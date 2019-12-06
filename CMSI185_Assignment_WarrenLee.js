
const progressBar = document.querySelector("progress");

function randomColor() {
  const red = Math.floor(Math.random() * 250);
  const green = Math.floor(Math.random() * 250);
  const blue = Math.floor(Math.random() * 250);
  return `rgba(${red},${green},${blue},0.7)`;
}

class Sprite {
  constructor(x, y, color, diameter) {
    Object.assign(this, { x, y, color, diameter });
  }
  get radius() {
    return this.diameter / 2;
  }
}

class Player extends Sprite {
  constructor() {
    super(width/10, height/2, "white", 20);
    this.health = 100;
  }
  render() {
    fill(this.color);
    circle(this.x,this.y, this.diameter);
    let speed = 4;
    if (keyIsDown(LEFT_ARROW)) {
      if(this.x < 10){
        speed = 0;
      }
      this.x -= speed;
    }
  
    if (keyIsDown(RIGHT_ARROW)) {
      if(this.x > width-10){
        speed = 0;
      }
      this.x += speed;
    }
  
    if (keyIsDown(UP_ARROW)) {
      if(this.y < 10){
        speed = 0;
      }
      this.y -= speed;
    }
  
    if (keyIsDown(DOWN_ARROW)) {
      if(this.y > height-10){
        speed = 0;
      }
      this.y += speed;
    }
    

  }
  takeHit() {
    this.health -= 1;
    console.log("oh");
    progressBar.value = this.health;
  }
}

class Enemy extends Sprite {
  constructor(x, y, Xspeed, Yspeed) {
    super(x, y, randomColor(), 30);
    this.Xspeed = Xspeed;
    this.Yspeed = Yspeed
  }
  render() {
    fill(this.color);
    circle(this.x, this.y, this.diameter);
  }
  move() {
    this.x += this.Xspeed;
    this.y += this.Yspeed;
    if(this.x >= width-this.diameter/2 || this.x <= this.diameter/2){
      this.Xspeed = -this.Xspeed;
    }
    if(this.y >= height-this.diameter/2 || this.y <= this.diameter/2){
      this.Yspeed = -this.Yspeed;
    }
  }
}

function collided(sprite1, sprite2) {
  const distanceBetween = Math.hypot(
    sprite1.x - sprite2.x,
    sprite1.y - sprite2.y
  );
  const sumOfRadii = sprite1.diameter / 2 + sprite2.diameter / 2;
  return distanceBetween < sumOfRadii;
}

function randomPointOnCanvas() {
  return [
    width/2,
    height/2,
    Math.floor(Math.random()*2) - 0.5,
    Math.floor(Math.random()*2) - 0.5
  ];
}

let width = 1500;
let height = 750;
let player = new Player();
let enemies = [];
for (let i = 0; i<300; i++){
  enemies.push(new Enemy(...randomPointOnCanvas()),
)
}


function setup() {
  createCanvas(width, height);
  noStroke();
}

function checkForDamage(enemy, player) {
  if (collided(player, enemy)) {
    player.takeHit();
  }
}

function PlayerToSprite() {
  const characters = [player, ...enemies];
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      pushOff(characters[i], characters[j]);
    }
  }
}

function pushOff(c1, c2) {
  let [dx, dy] = [c2.x - c1.x, c2.y - c1.y];
  const distance = Math.hypot(dx, dy);
  let overlap = c1.radius + c2.radius - distance;
  if (overlap > 0) {
    const adjustX = overlap / 2 * (dx / distance);
    const adjustY = overlap / 2 * (dy / distance);
    c1.x -= adjustX;
    c1.y -= adjustY;
    c2.x += adjustX;
    c2.y += adjustY;
  }
}



function draw() {
  background("black");
  player.render();
  enemies.forEach(enemy => {
    enemy.render();
    checkForDamage(enemy, player);
    enemy.move();
  });
  PlayerToSprite();
  
}
