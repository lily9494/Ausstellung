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
import { PointerLockControls } from '../scripts/pointerLocksControl.js';
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

      this.lockControl=new PointerLockControls(this.camera, this.renderer.domElement);

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
        
    },
    raycast:function(e){
    
    	// debugger	
      let mousex=0;
			this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
      this.raycaster.ray.origin.copy( this.controls.object.position );
// this.camera.getWorldDirection( this.raycaster.ray.direction );

			//2. set the picking ray from the camera position and mouse coordinates
			this.raycaster.setFromCamera( this.mouse, this.camera );    
      console.log(this.controls.object.position)
			//3. compute intersections
			const intersects = this.raycaster.intersectObjects( this.sceneMeshes );
		
			if (intersects.length>0)
      {
        if(intersects[0].distance>5)
        this.camera.lookAt( this.mouse );
       console.log(intersects[0])
      }
      else{
       
      }
  
    },
    raycastLock:function(){
      //keine Unterschied bis jetzt mit firstperson
      this.raycaster.ray.origin.copy( this.lockControl.getObject().position);
      const intersects = this.raycaster.intersectObjects( this.sceneMeshes );
      if (intersects.length>0)
      {
        if(intersects[0].distance<5)
       console.log(intersects[0])
      }
      console.log(this.lockControl.getObject().position);
      console.log(this.lockControl.isLocked)
    },
    animate:function(){
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera);
      this.raycastLock();
      // this.renderer.domElement.addEventListener( 'click', this.raycast,false );
      this.controls.update(0.01); // das muss glaub ich abhängig von der Zeit sein(lockedControler)
    }
  },
  mounted() {
     
    
  },
  created(){
 this.init();
 this.animate();
  }
}
</script>


