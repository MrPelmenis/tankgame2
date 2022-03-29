import SocketSender from "./SocketSender.js";
import World from "./groundMaker.js";
import Tank from "./tank.js";
import { KeyboardReader } from "./tank.js";

let socket;
let world;

let MyClientTank;
let MyClientKeyboardController;

let groundPointHeights;

let tanks = [];

function start() {
    socket = new SocketSender("http://localhost:6868", (data) => {
        console.log(data);
        groundPointHeights = data.listOfPoints;
        world = new World(groundPointHeights);
        world.init();

        MyClientTank = new Tank(world, socket);
        MyClientKeyboardController = new KeyboardReader(MyClientTank);
        MyClientTank.id = socket.socket.id;
        console.log(socket.socket.id);
        socket.registerTank();
    });

    socket.tankJoinedCallback = (data) => {
        if (data.id != MyClientTank.id) {
            if (tanks.find(tonka => tonka.id == data.id) == null) {
                let newTank = new Tank(world, socket);
                newTank.id = data.id;
                newTank.material.color.setHex(data.color);
                tanks.push(newTank);
                console.log(tanks.length);
            }
        } else {
            MyClientTank.material.color.setHex(data.color);
        }
    }

    socket.tankLeftCallback = (data) => {

    }
    socket.getGroundInfo();
}

start();
