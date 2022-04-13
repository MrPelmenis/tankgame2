import * as THREE from './three.js/three.module.js';
import { GLTFLoader } from './three.js/GLTFLoader.js';

class KeyboardReader {
    constructor(myTankID, game) {
        this.myTankID = myTankID;
        this.game = game;
        this.keys = { w: false, a: false, s: false, d: false, e: false, q: false };
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
        if (e.keyCode == 81) {
            this.keys.q = true;
        }
        if (e.keyCode == 69) {
            this.keys.e = true;
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
        if (e.keyCode == 81) {
            this.keys.q = false;
        }
        if (e.keyCode == 69) {
            this.keys.e = false;
        }
    }

    moveTank() {
        let myTank = this.game.tanks.find(t => t.id == this.myTankID);

        if (myTank) {
            let newCoords = { x: myTank.x, angle: myTank.rotationAngle, z: myTank.z, gunAngle: myTank.gunAngle };
            let changed = false;


            if (this.keys.q == true) {
                newCoords.gunAngle = myTank.gunAngle + 2;
                changed = true;
            }

            if (this.keys.e == true) {
                newCoords.gunAngle = myTank.gunAngle - 2;
                changed = true;
            }


            if (this.keys.d == true) {
                newCoords.angle = myTank.rotationAngle + myTank.rotationSpeed;
                changed = true;
            }
            if (this.keys.a == true) {
                newCoords.angle = myTank.rotationAngle - myTank.rotationSpeed;
                changed = true;
            }
            if (this.keys.w == true) {
                newCoords.z = myTank.z + Math.sin(myTank.rotationAngle * Math.PI / 180) * myTank.movementMultiplier;
                newCoords.x = myTank.x + Math.cos(myTank.rotationAngle * Math.PI / 180) * myTank.movementMultiplier;
                changed = true;
            }
            if (this.keys.s == true) {
                newCoords.z = myTank.z - Math.sin(myTank.rotationAngle * Math.PI / 180) * myTank.movementMultiplier;
                newCoords.x = myTank.x - Math.cos(myTank.rotationAngle * Math.PI / 180) * myTank.movementMultiplier;
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
        this.movementMultiplier = 0.125;
        this.rotationSpeed = 2;
        this.gunAngle = 0;

        this.socket = socket;

        this.x = 0;
        this.y = 0;
        this.z = 0;

        const geometry = new THREE.BoxGeometry(2, 1, 1);

        this.material = new THREE.MeshStandardMaterial({ color: 0xffffff });


        this.addObj((obj => {
            this.group = obj;
            this.gun = this.group.children.find(obj => obj.name == "gun");
        }), './manstanks.glb', this.world.scene);

        this.x = world.size / 2;
        this.y = 5;
        this.z = world.size / 2;
        this.scene.add(this.group);

        this.placeCube();
    }


    addObj(callback, path, scene) {
        const loader = new GLTFLoader();
        loader.load(path, function (gltf) {
            let tankModel = gltf.scene.children[0];
            tankModel.traverse(function (child) {
                child.castShadow = true;
                //child.receiveShadow = true;
            });
            let tankGroup = new THREE.Group();
            tankModel.scale.set(4, 4, 4);
            tankModel.position.set(0, 0, 0);
            //tankModel.rotateY(Math.PI / 2 * 3);
            tankGroup.add(tankModel);
            tankModel.position.set(0, 0.1, -0.75);


            const geometry = new THREE.BoxGeometry(1, 0.1, 0.1);
            const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
            let gun = new THREE.Mesh(geometry, material);
            gun.name = "gun";
            tankGroup.add(gun);
            gun.position.set(0.5, 0.5, 0.26);
            gun.geometry.translate(0.5, 0, 0);
            gun.castShadow = true;

            scene.add(tankGroup);
            callback(tankGroup);

        }, undefined, function (error) {
            console.error(error);
        });

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
        if (this.group) {
            this.group.position.x = this.x;
            this.group.position.y = this.y;
            this.group.position.z = this.z;

            this.group.rotation.y = -this.rotationAngle * Math.PI / 180;// - Math.PI / 2;
        }
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

            let gunAngle = tank.gunAngle;
            this.gunAngle = gunAngle;
            this.spinGun();

            let heightDif = this.getHeigtDiff();
            let tanRes = heightDif / 2;
            let angle = Math.atan(tanRes);
            this.group.rotation.z = -angle;

            this.placeCube();
        }
    }
    spinGun() {
        this.gun.rotation.z = this.gunAngle * Math.PI / 180;
    }

    getAltitude(x, z) {
        let p1Vector = new THREE.Vector3(x, this.y + 10, z);
        let direction = new THREE.Vector3(0, -1, 0);
        direction.normalize();
        let intersects1 = this.castRay(p1Vector, direction, this.world.scene);
        let point1Y = intersects1.find(collision => collision.object.name == "ground").point.y;
        return point1Y;
    }


    addBox(x, y, z) {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        this.world.scene.add(cube);
    }

    getHeigtDiff() {
        let p1 = { x: this.x + Math.sin((-this.rotationAngle - 90) * Math.PI / 180), z: this.z + Math.cos((-this.rotationAngle - 90) * Math.PI / 180) };
        let p2 = { x: this.x - Math.sin((-this.rotationAngle - 90) * Math.PI / 180), z: this.z - Math.cos((-this.rotationAngle - 90) * Math.PI / 180) };

        /*this.addBox(p1.x, this.y + 1, p1.z);
        this.addBox(p2.x, this.y + 1, p2.z);*/


        return this.getAltitude(p1.x, p1.z) - this.getAltitude(p2.x, p2.z);
    }

}

export default Tank;
export { KeyboardReader };