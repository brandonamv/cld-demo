import * as THREE from '../node_modules/three/build/three.module.js';
import { third_person_camera } from "./third-person-camera.js";
import { entity_manager } from "./entity-manager.js";
import { player_entity } from "./player-entity.js";
import { entity } from "./entity.js";
import { health_component } from "./health-component.js";
import { player_input } from "./player-input.js";
import { npc_entity } from "./npc-entity.js";
import { math } from "./math.js";
import { spatial_hash_grid } from "./spatial-hash-grid.js";
import { ui_controller } from "./ui-controller.js";
import { health_bar } from "./health-bar.js";
import { level_up_component } from "./level-up-component.js";
import { spatial_grid_controller } from "./spatial-grid-controller.js";
import { inventory_controller } from "./inventory-controller.js";
import { equip_weapon_component } from "./equip-weapon-component.js";
import { attack_controller } from "./attacker-controller.js";
import { Ocean } from "./water/water.js";
import { Sky } from "./sky/sky.js";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "../node_modules/three/examples/jsm/loaders/DRACOLoader.js";
import * as OCTREE from "./octree.js";
//import Stats from "../node_modules/three/examples/jsm/libs/stats.module.js"

class HackNSlashDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
	//this._stats = Stats();
	//document.body.appendChild(this._stats.dom);
    this._threejs = new THREE.WebGLRenderer({
      antialias: false,
    });
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    //this._threejs.gammaFactor = 2.2;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
    this._threejs.domElement.id = "threejs";
    this._selected = false; //variable para saber cuando se ha seleccionado personaje

    //document.getElementById("mostrarmodal").style.visibility = "visible";

	document.getElementById("icon-bar-selector-prev").onclick = () => {
		 document
		  .getElementById("container")
		  .appendChild(this._threejs.domElement);
		/*document.getElementById("mostrarmodalprev").style.visibility = "hidden"; */
		setTimeout(() => {
			document.getElementById("mostrarmodalprev").style.visibility = "hidden";
			this._selected = true;
			var e = jQuery.Event("keydown");
			e.keycode = 87; // # Some key code value
			$(document).trigger(e);
		}, 100);
	  };
	const button = document.getElementById("myBtn");
	button.addEventListener("click", ()=>{
		OCTREE.setDebug(this._scene,false);
	})
   /*  document.getElementById("icon-bar-selector").onclick = () => {
      document
        .getElementById("container")
        .appendChild(this._threejs.domElement);
		setTimeout(() => {
			document.getElementById("mostrarmodal").style.visibility = "hidden";
		}, 100);
      
      this._selected = true;
    };

    document.getElementById("icon-bar-selector2").onclick = () => {
      document
        .getElementById("container")
        .appendChild(this._threejs.domElement);
		setTimeout(() => {
			document.getElementById("mostrarmodal").style.visibility = "hidden";
		}, 100);
      
      this._selected = true;
    };

    document.getElementById("icon-bar-selector3").onclick = () => {
      document
        .getElementById("container")
        .appendChild(this._threejs.domElement);
		setTimeout(() => {
			document.getElementById("mostrarmodal").style.visibility = "hidden";
		}, 100);
      
      this._selected = true;
    };

    document.getElementById("icon-bar-selector4").onclick = () => {
      document
        .getElementById("container")
        .appendChild(this._threejs.domElement);
		setTimeout(() => {
			document.getElementById("mostrarmodal").style.visibility = "hidden";
		}, 100);
      
      this._selected = true;
    }; */
	

    // document.getElementById("myBtn").onclick = () => {
    //   // document.getElementById("container").appendChild(this._threejs.domElement);
    //   document.getElementById("mostrarmodal").style.visibility = "visible";
    // };

    window.addEventListener(
      "resize",
      () => {
        this._OnWindowResize();
      },
      false
    );

    const fov = 30;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 600.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(25, 10, 25);

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xffffff);
    this._scene.fog = new THREE.FogExp2(0x89b2eb, 0.002);

    let light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(-10, 500, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1000.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);

    let light2 = new THREE.AmbientLight(0xffffff, 0.5);
    this._scene.add(light2);

    this._sun = light;

    

    //variable del cielo
    this._cielo = new Sky(this._scene, this._camera);

    //variable del agua
    // this._ocean = new THREE.Mesh(
    //   new THREE.PlaneGeometry(1000, 1000, 5, 5),
    //   new THREE.MeshStandardMaterial({
    //     color: 0x1e601c,
    //   })
    // );
    // this._ocean.castShadow = false;
    // this._ocean.receiveShadow = true;
    // this._ocean.rotation.x = -Math.PI / 2;
    // this._ocean.position.y = -40;
    // this._agua = new Ocean(this._ocean, this._camera, this._cielo);
    // this._scene.add(this._ocean);

    this._entityManager = new entity_manager.EntityManager();
	OCTREE.newOctree(new THREE.Vector3(-1000, -100, -1000), new THREE.Vector3(1000, 100, 1000));
    this._grid = new spatial_hash_grid.SpatialHashGrid(
      [
        [-1000, -1000],
        [1000, 1000],
      ],
      [100, 100]
    );

    this._LoadControllers();
    this._LoadPlayer();
    this._LoadClouds();
    // this._LoadFoliage();
    this._LoadCastle();

    this.totalTime_ = 0.0;

    this._previousRAF = null;
    this._RAF();
  }

  _LoadControllers() {
    const ui = new entity.Entity();
    ui.AddComponent(new ui_controller.UIController());
    this._entityManager.Add(ui, "ui");
  }

  _LoadClouds() {
    this._clouds = [];
    for (let i = 0; i < 20; ++i) {
      const index = math.rand_int(1, 3);
      const loader = new GLTFLoader();
      loader.setPath("./resources/nature2/GLTF/");
      loader.load("Cloud" + index + ".glb", (glb) => {
        const object = glb.scene;
        object.position.set(
          (Math.random() * 2.0 - 1.0) * 500,
          100,
          (Math.random() * 2.0 - 1.0) * 500
        );
        object.scale.set(
          Math.random() * 5 + 10,
          Math.random() * 5 + 10,
          Math.random() * 5 + 10
        );
        object.traverse((e) => {
          if (e.isMesh) {
            e.receiveShadow = true;
            e.castShadow = true;
            let materials = e.material;
            if (!(e.material instanceof Array)) materials = [e.material];
            for (let m of materials) {
              if (m) m.emissive.set(0xffffff);
            }
          }
        });
        this._clouds.push(object);
        this._scene.add(this._clouds[this._clouds.length - 1]);
      });
    }
  }

  _LoadCastle() {
	this._manager = new THREE.LoadingManager();
	this._manager.onLoad = () => {
		const loadingScreen = document.getElementById("loading-screen");
		loadingScreen.classList.add("fade-out");

		loadingScreen.addEventListener("transitionend", onTransitionEnd);
	};	
    const loader = new GLTFLoader(this._manager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://assets2022.s3.amazonaws.com/Files/Draco/"
    );
    loader.setDRACOLoader(dracoLoader);
    loader.setPath(
      "https://assets2022.s3.amazonaws.com/Dragon/demo/46/"
    );
	
	
    const scene = this._scene;
    [
      "TeleportFloor.gltf",
      "SignPack.gltf",
      "HighPack.gltf",
      "AssetPack.gltf",
    ].forEach((object,index) => {
      loader.load(object, (gltf) => {
        const object = gltf.scene;
        object.scale.set(4, 4, 4);
		object.updateWorldMatrix(true,true);
		object.updateMatrixWorld();
        object.traverse((e) => {
			if (e.isMesh) {
			
				//e.receiveShadow = true;
				//e.castShadow = true;
			}
        });
        scene.add(object);
      });
    });
	loader.setPath(
		"https://assets2022.s3.amazonaws.com/Dragon/demo/46/"
	  );
	
	loader.load("CLD.gltf", (gltf) => {
        const object = gltf.scene;
		object.scale.set(4, 4, 4);
		object.updateWorldMatrix(true,true);
		object.updateMatrixWorld();
        object.traverse((e) => {
			if (e.isMesh) {
					/* let color=pos.count.toString(16);
					const n=6-color.length;
					for (let i = 0; i < n; i++) {
						color=color.concat("0");
					}
					const material_cold = new THREE.LineBasicMaterial({
						color: '#'+color,
					});
					console.log(e.name,pos,material_cold.color); */
					OCTREE.addPointsFromBounding(e,1,this._scene,false);
					/* const traslation=new THREE.Matrix4().makeTranslation(e.position.x,e.position.y,e.position.z);
					const rotation= new THREE.Matrix4().makeRotationFromEuler(e.rotation);
					const scale= new THREE.Matrix4().makeScale(e.scale.x*4,e.scale.y*4,e.scale.z*4);
					const model=traslation.multiply(rotation.multiply(scale));
					for (let i = 0; i < pos.count; i++) {
						points.push(new THREE.Vector3(pos.array[i*3],pos.array[i*3+1],pos.array[i*3+2]).applyMatrix4(model));
						if (Math.round(points[points.length-1].y)==0) {
							
						}
					} */
					/* const geometry=new THREE.BufferGeometry().setFromPoints( points );
					const line=new THREE.Line(geometry,material_cold);
					scene.add(line); */
				
			}
        });
		//scene.add(object);
      });

  }

  _LoadPlayer() {
    const params = {
      camera: this._camera,
      scene: this._scene,
    };

    const levelUpSpawner = new entity.Entity();
    levelUpSpawner.AddComponent(
      new level_up_component.LevelUpComponentSpawner({
        camera: this._camera,
        scene: this._scene,
      })
    );
    this._entityManager.Add(levelUpSpawner, "level-up-spawner");

    const axe = new entity.Entity();
    axe.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Axe",
          scale: 0.25,
          icon: "war-axe-64.png",
        },
      })
    );
    this._entityManager.Add(axe);

    const axe2 = new entity.Entity();
    axe2.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Axe2",
          scale: 2.0,
          icon: "war-axe-64.png",
        },
      })
    );
    this._entityManager.Add(axe2);

    const axe3 = new entity.Entity();
    axe3.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Axe3",
          scale: 2.0,
          icon: "war-axe-64.png",
        },
      })
    );
    this._entityManager.Add(axe3);

    const axe4 = new entity.Entity();
    axe4.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Axe4",
          scale: 2.0,
          icon: "war-axe-64.png",
        },
      })
    );
    this._entityManager.Add(axe4);

    const hammer = new entity.Entity();
    hammer.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Hammer_Double",
          scale: 0.25,
          icon: "hammer-weapon.png",
        },
      })
    );
    this._entityManager.Add(hammer);

    const hammer2 = new entity.Entity();
    hammer2.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Hammer_Double2",
          scale: 1.25,
          icon: "hammer-weapon.png",
        },
      })
    );
    this._entityManager.Add(hammer2);

    const hammer3 = new entity.Entity();
    hammer3.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Hammer_Double3",
          scale: 0.25,
          icon: "hammer-weapon.png",
        },
      })
    );
    this._entityManager.Add(hammer3);

    const hammer4 = new entity.Entity();
    hammer4.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Hammer_Double4",
          scale: 1.25,
          icon: "hammer-weapon.png",
        },
      })
    );
    this._entityManager.Add(hammer4);

    const sword = new entity.Entity();
    sword.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Sword",
          scale: 0.25,
          icon: "pointy-sword-64.png",
        },
      })
    );
    this._entityManager.Add(sword);

    const sword2 = new entity.Entity();
    sword2.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Sword2",
          scale: 2.0,
          icon: "pointy-sword-64.png",
        },
      })
    );
    this._entityManager.Add(sword2);

    const sword3 = new entity.Entity();
    sword3.AddComponent(
      new inventory_controller.InventoryItem({
        type: "weapon",
        damage: 3,
        renderParams: {
          name: "Sword3",
          scale: 2.0,
          icon: "pointy-sword-64.png",
        },
      })
    );
    this._entityManager.Add(sword3);

    const player = new entity.Entity();
	player.SetPosition(new THREE.Vector3(0,0,-30));
    player.AddComponent(new player_input.BasicCharacterControllerInput(params));
    player.AddComponent(new player_entity.BasicCharacterController(params));
    player.AddComponent(
      new equip_weapon_component.EquipWeapon({ anchor: "RightHandIndex1" })
    );
    // player.AddComponent(
    //   new equip_weapon_component.EquipWeapon({ anchor: "LeftHandIndex1" })
    // );
    player.AddComponent(new inventory_controller.InventoryController(params));
    player.AddComponent(
      new health_component.HealthComponent({
        updateUI: true,
        health: 100,
        maxHealth: 100,
        strength: 50,
        wisdomness: 5,
        benchpress: 20,
        curl: 100,
        experience: 0,
        level: 1,
      })
    );
    player.AddComponent(
      new spatial_grid_controller.SpatialGridController({ grid: this._grid })
    );
    player.AddComponent(
      new attack_controller.AttackController({ timing: 0.7 })
    );
    // this._entityManager.rotation.x = Math.PI * .5
    this._entityManager.Add(player, "player");

    const button = document.getElementById("inventory-1");
    button.addEventListener("click", () => {
      player.Broadcast({
        topic: "inventory.equip",
        value: sword.Name,
        added: false,
      });
    });

    const button2 = document.getElementById("inventory-2");
    button2.addEventListener("click", () => {
      player.Broadcast({
        topic: "inventory.equip",
        value: axe.Name,
        added: false,
      });
    });

    const button3 = document.getElementById("inventory-3");
    button3.addEventListener("click", () => {
      player.Broadcast({
        topic: "inventory.equip",
        value: hammer.Name,
        added: false,
      });
    });

    player.Broadcast({
      topic: "inventory.add",
      value: sword.Name,
      added: false,
    });
    player.Broadcast({
      topic: "inventory.equip",
      value: sword.Name,
      added: false,
    });

    player.Broadcast({
      topic: "inventory.add",
      value: axe.Name,
      added: false,
    });

    player.Broadcast({
      topic: "inventory.add",
      value: hammer.Name,
      added: false,
    });

    player.Broadcast({
      topic: "inventory.add",
      value: axe2.Name,
      added: false,
    });

    player.Broadcast({
      topic: "inventory.add",
      value: axe3.Name,
      added: false,
    });

    player.Broadcast({
      topic: "inventory.add",
      value: axe4.Name,
      added: false,
    });

    player.Broadcast({
      topic: "inventory.add",
      value: hammer2.Name,
      added: false,
    });

    player.Broadcast({
      topic: "inventory.add",
      value: hammer3.Name,
      added: false,
    });

    player.Broadcast({
      topic: "inventory.add",
      value: hammer4.Name,
      added: false,
    });

    player.Broadcast({
      topic: "inventory.add",
      value: sword2.Name,
      added: false,
    });

    player.Broadcast({
      topic: "inventory.add",
      value: sword3.Name,
      added: false,
    });

    const camera = new entity.Entity();
    camera.AddComponent(
      new third_person_camera.ThirdPersonCamera({
        camera: this._camera,
        target: this._entityManager.Get("player"),
      })
    );
    this._entityManager.Add(camera, "player-camera");

    const monsters = [
      {
        resourceName: "vampire.fbx",
        // resourceTexture: "Ghost_Texture.png",
      },
      {
        resourceName: "Vampire.fbx",
        // resourceTexture: "Ghost_Texture.png",
      },
      {
        resourceName: "Vampire.fbx",
        // resourceTexture: "Ghost_Texture.png",
      },
      {
        resourceName: "Vampire.fbx",
        // resourceTexture: "Alien_Texture.png",
      },
    ];
    for (let i = 0; i < 10; ++i) {
      const m = monsters[0];
      // math.rand_int(0, monsters.length - 1)

      const npc = new entity.Entity();
      npc.AddComponent(
        new npc_entity.NPCController({
          camera: this._camera,
          scene: this._scene,
          resourceName: m.resourceName,
          // resourceTexture: m.resourceTexture,
        })
      );
      npc.AddComponent(
        new health_component.HealthComponent({
          health: 200,
          maxHealth: 200,
          strength: 2,
          wisdomness: 2,
          benchpress: 3,
          curl: 1,
          experience: 0,
          level: 1,
          camera: this._camera,
          scene: this._scene,
        })
      );
      npc.AddComponent(
        new spatial_grid_controller.SpatialGridController({ grid: this._grid })
      );
      npc.AddComponent(
        new health_bar.HealthBar({
          parent: this._scene,
          camera: this._camera,
        })
      );
      npc.AddComponent(
        new attack_controller.AttackController({ timing: 0.35 })
      );
      npc.SetPosition(
        new THREE.Vector3(
          Math.random() * 300-150,
          0,
          Math.random() * 280 - 140
        )
      );
      this._entityManager.Add(npc);
    }
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
	  //this._stats.update();
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    if (this._selected) {
      const timeElapsedS = Math.min(
        (1.0 / 30.0) * 1.3,
        timeElapsed * 0.001 * 1.3
      );
      //paso de tiempo del sol
      let intensidad = this._cielo._phi;
      intensidad += 0.1 / 8;
      this._cielo.phi = intensidad % 180; //la intensidad debe estar entre 0 y 180
      this._sun.position.set(
        this._cielo.sunPosition.x,
        this._cielo.sunPosition.y,
        this._cielo.sunPosition.z
      ); //seteando la posicion del sol
      this._sun.intensity = this._cielo.hemiLight.intensity;
      this._cielo.update();
      this._entityManager.Update(timeElapsedS*1.1);

      //mover el agua
    //   this._agua.update(this._cielo._phi / 1800 + 0.0001);
    //   this._ocean.position.setY(intensidad / 18 - 40);
      //proceso para dar movimiento a nubes
      this._clouds.forEach((e) => {
        //si la nube pasa el umbral, se "resetea"
        e.position.z > 1000
          ? e.position.copy(
              new THREE.Vector3(e._position.x, e._position.y, -1000)
            )
          : e.position.copy(
              new THREE.Vector3(
                e.position.x,
                e.position.y,
                e.position.z + 0.1 / (Math.random() * 2 + 5)
              )
            );
      });
    }
  }
}

let _APP = null;
function onTransitionEnd(event) {
  event.target.remove();
}
window.addEventListener("DOMContentLoaded", () => {
  _APP = new HackNSlashDemo();
});
