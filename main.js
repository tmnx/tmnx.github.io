
// Animation for all entities
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// Background entity constructor 
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};
Background.prototype.draw = function () {               // fixed backgroud
    this.ctx.drawImage(this.spritesheet, this.x, this.y);
};
Background.prototype.update = function () {
};

// Health bar constructor
// function HealthBar(game) {
//     Entity.call(this, game, 0, 400);    // health status = 400
//     this.radius = 200;
// }
// HealthBar.prototype = new Entity();
// HealthBar.prototype.constructor = HealthBar;
// HealthBar.prototype.update = function () {
// }
// HealthBar.prototype.draw = function (ctx) {
//     ctx.fillStyle = "Red";
//     ctx.fillRect(5, 5, this.game.entities.Character.hp, 20);
//     ctx.fillStyle = "White";
//     ctx.fillRect(this.game.entities.Character.hp, 0, 100-this.game.entities.Character.hp, 20);
//     ctx.beginPath();
//     ctx.lineWidth = "4";
//     ctx.strokeStyle = "black";
//     ctx.rect(6, 6, 100, 20);
//     ctx.stroke();
//     Entity.prototype.draw.call(this);
// }

// Main character constructor
function MainCharacter(game) {
    this.walkAnim = new Animation(ASSET_MANAGER.getAsset("./img/MainCharacter.png"), 
                                                        0, 64, 64, 64, 0.1, 4, true, false);
    this.backWalkAnim= new Animation(ASSET_MANAGER.getAsset("./img/MainCharacter.png"), 
                                                            0, 0, 64, 64, 0.1, 4, true, false);
    this.attackBackAnim = new Animation(ASSET_MANAGER.getAsset("./img/MainCharacter.png"), 
                                                                0, 128, 64, 64, .1, 4, false, false);
    this.attackForwardAnim = new Animation(ASSET_MANAGER.getAsset("./img/MainCharacter.png"), 
                                                                0, 192, 64, 64, .1, 4, false, false);
    this.idleBackAnim = new Animation(ASSET_MANAGER.getAsset("./img/MainCharacter.png"), 
                                                            0, 0, 64, 64, .1, 1, true, false);
    this.idleAnim = new Animation(ASSET_MANAGER.getAsset("./img/MainCharacter.png"), 
                                                        0, 64, 64, 64, .1, 1, true, false);
    this.jumpForward = new Animation(ASSET_MANAGER.getAsset("./img/MainCharacter.png"), 
                                                            0, 320, 64, 64, .2, 4, false, false);
    this.jumpBackward = new Animation(ASSET_MANAGER.getAsset("./img/MainCharacter.png"), 
                                                            0, 256, 64, 64, .2, 4, false, false);
    this.jumping = false;
    this.stand = true;
    this.back = false;
    this.attack = false;
    this.hp = 100;
    this.radius = 64;
    this.ground = 244; // y placement on screen 

    Entity.call(this, game, 0, this.ground);
}

MainCharacter.prototype = new Entity();
MainCharacter.prototype.constructor = MainCharacter;

// update states
MainCharacter.prototype.update = function () {

    // if more than certain time stop and attack
    if (this.x > 150 && this.game.clockTick <= 0.016) {
        // this.game.d = false;
        this.game.c = true;
        this.game.l = true;
    } else if (this.x > 350) {
        this.game.c = false;
        this.game.l = false;
        this.game.space = true;
    } else {
        // animate walking
        this.game.c = false;
        this.game.l = false;
        this.game.space = false;
        this.game.d = true;
    }

    if (this.game.space) {
        this.jumping = true; 
    }
    if(this.game.l) {

        this.attack = true;
    }
    if(this.game.d || this.game.a) {
        this.stand = false;
        if(this.game.d == false) {
            this.back = true;
        }
        else {
            this.back = false;
        }
    }
    else {
        this.stand = true;
    }

    if (this.jumping) {
        if (this.jumpForward.isDone()) {
            this.jumpForward.elapsedTime = 0;
            this.jumpBackward.elapsedTime = 0;
            this.jumping = false;
        }
        if(this.jumpBackward.isDone()) {
            this.jumpForward.elapsedTime = 0;
            this.jumpBackward.elapsedTime = 0;
            this.jumping = false; 
        }
        if(this.jumpBackward.elapsedTime > this.jumpForward.elapsedTime) {
            this.jumpForward.elapsedTime = this.jumpBackward.elapsedTime;
        }
        else if(this.jumpForward.elapsedTime > this.jumpBackward.elapsedTime) {
            this.jumpBackward.elapsedTime = this.jumpForward.elapsedTime;
        }
        var jumpDistance = this.jumpForward.elapsedTime / this.jumpForward.totalTime;
        var totalHeight = 70;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    else if(this.attack) {
        if (this.attackForwardAnim.isDone() || this.attackBackAnim.isDone()) {
            this.attackForwardAnim.elapsedTime = 0;
            this.attackBackAnim.elapsedTime = 0;
            this.attack = false;
        }
    }

    // wrap around when out of frame
    if(this.game.d) {                                       // d = walk, d & c = sprint
        if(this.game.c) {
            this.x = this.x + this.game.clockTick * 200;    // sprint speed
            // if(this.x > 630) {
            //     this.x = -400;                  // wrap
            // }
        }
        else {
            this.x = this.x + this.game.clockTick * 80;    // sprint speed
            // if(this.x > 630) this.x = -400;                  // wrap
        }
    }
    if(this.game.a) {
        if(this.game.c) {
            this.x = this.x - this.game.clockTick * 200     // sprint speed
            // if(this.x < 0) this.x = 620;                    // wrap
        }
        else {
            this.x = this.x - this.game.clockTick * 80     // walk speed
            // if(this.x < 0) this.x = 620;                    // wrap
        } 
    }

    Entity.prototype.update.call(this);
}

// Draw based on state of character
MainCharacter.prototype.draw = function (ctx) {
    if (this.jumping && !this.back) {
        this.jumpForward.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if(this.jumping && this.back) {
        this.jumpBackward.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if(this.attack && this.back) {
        this.attackBackAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if(this.attack && !this.back) {
        this.attackForwardAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if(this.stand == false && this.back == false) {
        this.walkAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if(this.stand == false && this.back == true) {
        this.backWalkAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if(this.stand == true && this.back == false){
        this.idleAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        this.idleBackAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

function Bat(game, spriteSheet, speed) {
    this.fly = new Animation(spriteSheet, 0, 96, 32, 32, 0.1, 4, true, false);
    this.x = 660;
    this.y = 260;
    this.speed = speed;
    this.game = game;
    this.ctx = game.ctx;
    this.spriteSheet = spriteSheet;
}
Bat.prototype.update = function() {
    if (this.x < 400) {
        this.x -= this.game.clockTick * this.speed * 10;
    } else {
        this.x -= this.game.clockTick * this.speed;
    }
    Entity.prototype.update.call(this);
}
Bat.prototype.draw = function(cxt) {
    this.fly.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/MainCharacter.png");
ASSET_MANAGER.queueDownload("./img/bg.gif");
ASSET_MANAGER.queueDownload("./img/bat.png/");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    var maincharacter = new MainCharacter(gameEngine);
    // var healthbar = new HealthBar(gameEngine);
    var bat = new Bat(gameEngine, ASSET_MANAGER.getAsset("./img/bat.png/"), 67);
    var bat2 = new Bat(gameEngine, ASSET_MANAGER.getAsset("./img/bat.png/"), 80);
    var bat3 = new Bat(gameEngine, ASSET_MANAGER.getAsset("./img/bat.png/"), 140);
    var bat4 = new Bat(gameEngine, ASSET_MANAGER.getAsset("./img/bat.png/"), 30);
    bat2.y = 230;
    bat3.y = 250;

    gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/bg.gif")));
    // gameEngine.addEntity(healthbar);
    gameEngine.addEntity(bat);
    gameEngine.addEntity(bat2);
    gameEngine.addEntity(bat3);
    gameEngine.addEntity(bat4);
    gameEngine.entities.Character = maincharacter;

    console.log(gameEngine.entities);
});

