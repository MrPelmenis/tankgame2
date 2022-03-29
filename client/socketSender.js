class SocketSender {
    constructor(url, callback) {
        this.url = url;
        this.socket = io(url);
        this.tankMovedCallback = null;

        this.tankJoinedCallback = null;
        this.tankLeftCallback = null;

        this.socket.on("giveGroundMeshInfoResponse", (data) => {
            callback(data);
        });

        this.socket.on("tankJoined", (tank) => {
            if (this.tankMovedCallback) {

            }
        });
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