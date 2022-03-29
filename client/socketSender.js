class SocketSender {
    constructor(url, callback) {
        this.url = url;
        this.socket = io(url);
        this.tankMovedCallback = null;

        this.tankJoinedCallback = null;
        this.tankLeftCallback = null;

        //vajag katram savu tank moved callback uzlikt
        this.socket.on("tankMoved", (data) => {
            if (this.tankMovedCallback) this.tankMovedCallback(data);
        });


        this.socket.on("giveGroundMeshInfoResponse", (data) => {
            callback(data);
        });

        this.socket.on("tankJoined", (tank) => {
            if (this.tankJoinedCallback) this.tankJoinedCallback(tank);
            console.log(tank);
        });
    }

    registerTank() {
        this.emitMessage("registerTank", null);
    }

    getGroundInfo() {
        this.emitMessage("giveGroundMeshInfo", null);
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