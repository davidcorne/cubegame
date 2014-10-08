var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var fs = require("fs");
var Engine = require("./public/GameEngine");

var nextPlayerID = 0;
var bullets = [];
var players = [];
var entities = [];

app.get("/", function(request, response) {
    response.sendFile(__dirname + "/public/index.html");
})

app.get("/public/*", function(request, response) {
    var fullPath = __dirname + request.path;
    if (fs.existsSync(fullPath)) {
        response.sendFile(fullPath);
    } else {
        response.status(404).send("File " + request.path + " not found.");
    }
})

io.on("connection", function(client) {
    client.emit("initialise-game", {id: ++nextPlayerID});
    
    console.log("A player connected. Given id " + nextPlayerID);
    client.on("disconnect", function() {
        console.log("A player disconnected.");
    });
    client.on("new-bullet", function(data) {
        entities.push(new Engine.BulletEntity(data.id, data.point, data.vector));
        io.emit("new-bullet", data);
    });
    client.on("entity-move", function(data) {
        Engine.entityMove(entities, data.id, data.vector);
        io.emit("entity-move", data);
    });
    client.on("new-player", function (data) {
        entities.push(new Engine.PlayerEntity(data.id, data.point));
        client.broadcast.emit("new-player", data);
    });
    for (var i = 0; i < entities.length; i += 1) {
        client.emit(
            "new-" + entities[i].tag, 
            {id: entities[i].id, point: entities[i].point, vector: entities[i].vector}
        );
    }
});

setInterval(
    function () {
        for (var i = 0; i < entities.length; i += 1) {
            if (entities[i].remove) {
                io.emit("entity-remove", {id: entities[i].id});
                entities.splice(i, 1);
            }
        }
        for (var index = 0; index < entities.length; index += 1) {
            entities[index].update(io);
        }
        io.emit("tick", {});
    }, 
    17 // millisecond delay
);

http.listen(3000, function() {
    console.log("Listening on *:3000");
});

