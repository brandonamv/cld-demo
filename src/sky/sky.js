import { SkyShader } from './skyShader.js';
import * as THREE from '../../node_modules/three/build/three.module.js';

export class Sky extends THREE.	Object3D 
{

	/**
	 * @param {Number} value
	 */
	set theta(value) {
		this._theta = value;
		this.refreshSunPosition();
	}

	/**
	 * @param {Number} value
	 */
	set phi(value) {
		this._phi = value;
		this.refreshSunPosition();
		this.refreshHemiIntensity();
	}
	
	constructor(scene, camera)
	{
		super();

		this.sunPosition= new THREE.Vector3();
		this._phi=50;							//sun elevation
		this._theta=145;						//sun rotation
		this.maxHemiIntensity= 0.9;
		this.minHemiIntensity= 0.3;

		this.scene=scene;
        this.camera=camera;
		
		// Sky material
		this.skyMaterial = new THREE.ShaderMaterial({
			name: 'SkyShader',
			uniforms: THREE.UniformsUtils.clone(SkyShader.uniforms),
			fragmentShader: SkyShader.fragmentShader,
			vertexShader: SkyShader.vertexShader,
			side: THREE.BackSide,
			depthWrite: false
		});

		// Mesh
		this.skyMesh = new THREE.Mesh(
			new THREE.SphereGeometry(500, 24, 12),
			this.skyMaterial
		);
		this.attach(this.skyMesh);
		// Ambient light
		this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.0 );
		this.refreshHemiIntensity();
		this.hemiLight.color.setHSL( 0.59, 0.4, 0.6 );
		this.hemiLight.groundColor.setHSL( 0.095, 0.2, 0.75 );
		this.hemiLight.position.set( 0, 50, 0 );
		this.scene.add( this.hemiLight );


		// Legacy
		let splitsCallback = (amount) =>
		{
			let arr= [];

			for (let i = amount - 1; i >= 0; i--)
			{
				arr.push(Math.pow(1 / 4, i));
			}

			return arr;
		};

		this.refreshSunPosition();
		
		scene.add(this);
	}

	update()
	{
		this.position.copy(this.camera.position);
		this.refreshSunPosition();
	}

	refreshSunPosition()
	{
		const sunDistance = 10;
		this.sunPosition.x = sunDistance * Math.sin(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);
		this.sunPosition.y = sunDistance * Math.sin(this._phi * Math.PI / 180);
		this.sunPosition.z = sunDistance * Math.cos(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);

		this.skyMaterial.uniforms.sunPosition.value.copy(this.sunPosition);
		this.skyMaterial.uniforms.cameraPos.value.copy(this.camera.position);
	}

	refreshHemiIntensity()
	{
		this.hemiLight.intensity = this.minHemiIntensity + Math.pow(1 - (Math.abs(this._phi - 90) / 90), 0.25) * (this.maxHemiIntensity - this.minHemiIntensity);
	}
}
