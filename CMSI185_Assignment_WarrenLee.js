const progressBar = document.querySelector("progress");
const prompt = document.querySelector("#prompt");
let canvas;
let gamestate = "homepage";
let backgroundImage;
let victoryAudio = document.getElementById("victoryAudio");
let lossAudio = document.getElementById("lossAudio");
prompt.addEventListener("click", () => {
  canvas.style.display = "block";
  prompt.style.display = "none";
  gamestate = "game";
  console.log(`HAPPENED, gamestate is now ${gamestate}`);
});

class Sprite {
  constructor(x, y, color, diameter) {
    Object.assign(this, { x, y, color, diameter });
  }
  get radius() {
    return this.diameter / 2;
  }
}
class Player extends Sprite {
  constructor(x, y, health, color) {
    super(x, y, "white", 20);
    this.health = health;
    this.color = color;
  }

  reset() {
    [this.x, this.y] = [width / 10, height / 2];
    this.health = 100;
  }

  move() {
    let speed = 4;
    if (keyIsDown(LEFT_ARROW)) {
      if (this.x < 10) {
        speed = 0;
      }
      this.x -= speed;
    }

    if (keyIsDown(RIGHT_ARROW)) {
      if (this.x > width - 10) {
        speed = 0;
      }
      this.x += speed;
    }

    if (keyIsDown(UP_ARROW)) {
      if (this.y < 10) {
        speed = 0;
      }
      this.y -= speed;
    }

    if (keyIsDown(DOWN_ARROW)) {
      if (this.y > height - 10) {
        speed = 0;
      }
      this.y += speed;
    }
  }
  render() {
    fill(this.color);
    circle(this.x, this.y, this.diameter);
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
    this.Yspeed = Yspeed;
  }
  reset() {
    [this.x, this.y, this.Xspeed, this.Yspeed] = [
      width * 5 / 7,
      height / 2,
      this.Xspeed,
      this.Yspeed
    ];
  }
  render() {
    fill(this.color);
    circle(this.x, this.y, this.diameter);
  }
  move() {
    this.x += this.Xspeed;
    this.y += this.Yspeed;
    if (this.x >= width - this.diameter / 2 || this.x <= this.diameter / 2) {
      this.Xspeed = -this.Xspeed;
    }
    if (this.y >= height - this.diameter / 2 || this.y <= this.diameter / 2) {
      this.Yspeed = -this.Yspeed;
    }
  }
}
class Enemy2 extends Sprite {
  constructor(x, y, Xspeed, Yspeed) {
    super(x, y, randomColor(), 60);
    this.Xspeed = Xspeed;
    this.Yspeed = Yspeed;
  }
  reset() {
    [this.x, this.y] = [width * 6 / 8, height / 2];
  }
  render() {
    circle(this.x, this.y, this.diameter);
  }
  move(target) {
    this.x += (target.x - this.x) * this.Xspeed;
    this.y += (target.y - this.y) * this.Yspeed;
    if (this.x >= width - this.diameter / 2 || this.x <= this.diameter / 2) {
      this.Xspeed = -this.Xspeed;
    }
    if (this.y >= height - this.diameter / 2 || this.y <= this.diameter / 2) {
      this.Yspeed = -this.Yspeed;
    }
  }
}
class Goal {
  constructor(x, y, width, height, color) {
    Object.assign(this, { x, y, width, height, color });
  }
  isTouched(player) {
    return player.x >= width - 30;
  }
  render() {
    let goal_width = 30;
    fill("#ff3333");
    rect(width - goal_width, 0, goal_width, height);
  }
}

let width = 1500;
let height = 750;
let goal = new Goal();
let points = 0;
let scarecrow;
let numScarecrow = 3;
let player = new Player(width / 10, height / 2, 100, "white");
let enemies = [];
let enemies2 = [];

for (let i = 0; i < 200; i++) {
  enemies.push(new Enemy(...randomParticle()));
  console.log(enemies[i].Xspeed);
}
for (let i = 0; i < 5; i++) {
  enemies2.push(
    new Enemy2(
      ...randomPointOnCanvas(),
      Math.random() * 0.01,
      Math.random() * 0.01
    )
  );
}

function preload() {
  backgroundImage = loadImage("https://i.imgur.com/TmeMFKz.jpg");
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
    width * (5 / 7),
    height / 2,
    Math.floor(Math.random() * 2) - 0.5,
    Math.floor(Math.random() * 2) - 0.5
  ];
}

function randomPointOnCanvas() {
  return [width * (5 / 7), height / 2];
}

function checkForDamage(enemy, player) {
  if (collided(player, enemy)) {
    player.takeHit();
  }
}

function adjust() {
  const characters = [player, ...enemies, ...enemies2];
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

function randomColor() {
  const red = Math.floor(Math.random() * 250);
  const green = Math.floor(Math.random() * 250);
  const blue = Math.floor(Math.random() * 250);
  return `rgba(${red},${green},${blue},0.7)`;
}

function setup() {
  createCanvas(width, height);
  noStroke();
  canvas = document.querySelector("canvas");
}

function slowDown(sprite) {
  sprite.Xspeed = sprite.Xspeed;
  sprite.Yspeed = sprite.Yspeed;
  if (keyIsDown(32)) {
    sprite.Xspeed = sprite.Xspeed * 0.95;
    sprite.Yspeed = sprite.Yspeed * 0.95;
  }
}

function draw() {
  background("black");
  noStroke();
  if (gamestate === "game") {
    pauseAudio(victoryAudio);
    goal.render();
    player.render();
    player.move();

    enemies.forEach(enemy1 => {
      enemy1.render();
    });
    enemies.forEach(enemy1 => {
      checkForDamage(enemy1, player);
    });
    enemies.forEach(enemy1 => {
      enemy1.move();
    });
    enemies.forEach(enemy1 => {
      slowDown(enemy1);
    });

    enemies2.forEach(enemy2 => {
      enemy2.render();
    });
    enemies2.forEach(enemy2 => {
      checkForDamage(enemy2, player);
    });
    enemies2.forEach(enemy2 => {
      slowDown(enemy2);
    });
    enemies2.forEach(enemy2 => {
      enemy2.move(scarecrow || player);
    });

    if (scarecrow) {
      scarecrow.render();
      scarecrow.ttl--;
      if (scarecrow.ttl < 0) {
        scarecrow = undefined;
      }
    }
    if (player.health <= 0) {
      gamestate = "loss";
    }
    if (goal.isTouched(player)) {
      gamestate = "win";
    }
    adjust();
  }

  if (gamestate === "win") {
    playAudio(victoryAudio);
    canvas.style.display = "none";
    prompt.textContent = "YOU WIN PLAY AGAIN";
    prompt.style.display = "block";
    player.reset();
    enemies.forEach(enemy1 => {
      enemy1.reset();
    });
    enemies2.forEach(enemy2 => {
      enemy2.reset();
    });
    numScarecrow = 2;
    gamestate = "homepage";
  }

  if (gamestate === "loss") {
    playAudio(lossAudio);
    canvas.style.display = "none";
    prompt.textContent = "TRY AGAIN";
    prompt.style.display = "block";
    player.reset();
    enemies.forEach(enemy1 => {
      enemy1.reset();
    });
    enemies2.forEach(enemy2 => {
      enemy2.reset();
    });
    numScarecrow = 2;
    gamestate = "homepage";
  }
}

if (gamestate === "homepage") {
  console.log("winaudio");
  pauseAudio(victoryAudio);
}

function playAudio(x) {
  x.play();
}

function pauseAudio(x) {
  x.pause();
}

function mouseClicked() {
  if (!scarecrow && numScarecrow > 0) {
    numScarecrow -= 1;
    scarecrow = new Player(player.x, player.y, 100, "rgba(255,255,255,0.3)");
    scarecrow.ttl = frameRate() * 5;
  }
}