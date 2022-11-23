<template>
  <div class="threejs">
    <h1>{{ msg }}</h1>

  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { Pathfinding } from 'three-pathfinding';
import {FirstPersonControls} from '../scripts/firstPerson';
// import {FirstPersonControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/FirstPersonControls.js';

export default {
  name: 'threejs',
  data() {
    return{
      mouse :{ x:0, y:0 },
      raycaster:new THREE.Raycaster(),
     camera : new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000),
     navmesh:new THREE.Object3D(),
     sceneMeshes: []
    }
   
  },
  props: {
    msg: String
  },
  methods:{
     init: function(){
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xdddddd);
      // this.pathfinder = new Pathfinding();
     
      // this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
      this.camera.rotation.y = 10 / 180 * Math.PI;
      this.camera.position.x = 10;
      this.camera.position.y = 3;
      this.camera.position.z = 20;
      // this.camera.lookAt(this.scene.position);
      
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.physicallyCorrectLights = true;
    
      document.body.appendChild(this.renderer.domElement);

      this.controls =  new FirstPersonControls(this.camera, this.renderer.domElement);
      this.controls.movementSpeed =  5;
      this.controls.lookSpeed = 0.01;
      this.controls.noFly = false;
      this.controls.lookVertical = false;
     

      this.hlight = new THREE.AmbientLight(0xffffff, 3);;
      this.scene.add(this.hlight);
      let loader = new GLTFLoader();
      loader.load("/ShowRoom121122.glb",  (gltf) => {

			
        const self = this;
				gltf.scene.traverse(function (child) {
        
    				if (child.isMesh){
      
						if (child.name=="navMesh_1"  ){
              
              self.navmesh=child;
              self.sceneMeshes.push(child);
							child.material.transparent = true;
							child.material.opacity =0.3;
              // let pathfinder = new Pathfinding();
              //  this.raycaster = new THREE.Raycaster();
              // const ZONE = 'Ausstellung';
							// const mesh = new THREE.Mesh(child.geometry, new THREE.MeshBasicMaterial({ wireframe: true, color: 0x111111}));
							// mesh.position.copy(child.position);
              // // pathfinder.setZoneData(ZONE, Pathfinding.createZone(child.geometry));
							// // mesh.quaternion.copy(child.quaternion);
							// gltf.scene.add(mesh);
					
						}
            else if(child.name=="wall_1" ||child.name=="wall_2"){
              self.navmesh=child;
              self.sceneMeshes.push(child);
            }
            else{
							child.castShadow = false;
							child.receiveShadow = true;
						}
            self.scene.add( gltf.scene );
					}
				})});
        
      // this.renderer.setAnimationLoop(this.animate)
    },
    raycast:function(e){
    
    	// debugger	
      let mousex=0;
			this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
      this.raycaster.ray.origin.copy( this.camera.position );
this.camera.getWorldDirection( this.raycaster.ray.direction );

			//2. set the picking ray from the camera position and mouse coordinates
			this.raycaster.setFromCamera( this.mouse, this.camera );    

			//3. compute intersections
			const intersects = this.raycaster.intersectObjects( this.sceneMeshes );
		
			if (intersects.length>0)
      {
       console.log(intersects[0])
      }
      else{
       
      }
  
    },
    animate:function(){
      requestAnimationFrame(this.animate)
      this.controls.update(0.01);
      this.renderer.render(this.scene, this.camera);
      this.renderer.domElement.addEventListener( 'mousedown', this.raycast,false );
    }
  },
  mounted() {
      this.init();
      this.animate();
  }
}
</script>


