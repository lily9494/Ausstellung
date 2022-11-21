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
     navmesh:new THREE.Object3D()
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
              // debugger
						if (child.name=="navMesh_1"){
              debugger
              // let pathfinder = new Pathfinding();
              //  this.raycaster = new THREE.Raycaster();
              self.navmesh=child;
              // const ZONE = 'Ausstellung';
							child.material.transparent = true;
							child.material.opacity = 0.5;
							const mesh = new THREE.Mesh(child.geometry, new THREE.MeshBasicMaterial({ wireframe: true, color: 0x111111}));
							mesh.position.copy(child.position);
              // pathfinder.setZoneData(ZONE, Pathfinding.createZone(child.geometry));
							// mesh.quaternion.copy(child.quaternion);
							gltf.scene.add(mesh);
					
						}else{
							child.castShadow = false;
							child.receiveShadow = true;
						}
            self.scene.add( gltf.scene );
					}
				})});
        
      this.renderer.setAnimationLoop(this.animate)
    },
    raycast:function(e){
    
    	debugger	
			this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

			//2. set the picking ray from the camera position and mouse coordinates
			this.raycaster.setFromCamera( this.mouse, this.camera );    

			//3. compute intersections
			const intersects = this.raycaster.intersectObject( this.navmesh );
			
			if (intersects.length>0){
				const pt = intersects[0].point;
				console.log(pt);
			}		},
    animate:function(){
      this.controls.update(0.01);
      this.renderer.render(this.scene, this.camera);
      this.renderer.domElement.addEventListener( 'click', this.raycast,false );
    }
  },
  mounted() {
      this.init();
      this.animate();
  }
}
</script>


