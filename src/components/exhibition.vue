<template>
  <div class="threejs">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
import * as THREE from "three";
import jsonData from "../../public/ExportSimple.json";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FirstPersonControls } from "../scripts/firstPerson";

export default {
  name: "threejs",
  data() {
    return {
      mouse: new THREE.Vector2(),
      topics: jsonData,
      raycaster: new THREE.Raycaster(),
      camera: new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        5000
      ),
      navmesh: new THREE.Object3D(),
      sceneMeshes: [],
      artMeshes: [],
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

      //Sky as background
      const path = "/SkyBox/";
      const format = ".jpg";
      const urls = [
        path + "px" + format,
        path + "nx" + format,
        path + "py" + format,
        path + "ny" + format,
        path + "pz" + format,
        path + "nz" + format,
      ];

      const reflectionCube = new THREE.CubeTextureLoader().load(urls);
      const refractionCube = new THREE.CubeTextureLoader().load(urls);
      refractionCube.mapping = THREE.CubeRefractionMapping;
      this.scene.background = reflectionCube;
      this.camera.rotation.y = (10 / 180) * Math.PI;
      this.camera.position.x = 15;
      this.camera.position.y = 3;
      this.camera.position.z = 20;
      //end of sky
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
      this.controls.movementSpeed = 5;
      this.controls.lookSpeed = 0.01;
      this.controls.noFly = false;
      this.controls.lookVertical = false;

      this.hlight = new THREE.AmbientLight(0xffffff, 3);
      this.scene.add(this.hlight);

      let loader = new GLTFLoader();
      loader.load("/Gallery.glb", (gltf) => {
        const self = this;
        let n = 0;
        const topics = this.topics.filter((m) => m.image.length > 50);
        const count = topics.length;
        gltf.scene.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            if (child.name && child.name.startsWith("art_")) {
              // Rolling because there are to few images
              const topic = topics[n % count];
              n++;
              // Create an image
              const image = new Image();
              // Create texture
              const texture = new THREE.Texture(image);
              texture.flipY = false;
              // On image load, update texture
              image.onload = () => {
                texture.needsUpdate = true;
              };
              // Set image source
              image.src = topic.image;
              // Load an set material
              child.material = new THREE.MeshBasicMaterial({ map: texture });
              // Set topic as userData
              child.userData.topic = topic;
              // Collect image-meshes for further interaction
              self.artMeshes.push(child);
            } else if (
              child.name == "wall_1" ||
              child.name == "wall_2" ||
              child.name == "wall_3"
            ) {
              self.navmesh = child;
              self.sceneMeshes.push(child);
            }
          } else if (child.name == "windows") {
            //sky doesn't appear very well beacuse of light and window texture, so...
            child.children[1].material.visible = false;
          } else if (
            child.name.startsWith("bench_") ||
            child.name.startsWith("flower_")
          ) {
            child.children[1].castShadow = true;
            child.children[1].receiveShadow = true;
            child.children[1].renderOrder = 1;
          }
          self.scene.add(gltf.scene);
        });
      });
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
      var intersects = this.raycaster.intersectObjects(this.artMeshes, true);

      // if there is one (or more) intersections, the intersection
      // with the lowest distance
      const obj = intersects.length > 0 ? intersects[0] : null;
      if (obj) {
        alert(obj.object.userData.topic.title);
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
      ).intersectObjects(this.sceneMeshes, false);

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
