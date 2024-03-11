import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "lil-gui";
import { ColorGUIHelper } from "../scripts/colorGUIHelper";
import jsonData from "../../public/ExportSimple.json";
import * as THREE from "three";
const topic = jsonData;

class Loader {
  constructor(scene) {
    let loader = new GLTFLoader();
    this.sceneMeshes = [];
    this.artMeshes = [];
    loader.load("/Gallery1.glb", (gltf) => {
      const self = this;
      let n = 0;
      // debugger;
      const topics = topic.filter((m) => m.image.length > 50);
      const count = topics.length;
      gltf.scene.traverse(function (child) {
        // debugger;
        if (child.isMesh) {
          // debugger;
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
          } else if (child.name == "navMesh_Wall") {
            child.material.transparent = true;
            child.material.opacity = 0.3;
            child.renderOrder = 0;
          }
        } else if (child.name == "windows") {
          //sky doesn't appear very well beacuse of light and window texture, so...
          child.children[1].material.visible = false;
        } else if (child.name == "wall") {
          child.children.forEach((c) => {
            c.castShadow = false;
            c.receiveShadow = true;
            if (c.name == "floor") {
              const geometry = new THREE.PlaneGeometry(50, 50);
              geometry.rotateX(-Math.PI / 2);

              const material = new THREE.MeshPhongMaterial({
                // Set the color of your floor
                dithering: true, // Enable dithering for smoother color transitions
              });

              material.opacity = 0.2;
              material.transparent = false;
              // c.renderOrder = 2;
              const floorPos = c.getWorldPosition(new THREE.Vector3());
              const plane = new THREE.Mesh(geometry, material);

              plane.position.y = floorPos.y + 0.005;
              plane.receiveShadow = true;
              plane.castShadow = true;
              c.receiveShadow = true;
              c.castShadow = true;
              // scene.add(plane);
            }
          });
        } else if (child.name == "lamps") {
          //sky doesn't appear very well beacuse of light and window texture, so...
          child.children.forEach((c) => {
            const color = 0xffffff;
            const intensity = 2;
            const distance = 10; // Adjust this value
            const light = new THREE.PointLight(color, intensity, distance);
            const lampPos = c.getWorldPosition(new THREE.Vector3());
            // debugger;
            // spotLight.position.set(lampPos.x, lampPos.y, lampPos.z); // Position the light
            light.position.set(lampPos.x, lampPos.y, lampPos.z);
            // c.children[1] = light;
            // light.target.position.set(lampPos.x, lampPos.y, lampPos.z);
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;

            scene.add(light);

            c.castShadow = true;
          });
        } else if (
          child.name.startsWith("bench_") ||
          child.name.startsWith("flower_")
        ) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.children[1].castShadow = true;
          child.children[1].receiveShadow = true;
          child.children[0].castShadow = true;
          child.children[0].receiveShadow = true;
          child.children[1].renderOrder = 1;
        }
        child.castShadow = false;
        child.receiveShadow = true;

        scene.add(gltf.scene);
      });
    });
  }
}

export { Loader };
