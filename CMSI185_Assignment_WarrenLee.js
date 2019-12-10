const progressBar = document.querySelector("progress");

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
    super(width/10, height/2, "black", 20);
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
class Enemy2 extends Sprite {
  constructor(x, y, Xspeed, Yspeed) {
    super(x, y, randomColor(), 60)
    this.Xspeed = Xspeed;
    this.Yspeed = Yspeed;
  }
  render() {
    // stroke("black");
    // strokeWeight(5); 
    circle(this.x, this.y, this.diameter);
  }
  move(target) {
    this.x += (target.x - this.x) *  this.Xspeed;
    this.y += (target.y - this.y) *  this.Yspeed;
    if(this.x >= width-this.diameter/2 || this.x <= this.diameter/2){
      this.Xspeed = -this.Xspeed;
    }
    if(this.y >= height-this.diameter/2 || this.y <= this.diameter/2){
      this.Yspeed = -this.Yspeed;
    }
  }
}
class Goal {
  constructor(x, y, width, height, color) {
    Object.assign(this, { x, y, width, height, color });
  }
  isTouched(player) {
    if(player.x >= this.x){
      return true;
    } else {
      return false;
    }
  }
  
  render() {
    let goal_width = 30;
    fill("red");
    rect(width - goal_width, 0, goal_width, height);
  }
}

let width = 1500;
let height = 750;
let goal = new Goal();
let player = new Player();
let enemies = []; 
let enemies2 = [];

for (let i = 0; i<300; i++){
  enemies.push(new Enemy(...randomParticle()))
}
for (let i = 0; i<5; i++){
  enemies2.push(new Enemy2(...randomPointOnCanvas(), Math.random()*0.01, Math.random()*0.01))
}

function moveToward(leader, follower, speed) {
  follower.x += (leader.x - follower.x) * speed;
  follower.y += (leader.y - follower.y) * speed;
}

function collided(sprite1, sprite2) {
  const distanceBetween = Math.hypot(
    sprite1.x - sprite2.x,
    sprite1.y - sprite2.y
  );
  const sumOfRadii = sprite1.diameter / 2 + sprite2.diameter / 2;
  return distanceBetween < sumOfRadii;
}

function randomParticle() {
  return [
    width*(5/7),
    height/2,
    Math.floor(Math.random()*2) - 0.5,
    Math.floor(Math.random()*2) - 0.5
  ];
}

function randomPointOnCanvas() {
  return [
    width*(5/7),
    height/2
  ];
}

function checkForDamage(enemy, player) {
  if (collided(player, enemy)) {
    player.takeHit();
  }
}

function adjust() {
  const characters = [player, ...enemies, ...enemies2];
  for (let i = 0; i < characters.length; i++) {
    for (let j = i+1; j < characters.length; j++) {
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

function randomColor() {
  const red = Math.floor(Math.random() * 250);
  const green = Math.floor(Math.random() * 250);
  const blue = Math.floor(Math.random() * 250);
  return `rgba(${red},${green},${blue},0.7)`;
}

function setup() {
  createCanvas(width, height);
  noStroke();
}

function slowDown(sprite) {
  if(keyIsDown(32)){
    sprite.Xspeed = sprite.Xspeed * 0.9;
    sprite.Yspeed = sprite.Yspeed * 0.9;
  }
  
}

function draw() {
  background("url('/Users/lee/Documents/Visual_Studio_Code/Chaser Game/background_grid.jpg')");
  noStroke();
  goal.render();
  player.render();
  enemies.forEach(enemy1 => {
    enemy1.render();
    checkForDamage(enemy1, player);
    enemy1.move();
    slowDown(enemy1);
  });
  enemies2.forEach(enemy2 => {
    enemy2.render();
    checkForDamage(enemy2,player);
    enemy2.move(player);
    slowDown(enemy2);
  })
  adjust();
}

