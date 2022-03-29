import * as THREE from './three.js/three.module.js';
import { GLTFLoader } from './three.js/GLTFLoader.js';

class KeyboardReader {
    constructor(myTank) {
        this.myTank = myTank;
        this.keys = { w: false, a: false, s: false, d: false }
        document.onkeydown = (e) => {
            this.keydown(e);
        }
        document.onkeyup = (e) => {
            this.keyup(e);
        }
        this.moveTank();
    }
    keydown(e) {
        if (e.keyCode == 87) {
            this.keys.w = true;
        }
        if (e.keyCode == 83) {
            this.keys.s = true;
        }
        if (e.keyCode == 65) {
            this.keys.a = true;
        }
        if (e.keyCode == 68) {
            this.keys.d = true;
        }
    }
    keyup(e) {
        if (e.keyCode == 87) {
            this.keys.w = false;
        }
        if (e.keyCode == 83) {
            this.keys.s = false;
        }
        if (e.keyCode == 65) {
            this.keys.a = false;
        }
        if (e.keyCode == 68) {
            this.keys.d = false;
        }
    }

    moveTank() {
        let newCoords = { x: this.myTank.x, angle: this.myTank.rotationAngle, z: this.myTank.z };
        let changed = false;

        if (this.keys.d == true) {
            newCoords.angle = this.myTank.rotationAngle - this.myTank.rotationSpeed;
            changed = true;
        }
        if (this.keys.a == true) {
            newCoords.angle = this.myTank.rotationAngle + this.myTank.rotationSpeed;
            changed = true;
        }
        if (this.keys.w == true) {
            newCoords.z = this.myTank.z + Math.cos(this.myTank.rotationAngle * Math.PI / 180) * this.myTank.movementMultiplier;
            newCoords.x = this.myTank.x + Math.sin(this.myTank.rotationAngle * Math.PI / 180) * this.myTank.movementMultiplier;
            changed = true;
        }
        if (this.keys.s == true) {
            newCoords.z = this.myTank.z - Math.cos(this.myTank.rotationAngle * Math.PI / 180) * this.myTank.movementMultiplier;
            newCoords.x = this.myTank.x - Math.sin(this.myTank.rotationAngle * Math.PI / 180) * this.myTank.movementMultiplier;
            changed = true;
        }
        if (changed) {
            this.myTank.socket.sendNewCoordsToServer(newCoords);
        }
        setTimeout(() => {
            this.moveTank();
        },
            10);
    }
}

class Tank {
    constructor(world, socket) {
        this.id = null;

        this.world = world;
        this.groundMesh = world.groundMesh;
        this.scene = world.scene;
        this.rotationAngle = 0;
        this.kys = { w: false, a: false, s: false, d: false };
        this.movementMultiplier = 0.05;
        this.rotationSpeed = 2;

        this.socket = socket;

        this.socket.tankMovedCallback = (data) => {
            this.tankMovedCallback(data);
        }


        this.socket.tankJoinedCallback = (data) => {
            this.tankJoinedCallback(data);
        }
        this.socket.tankLeftCallback = (data) => {
            this.tankLeftCallback(data);
        }

        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.world.tanks.push(this);


        const geometry = new THREE.BoxGeometry(2, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

        this.group = new THREE.Group();
        let mainCube = new THREE.Mesh(geometry, material);
        mainCube.castShadow = true;
        mainCube.receiveShadow = true;
        let smallCubeg = new THREE.BoxGeometry(1.3, 1.3, 1.3);
        let smallCube = new THREE.Mesh(smallCubeg, material);
        smallCube.castShadow = true;
        smallCube.receiveShadow = true;
        smallCube.position.set(0, 0.2, 1.5);
        this.group.add(mainCube);
        this.group.add(smallCube);
        this.group.position.set(world.size / 2, 5, world.size / 2);

        this.x = world.size / 2;
        this.y = 5;
        this.z = world.size / 2;
        this.scene.add(this.group);

        this.placeCube();


        this.myKeyboardController = new KeyboardReader(this);
    }

    castRay(p1, p2, scene) {
        const raycaster = new THREE.Raycaster();
        raycaster.set(p1, p2);
        const intersects = raycaster.intersectObjects(scene.children);

        return intersects;
    }

    placeCube() {
        this.group.position.x = this.x;
        this.group.position.y = this.y;
        this.group.position.z = this.z;

        this.group.rotation.y = this.rotationAngle * Math.PI / 180;
    }

    tankMovedCallback(tank) {
        if (this.socket.socket.id == tank.id) {
            this.x = tank.x;
            this.z = tank.z;
            this.rotationAngle = tank.angle;

            let point = new THREE.Vector3(this.x, this.y + 10, this.z);
            let direction = new THREE.Vector3(0, -1, 0);
            direction.normalize();
            let intersects = this.castRay(point, direction, this.world.scene);
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.name == "ground") {
                    this.y = intersects[i].point.y;
                    break;
                }
            }
            this.placeCube();
        }
    }
}

export default Tank;
export { KeyboardReader };