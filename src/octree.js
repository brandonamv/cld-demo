import * as THREE from '../node_modules/three/build/three.module.js';

const TopLeftFront= 0;
const TopRightFront= 1;
const BottomRightFront= 2;
const BottomLeftFront= 3;
const TopLeftBottom= 4;
const TopRightBottom= 5;
const BottomRightBack= 6;
const BottomLeftBack= 7;
//se compara con un rango de error permitido
function compareFind(x1,y1,z1,x2,y2,z2) {
	if (Math.abs(x2-x1)<2&&Math.abs(y2-y1)<2&&Math.abs(z2-z1)<2) {
		return true;
	}else{
		return false;
	}
	
}


// Structure of a point
class Point{
	constructor(x,y,z){
		if (!arguments.length){
			this.x=null;
			this.y=null;
			this.z=null;
		} else {
			this.x=x;
			this.y=y;
			this.z=z;
		}
	}
}

class Octree{
	constructor(x1,y1,z1,x2,y2,z2){
		// if point == (null, null, null), node is empty.
		if (!arguments.length)
			this.point=new Point();
		else if(arguments.length==3){
			this.point=new Point(x1,y1,z1);
		}
		else{
			// This use to construct Octree
			// with boundaries defined
			if (x2 < x1
				|| y2 < y1
				|| z2 < z1) {
				//console.log("boundary points are not valid",{x2,y2,z2},{x1,y1,z1});
				return;
			}
			this.children=new Array(8).fill(new Octree());
			// if point == NULL, node is internal node.
			this.point = null;
			// Represent the boundary of the cube
			this.topLeftFront= new Point(x1, y1, z1);
			this.bottomRightBack= new Point(x2, y2, z2);
				
		}
	}

	// Function to insert a point in the octree
	insert(x, y, z){

		// If the point already exists in the octree
		if (find(x, y, z))return false;
		// If the point is out of bounds
		if (x < this.topLeftFront.x
			|| x > this.bottomRightBack.x
			|| y < this.topLeftFront.y
			|| y > this.bottomRightBack.y
			|| z < this.topLeftFront.z
			|| z > this.bottomRightBack.z) {
			//console.log(this.bottomRightBack,this.topLeftFront,x,y,z);
			//console.log("Point is out of bound" );
			return false;
		}

		// Binary search to insert the point
		const midx = (this.topLeftFront.x
					+ this.bottomRightBack.x)
				/ 2;
		const midy = (this.topLeftFront.y
					+ this.bottomRightBack.y)
				/ 2;
		const midz = (this.topLeftFront.z
					+ this.bottomRightBack.z)
				/ 2;

		let pos = -1;

		// Checking the octant of
		// the point
		if (x <= midx) {
			if (y <= midy) {
				if (z <= midz)
					pos = TopLeftFront;
				else
					pos = TopLeftBottom;
			}
			else {
				if (z <= midz)
					pos = BottomLeftFront;
				else
					pos = BottomLeftBack;
			}
		}
		else {
			if (y <= midy) {
				if (z <= midz)
					pos = TopRightFront;
				else
					pos = TopRightBottom;
			}
			else {
				if (z <= midz)
					pos = BottomRightFront;
				else
					pos = BottomRightBack;
			}
		}

		// If an internal node is encountered
		if (this.children[pos].point == null) {
			this.children[pos].insert(x, y, z);
			return true;
		}

		// If an empty node is encountered
		else if (this.children[pos].point.x == null) {
			delete this.children[pos];
			this.children[pos] = new Octree(x, y, z);
			return true;
		}
		else {
			if (this.children[pos].point.x==x &&
				this.children[pos].point.y==y &&
				this.children[pos].point.z==z ) {
				return false;
			}
			const x_ = this.children[pos].point.x,
				y_ = this.children[pos].point.y,
				z_ = this.children[pos].point.z;
			
			delete this.children[pos];
			this.children[pos] = null;
			if (pos == TopLeftFront) {
				
				this.children[pos] = new Octree(this.topLeftFront.x,
										this.topLeftFront.y,
										this.topLeftFront.z,
										midx,
										midy,
										midz);
			}

			else if (pos == TopRightFront) {
				
				this.children[pos] = new Octree(midx,
										this.topLeftFront.y,
										this.topLeftFront.z,
										this.bottomRightBack.x,
										midy,
										midz);
			}
			else if (pos == BottomRightFront) {
				
				this.children[pos] = new Octree(midx,
										midy,
										this.topLeftFront.z,
										this.bottomRightBack.x,
										this.bottomRightBack.y,
										midz);
			}
			else if (pos == BottomLeftFront) {
				
				this.children[pos] = new Octree(this.topLeftFront.x,
										midy,
										this.topLeftFront.z,
										midx,
										this.bottomRightBack.y,
										midz);
			}
			else if (pos == TopLeftBottom) {
				
				this.children[pos] = new Octree(this.topLeftFront.x,
										this.topLeftFront.y,
										midz,
										midx,
										midy,
										this.bottomRightBack.z);
			}
			else if (pos == TopRightBottom) {
				
				this.children[pos] = new Octree(midx,
										this.topLeftFront.y,
										midz,
										this.bottomRightBack.x,
										midy,
										this.bottomRightBack.z);
			}
			else if (pos == BottomRightBack) {
				
				this.children[pos] = new Octree(midx,
										midy,
										midz,
										this.bottomRightBack.x,
										this.bottomRightBack.y,
										this.bottomRightBack.z);
			}
			else if (pos == BottomLeftBack) {
				
				this.children[pos] = new Octree(this.topLeftFront.x,
										midy,
										midz,
										midx,
										this.bottomRightBack.y,
										this.bottomRightBack.z);
				
			}
			/* if (!this.children[pos].insert(x_, y_, z_)) {
				console.log("error_",this.children[pos],x_,y_,z_);
			}
			if (!this.children[pos].insert(x, y, z)) {
				console.log("error",x,y,z);
			} */
			if (this.children[pos].point==null) {
				this.children[pos].insert(x_, y_, z_);
				this.children[pos].insert(x, y, z);
				return true;
			}else{
				this.children[pos]=new Octree(x,y,z);
				return true;
			}
			
		}
	}
	// Function that returns true if the point
    // (x, y, z) exists in the octree
    find(x, y, z)
    {
        // If point is out of bound
        if (x < this.topLeftFront.x
            || x > this.bottomRightBack.x
            || y < this.topLeftFront.y
            || y > this.bottomRightBack.y
            || z < this.topLeftFront.z
            || z > this.bottomRightBack.z){
			//console.log(x,y,z,this);
            return false;
 		}
        // Otherwise perform binary search
        // for each ordinate
        const midx = (this.topLeftFront.x
                    + this.bottomRightBack.x)
                   / 2;
        const midy = (this.topLeftFront.y
                    + this.bottomRightBack.y)
                   / 2;
        const midz = (this.topLeftFront.z
                    + this.bottomRightBack.z)
                   / 2;
 
        let pos = -1;
 
        // Deciding the position
        // where to move
        if (x <= midx) {
            if (y <= midy) {
                if (z <= midz)
                    pos = TopLeftFront;
                else
                    pos = TopLeftBottom;
            }
            else {
                if (z <= midz)
                    pos = BottomLeftFront;
                else
                    pos = BottomLeftBack;
            }
        }
        else {
            if (y <= midy) {
                if (z <= midz)
                    pos = TopRightFront;
                else
                    pos = TopRightBottom;
            }
            else {
                if (z <= midz)
                    pos = BottomRightFront;
                else
                    pos = BottomRightBack;
            }
        }
 
        // If an internal node is encountered
        if (this.children[pos].point == null) {
            return this.children[pos].find(x, y, z);
        }
 
        // If an empty node is encountered
        else if (this.children[pos].point.x == null) {
            return false;
        }
        else {
            // If node is found with
            // the given value
            return x==this.children[pos].point.x&&y==this.children[pos].point.y&&z==this.children[pos].point.z;
        }
    }
	findOut(x, y, z, bounding)
    {
        // If point is out of bound
        if (x < this.topLeftFront.x
            || x > this.bottomRightBack.x
            || y < this.topLeftFront.y
            || y > this.bottomRightBack.y
            || z < this.topLeftFront.z
            || z > this.bottomRightBack.z){
			//console.log(x,y,z,this);
            return false;
 		}
        // Otherwise perform binary search
        // for each ordinate
        const midx = (this.topLeftFront.x
                    + this.bottomRightBack.x)
                   / 2;
        const midy = (this.topLeftFront.y
                    + this.bottomRightBack.y)
                   / 2;
        const midz = (this.topLeftFront.z
                    + this.bottomRightBack.z)
                   / 2;
 
        let pos = -1;
 
        // Deciding the position
        // where to move
        if (x <= midx) {
            if (y <= midy) {
                if (z <= midz)
                    pos = TopLeftFront;
                else
                    pos = TopLeftBottom;
            }
            else {
                if (z <= midz)
                    pos = BottomLeftFront;
                else
                    pos = BottomLeftBack;
            }
        }
        else {
            if (y <= midy) {
                if (z <= midz)
                    pos = TopRightFront;
                else
                    pos = TopRightBottom;
            }
            else {
                if (z <= midz)
                    pos = BottomRightFront;
                else
                    pos = BottomRightBack;
            }
        }
 
        // If an internal node is encountered
        if (this.children[pos].point == null) {
            return this.children[pos].findOut(x, y, z, bounding);
        }
 
        // If an empty node is encountered
        else if (this.children[pos].point.x == null) {
			if (this.bottomRightBack.x-this.topLeftFront.x>bounding) {
				return false;
			} else {
				for (let i = 0; i < 8; i++) {
					if(this.children[i].point==null){
						return true;
					}
				}
				return false;
			}
        }
        else {
            // If node is found with
            // the given value
            return compareFind(x,y,z, 
				this.children[pos].point.x,this.children[pos].point.y,this.children[pos].point.z);
        }
    }
	
}
export {Octree};
//https://www.geeksforgeeks.org/octree-insertion-and-searching/
var octree;
var ubicacion=[];
var v_debug=false;
var material_cold = new THREE.LineBasicMaterial({
	color: 0x0000ff
});

export {octree,v_debug};
/**
 * function for init the octree
 * @param {Number} min Min value posible in the scene
 * @param {Number} max Max value posible in the scene
 */
export function newOctree(min,max) {
	octree=new Octree(min,min,min,max,max,max);
}

/**
 * Add points from object mesh
 * @param {THREE.Mesh} mesh object mesh
 * @param {Number} presition determine number of points detail to be saved
 * @param {THREE.Scene} scene mother scene
 * @param {Boolean} debug set visible/invisible collision lines
 * 
 */
export function addPointsFromMesh(mesh,presition,scene,debug) {
	const debugs=[];
	
	const pos=mesh.geometry.attributes.position;
	/* const traslation=new THREE.Matrix4().makeTranslation(mesh.position.x,mesh.position.y,mesh.position.z);
	const rotation= new THREE.Matrix4().makeRotationFromEuler(mesh.rotation);
	const scale= new THREE.Matrix4().makeScale(mesh.scale.x*4,mesh.scale.y*4,mesh.scale.z*4);
	const model=traslation.multiply(rotation.multiply(scale)); */
	const index=mesh.geometry.index;
	
	for (let i = 0; i < index.count/3; i++) {
		const point=new THREE.Vector3(pos.array[index.array[i*3]*3],pos.array[index.array[i*3]*3+1],pos.array[index.array[i*3]*3+2]).applyMatrix4(mesh.matrixWorld);
		// const pointb=new THREE.Vector3(pos.array[index.array[i*3+1]*3],pos.array[index.array[i*3+1]*3+1],pos.array[index.array[i*3+1]*3+2]).applyMatrix4(mesh.matrixWorld);
		// const pointc=new THREE.Vector3(pos.array[index.array[i*3+2]*3],pos.array[index.array[i*3+2]*3+1],pos.array[index.array[i*3+2]*3+2]).applyMatrix4(mesh.matrixWorld);
		point.set(Number(point.x.toFixed(presition)),Number(point.y.toFixed(presition)),Number(point.z.toFixed(presition)));
		//if (!octree.find(point.x,point.y,point.z)) {
			if(octree.insert(point.x,point.y,point.z)){
				//ubicacion.push({x:point.x,y:point.y,z:point.z});
				debugs.push(point);
			}
		//} 	
		/*if (!octree.find(Number(pointb.x.toFixed(presition)),Number(pointb.y.toFixed(presition)),Number(pointb.z.toFixed(presition)))) {
			if(octree.insert(Number(pointb.x.toFixed(presition)),Number(pointb.y.toFixed(presition)),Number(pointb.z.toFixed(presition)))){
				//ubicacion.push({x:Number(pointb.x.toFixed(presition)),y:Number(pointb.y.toFixed(presition)),z:Number(pointb.z.toFixed(presition))});
				debugs.push(new THREE.Vector3(Number(pointb.x.toFixed(presition)),Number(pointb.y.toFixed(presition)),Number(pointb.z.toFixed(presition))));
			}
		} 
		if (!octree.find(Number(pointc.x.toFixed(presition)),Number(pointc.y.toFixed(presition)),Number(pointc.z.toFixed(presition)))) {
			if(octree.insert(Number(pointc.x.toFixed(presition)),Number(pointc.y.toFixed(presition)),Number(pointc.z.toFixed(presition)))){
				//ubicacion.push({x:Number(pointc.x.toFixed(presition)),y:Number(pointc.y.toFixed(presition)),z:Number(pointc.z.toFixed(presition))});
				debugs.push(new THREE.Vector3(Number(pointc.x.toFixed(presition)),Number(pointc.y.toFixed(presition)),Number(pointc.z.toFixed(presition))));
			}
		}  */
		// drawLine(Number(pointa.x.toFixed(presition)),Number(pointa.y.toFixed(presition)),Number(pointa.z.toFixed(presition)),Number(pointb.x.toFixed(presition)),Number(pointb.y.toFixed(presition)),Number(pointb.z.toFixed(presition)));
		// drawLine(Number(pointa.x.toFixed(presition)),Number(pointa.y.toFixed(presition)),Number(pointa.z.toFixed(presition)),Number(pointc.x.toFixed(presition)),Number(pointc.y.toFixed(presition)),Number(pointc.z.toFixed(presition)));
		// drawLine(Number(pointc.x.toFixed(presition)),Number(pointc.y.toFixed(presition)),Number(pointc.z.toFixed(presition)),Number(pointb.x.toFixed(presition)),Number(pointb.y.toFixed(presition)),Number(pointb.z.toFixed(presition)));
	}
	// if (!model.equals(mesh.matrixWorld)) {
	// 	console.log("no agrupados");
	// }else{
		/* if (n%3!=0) {
			console.log(mesh);
			material_cold = new THREE.LineBasicMaterial({
				color: 0x00ff00
			}); 
		} else{
			
			material_cold = new THREE.LineBasicMaterial({
				color: 0xff0000
			});	
		} */
	//}
	/* let material_cold = new THREE.LineBasicMaterial({
		color: 0x0000ff
	}); */
	
	
	// for (let i = 0; i < pos.count; i++) {
	// 	const point=new THREE.Vector3(pos.array[i*3],pos.array[i*3+1],pos.array[i*3+2]).applyMatrix4(mesh.matrixWorld);
	// 	if (!octree.find(Number(point.x.toFixed(presition)),Number(point.y.toFixed(presition)),Number(point.z.toFixed(presition)))) {
	// 		if(octree.insert(Number(point.x.toFixed(presition)),Number(point.y.toFixed(presition)),Number(point.z.toFixed(presition)))){
	// 			//ubicacion.push({x:Number(point.x.toFixed(presition)),y:Number(point.y.toFixed(presition)),z:Number(point.z.toFixed(presition))});
	// 			debugs.push(new THREE.Vector3(Number(point.x.toFixed(presition)),Number(point.y.toFixed(presition)),Number(point.z.toFixed(presition))));
	// 		}
	// 	} 
	// }
	
	const geometry=new THREE.BufferGeometry().setFromPoints( debugs );
	/* var geometry = new THREE.BufferGeometry();
	var positions = new Float32Array( debugs.length * 3 ); 
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) ); */
	const line=new THREE.Line(geometry,material_cold);
	line.visible=debug;
	v_debug=debug;
	line.name='debug';
	scene.add(line);
	/* ubicacion.forEach(e=>{
		if(!octree.findOut(e.x,e.y,e.z))
			console.log("no encontro");
	}) */
}

/**
 * Add points from object bounding
 * @param {THREE.Mesh} mesh object mesh
 * @param {Number} presition determine number of points detail to be saved
 * @param {THREE.Scene} scene mother scene
 * @param {Boolean} debug set visible/invisible collision lines
 */
export function addPointsFromBounding(mesh,presition,scene,debug) {
	
	// const traslation=new THREE.Matrix4().makeTranslation(mesh.position.x,mesh.position.y,mesh.position.z);
	// const rotation= new THREE.Matrix4().makeRotationFromEuler(mesh.rotation);
	// const scale= new THREE.Matrix4().makeScale(mesh.scale.x,mesh.scale.y,mesh.scale.z);
	// const model=traslation.multiply(rotation.multiply(scale));

	const max=mesh.geometry.boundingBox.max;
	const min=mesh.geometry.boundingBox.min;
	if (max.x<min.x) {
		const aux=max.x;
		max.x=min.x;
		min.x=aux;
	}
	if (max.z<min.z) {
		const aux=max.z;
		max.z=min.z;
		min.z=aux;
	}
	const pres=1/(presition+1);
	var dotGeometry = new THREE.BufferGeometry();
	const points=[];
	//const debugs=[];
	for (let i = min.y; i <= max.y; i+=pres) {
		for (let j = min.x-.1; j <= max.x+.1; j+=pres) {
			for (let k = min.z-.1; k <= max.z+.1; k+=pres) {
				const point=new THREE.Vector3(j,i,k).applyMatrix4(mesh.matrixWorld);
				point.set(Number(point.x.toFixed(presition)),Number(point.y.toFixed(presition)),Number(point.z.toFixed(presition)));
				//if (!octree.find(point.x,point.y,point.z)) {
					if(octree.insert(point.x,point.y,point.z)){
						//debugs.push(point);
						points.push(point.x);
						points.push(point.y);
						points.push(point.z);
					}
				//}
			}
		}
	}
	dotGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
	var dotMaterial = new THREE.PointsMaterial( { size: 1, color: 0x00ff00 } );
	var dot = new THREE.Points( dotGeometry, dotMaterial );
	dot.visible=debug;
	dot.name='debug'
	scene.add( dot );
	// const geometry=new THREE.BufferGeometry().setFromPoints( debugs );
	// const line=new THREE.Line(geometry,material_cold);
	// line.visible=debug;
	v_debug=debug;
	// line.name='debug';
	// scene.add(line);
	
	
}

/** 
 * Function to detect object actual position collision
 * @param {THREE.Vector3} position the object.position
 * @param {THREE.Vector3} min the object.min
 * @param {THREE.Vector3} max the object.max
 */
export function detectColision(position,min,max) {
	/* for (let i = position.x+min.x; i <position.x+max.x ; i++) {
		for (let j = position.y+min.y; j < position.y+max.y; j++) {
			if(octree.findOut(i,j,position.z+min.z)||octree.findOut(i,j,position.z+max.z)){
				return true;
			}
		}
	}
	for (let j = position.y+min.y; j < position.y+max.y; j++) {
		for (let k = position.z+min.z; k < position.z+max.z; k++) {
			if(octree.findOut(position.x+min.x,j,k)||octree.findOut(position.x+max.x,j,k)){
				return true;
			}
		}
		
	}
	for (let k = position.z+min.z; k < position.z+max.z; k++) {
		for (let i = position.x+min.x; i <position.x+max.x ; i++) {
			if(octree.findOut(i,position.y+min.y,k)||octree.findOut(i,position.y+max.y,k)){
				return true;
			}
		}
	} */
	const center=new THREE.Vector3((max.x+min.x)/2,(max.y+min.y)/2,(max.z+min.z)/2);
	const distance= new THREE.Vector3(max.x-min.x,max.y-min.y,max.z-min.z);
	let range=0;
	if (distance.x<distance.y<distance.z) {
		range=distance.x;
	}else{
		if (distance.y<distance.z) {
			range=distance.y;
		} else {
			range=distance.z;
		}
	}
	return octree.findOut(position.x+center.x,position.y+center.y,position.z+center.z,range);
}

/** 
 * Active/Desactive Collision lines visible
 * @param {THREE.Scene} scene mother scene
 * @param {Boolean} value active/desactive debug
 */
export function setDebug(scene,value) {
	v_debug = !((value || v_debug) && (!value || !v_debug));
	scene.traverse(object=>{
		if (object.name=='debug') {
			object.visible=v_debug;
		}
	});
}