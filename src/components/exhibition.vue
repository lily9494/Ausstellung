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
import { FirstPersonControls } from '../scripts/firstPerson';
// import {FirstPersonControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/FirstPersonControls.js';

export default {
    name: 'threejs',
    data () {
        return {
            mouse: { x: 0, y: 0 },
            raycaster: new THREE.Raycaster(),
            camera: new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000),
            navmesh: new THREE.Object3D(),
            sceneMeshes: [],
            collides: false,
        }

    },
    props: {
        msg: String
    },
    methods: {
        init: function () {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xdddddd);
            // this.pathfinder = new Pathfinding();

            // this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
            this.camera.rotation.y = 10 / 180 * Math.PI;
            this.camera.position.x = 15;
            this.camera.position.y = 3;
            this.camera.position.z = 20;
            // this.camera.lookAt(this.scene.position);

            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.physicallyCorrectLights = true;

            document.body.appendChild(this.renderer.domElement);

            this.lockControl = new PointerLockControls(this.camera, this.renderer.domElement);

            this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
            this.controls.movementSpeed = 5;
            this.controls.lookSpeed = 0.01;
            this.controls.noFly = false;
            this.controls.lookVertical = false;


            this.hlight = new THREE.AmbientLight(0xffffff, 3);;
            this.scene.add(this.hlight);
            let loader = new GLTFLoader();
            loader.load("/ShowRoom121122.glb", (gltf) => {


                const self = this;
                gltf.scene.traverse(function (child) {

                    if (child.isMesh) {

                        if (child.name == "navMesh_1") {

                            self.navmesh = child;
                            // self.sceneMeshes.push(child);
                            child.material.transparent = true;
                            child.material.opacity = 0.3;

                        }
                        else if (child.name == "wall_1" || child.name == "wall_2") {
                            self.navmesh = child;
                            self.sceneMeshes.push(child);
                        }
                        else {
                            child.castShadow = false;
                            child.receiveShadow = true;
                        }
                        self.scene.add(gltf.scene);
                    }
                })
            });

        },
        computeDistance: function () {
            const self = this;

            this.sceneMeshes.forEach(function (mesh) {
                self.distanceToCamera(self.camera.position, mesh)
            })
        },

        distanceToCamera: function (cam, mesh) {
            // let camPoints = [{ x: cam.x + 1, y: cam.y, z: cam.z + 1 }, { x: cam.x - 1, y: cam.y, z: cam.z - 1 }, { x: cam.x + 1, y: cam.y, z: cam.z - 1 }, { x: cam.x - 1, y: cam.y, z: cam.z + 1 }]
            // const box1 = new THREE.Box3().setFromPoints(camPoints);
            const box2 = new THREE.Box3().setFromObject(mesh);
            if (box2.distanceToPoint(cam) > 0) {
                this.raycaster.setFromCamera(this.mouse, this.camera);
                var collisionResults = this.raycaster.intersectObjects(this.sceneMeshes, true);
                if (collisionResults.length > 0 && collisionResults[0].distance < 2) {
                    console.log("distanceToCamera bigger than 0");
                    var point = collisionResults[0].point;
                    var dir = new THREE.Vector3();
                    console.log(point)
                    dir.subVectors(this.camera.position, point).normalize();
                    this.camera.position.addScaledVector(dir, -0.4);
                }
            }

            return box2.distanceToPoint(cam);
        },

        //calculate the collision of two objects
        collision: function (object1, object2) {
            const box1 = new THREE.Box3().setFromObject(object1);
            const box2 = new THREE.Box3().setFromObject(object2);
            return box1.intersectsBox(box2);
        },

        //calculate the distance between two objects
        distance: function (object1, object2) {
            const box1 = new THREE.Box3().setFromObject(object1);
            const box2 = new THREE.Box3().setFromObject(object2);
            return box1.distanceToPoint(box2);
        },

        //detect the collision of the player with the scene
        detectCollision: function () {
            const self = this;
            this.sceneMeshes.forEach(function (mesh) {
                if (self.collision(self.controls.getObject(), mesh)) {
                    console.log("collision");
                }
            })
        },
        //compute the object which is in front of the player
        computeIntersections: function () {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.sceneMeshes);
            if (intersects.length > 0) {
                console.log(intersects[0].object.name);
            }
        },

        //compute the object which collides with the player
        computeCollisions: function () {
            const self = this;
            this.sceneMeshes.forEach(function (mesh) {
                if (self.collision(self.controls.getObject(), mesh)) {
                    console.log(mesh.name);
                }
            })
        },

        raycast: function (e) {
            debugger
            var collisionResults = this.raycaster.intersectObjects(this.sceneMeshes, true);
            if (collisionResults.length > 0 && collisionResults[0].distance < 3) {
                //stop the movement
                this.controls.moveForward = false;
                console.log(collisionResults[0].object.name);
                debugger
            }
            //// debugger
            //let mousex = 0;
            //this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            //this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
            //this.raycaster.ray.origin.copy(this.controls.object.position);
            //// this.camera.getWorldDirection( this.raycaster.ray.direction );

            ////2. set the picking ray from the camera position and mouse coordinates
            //this.raycaster.setFromCamera(this.mouse, this.camera);
            //console.log(this.controls.object.position)
            ////3. compute intersections
            //const intersects = this.raycaster.intersectObjects(this.sceneMeshes);

            //if (intersects.length > 0) {
            //    if (intersects[0].distance > 5)
            //        this.camera.lookAt(this.mouse);
            //    console.log(intersects[0])
            //}
            //else {

            //}

        },
        raycastLock: function () {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            var collisionResults = this.raycaster.intersectObjects(this.sceneMeshes, true);
            this.computeDistance();
            if (collisionResults.length > 0 && collisionResults[0].distance < 3) {
                var point = collisionResults[0].point;
                var dir = new THREE.Vector3();
                console.log(point)
                dir.subVectors(this.camera.position, point).normalize();
                this.camera.position.addScaledVector(dir, .5);
            }
        },
        animate: function () {
            requestAnimationFrame(this.animate)
            this.renderer.render(this.scene, this.camera);
            this.raycastLock();
            // this.renderer.domElement.addEventListener( 'click', this.raycast,false );
            this.controls.update(0.03); // das muss glaub ich abhängig von der Zeit sein(lockedControler)
        }
    },
    mounted () {


    },
    created () {
        this.init();
        this.animate();
    }
}
</script>
