class SocketSender {
    constructor(url, callback, game) {
        this.url = url;
        this.game = game;
        this.socket = io(url);

        this.tankListUpdateCallback = null;

        this.shotCallback = null;

        //vajag katram savu tank moved callback uzlikt
        this.socket.on("tankMoved", (data) => {
            let neededTank = this.game.tanks.find(tank => tank.id == data.id);
            if (neededTank) {
                con(data.id + "  moved  " + data.x + "  " + data.z);
                neededTank.tankMovedCallback(data);
            }
        });

        this.socket.on("giveGroundMeshInfoResponse", (data) => {
            callback(data);
        });

        this.socket.on("tankListUpdate", (tanks) => {
            if (this.tankListUpdateCallback) this.tankListUpdateCallback(tanks);
            //console.log(tanks);
        });


        this.socket.on("shotFired", (info) => {
            if (this.shotCallback)
                this.shotCallback(info);
        });
    }

    registerTank() {
        this.emitMessage("registerTank", null);
    }

    getGroundInfo() {
        this.emitMessage("giveGroundMeshInfo", null);
    }

    shotFired(place) {
        this.emitMessage("shotFired", place);
    }

    sendNewCoordsToServer(coords) {
        this.emitMessage("tankNewCoords", coords);
    }

    emitMessage(info, data) {
        this.socket.emit(info, data);
    }

    //kad saÅ†em

    recievedAddOne(data) {
        alert(data.number);
    }
}

export default SocketSender;