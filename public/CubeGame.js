//=============================================================================
// requestAnimFrame is not well supported so use this shim layer. In reality
// most modern browsers (including mobile) support it, but Opera Mini doesn't
// so use this anyway. This is from
// http://paulirish.com/2011/requestanimationframe-for-smart-animating
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(callback){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var CubeGame = {
    WIDTH: 320,
    HEIGHT: 480,
    RATIO: 0,
    KEYBOARD_MAP: {},
    current_width: null,
    current_height: null,
    scale: 1,
    offset: {top: 0, left: 0},
    canvas: null,
    context: null,
    socket: null,
    entites: [],
    playerEntity: null,
    nextEntityId: 0
};

CubeGame.init = function() {
    CubeGame.startSocketConnection();
    CubeGame.initialiseGraphics();    
    CubeGame.initialiseGame();    
    
    CubeGame.loop();
};

CubeGame.startSocketConnection = function() {
    CubeGame.socket = io();
};

CubeGame.initialiseGraphics = function() {
    CubeGame.RATIO = CubeGame.WIDTH / CubeGame.HEIGHT;
    CubeGame.current_width = CubeGame.WIDTH;
    CubeGame.current_height = CubeGame.HEIGHT;

    CubeGame.canvas = document.getElementsByTagName("canvas")[0];
    CubeGame.canvas.width = CubeGame.WIDTH;
    CubeGame.canvas.height = CubeGame.HEIGHT;
    
    CubeGame.context = CubeGame.canvas.getContext("2d");

    CubeGame.resize();
};

CubeGame.initialiseGame = function() {
    CubeGame.playerEntity = new CubeGame.PlayerEntity(10, 10);
    CubeGame.entites.push(CubeGame.playerEntity);
    
    // left arrow
    CubeGame.KEYBOARD_MAP[37] = function() {
        CubeGame.playerEntity.move({x: -CubeGame.playerEntity.speed, y: 0});
    };
    // up arrow
    CubeGame.KEYBOARD_MAP[38] = function() {
        CubeGame.playerEntity.move({x: 0, y: -CubeGame.playerEntity.speed});
    };
    // right arrow
    CubeGame.KEYBOARD_MAP[39] = function() {
        CubeGame.playerEntity.move({x: CubeGame.playerEntity.speed, y: 0});
    };
    // down arrow
    CubeGame.KEYBOARD_MAP[40] = function() {
        CubeGame.playerEntity.move({x: 0, y: CubeGame.playerEntity.speed});
    };
    
    // a key
    CubeGame.KEYBOARD_MAP[65] = function() {
        CubeGame.shoot(
            {x: CubeGame.playerEntity.x, y: CubeGame.playerEntity.y},
            {x: -CubeGame.playerEntity.speed, y: 0}
        );
    };
    // w key
    CubeGame.KEYBOARD_MAP[87] = function() {
        CubeGame.shoot(
            {x: CubeGame.playerEntity.x, y: CubeGame.playerEntity.y},
            {x: 0, y: -CubeGame.playerEntity.speed}
        );
    };
    // d key
    CubeGame.KEYBOARD_MAP[68] = function() {
        CubeGame.shoot(
            {x: CubeGame.playerEntity.x, y: CubeGame.playerEntity.y},
            {x: CubeGame.playerEntity.speed, y: 0}
        );
    };
    // s key
    CubeGame.KEYBOARD_MAP[83] = function() {
        CubeGame.shoot(
            {x: CubeGame.playerEntity.x, y: CubeGame.playerEntity.y},
            {x: 0, y: CubeGame.playerEntity.speed}
        );
    };
    window.addEventListener("keydown", CubeGame.keyPressed, false);
};

CubeGame.removeEntity = function(entity) {
    for (var i = 0; i < CubeGame.entites.length; i += 1) {
        if (entity.id === CubeGame.entites[i].id) {
            CubeGame.entites.splice(i, 1);
        }
    }
};

CubeGame.shoot = function(start, vector) {
    CubeGame.entites.push(new CubeGame.BulletEntity(start, vector));
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
    CubeGame.scale = CubeGame.current_width / CubeGame.WIDTH;
    CubeGame.offset.top = CubeGame.canvas.offsetTop;
    CubeGame.offset.left = CubeGame.canvas.offsetLeft;
};

CubeGame.loop = function() {
    requestAnimFrame(CubeGame.loop);
    CubeGame.update();
    CubeGame.render();
};

CubeGame.update = function() {
    for (var index = 0; index < CubeGame.entites.length; index += 1) {
        CubeGame.entites[index].update();
    }
};

CubeGame.render = function() {
    CubeGame.Graphics.clear();
    for (var index = 0; index < CubeGame.entites.length; index += 1) {
        CubeGame.entites[index].render();
    }
    
};

CubeGame.Graphics = {
    clear:function() {
        CubeGame.context.clearRect(0, 0, CubeGame.WIDTH, CubeGame.HEIGHT);
    },

    rectangle: function(x, y, width, height, colour) {
        CubeGame.context.fillStyle = colour;
        CubeGame.context.fillRect(x, y, width, height);
    },

    circle: function(x, y, radius, colour) {
        CubeGame.context.fillStyle = colour;
        CubeGame.context.beginPath();
        CubeGame.context.arc(x + 5, y + 5, radius, 0, Math.PI * 2, true);
        CubeGame.context.closePath();
        CubeGame.context.fill();
    },

    text: function(message, x, y, size, colour) {
        CubeGame.context.font = "bold " + size + "px Monospace";
        CubeGame.context.fillStyle = colour;
        CubeGame.context.fillText(message, x, y);
    }
};

CubeGame.insideScene = function(point) {
    if (point.x >= 0 && point.x < CubeGame.WIDTH) {
        if (point.y >= 0 && point.y < CubeGame.HEIGHT) {
            return true;
        }
    }
    return false;
};

CubeGame.PlayerEntity = function(x, y) {
    this.id = ++CubeGame.nextEntityId;
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.render = function() {
        CubeGame.Graphics.rectangle(this.x, this.y, 15, 15, "black");
    };
    this.move = function(vector) {
        this.x += vector.x;
        this.y += vector.y;
        if (!CubeGame.insideScene({x: this.x, y: this.y})) {
            this.x -= vector.x;
            this.y -= vector.y;
        }
    };
    this.update = function() {

    };
};

CubeGame.BulletEntity = function(point, vector) {
    this.id = ++CubeGame.nextEntityId;
    this.x = point.x;
    this.y = point.y;
    this.vector = vector;
    this.render = function() {
        CubeGame.Graphics.circle(this.x, this.y, 3, "red");
    };
    this.update = function() {
        this.x += this.vector.x;
        this.y += this.vector.y;
        if (!CubeGame.insideScene({x: this.x, y: this.y})) {
            CubeGame.removeEntity(this);
        }
    };
};
// The false means fire the event at bubbling stage, not capturing.
window.addEventListener("load", CubeGame.init, false);
window.addEventListener("resize", CubeGame.resize, false);
