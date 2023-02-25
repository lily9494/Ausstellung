import * as THREE from "three";
import { Text } from "troika-three-text";

export const addText = (scene, size, x, y, z) => {
  const myText = new Text();

  // Set properties to configure:
  myText.text = "Coming soon";
  myText.fontSize = size;
  myText.position.x = x;
  myText.position.y = y;
  myText.position.z = z;
  myText.anchorX = "center";
  myText.anchorY = "middle";
  myText.textAlign = "center";
  myText.color = "green";

  var box = new THREE.BoxGeometry();
  var mat = new THREE.MeshLambertMaterial({ color: "silver" });
  scene.add(myText);
  var mesh = new THREE.Mesh(box, myText);

  // Update the rendering:
  myText.sync();
  return mesh;
};
