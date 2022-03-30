import * as THREE from './three.js/three.module.js';
import { GLTFLoader } from './three.js/GLTFLoader.js';


var renderer;
var camera;
var scene;
var loader;


let size = 300;
let cameraAngle = 0;
let mainPlane;
renderer = new THREE.WebGLRenderer({ antialias: false });

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


class World {
    constructor(groundInfo) {
        this.camera;
        this.scene;
        this.renderer;
        this.size = 300;
        this.loader = null;
        this.cameraAngle = 0;
        this.groundMesh = null;
        this.groundMeshPointHeights = groundInfo;
    }

    init() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(0, 20, 0);
        this.camera.up = new THREE.Vector3(0, 1, 0);
        this.camera.lookAt(0, 0, 0);

        this.scene = new THREE.Scene();

        this.createDirectionalLight();

        this.loader = new GLTFLoader();
        this.makeGround();

        this.animate();
    }

    makeGround() {
        let points = makeTheArrayOfGround(this.groundMeshPointHeights, this.size);
        this.groundMesh = this.generateGround(points);
    }


    animate() {
        this.renderer.setAnimationLoop(() => {
            this.camera.position.x = Math.cos(Math.PI) * 50 + size / 2;
            this.camera.position.z = Math.sin(Math.PI) * 50 + size / 2;
            //this.cameraAngle += 0.001;
            this.camera.lookAt(this.size / 2, 0, this.size / 2);

            this.renderer.render(this.scene, this.camera);
        });
    }

    createDirectionalLight() {
        //Create a DirectionalLight and turn on shadows for the light
        let light = new THREE.Group();
        let lightx = new THREE.PointLight(0xffffff, 2, 100);
        lightx.position.set(0, 0, 0);
        lightx.castShadow = true;
        light.add(lightx);

        let geometry = new THREE.SphereGeometry(1, 21, 21);
        let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        let sun = new THREE.Mesh(geometry, material);
        sun.position.set(0, 0, 0);
        sun.castShadow = false;
        sun.receiveShadow = false;

        //Set up shadow properties for the light
        lightx.shadow.mapSize.width = 512;
        lightx.shadow.mapSize.height = 512;
        lightx.shadow.camera.near = 0.5;
        lightx.shadow.camera.far = 500;

        light.position.set(size / 2, 20, size / 2);

        light.add(sun);
        this.scene.add(light);
    }


    generateGround(points) {
        const material = new THREE.MeshStandardMaterial({ color: 0x32456a })
        material.side = THREE.DoubleSide;
        let geometry = new THREE.BufferGeometry();
        geometry.setFromPoints(points);
        geometry.computeVertexNormals()

        const mesh = new THREE.Mesh(geometry, material);
        //mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "ground";
        this.scene.add(mesh);
        return mesh;
    }

    addObj(x, y, z, size) {
        const loader = new GLTFLoader();
        loader.load('../models/tree.glb', function (gltf) {
            let treeModel = gltf.scene.children[0];
            treeModel.traverse(function (child) {
                child.castShadow = true;
                child.receiveShadow = true;
            });
            for (let i = 0; i < 1; i++) {
                treeModel.scale.set(size, size, size);
                treeModel.position.set(x, y, z);
                treeModel.rotateY(Math.random() * 502);
                scene.add(treeModel);
            }
        }, undefined, function (error) {
            console.error(error);
        });

    }


}
export default World;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 20, 0);
    camera.up = new THREE.Vector3(0, 1, 0);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();

    createDirectionalLight();



    loader = new GLTFLoader();
    makeGround();

    const geometry1 = new THREE.BoxGeometry(1, 1, 1);
    const material1 = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube1 = new THREE.Mesh(geometry1, material1);
    cube1.castShadow = true;
    cube1.receiveShadow = true;
    cube1.position.set(size / 2, 2, size / 2);
    scene.add(cube1);

    animate();
}


//mana
function createDirectionalLight() {
    //Create a DirectionalLight and turn on shadows for the light
    let light = new THREE.Group();
    let lightx = new THREE.PointLight(0xffffff, 2, 100);
    lightx.position.set(0, 0, 0);
    lightx.castShadow = true;
    light.add(lightx);

    let geometry = new THREE.SphereGeometry(1, 21, 21);
    let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    let sun = new THREE.Mesh(geometry, material);
    sun.position.set(0, 0, 0);
    sun.castShadow = false;
    sun.receiveShadow = false;

    //Set up shadow properties for the light
    lightx.shadow.mapSize.width = 512;
    lightx.shadow.mapSize.height = 512;
    lightx.shadow.camera.near = 0.5;
    lightx.shadow.camera.far = 500;

    light.position.set(size / 2, 20, size / 2);

    light.add(sun);
    scene.add(light);
}


function makeTheArrayOfGround(hillsHeight, size) {
    let points = [];
    for (let i = 0; i < size - 1; i++) {
        for (let j = 0; j < size - 1; j++) {
            points.push(new THREE.Vector3(i, hillsHeight[i][j], j));
            points.push(new THREE.Vector3(i + 1, hillsHeight[i + 1][j], j));
            points.push(new THREE.Vector3(i, hillsHeight[i][j + 1], j + 1));

            points.push(new THREE.Vector3(i + 1, hillsHeight[i + 1][j], j));
            points.push(new THREE.Vector3(i + 1, hillsHeight[i + 1][j + 1], j + 1));
            points.push(new THREE.Vector3(i, hillsHeight[i][j + 1], j + 1));
        }

    }
    return points;
}


function generateGround(points) {
    const material = new THREE.MeshStandardMaterial({ color: 0x32456a })
    material.side = THREE.DoubleSide;
    let geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);
    geometry.computeVertexNormals()

    const mesh = new THREE.Mesh(geometry, material);
    //mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = "soil";
    scene.add(mesh);
    return mesh;
}


//trees
function addObj(x, y, z, size) {
    const loader = new GLTFLoader();
    loader.load('../models/tree.glb', function (gltf) {
        let treeModel = gltf.scene.children[0];
        treeModel.traverse(function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        for (let i = 0; i < 1; i++) {
            treeModel.scale.set(size, size, size);
            treeModel.position.set(x, y, z);
            treeModel.rotateY(Math.random() * 502);
            scene.add(treeModel);
        }
    }, undefined, function (error) {
        console.error(error);
    });

}


function animate() {
    renderer.setAnimationLoop(() => {
        camera.position.x = Math.cos(cameraAngle) * 50 + size / 2;
        camera.position.z = Math.sin(cameraAngle) * 50 + size / 2;
        cameraAngle += 0.001;
        camera.lookAt(size / 2, 0, size / 2);

        renderer.render(scene, camera);
    });
}



