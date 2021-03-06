let port = 6868;
let clientRootPath = "./client/";
var path = require('path');
const fs = require('fs');

let currentGroundMeshPointHeightslist = null;
let worldSize = 300;

let tanks = [];

//sends the html and smth more ig
let server = require('http').createServer((request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    response.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');

    let filePath = path.join(clientRootPath, request.url);
    if (request.url.startsWith('/node_modules/'))
        filePath = path.join('./', request.url);
    if (request.url == '/' || request.url == '')
        filePath = path.join(clientRootPath, 'index.html');

    if (fs.existsSync(filePath)) {
        var extname = path.extname(filePath);
        var contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.mp3':
                contentType = 'audio/mp3';
                break;
        }

        fs.readFile(filePath, function (error, content) {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
            return;
        });
    }
    else {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('File not found', 'utf-8');
        return;
    }
});

////////////////////////////////////////////////////////////////////////

let io = require('socket.io')(server);
io.on('connection', client => {
    console.log("client connected, " + client.id);
    tanks.push({ id: client.id, x: worldSize / 2, z: worldSize / 2, angle: 0, color: Math.floor(Math.random() * 16777215), gunAngle: 0 });

    client.on('registerTank', data => {
        tanks.forEach(t => {
            io.to(t.id).emit("tankListUpdate", tanks);
        });
    });

    client.on('shotFired', place => {
        hitTanks = [];
        tanks.forEach(tank => {
            let distance = Math.sqrt(Math.pow(place.x - tank.x, 2) + Math.pow(place.z - tank.z, 2));
            if (distance <= 4) {
                hitTanks.push(tank.id);
            }
        });

        tanks.forEach(t => {
            io.to(t.id).emit("shotFired", { place: place, hitTanks: hitTanks });
        });

    });

    client.on("giveGroundMeshInfo", data => {
        if (!currentGroundMeshPointHeightslist) {
            currentGroundMeshPointHeightslist = makeTheArrayOfGround(worldSize, worldSize);
        }
        io.to(client.id).emit("giveGroundMeshInfoResponse", { listOfPoints: currentGroundMeshPointHeightslist });
    });

    client.on('tankNewCoords', data => {
        //console.log(data);
        let tank = tanks.find(tank => {
            return tank.id == client.id;
        });
        tank.x = data.x;
        tank.z = data.z;
        tank.angle = data.angle;
        tank.gunAngle = data.gunAngle;

        tanks.forEach(t => {
            io.to(t.id).emit("tankMoved", tank);
        });
        console.log(tank);
    });

    client.on('disconnect', () => {
        let disconnectedTank = tanks.find(tank => {
            return tank.id == client.id;
        });
        tanks = tanks.filter(tank => {
            return tank.id != client.id;
        });
        tanks.forEach(t => {
            io.to(t.id).emit("tankListUpdate", tanks);
        });

    });
});




function makeTheArrayOfGround(widthSegments, heightSegments) {
    let hillsHeight = [];
    for (let i = 0; i < widthSegments; i++) {
        let pushable = [];
        for (let j = 0; j < heightSegments; j++) {
            if (Math.random() * 300 > 299) {
                pushable.push(900);
            } else {
                pushable.push(0);
            }
        }
        hillsHeight.push(pushable);
    }
    hillsHeight = round2dArray(hillsHeight, 16, worldSize, worldSize);

    return hillsHeight;
}

function round2dArray(array, times, widthSegments, heightSegments) {
    let hillsHeight = array;
    for (let timez = 0; timez < times; timez++) {
        let tempArray = hillsHeight;
        for (let i = 0; i < widthSegments; i++) {
            for (let j = 0; j < heightSegments; j++) {
                let thisCellsNeighboursTotal = 0;

                //left side
                if (i > 0 && j > 0) {
                    thisCellsNeighboursTotal += hillsHeight[i - 1][j - 1];
                }
                if (i > 0) {
                    thisCellsNeighboursTotal += hillsHeight[i - 1][j];
                }
                if (i > 0 && j < hillsHeight[0].length - 1) {
                    thisCellsNeighboursTotal += hillsHeight[i - 1][j + 1];
                }

                //mid
                if (j > 0) {
                    thisCellsNeighboursTotal += hillsHeight[i][j - 1];
                }
                if (j < hillsHeight[0].length - 1) {
                    thisCellsNeighboursTotal += hillsHeight[i][j + 1];
                }

                //right
                if (i < hillsHeight.length - 1 && j > 0) {
                    thisCellsNeighboursTotal += hillsHeight[i + 1][j - 1];
                }

                if (i < hillsHeight.length - 1) {
                    thisCellsNeighboursTotal += hillsHeight[i + 1][j];
                }

                if (i < hillsHeight[0].length - 1 && j < hillsHeight[0].length - 1) {
                    thisCellsNeighboursTotal += hillsHeight[i + 1][j + 1];
                }

                tempArray[i][j] = thisCellsNeighboursTotal / 8;
            }
        }
        hillsHeight = tempArray;
    }
    return hillsHeight;
}





console.log(`Start listening on port ${port}`);
server.listen(port);
