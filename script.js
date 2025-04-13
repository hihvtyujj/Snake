const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

class Snake {
  constructor(x, y, color, isAI = false) {
    this.segments = [{ x, y }];
    this.length = 40;
    this.speed = 2;
    this.color = color;
    this.isAI = isAI;
    this.angle = 0;
    this.dead = false;
  }

  move() {
    if (this.dead) return;

    const head = this.segments[0];
    if (this.isAI) {
      this.angle += (Math.random() - 0.5) * 0.2;
    } else {
      this.angle = Math.atan2(mouse.y - head.y, mouse.x - head.x);
    }

    const newHead = {
      x: head.x + Math.cos(this.angle) * this.speed,
      y: head.y + Math.sin(this.angle) * this.speed
    };

    this.segments.unshift(newHead);
    while (this.segments.length > this.length) this.segments.pop();
  }

  draw() {
    if (this.dead) return;
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(seg.x, seg.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  checkCollision(otherSnakes) {
    if (this.dead) return;

    const head = this.segments[0];
    for (let snake of otherSnakes) {
      if (snake === this || snake.dead) continue;
      for (let i = 5; i < snake.segments.length; i++) {
        const seg = snake.segments[i];
        const dist = Math.hypot(seg.x - head.x, seg.y - head.y);
        if (dist < 10) {
          this.dead = true;
          dropFood(this.segments);
          return;
        }
      }
    }
  }
}

class Food {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

let player = new Snake(canvas.width / 2, canvas.height / 2, "#00FF00");
let aiSnakes = Array.from({ length: 5 }, () =>
  new Snake(Math.random() * canvas.width, Math.random() * canvas.height, "#FF0000", true)
);
let foods = [];

function dropFood(segments) {
  for (let i = 0; i < segments.length; i += 3) {
    foods.push(new Food(segments[i].x, segments[i].y, "#FFFF00"));
  }
}

function eatFood(snake) {
  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i];
    const head = snake.segments[0];
    const dist = Math.hypot(f.x - head.x, f.y - head.y);
    if (dist < 10) {
      snake.length += 5;
      foods.splice(i, 1);
    }
  }
}

function gameLoop() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  player.move();
  player.checkCollision(aiSnakes);
  eatFood(player);
  player.draw();

  for (let ai of aiSnakes) {
    ai.move();
    ai.checkCollision([player, ...aiSnakes]);
    eatFood(ai);
    ai.draw();
  }

  for (let f of foods) f.draw();

  requestAnimationFrame(gameLoop);
}

gameLoop();
