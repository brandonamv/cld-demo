import * as THREE from '../node_modules/three/build/three.module.js';

import {FBXLoader} from '../node_modules/three/examples/jsm/loaders/FBXLoader.js';

import {finite_state_machine} from './finite-state-machine.js';
import {entity} from './entity.js';
import {player_entity} from './player-entity.js'
import {player_state} from './player-state.js';


export const npc_entity = (() => {
  
  class AIInput {
    constructor() {
      this._Init();    
    }

    _Init() {
      this._keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        space: false,
        shift: false,
      };
    }
  };

  class NPCFSM extends finite_state_machine.FiniteStateMachine {
    constructor(proxy) {
      super();
      this._proxy = proxy;
      this._Init();
    }

    _Init() {
      this._AddState('idle', player_state.IdleState);
      this._AddState('walk', player_state.WalkState);
      this._AddState('death', player_state.DeathState);
      this._AddState('attack', player_state.AttackState);
    }
  };

  class NPCController extends entity.Component {
    constructor(params) {
      super();
      this._Init(params);
    }

    _Init(params) {
      this._params = params;
      this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this._acceleration = new THREE.Vector3(1, 0.25, 40.0);
      this._velocity = new THREE.Vector3(0, 0, 0);
      this._position = new THREE.Vector3();

      this._animations = {};
      this._input = new AIInput();
      // FIXME
      this._stateMachine = new NPCFSM(
          new player_entity.BasicCharacterControllerProxy(this._animations));

      this._LoadModels();
    }

    InitComponent() {
      this._RegisterHandler('health.death', (m) => { this._OnDeath(m); });
      this._RegisterHandler('update.position', (m) => { this._OnPosition(m); });
    }

    _OnDeath(msg) {
      this._stateMachine.SetState('death');
      setTimeout(() =>  this._target.visible=false, 5000);
    }

    _OnPosition(m) {
      if (this._target) {
        this._target.position.copy(m.value);
        this._target.position.y = 0.35;
      }
    }

    _LoadModels() {
      const loader = new FBXLoader();
      loader.setPath('https://assets2022.s3.amazonaws.com/Dragon/animoca/MedievalcastleAtlasH/heros/');
      loader.load(this._params.resourceName, (glb) => {
        this._target = glb;
        this._params.scene.add(this._target);

        this._target.scale.setScalar(0.035);
        this._target.position.copy(this._parent._position);
        this._target.position.y += 0.35;
        // const texLoader = new THREE.TextureLoader();
        // const texture = texLoader.load(
        //     './resources/monsters/Textures/' + this._params.resourceTexture);
        // texture.encoding = THREE.sRGBEncoding;
        // texture.flipY = true;

        this._bones = {};
        for (let b of this._target.children[1].skeleton.bones) {
          this._bones[b.name] = b;
        }

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
            // c.material.map = texture;
            // c.material.side = THREE.DoubleSide;
          }
        });

        this.Broadcast({
          topic: 'load.character',
          model: this._target,
          bones: this._bones,
      });

        this._mixer = new THREE.AnimationMixer(this._target);

        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
			
          this._animations[animName] = {
            clip: clip,
            action: action,
          };
		  this._stateMachine.SetState('idle');
        };

        // const fbx = glb;
        // const _OnLoad = (animName) => {
        //   for (let i = 0; i < fbx.animations.length; i++) {
        //     if (fbx.animations[i].name.includes(animName)) {
        //       const clip = fbx.animations[i];
        //       const action = this._mixer.clipAction(clip);
        //       return {
        //         clip: clip,
        //         action: action
        //       }
        //     }
        //   }
        //   return null;
        // };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState('idle');
        };

        const loader = new FBXLoader(this._manager);
        loader.setPath('./resources/vampire/');
        this._animations['idle'] =loader.load('Sword_And_Shield_Idle.fbx', (a) => { _OnLoad('idle', a); });
        this._animations['run']= loader.load('Sword_And_Shield_Run.fbx', (a) => { _OnLoad('run', a); });
        this._animations['walk'] =loader.load('Sword_And_Shield_Walk.fbx', (a) => { _OnLoad('walk', a); });
        this._animations['attack'] =loader.load('Sword_And_Shield_Slash.fbx', (a) => { _OnLoad('attack', a); });
        this._animations['death'] =loader.load('Sword_And_Shield_Death.fbx', (a) => { _OnLoad('death', a); });

        /* this._animations['idle'] = _FindAnim('Idle');
        this._animations['walk'] = _FindAnim('Walk');
        this._animations['death'] = _FindAnim('Death');
        this._animations['attack'] = _FindAnim('Attack');

        this._stateMachine.SetState('idle'); */
      });
    }

    get Position() {
      return this._position;
    }

    get Rotation() {
      if (!this._target) {
        return new THREE.Quaternion();
      }
      return this._target.quaternion;
    }

    _FindIntersections(pos) {
      const _IsAlive = (c) => {
        const h = c.entity.GetComponent('HealthComponent');
        if (!h) {
          return true;
        }
        return h._health > 0;
      };

      const grid = this.GetComponent('SpatialGridController');
      const nearby = grid.FindNearbyEntities(2).filter(e => _IsAlive(e));
      const collisions = [];

      for (let i = 0; i < nearby.length; ++i) {
        const e = nearby[i].entity;
        const d = ((pos.x - e._position.x) ** 2 + (pos.z - e._position.z) ** 2) ** 0.5;

        // HARDCODED
        if (d <= 4) {
          collisions.push(nearby[i].entity);
        }
      }
      return collisions;
    }

    _FindPlayer(pos) {
      const _IsAlivePlayer = (c) => {
        const h = c.entity.GetComponent('HealthComponent');
        if (!h) {
          return false;
        }
        if (c.entity.Name != 'player') {
          return false;
        }
        return h._health > 0;
      };

      const grid = this.GetComponent('SpatialGridController');
      const nearby = grid.FindNearbyEntities(100).filter(c => _IsAlivePlayer(c));

      if (nearby.length == 0) {
        return new THREE.Vector3(0, 0, 0);
      }

      const dir = this._parent._position.clone();
      dir.sub(nearby[0].entity._position);
      dir.y = 0.0;
      dir.normalize();

      return dir;
    }

    _UpdateAI(timeInSeconds) {
      const currentState = this._stateMachine._currentState;
      if (currentState.Name != 'walk' &&
          currentState.Name != 'run' &&
          currentState.Name != 'idle') {
        return;
      }

      if (currentState.Name == 'death') {
        return;
      }

      if (currentState.Name == 'idle' ||
          currentState.Name == 'walk') {
        this._OnAIWalk(timeInSeconds);
      }
    }

    _OnAIWalk(timeInSeconds) {
      const dirToPlayer = this._FindPlayer();
	  if (dirToPlayer.length() == 0) {
        return;
      }

      const velocity = this._velocity;
      const frameDecceleration = new THREE.Vector3(
          velocity.x * this._decceleration.x,
          velocity.y * this._decceleration.y,
          velocity.z * this._decceleration.z
      );
      frameDecceleration.multiplyScalar(timeInSeconds);
      frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
          Math.abs(frameDecceleration.z), Math.abs(velocity.z));
  
      velocity.add(frameDecceleration);

      const controlObject = this._target;
      const _R = controlObject.quaternion.clone();
  
      this._input._keys.forward = false;

      const acc = this._acceleration;
      

      this._input._keys.forward = true;
      velocity.z += acc.z * timeInSeconds;

      const m = new THREE.Matrix4();
      m.lookAt(
          new THREE.Vector3(0, 0, 0),
          dirToPlayer,
          new THREE.Vector3(0, 1, 0));
      _R.setFromRotationMatrix(m);
  
      controlObject.quaternion.copy(_R);
  
      const oldPosition = new THREE.Vector3();
      oldPosition.copy(controlObject.position);
  
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();
  
      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();
  
      sideways.multiplyScalar(velocity.x * timeInSeconds);
      forward.multiplyScalar(velocity.z * timeInSeconds);
  
      const pos = controlObject.position.clone();
      pos.add(forward);
      pos.add(sideways);
	  //if(OCTREE.detectColision(pos,new THREE.Vector3(0,2,0)))return;
      const collisions = this._FindIntersections(pos);
      if (collisions.length > 0) {
        this._input._keys.space = true;
        this._input._keys.forward = false;
        return;
      }

      controlObject.position.copy(pos);
      this._position.copy(pos);
  
      this._parent.SetPosition(this._position);
      this._parent.SetQuaternion(this._target.quaternion);
    }

    Update(timeInSeconds) {
      if (!this._stateMachine._currentState) {
        return;
      }

      this._input._keys.space = false;
      this._input._keys.forward = false;

      this._UpdateAI(timeInSeconds);

      this._stateMachine.Update(timeInSeconds, this._input);

      // HARDCODED
      if (this._stateMachine._currentState._action) {
        this.Broadcast({
          topic: 'player.action',
          action: this._stateMachine._currentState.Name,
          time: this._stateMachine._currentState._action.time,
        });
      }
      
      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }
    }
  };

  return {
    NPCController: NPCController,
  };

})();