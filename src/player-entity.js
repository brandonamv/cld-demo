import * as THREE from 'three';

import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

import { entity } from "./entity.js";
import { finite_state_machine } from "./finite-state-machine.js";
import { player_state } from "./player-state.js";

import * as OCTREE from "./octree.js";


export const player_entity = (() => {
  class CharacterFSM extends finite_state_machine.FiniteStateMachine {
    constructor(proxy) {
      super();
      this._proxy = proxy;
      this._Init();
    }

    _Init() {
      this._AddState("idle", player_state.IdleState);
      this._AddState("walk", player_state.WalkState);
      this._AddState("run", player_state.RunState);
      this._AddState("attack", player_state.AttackState);
      this._AddState("death", player_state.DeathState);
    }
  }

  class BasicCharacterControllerProxy {
    constructor(animations) {
      this._animations = animations;
    }

    get animations() {
      return this._animations;
    }
  }

  class BasicCharacterController extends entity.Component {
    constructor(params) {
      super();
      this._Init(params);
    }

	

    _Init(params) {
		this._params = params;
		this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
		this._acceleration = new THREE.Vector3(1, 0.125, 50.0).multiplyScalar(
			1.5
		);
		this._velocity = new THREE.Vector3(0, 0, 0);
		this._position = new THREE.Vector3();

		this._animations = {};
		this.target=[];
		this.bones=[];
		this.animations=[];
		this.active=0;
		this._stateMachine = new CharacterFSM(
          new BasicCharacterControllerProxy(this._animations));

		const button = document.getElementById("icon-bar-selector-prev");
		// const button2 = document.getElementById("icon-bar-selector2");
		// const button3 = document.getElementById("icon-bar-selector3");
		// const button4 = document.getElementById("icon-bar-selector4");
		const weapon1 = document.getElementById("inventory-1");
		const weapon2 = document.getElementById("inventory-2");
		const weapon3 = document.getElementById("inventory-3");
		//const button5 = document.getElementById("myBtn");
		
		// const changeCharacter=(i)=>{
		// 	if(this._target){
		// 		this.target[i].position.copy(this._target.position);
		// 		this.target[i].quaternion.copy(this._target.quaternion);
		// 		this._params.scene.remove(this._target);
		// 	}
		// 	weapon1.style.visibility="hidden";
		// 	weapon2.style.visibility="hidden";
		// 	weapon3.style.visibility="hidden";
		// 	this._target=this.target[i];
		// 	this._target.visible=true;
		// 	this._params.scene.add(this._target);
		// 	this.Broadcast({
		// 		topic: "load.character",
		// 		model: this._target,
		// 		//bones: this.bones[1],
		// 	});
		// 	this._mixer = new THREE.AnimationMixer(this._target);
		// 	Object.keys(this.animations[i]).forEach(key=>{
		// 		const clip = this.animations[i][key].clip;
		// 		const action = this._mixer.clipAction(clip);
		// 		this._animations[key]={
		// 			clip:clip,
		// 			action:action
		// 		};
		// 	});
		// 	this._mixer.clipAction(this._animations['idle'].clip).play();
		// 	this._stateMachine.SetState("idle");
		// }
		this._LoadModel();
		button.addEventListener("click", ()=>{
			//this._LoadModels();
			// if(this._target){
			// 	this.target[0].position.copy(this._target.position);
			// 	this.target[0].quaternion.copy(this._target.quaternion);
			// 	this._params.scene.remove(this._target);
			// }
			weapon1.style.visibility="visible";
			weapon2.style.visibility="visible";
			weapon3.style.visibility="visible";
			this._target=this.target[0];
			this._target.visible=true;
			this._params.scene.add(this._target);
			
			this.Broadcast({
				topic: "load.character",
				model: this._target,
				bones: this.bones[0]
			});
			this._mixer = new THREE.AnimationMixer(this._target);
			Object.keys(this.animations[0]).forEach(key=>{
				const clip = this.animations[0][key].clip;
				const action = this._mixer.clipAction(clip);
				this._animations[key]={
					clip:clip,
					action:action
				};
			});
			this._stateMachine.SetState("idle");
			this._mixer.clipAction(this._animations['idle'].clip).play();
		});
		// button2.addEventListener("click", ()=>{
		// 	//this._LoadModels2();
		// 	changeCharacter(1);
		// });
		// button3.addEventListener("click", ()=>{
		// 	//this._LoadModels3();
		// 	changeCharacter(2);
		// });
		// button4.addEventListener("click", ()=>{
		// 	//this._LoadModels4();
		// 	changeCharacter(3);
		// });
		
		// button5.addEventListener("click", ()=>{
		//   this._LoadModels();
		// })
      
    }


    InitComponent() {
      this._RegisterHandler("health.death", (m) => {
        this._OnDeath(m);
      });
    }

    _OnDeath(msg) {
      this._stateMachine.SetState("death");
      document.getElementById("myModal").style.display = "block";
    }

	_LoadModel() {
		const loader = new FBXLoader();
		/* loader.setPath("https://assets2022.s3.amazonaws.com/Dragon/animoca/MedievalcastleAtlasH/heros/"); */
		loader.setPath("./resources/guard/");
		this._min=new THREE.Vector3(Infinity,Infinity,Infinity);
		this._max=new THREE.Vector3(-Infinity,-Infinity,-Infinity);
		loader.load("castle_guard_1.fbx", (fbx) => {
			//cargando personaje y seteando las posiciones y argumentos
			this.target.push(fbx);
			const index=fbx.children[1].geometry.attributes.position.count;
			const array=fbx.children[1].geometry.attributes.position.array;
			for (let i = 0; i < index; i++) {
				const point=new THREE.Vector3(array[i*3],array[i*3+1],array[i*3+2]);
				if(point.x<this._min.x)
					this._min.setX(point.x);
				if(point.y<this._min.y)
					this._min.setY(point.y);
				if(point.z<this._min.z)
					this._min.setZ(point.z);
				if(point.x>this._max.x)
					this._max.setX(point.x);
				if(point.y>this._max.y)
					this._max.setY(point.y);
				if(point.z>this._max.z)
					this._max.setZ(point.z);
			}
			this._max.multiplyScalar(0.035);
			this._min.multiplyScalar(0.035);
			//console.log(this);	
			const n=this.target.length-1;
			this.target[n].scale.setScalar(0.035);
			this.target[n].rotation.y=Math.PI; 
			this.target[n].position.copy(this._parent._position);
			
			const button5 = document.getElementById("myBtn");
			/* button5.addEventListener("click", ()=>{
				this.target[n].visible = false;
			}) */
			
			//cargando bones en caso de usar armas
			const bones = {};

			for (let b of this.target[n].children[1].skeleton.bones) {
				bones[b.name] = b;
			}
			
			this.bones.push(bones);
			
			//cargando texturas y sombras
			this.target[n].traverse((c) => {
				c.castShadow = true;
				c.receiveShadow = true;
				if (c.material && c.material.map) {
				c.material.map.encoding = THREE.sRGBEncoding;
				}
			});

			const  onTransitionEnd=(event)=>{
				event.target.remove();
			}
			//cargando animaciones
			const animation={};
			const _OnLoad = (animName, anim) => {
				const clip = anim.animations[0];
				animation[animName]={
					clip: clip,
				}
				if (animName=="death") {
					this.animations.push(animation);
				}
			};

			this._manager = new THREE.LoadingManager();
			this._manager.onLoad = () => {
				//this._stateMachine.SetState("idle");
			};

			const loader = new FBXLoader(this._manager);
			loader.setPath("./resources/guard/");
			loader.load("Sword_And_Shield_Idle.fbx", (a) => {
				_OnLoad("idle", a);
			});
			loader.load("Sword_And_Shield_Run.fbx", (a) => {
				_OnLoad("run", a);
			});
			loader.load("Sword_And_Shield_Walk.fbx", (a) => {
				_OnLoad("walk", a);
			});
			loader.load("Sword_And_Shield_Slash.fbx", (a) => {
				_OnLoad("attack", a);
			});
			loader.load("Sword_And_Shield_Death.fbx", (a) => {
				_OnLoad("death", a);
			});
		});
		/* loader.setPath('https://assets2022.s3.amazonaws.com/Dragon/animoca/MedievalcastleAtlasH/heros/');
		loader.load('guard2.fbx', (fbx) => {
			this.target.push(fbx);
			const n=this.target.length-1;
			this.target[n].scale.setScalar(0.035);
			this.target[n].rotation.y=Math.PI; 
			this.target[n].position.copy(this._parent._position);
			

			this.target[n].traverse((c) => {
				c.castShadow = true;
				c.receiveShadow = true;
				if (c.material && c.material.map) {
				c.material.map.encoding = THREE.sRGBEncoding;
				}
			});
			const animation={};
			const _OnLoad = (animName, anim) => {
				const clip = anim.animations[0];
				animation[animName]={
					clip: clip
					//action: action,
				}
				if (animName=="death") {
					this.animations.push(animation);
				}
			};

			this._manager = new THREE.LoadingManager();
			this._manager.onLoad = () => {
			};

			const loader2 = new FBXLoader(this._manager);
			loader2.setPath('./resources/guard2/');
			loader2.load('Sword And Shield Idle.fbx', (a) => { _OnLoad('idle', a); });
			loader2.load('Sword And Shield Run.fbx', (a) => { _OnLoad('run', a); });
			loader2.load('Sword And Shield Walk.fbx', (a) => { _OnLoad('walk', a); });
			loader2.load('Sword And Shield Slash.fbx', (a) => { _OnLoad('attack', a); });
			loader2.load('Sword And Shield Death.fbx', (a) => { _OnLoad('death', a); });
		});
		loader.setPath('https://assets2022.s3.amazonaws.com/Dragon/animoca/MedievalcastleAtlasH/heros/');
		loader.load('guard3.fbx', (fbx) => {
			this.target.push(fbx);
			const n=this.target.length-1;
			this.target[n].scale.setScalar(0.035);
			this.target[n].rotation.y=Math.PI; 
			this.target[n].position.copy(this._parent._position);
			const button5 = document.getElementById("myBtn");
			button5.addEventListener("click", ()=>{
				this._target.visible = false
			
			})

			this.target[n].traverse((c) => {
				c.castShadow = true;
				c.receiveShadow = true;
				if (c.material && c.material.map) {
				c.material.map.encoding = THREE.sRGBEncoding;
				}
			});


			this._mixer = new THREE.AnimationMixer(this._target);
			const animation={};
			const _OnLoad = (animName, anim) => {
				const clip = anim.animations[0];
				animation[animName]={
					clip: clip,
					//action: action,
				}
				if (animName=="death") {
					this.animations.push(animation);
				}
			};

			this._manager = new THREE.LoadingManager();
			this._manager.onLoad = () => {
			};

			const loader3 = new FBXLoader(this._manager);
			loader3.setPath('./resources/guard3/');
			loader3.load('Idle.fbx', (a) => { _OnLoad('idle', a); });
			loader3.load('Slow Run.fbx', (a) => { _OnLoad('run', a); });
			loader3.load('Walking.fbx', (a) => { _OnLoad('walk', a); });
			loader3.load('Smash.fbx', (a) => { _OnLoad('attack', a); });
			loader3.load('Standing Death Backward 01.fbx', (a) => { _OnLoad('death', a); });
		});
		loader.setPath('https://assets2022.s3.amazonaws.com/Dragon/animoca/MedievalcastleAtlasH/heros/');
		loader.load('guard4.fbx', (fbx) => {
			this.target.push(fbx);
			const n=this.target.length-1;
			this.target[n].scale.setScalar(0.035);
			this.target[n].rotation.y=Math.PI; 
			this.target[n].position.copy(this._parent._position);
			const button5 = document.getElementById("myBtn");
			button5.addEventListener("click", ()=>{
				this._target.visible = false
			
			})
	
			this.target[n].traverse((c) => {
				c.castShadow = true;
				c.receiveShadow = true;
				if (c.material && c.material.map) {
				c.material.map.encoding = THREE.sRGBEncoding;
				}
			});

			const animation={};
			const _OnLoad = (animName, anim) => {
				const clip = anim.animations[0];
				animation[animName]={
					clip: clip,
					//action: action,
				}
				if (animName=="death") {
					this.animations.push(animation);
					const loadingScreen = document.getElementById("loading-screen");
					loadingScreen.classList.add("fade-out");

					loadingScreen.addEventListener("transitionend", onTransitionEnd);
				}
			};
			const  onTransitionEnd=(event)=>{
				event.target.remove();
			  }

			this._manager = new THREE.LoadingManager();
			this._manager.onLoad = () => {
			
			};

			const loader3 = new FBXLoader(this._manager);
			loader3.setPath('./resources/guard4/');
			loader3.load('Idle.fbx', (a) => { _OnLoad('idle', a); });
			loader3.load('Sprint.fbx', (a) => { _OnLoad('run', a); });
			loader3.load('Walking.fbx', (a) => { _OnLoad('walk', a); });
			loader3.load('Slash.fbx', (a) => { _OnLoad('attack', a); });
			loader3.load('Death.fbx', (a) => { _OnLoad('death', a); });
		}); */
	}

    _LoadModels() {
      const loader = new FBXLoader();
      loader.setPath("./resources/guard/");
      loader.load("castle_guard_01.fbx", (fbx) => {
        this._target = fbx;
        this._target.scale.setScalar(0.035);
        this._target.rotation.y=Math.PI; 
        this._target.position.copy(this._parent._position);
        this._params.scene.add(this._target);
        
        const button5 = document.getElementById("myBtn");
        button5.addEventListener("click", ()=>{
          this._target.visible = false
        })
        

        this._bones = {};

        for (let b of this._target.children[1].skeleton.bones) {
          this._bones[b.name] = b;
        }

        this._target.traverse((c) => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });

        this.Broadcast({
          topic: "load.character",
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
        };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState("idle");
        };

        const loader = new FBXLoader(this._manager);
        loader.setPath("./resources/guard/");
        loader.load("Sword And Shield Idle.fbx", (a) => {
          _OnLoad("idle", a);
        });
        loader.load("Sword And Shield Run.fbx", (a) => {
          _OnLoad("run", a);
        });
        loader.load("Sword And Shield Walk.fbx", (a) => {
          _OnLoad("walk", a);
        });
        loader.load("Sword And Shield Slash.fbx", (a) => {
          _OnLoad("attack", a);
        });
        loader.load("Sword And Shield Death.fbx", (a) => {
          _OnLoad("death", a);
        });
      });
    }

    _LoadModels2(){
      const loader2 = new FBXLoader();
      loader2.setPath('./resources/guard2/');
      loader2.load('guard02.fbx', (fbx) => {
        this._target = fbx;
        this._target.scale.setScalar(0.045);
        this._target.rotation.y=Math.PI; 
        this._target.position.copy(this._parent._position);
        this._params.scene.add(this._target);
        const button5 = document.getElementById("myBtn");
        button5.addEventListener("click", ()=>{
          this._target.visible = false
          
        })
  
        // this._bones = {};

        // for (let b of this._target.children[1].skeleton.bones) {
        //   this._bones[b.name] = b;
        // }

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });

        this.Broadcast({
            topic: 'load.character',
            model: this._target,
            // bones: this._bones,
        });

        this._mixer = new THREE.AnimationMixer(this._target);

        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
    
          /* this._animations[animName] = {
            clip: clip,
            action: action,
          }; */
        };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          //this._stateMachine.SetState('idle');
        };
  
        const loader2 = new FBXLoader(this._manager);
        loader2.setPath('./resources/guard2/');
        loader2.load('Sword And Shield Idle.fbx', (a) => { _OnLoad('idle', a); });
        loader2.load('Sword And Shield Run.fbx', (a) => { _OnLoad('run', a); });
        loader2.load('Sword And Shield Walk.fbx', (a) => { _OnLoad('walk', a); });
        loader2.load('Sword And Shield Slash.fbx', (a) => { _OnLoad('attack', a); });
        loader2.load('Sword And Shield Death.fbx', (a) => { _OnLoad('death', a); });
      });
    }

    _LoadModels3(){
      const loader3 = new FBXLoader();
      loader3.setPath('./resources/guard3/');
      loader3.load('guard03.fbx', (fbx) => {
        this._target = fbx;
        this._target.scale.setScalar(0.045);
        this._target.rotation.y=Math.PI; 
        this._target.position.copy(this._parent._position);
        this._params.scene.add(this._target);
        const button5 = document.getElementById("myBtn");
        button5.addEventListener("click", ()=>{
          this._target.visible = false
          
        })
  
        // this._bones = {};

        // for (let b of this._target.children[1].skeleton.bones) {
        //   this._bones[b.name] = b;
        // }

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });

        this.Broadcast({
            topic: 'load.character',
            model: this._target,
            // bones: this._bones,
        });

        this._mixer = new THREE.AnimationMixer(this._target);

        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
    
          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState('idle');
        };
  
        const loader3 = new FBXLoader(this._manager);
        loader3.setPath('./resources/guard3/');
        loader3.load('Idle.fbx', (a) => { _OnLoad('idle', a); });
        loader3.load('Slow Run.fbx', (a) => { _OnLoad('run', a); });
        loader3.load('Walking.fbx', (a) => { _OnLoad('walk', a); });
        loader3.load('Smash.fbx', (a) => { _OnLoad('attack', a); });
        loader3.load('Standing Death Backward 01.fbx', (a) => { _OnLoad('death', a); });
      });
    }

    _LoadModels4(){
      const loader3 = new FBXLoader();
      loader3.setPath('./resources/guard4/');
      loader3.load('Erika Archer.fbx', (fbx) => {
        this._target = fbx;
        this._target.scale.setScalar(0.045);
        this._target.rotation.y=Math.PI; 
        this._target.position.copy(this._parent._position);
        this._params.scene.add(this._target);
        const button5 = document.getElementById("myBtn");
        button5.addEventListener("click", ()=>{
          this._target.visible = false
            
        })
        
        
       
  
        // this._bones = {};

        // for (let b of this._target.children[1].skeleton.bones) {
        //   this._bones[b.name] = b;
        // }

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
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
        };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState('idle');
        };
  
        const loader3 = new FBXLoader(this._manager);
        loader3.setPath('./resources/guard4/');
        loader3.load('Idle.fbx', (a) => { _OnLoad('idle', a); });
        loader3.load('Sprint.fbx', (a) => { _OnLoad('run', a); });
        loader3.load('Walking.fbx', (a) => { _OnLoad('walk', a); });
        loader3.load('Slash.fbx', (a) => { _OnLoad('attack', a); });
        loader3.load('Death.fbx', (a) => { _OnLoad('death', a); });
      });
    }

    _FindIntersections(pos) {
      const _IsAlive = (c) => {
        const h = c.entity.GetComponent("HealthComponent");
        if (!h) {
          return true;
        }
        return h._health > 0;
      };

      const grid = this.GetComponent("SpatialGridController");
      const nearby = grid.FindNearbyEntities(5).filter((e) => _IsAlive(e));
      const collisions = [];

      for (let i = 0; i < nearby.length; ++i) {
        const e = nearby[i].entity;
        const d =
          ((pos.x - e._position.x) ** 2 + (pos.z - e._position.z) ** 2) ** 0.5;

        // HARDCODED
        if (d <= 2) {
          collisions.push(nearby[i].entity);
        }
      }
      return collisions;
    }

    Update(timeInSeconds) {
      if (!this._stateMachine._currentState) {
        return;
      }

      const input = this.GetComponent("BasicCharacterControllerInput");
      this._stateMachine.Update(timeInSeconds, input);

      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }

      // HARDCODED
      if (this._stateMachine._currentState._action) {
        this.Broadcast({
          topic: "player.action",
          action: this._stateMachine._currentState.Name,
          time: this._stateMachine._currentState._action.time,
        });
      }

      const currentState = this._stateMachine._currentState;
      if (
        currentState.Name != "walk" &&
        currentState.Name != "run" &&
        currentState.Name != "idle"
      ) {
        return;
      }
	  // if (!input._keys.forward&&!input._keys.backward&&!input._keys.left&&!input._keys.right)
		// return;
      const velocity = this._velocity;
      const frameDecceleration = new THREE.Vector3(
        velocity.x * this._decceleration.x,
        velocity.y * this._decceleration.y,
        velocity.z * this._decceleration.z
      );
      frameDecceleration.multiplyScalar(timeInSeconds);
      frameDecceleration.z =
        Math.sign(frameDecceleration.z) *
        Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

      velocity.add(frameDecceleration);
	  let controlObject=this._target;
      
      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3();
      const _R = controlObject.quaternion.clone();

      const acc = this._acceleration.clone();
      if (input._keys.shift) {
        acc.multiplyScalar(2.0);
      }

      if (input._keys.forward) {
        velocity.z += acc.z * timeInSeconds;
      }
      if (input._keys.backward) {
        velocity.z -= acc.z * timeInSeconds;
      }
      if (input._keys.left) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(
          _A,
          4.0 * Math.PI * timeInSeconds * this._acceleration.y
        );
        _R.multiply(_Q);
      }
      if (input._keys.right) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(
          _A,
          4.0 * -Math.PI * timeInSeconds * this._acceleration.y
        );
        _R.multiply(_Q);
      }

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
	  if(OCTREE.detectColision(pos,this._min,this._max))return;
      const collisions = this._FindIntersections(pos);
      if (collisions.length > 0) {
        return;
      }

      controlObject.position.copy(pos);
      this._position.copy(pos);

      this._parent.SetPosition(this._position);
	  //if (this.active==0) {
		this._parent.SetQuaternion(this._target.quaternion);
	 /*  } else {
		this._parent.SetQuaternion(this.target[0].quaternion);
	  } */
      
    }
  }

  return {
    CharacterFSM: CharacterFSM,
    BasicCharacterControllerProxy: BasicCharacterControllerProxy,
    BasicCharacterController: BasicCharacterController,
  };
})();