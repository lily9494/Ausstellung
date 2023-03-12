import * as THREE from "three";

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

class Sky {
  constructor(cam, scene) {
    scene.background = reflectionCube;
    cam.rotation.y = (10 / 180) * Math.PI;
    cam.position.x = 15;
    cam.position.y = 3;
    cam.position.z = 20;

    // internals
  }
}

export { Sky };
