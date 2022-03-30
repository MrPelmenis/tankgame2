import SocketSender from "./SocketSender.js";
import World from "./groundMaker.js";
import Tank from "./tank.js";
import { KeyboardReader } from "./tank.js";

let socket;
let world;

let MyClientTank;
//let MyClientKeyboardController;

let groundPointHeights;

let game = { tanks: [] };

function start() {
    socket = new SocketSender("http://localhost:6868", (data) => {
        console.log(data);
        groundPointHeights = data.listOfPoints;
        world = new World(groundPointHeights);
        world.init();

        /*MyClientTank = new Tank(world, socket);
        MyClientTank.tavamamma = 1;
        MyClientTank.id = socket.socket.id;
        console.log(socket.socket.id);*/
        let MyClientKeyboardController = new KeyboardReader(socket.socket.id, game);
        document.getElementById("tempIdShower2").innerHTML = socket.socket.id;
        socket.registerTank();
    }, game);

    socket.tankListUpdateCallback = (currentTanks) => {

        let newTanks = currentTanks.filter(sentTank => {
            return !game.tanks.find(localTank => sentTank.id == localTank.id);
        });

        let disconectedTanks = game.tanks.filter(localTank => {
            return !currentTanks.find(sentTank => sentTank.id == localTank.id);
        });

        newTanks.forEach(data => {
            let newTank = new Tank(world, socket);
            newTank.id = data.id;
            newTank.material.color.setHex(data.color);
            game.tanks.push(newTank);
        });

        disconectedTanks.forEach(data => {
            data.removeObject();
            game.tanks = game.tanks.filter(localTank => localTank.id != data.id);
        });

        console.log(game.tanks.map(t => t.id));
    }

    socket.getGroundInfo();
}

start();
