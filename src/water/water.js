import * as THREE from 'three';

import { WaterShader } from './waterShader.js';

export class Ocean
{
	/* public updateOrder: number = 10;
	public material: THREE.ShaderMaterial;

	private world: World; */
	//object es el mallado al que le aplicaras la textura
	constructor(object, camera, sky)
	{
		this.camera=camera;
        this.sky=sky;

		let uniforms = THREE.UniformsUtils.clone(WaterShader.uniforms);
		uniforms.iResolution.value.x = window.innerWidth;
		uniforms.iResolution.value.y = window.innerHeight;

		this.material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			fragmentShader: WaterShader.fragmentShader,
			vertexShader: WaterShader.vertexShader,
		});

		object.material = this.material;
		object.material.transparent = true;
	}

	update(timeStep)
	{
		this.material.uniforms.cameraPos.value.copy(this.camera.position);
		this.material.uniforms.lightDir.value.copy(new THREE.Vector3().copy(this.sky.sunPosition).normalize());
		this.material.uniforms.iGlobalTime.value += timeStep;
	}
}
