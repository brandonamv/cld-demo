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
			this.point= new Point(x1,y1,z1);
			this.size=1;
		}

		else{
			// This use to construct Octree
			// with boundaries defined
			this.size=0;
			if (x2 < x1
				|| y2 < y1
				|| z2 < z1) {
				//console.log("boundary points are not valid",{x2,y2,z2},{x1,y1,z1});
				return;
			}
			// if point == NULL, node is internal node.
			this.size=8;
			this.point = null;
			// Represent the boundary of the cube
			this.topLeftFront= new Point(x1, y1, z1);
			this.bottomRightBack= new Point(x2, y2, z2);
	
			// Assigning null to the this.children
			this.children=new Array(8).fill(new Octree());
		}
	}

	// Function to insert a point in the octree
	insert(x, y, z){

		// If the point already exists in the octree
		if (find(x, y, z)) {
			console.log("Point already exist in the tree");
			return false;
		}

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
				/* if (compare(this.topLeftFront.x,this.topLeftFront.y,this.topLeftFront.z,
					midx,midy,midz)){
					this.children[pos] = new Octree(x,y,z);
					
					return true; 
				} */
				this.children[pos] = new Octree(this.topLeftFront.x,
										this.topLeftFront.y,
										this.topLeftFront.z,
										midx,
										midy,
										midz);
			}

			else if (pos == TopRightFront) {
				/* if (compare(midx + 0.5,this.topLeftFront.y,this.topLeftFront.z,
					this.bottomRightBack.x,midy,midz)){
					this.children[pos] = new Octree(x,y,z);
					
					return true;
				} */
				this.children[pos] = new Octree(midx + 0.000001,
										this.topLeftFront.y,
										this.topLeftFront.z,
										this.bottomRightBack.x,
										midy,
										midz);
			}
			else if (pos == BottomRightFront) {
				/* if (compare(midx + 0.000001,midy + 0.000001,this.topLeftFront.z,
					this.bottomRightBack.x,this.bottomRightBack.y,midz)){
					this.children[pos] = new Octree(x,y,z);
					
					return true;
				} */
				this.children[pos] = new Octree(midx + 0.000001,
										midy + 0.000001,
										this.topLeftFront.z,
										this.bottomRightBack.x,
										this.bottomRightBack.y,
										midz);
			}
			else if (pos == BottomLeftFront) {
				/* if (compare(this.topLeftFront.x,midy + 0.000001,this.topLeftFront.z,
					midx,this.bottomRightBack.y,midz)){
					this.children[pos] = new Octree(x,y,z);
					
					return true;
				} */
				this.children[pos] = new Octree(this.topLeftFront.x,
										midy + 0.000001,
										this.topLeftFront.z,
										midx,
										this.bottomRightBack.y,
										midz);
			}
			else if (pos == TopLeftBottom) {
				/* if (compare(this.topLeftFront.x,this.topLeftFront.y,midz + 0.000001,
					midx,midy,this.bottomRightBack.z)){
					this.children[pos] = new Octree(x,y,z);
					
					return true;
				} */
				this.children[pos] = new Octree(this.topLeftFront.x,
										this.topLeftFront.y,
										midz + 0.000001,
										midx,
										midy,
										this.bottomRightBack.z);
			}
			else if (pos == TopRightBottom) {
				/* if (compare(midx + 0.000001,this.topLeftFront.y,midz + 0.000001,
					this.bottomRightBack.x,midy,this.bottomRightBack.z)){
					this.children[pos] = new Octree(x,y,z);
					
					return true;
				} */
				this.children[pos] = new Octree(midx + 0.000001,
										this.topLeftFront.y,
										midz + 0.000001,
										this.bottomRightBack.x,
										midy,
										this.bottomRightBack.z);
			}
			else if (pos == BottomRightBack) {
				/* if (compare(midx + 0.000001,midy + 0.000001,midz + 0.000001,
					this.bottomRightBack.x,this.bottomRightBack.y,this.bottomRightBack.z)){
					this.children[pos] = new Octree(x,y,z);
					
					return true;
				} */
				this.children[pos] = new Octree(midx + 0.000001,
										midy + 0.000001,
										midz + 0.000001,
										this.bottomRightBack.x,
										this.bottomRightBack.y,
										this.bottomRightBack.z);
			}
			else if (pos == BottomLeftBack) {
				/* if (compare(this.topLeftFront.x,midy + 0.000001,midz + 0.000001,
					midx,this.bottomRightBack.y,this.bottomRightBack.z)){
					this.children[pos] = new Octree(x,y,z);
					
					return true;
				} */
				this.children[pos] = new Octree(this.topLeftFront.x,
										midy + 0.000001,
										midz + 0.000001,
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
			if (this.children[pos].size>1) {
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
	findOut(x, y, z)
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
            return this.children[pos].findOut(x, y, z);
        }
 
        // If an empty node is encountered
        else if (this.children[pos].point.x == null) {
            return false;
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

export {octree};
/**
 * function for init the octree
 * @param {THREE.Vector3} min Min value posible in the scene
 * @param {THREE.Vector3} max Max value posible in the scene
 */
export function newOctree(min,max) {
	octree=new Octree(min.x,min.y,min.z,max.x,max.y,max.z);
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
	const drawLine=(x1,y1,z1,x2,y2,z2)=> {
		let i, dx, dy, dz, l, m, n, x_inc, y_inc, z_inc, err_1, err_2, dx2, dy2, dz2;
		let point=[];
		
		point.push(x1);
		point.push(y1);
		point.push(z1);
		dx = x2 - x1;
		dy = y2 - y1;
		dz = z2 - z1;
		x_inc = (dx < 0) ? -1 : 1;
		l = Math.abs(dx);
		y_inc = (dy < 0) ? -1 : 1;
		m = Math.abs(dy);
		z_inc = (dz < 0) ? -1 : 1;
		n = Math.abs(dz);
		dx2 = l << 1;
		dy2 = m << 1;
		dz2 = n << 1;
		
		if ((l >= m) && (l >= n)) {
			err_1 = dy2 - l;
			err_2 = dz2 - l;
			for (i = 0; i < l; i++) {
				if(!octree.insert(point[0],point[1],point[2])){
					debugs.push(new THREE.Vector3(point[0],point[1],point[2]));
				}
				if (err_1 > 0) {
					point[1] += y_inc;
					err_1 -= dx2;
				}
				if (err_2 > 0) {
					point[2] += z_inc;
					err_2 -= dx2;
				}
				err_1 += dy2;
				err_2 += dz2;
				point[0] += x_inc;
			}
		} else if ((m >= l) && (m >= n)) {
			err_1 = dx2 - m;
			err_2 = dz2 - m;
			for (i = 0; i < m; i++) {
				if(!octree.insert(point[0],point[1],point[2])){
					debugs.push(new THREE.Vector3(point[0],point[1],point[2]));
				}
				if (err_1 > 0) {
					point[0] += x_inc;
					err_1 -= dy2;
				}
				if (err_2 > 0) {
					point[2] += z_inc;
					err_2 -= dy2;
				}
				err_1 += dx2;
				err_2 += dz2;
				point[1] += y_inc;
			}
		} else {
			err_1 = dy2 - n;
			err_2 = dx2 - n;
			for (i = 0; i < n; i++) {
				if(!octree.insert(point[0],point[1],point[2])){
					debugs.push(new THREE.Vector3(point[0],point[1],point[2]));
				}
				if (err_1 > 0) {
					point[1] += y_inc;
					err_1 -= dz2;
				}
				if (err_2 > 0) {
					point[0] += x_inc;
					err_2 -= dz2;
				}
				err_1 += dy2;
				err_2 += dx2;
				point[2] += z_inc;
			}
		}
		if(!octree.insert(point[0],point[1],point[2])){
			debugs.push(new THREE.Vector3(point[0],point[1],point[2]));
		}
	}
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
		if (!octree.find(point.x,point.y,point.z)) {
			if(octree.insert(point.x,point.y,point.z)){
				//ubicacion.push({x:point.x,y:point.y,z:point.z});
				debugs.push(point);
			}
		} 	
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
	const pres=1/presition;
	
	const debugs=[];
	for (let i = min.y; i <= max.y; i+=pres) {
		for (let j = min.x; j <= max.x; j+=pres) {
			for (let k = min.z; k <= max.z; k+=pres) {
				const point=new THREE.Vector3(j,i,k).applyMatrix4(mesh.matrixWorld);
				point.set(Number(point.x.toFixed(presition)),Number(point.y.toFixed(presition)),Number(point.z.toFixed(presition)));
				if (!octree.find(point.x,point.y,point.z)) {
					if(octree.insert(point.x,point.y,point.z)){
						debugs.push(point);
					}
				}
			}
		}
	}
	
	const geometry=new THREE.BufferGeometry().setFromPoints( debugs );
	const line=new THREE.Line(geometry,material_cold);
	line.visible=debug;
	v_debug=debug;
	line.name='debug';
	scene.add(line);
	
	
}

/** 
 * Function to detect object actual position collision
 * @param {THREE.Vector3} position the object.position
 * @param {THREE.Vector3} scale the object.scale
 */
export function detectColision(position,scale) {
	for (let i = -0.5; i < scale.y; i+=0.5) {
		if(octree.findOut(Number(position.x).toFixed(2),i,Number(position.z).toFixed(2))){
			return true;
		}
	}
	return false;
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