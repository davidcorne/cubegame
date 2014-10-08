//=============================================================================
var CubeGame = {
    RATIO: 0,
    KEYBOARD_MAP: {},
    current_width: null,
    current_height: null,
    scale: 1,
    offset: {top: 0, left: 0},
    canvas: null,
    context: null,
    socket: null,
    entities: [],
    playerEntity: null,
    nextEntityIdIndex: 0,
    playerID: null
};

CubeGame.init = function() {
    CubeGame.startSocketConnection();
    CubeGame.initialiseGraphics();    
};

CubeGame.startSocketConnection = function() {
    CubeGame.socket = io();
    CubeGame.socket.on("new-player", function(data) {
        CubeGame.entities.push(new Engine.PlayerEntity(data.id, data.point));
    });
    CubeGame.socket.on("new-bullet", function(data) {
        CubeGame.entities.push(new Engine.BulletEntity(data.id, data.point, data.vector));
    });
    CubeGame.socket.on("entity-move", function(data) {
        Engine.entityMove(CubeGame.entities, data.id, data.vector);
    });
    CubeGame.socket.on("entity-remove", function(data) {
        Engine.entityRemove(CubeGame.entities, data.id);
    });
    CubeGame.socket.on("initialise-game", function(data) {
        CubeGame.playerID = data.id;
        CubeGame.initialiseGame();
    });
    CubeGame.socket.on("tick", function (data) {
        CubeGame.update();
        CubeGame.render();
    });
};

CubeGame.nextEntityId = function() {
    ++CubeGame.nextEntityIdIndex;
    return CubeGame.playerID + "_" + CubeGame.nextEntityIdIndex;
};

CubeGame.initialiseGraphics = function() {
    CubeGame.RATIO = Engine.world.width / Engine.world.height;
    CubeGame.current_width = Engine.world.width;
    CubeGame.current_height = Engine.world.height;

    CubeGame.canvas = document.getElementsByTagName("canvas")[0];
    CubeGame.canvas.width = Engine.world.width;
    CubeGame.canvas.height = Engine.world.height;
    
    CubeGame.context = CubeGame.canvas.getContext("2d");

    CubeGame.resize();
};

CubeGame.moveEntity = function(entity, vector) {
    CubeGame.socket.emit("entity-move", {id: entity.id, vector: vector});
};

CubeGame.initialiseGame = function() {
    CubeGame.playerEntity = new Engine.PlayerEntity(
        CubeGame.nextEntityId(),
        {x: 10, y: 10}
    );
    CubeGame.entities.push(CubeGame.playerEntity);
    CubeGame.socket.emit("new-player", CubeGame.playerEntity);
    
    // left arrow
    CubeGame.KEYBOARD_MAP[37] = function() {
        CubeGame.moveEntity(
            CubeGame.playerEntity, 
            {x: -CubeGame.playerEntity.speed, y: 0}
        );
    };
    // up arrow
    CubeGame.KEYBOARD_MAP[38] = function() {
        CubeGame.moveEntity(
            CubeGame.playerEntity, 
            {x: 0, y: -CubeGame.playerEntity.speed}
        );
    };
    // right arrow
    CubeGame.KEYBOARD_MAP[39] = function() {
        CubeGame.moveEntity(
            CubeGame.playerEntity, 
            {x: CubeGame.playerEntity.speed, y: 0}
        );
    };
    // down arrow
    CubeGame.KEYBOARD_MAP[40] = function() {
        CubeGame.moveEntity(
            CubeGame.playerEntity, 
            {x: 0, y: CubeGame.playerEntity.speed}
        );
    };
    
    // 'a' key
    CubeGame.KEYBOARD_MAP[65] = function() {
        CubeGame.shoot(
            CubeGame.playerEntity.point,
            {x: -CubeGame.playerEntity.speed, y: 0}
        );
    };
    // 'w' key
    CubeGame.KEYBOARD_MAP[87] = function() {
        CubeGame.shoot(
            CubeGame.playerEntity.point,
            {x: 0, y: -CubeGame.playerEntity.speed}
        );
    };
    // 'd' key
    CubeGame.KEYBOARD_MAP[68] = function() {
        CubeGame.shoot(
            CubeGame.playerEntity.point,
            {x: CubeGame.playerEntity.speed, y: 0}
        );
    };
    // 's' key
    CubeGame.KEYBOARD_MAP[83] = function() {
        CubeGame.shoot(
            CubeGame.playerEntity.point,
            {x: 0, y: CubeGame.playerEntity.speed}
        );
    };
    window.addEventListener("keydown", CubeGame.keyPressed, false);
};

CubeGame.shoot = function(start, vector) {
    CubeGame.socket.emit(
        "new-bullet", 
        {id: CubeGame.nextEntityId(), point: start, vector: vector}
    );
};

CubeGame.keyPressed = function(event) {
    if (CubeGame.KEYBOARD_MAP[event.keyCode] !== undefined) {
        event.preventDefault();
        CubeGame.KEYBOARD_MAP[event.keyCode]();
    }
};

CubeGame.resize =  function() {
    CubeGame.current_height = window.innerHeight;
    // Now keep the correct ratio
    CubeGame.current_width = CubeGame.current_height * CubeGame.RATIO;

    // Set the canvas style width and height.
    CubeGame.canvas.style.width = CubeGame.current_width + "px";
    CubeGame.canvas.style.height = CubeGame.current_height + "px";

    // calculate the offset/scale
    CubeGame.scale = CubeGame.current_width / Engine.world.width;
    CubeGame.offset.top = CubeGame.canvas.offsetTop;
    CubeGame.offset.left = CubeGame.canvas.offsetLeft;
};

CubeGame.update = function() {
    for (var i = 0; i < CubeGame.entities.length; i += 1) {
        if (CubeGame.entities[i].remove) {
            CubeGame.entities.splice(i, 1);
        }
    }
};

CubeGame.render = function() {
    CubeGame.Graphics.clear();
    for (var index = 0; index < CubeGame.entities.length; index += 1) {
        CubeGame.entities[index].draw(CubeGame.Graphics);
    }
    
};

CubeGame.Graphics = {
    clear:function() {
        CubeGame.context.clearRect(0, 0, Engine.world.width, Engine.world.height);
    },

    rectangle: function(point, width, height, colour) {
        CubeGame.context.fillStyle = colour;
        CubeGame.context.fillRect(point.x, point.y, width, height);
    },

    circle: function(point, radius, colour) {
        CubeGame.context.fillStyle = colour;
        CubeGame.context.beginPath();
        CubeGame.context.arc(point.x + 5, point.y + 5, radius, 0, Math.PI * 2, true);
        CubeGame.context.closePath();
        CubeGame.context.fill();
    },

    text: function(message, point, size, colour) {
        CubeGame.context.font = "bold " + size + "px Monospace";
        CubeGame.context.fillStyle = colour;
        CubeGame.context.fillText(message, point.x, point.y);
    }
};

// The false means fire the event at bubbling stage, not capturing.
window.addEventListener("load", CubeGame.init, false);
window.addEventListener("resize", CubeGame.resize, false);
