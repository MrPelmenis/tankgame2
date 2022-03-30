import * as THREE from './three.js/three.module.js';
import { GLTFLoader } from './three.js/GLTFLoader.js';

class KeyboardReader {
    constructor(myTankID, game) {
        this.myTankID = myTankID;
        this.game = game;
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
        let myTank = this.game.tanks.find(t => t.id == this.myTankID);

        if (myTank) {
            let newCoords = { x: myTank.x, angle: myTank.rotationAngle, z: myTank.z };
            let changed = false;

            if (this.keys.d == true) {
                newCoords.angle = myTank.rotationAngle - myTank.rotationSpeed;
                changed = true;
            }
            if (this.keys.a == true) {
                newCoords.angle = myTank.rotationAngle + myTank.rotationSpeed;
                changed = true;
            }
            if (this.keys.w == true) {
                newCoords.z = myTank.z + Math.cos(myTank.rotationAngle * Math.PI / 180) * myTank.movementMultiplier;
                newCoords.x = myTank.x + Math.sin(myTank.rotationAngle * Math.PI / 180) * myTank.movementMultiplier;
                changed = true;
            }
            if (this.keys.s == true) {
                newCoords.z = myTank.z - Math.cos(myTank.rotationAngle * Math.PI / 180) * myTank.movementMultiplier;
                newCoords.x = myTank.x - Math.sin(myTank.rotationAngle * Math.PI / 180) * myTank.movementMultiplier;
                changed = true;
            }
            if (changed) {
                con(myTank.id + "     " + myTank.x + "    " + myTank.z);
                myTank.socket.sendNewCoordsToServer(newCoords);
            }
        }
        setTimeout(() => {
            this.moveTank();
        },
            100);
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
        this.movementMultiplier = 0.5;
        this.rotationSpeed = 20;

        this.socket = socket;

        this.x = 0;
        this.y = 0;
        this.z = 0;

        const geometry = new THREE.BoxGeometry(2, 1, 1);

        this.material = new THREE.MeshStandardMaterial({ color: 0xffffff });

        this.group = new THREE.Group();
        let mainCube = new THREE.Mesh(geometry, this.material);
        mainCube.castShadow = true;
        mainCube.receiveShadow = true;
        let smallCubeg = new THREE.BoxGeometry(1.3, 1.3, 1.3);
        let smallCube = new THREE.Mesh(smallCubeg, this.material);
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
    }

    removeObject() {
        this.world.scene.remove(this.group);
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
        //console.log([tank.id, this.id]);
        if (this.id == tank.id) {
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