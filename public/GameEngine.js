//=============================================================================
//
// This is code to be shared between the client and server.

var Engine = (typeof exports == "undefined") ? {} : exports;

Engine.world = {
    width: 320,
    height: 480
};

Engine.entityMove = function(entities, id, vector) {
    for (var i = 0; i < entities.length; ++i) {
        if (entities[i].id === id) {
            entities[i].move(vector);
            break;
        }
    }
}

Engine.removeEntity = function(entity) {
    entity.remove = true;
};


Engine.insideWorld = function(point) {
    if (point.x >= 0 && point.x < Engine.world.width) {
        if (point.y >= 0 && point.y < Engine.world.height) {
            return true;
        }
    }
    return false;
};
Engine.PlayerEntity = function(id, point) {
    this.id = id;
    this.remove = false;
    this.point = point;
    this.speed = 5;
    this.move = function(vector) {
        this.point.x += vector.x;
        this.point.y += vector.y;
        if (!Engine.insideWorld(this.point)) {
            this.point.x -= vector.x;
            this.point.y -= vector.y;
        }
    };
    this.draw = function(renderer) {
        renderer.rectangle(this.point, 15, 15, "black");
    };
    this.update = function() {

    };
};

Engine.BulletEntity = function(id, point, vector) {
    this.id = id;
    this.point = point;
    this.remove = false;
    this.vector = vector;
    this.update = function() {
        this.point.x += this.vector.x;
        this.point.y += this.vector.y;
        if (!(this.point)) {
            Engine.removeEntity(this);
        }
    };
    this.draw = function(renderer) {
        renderer.circle(this.point, 3, "red");
    };
};
