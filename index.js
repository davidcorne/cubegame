var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(request, response) {
    response.sendFile(__dirname + "/public/index.html");
})

app.get("/public/*", function(request, response) {
    response.sendFile(__dirname + request.path);
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

