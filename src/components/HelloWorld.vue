<template>
  <div class="threejs">
    <h1>{{ msg }}</h1>

  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Pathfinding } from 'three-pathfinding';
import {FirstPersonControls} from '../scripts/firstPerson';
// import {FirstPersonControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/FirstPersonControls.js';

export default {
  name: 'threejs',
  data() {
    return{

    }
   
  },
  props: {
    msg: String
  },
  methods:{
     init: function(){
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xdddddd);

      this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
      this.camera.rotation.y = 10 / 180 * Math.PI;
      this.camera.position.x = 10;
      this.camera.position.y = 3;
      this.camera.position.z = 20;

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.physicallyCorrectLights = true;
    
      document.body.appendChild(this.renderer.domElement);

      this.controls =  new FirstPersonControls(this.camera, this.renderer.domElement)
      this.controls.movementSpeed =  5;
      this.controls.lookSpeed = 0.01;
      this.controls.noFly = false;
      this.controls.lookVertical = false;
      
      this.hlight = new THREE.AmbientLight(0xffffff, 3);;
      this.scene.add(this.hlight);
      let loader = new GLTFLoader();
      loader.load("/ShowRoom.glb",  (gltf) =>{
       let gallery = gltf.scene.children[0];
        gallery.scale.set(0.5, 0.5, 0.5);
        this.scene.add(gltf.scene);
        this.renderer.render(this.scene, this.camera)

      });
      this.renderer.setAnimationLoop(this.animate)
    },
    animate:function(){
      this.controls.update(0.01);
      this.renderer.render(this.scene, this.camera);
    }
  },
  mounted() {
      this.init();
      this.animate();
  }
}
</script>


