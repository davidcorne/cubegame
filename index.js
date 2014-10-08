var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var fs = require("fs");

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

io.on("connection", function(socket) {
    console.log("A player connected.");
    socket.on("disconnect", function() {
        console.log("A player disconnected.");
    });
});

http.listen(3000, function() {
    console.log("Listening on *:3000");
});

