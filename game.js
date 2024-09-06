const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load Images
const playerImg = new Image();
playerImg.src = 'assets/a.png';

const bulletImg = new Image();
bulletImg.src = 'assets/b.png';

const monsterMoveImages = [
    new Image(),
    new Image(),
    new Image(),
];
monsterMoveImages[0].src = 'assets/move_0.png';
monsterMoveImages[1].src = 'assets/move_1.png';
monsterMoveImages[2].src = 'assets/move_2.png';

const monsterStandImages = [
    new Image(),
    new Image(),
    new Image(),
];
monsterStandImages[0].src = 'assets/stand_0.png';
monsterStandImages[1].src = 'assets/stand_1.png';
monsterStandImages[2].src = 'assets/stand_2.png';

const monsterHitImage = new Image();
monsterHitImage.src = 'assets/hit1_0.png';

const monsterDieImages = [
    new Image(),
    new Image(),
    new Image(),
];
monsterDieImages[0].src = 'assets/die1_0.png';
monsterDieImages[1].src = 'assets/die1_1.png';
monsterDieImages[2].src = 'assets/die1_2.png';

// Game Variables
let player = {
    x: 100,
    y: canvas.height - 150,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
    health: 100,
    exp: 0,
    facingRight: true
};

let bullets = [];
let monsters = [];
let keys = {};

// Bullet Class
class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 10;
        this.speed = 10;
        this.direction = direction;
    }

    update() {
        this.x += this.direction === 'right' ? this.speed : -this.speed;
    }

    draw() {
        ctx.save();
        if (this.direction === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(bulletImg, -this.x - this.width, this.y, this.width, this.height);
        } else {
            ctx.drawImage(bulletImg, this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
}

// Monster Class
class Monster {
    constructor() {
        this.x = canvas.width - 100;
        this.y = canvas.height - 150;
        this.width = 50;
        this.height = 50;
        this.speed = 2;
        this.health = 100;
        this.facingRight = false;
        this.movingLeft = true;
        this.animationFrame = 0;
    }

    update() {
        this.animationFrame = (this.animationFrame + 1) % 3;
        if (this.movingLeft) {
            this.x -= this.speed;
            if (this.x <= 50) {
                this.movingLeft = false;
            }
        } else {
            this.x += this.speed;
            if (this.x >= canvas.width - 100) {
                this.movingLeft = true;
            }
        }
    }

    draw() {
        ctx.drawImage(monsterMoveImages[this.animationFrame], this.x, this.y, this.width, this.height);
    }
}

// Control Player Movement
function movePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Draw Player
function drawPlayer() {
    ctx.save();
    if (!player.facingRight) {
        ctx.scale(-1, 1);
        ctx.drawImage(playerImg, -player.x - player.width, player.y, player.width, player.height);
    } else {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    }
    ctx.restore();
}

// Shoot Bullet
function shootBullet() {
    const bulletDirection = player.facingRight ? 'right' : 'left';
    bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, bulletDirection));
}

// Update Bullets
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(index, 1);
        }
    });
}

// Draw Bullets
function drawBullets() {
    bullets.forEach(bullet => bullet.draw());
}

// Update Game State
function update() {
    movePlayer();
    updateBullets();
    monsters.forEach(monster => monster.update());
}

// Draw Game Elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    monsters.forEach(monster => monster.draw());
}

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Handle Key Presses
function keyDown(e) {
    keys[e.key] = true;
    if (keys['a'] || keys['A']) {
        player.dx = -player.speed;
        player.facingRight = false;
    } else if (keys['d'] || keys['D']) {
        player.dx = player.speed;
        player.facingRight = true;
    }
    if (keys['j'] || keys['J']) {
        shootBullet();
    }
}

// Handle Key Releases
function keyUp(e) {
    keys[e.key] = false;
    if (!keys['a'] && !keys['d']) {
        player.dx = 0;
    }
}

// Initialize Monsters
function initMonsters() {
    for (let i = 0; i < 3; i++) {
        monsters.push(new Monster());
    }
}

// Event Listeners
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Start Game
initMonsters();
gameLoop();
