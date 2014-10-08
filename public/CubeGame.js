var CubeGame = {
    socket: null,
};

CubeGame.init = function() {
    CubeGame.socket = io();
};

// The false means fire the event at bubbling stage, not capturing.
window.addEventListener("load", CubeGame.init, false);
