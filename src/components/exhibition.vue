<template>
  <div class="threejs">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
import * as THREE from "three";
import { FirstPersonControls } from "../scripts/firstPerson";
import { Loader } from "../scripts/gltfLoader";
import { Sky } from "../scripts/sky";

export default {
  name: "threejs",
  data() {
    return {
      mouse: new THREE.Vector2(),
      raycaster: new THREE.Raycaster(),
      loader: null,
      camera: new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        5000
      ),
      collides: false,
      oldPosition: null,
    };
  },
  props: {
    msg: String,
  },
  methods: {
    init: function () {
      this.scene = new THREE.Scene();

      new Sky(this.camera, this.scene);

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.physicallyCorrectLights = true;

      document.body.appendChild(this.renderer.domElement);
      this.renderer.domElement.onclick = this.onClick;

      this.controls = new FirstPersonControls(
        this.camera,
        this.renderer.domElement
      );
      //ambientLight
      this.hlight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(this.hlight);

      this.loader = new Loader(this.scene);
    },
    onClick: function (event) {
      // the following line would stop any other event handler from firing
      event.preventDefault();

      // calculate pointer position in normalized device coordinates
      // (-1 to +1) for both components
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // update the picking ray with the camera and pointer position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // create an array containing all objects in the scene with which the ray intersects
      if (this.loader.artMeshes.length > 0) {
        var intersects = this.raycaster.intersectObjects(
          this.loader.artMeshes,
          true
        );

        // if there is one (or more) intersections, the intersection
        // with the lowest distance
        const obj = intersects.length > 0 ? intersects[0] : null;
        if (obj) {
          alert(obj.object.userData.topic.title);
        }
      }
    },

    //method to detect collision between the player and the scene and stop the movement
    raycastLock: function () {
      var camPosition = this.camera.position;
      if (!this.oldPosition) {
        this.oldPosition = camPosition.clone();
        return;
      }
      var direction = new THREE.Vector3();
      direction.subVectors(camPosition, this.oldPosition).normalize();
      this.oldPosition = camPosition.clone();
      var intersectedObjects = new THREE.Raycaster(
        camPosition,
        direction
      ).intersectObjects(this.loader.sceneMeshes, false);

      if (intersectedObjects.length > 0 && intersectedObjects[0].distance < 2) {
        var obj = intersectedObjects[0];
        var moveV = new THREE.Vector3();
        moveV.subVectors(camPosition, obj.point).normalize();
        this.camera.position.addScaledVector(moveV, 0.4);
      }
    },
    animate: function () {
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
      this.raycastLock();
      this.controls.update(0.03); // das muss glaub ich abhängig von der Zeit sein(lockedControler)
    },
  },
  mounted() {},
  created() {
    this.init();
    this.animate();
  },
};
</script>
