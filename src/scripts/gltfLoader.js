import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import jsonData from "../../public/ExportSimple.json";
import * as THREE from "three";
const topic = jsonData;

class Loader {
  constructor(scene) {
    let loader = new GLTFLoader();
    this.sceneMeshes = [];
    this.artMeshes = [];
    loader.load("/Gallery.glb", (gltf) => {
      const self = this;
      let n = 0;
      const topics = topic.filter((m) => m.image.length > 50);
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
        scene.add(gltf.scene);
      });
    });
  }
}

export { Loader };
