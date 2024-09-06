const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 背景设置为纯黑色
function drawBackground() {
    ctx.fillStyle = '#000000';  // 设置填充颜色为黑色
    ctx.fillRect(0, 0, canvas.width, canvas.height);  // 绘制整个画布为黑色
}

// 加载玩家和子弹图片
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

// 游戏变量
const groundHeight = 100;
const platformY = canvas.height - groundHeight;

let player = {
    x: 100,
    y: platformY - 50, // 玩家出生位置
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
    health: 100,
    exp: 0,
    expToLevelUp: 100,
    level: 1,
    facingRight: true,
    grounded: true,
    jumpPower: 15, // 跳跃高度
    gravity: 0.8 // 重力
};

let bullets = [];
let monsters = [];
let keys = {};
let gameOver = false;

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
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = platformY - 50;
        this.width = 50;
        this.height = 50;
        this.speed = 2;
        this.health = 100;
        this.maxHealth = 100;
        this.movingLeft = Math.random() > 0.5; // 随机初始方向
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
            if (this.x >= canvas.width - this.width - 50) {
                this.movingLeft = true;
            }
        }
    }

    draw() {
        ctx.drawImage(monsterMoveImages[this.animationFrame], this.x, this.y, this.width, this.height);
        this.drawHealthBar();
    }

    // 绘制怪物的血量条
    drawHealthBar() {
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthRatio = this.health / this.maxHealth;

        ctx.fillStyle = '#ff0000'; // 红色表示未损失的血量
        ctx.fillRect(this.x, this.y - 10, healthBarWidth, healthBarHeight);

        ctx.fillStyle = '#00ff00'; // 绿色表示当前剩余的血量
        ctx.fillRect(this.x, this.y - 10, healthBarWidth * healthRatio, healthBarHeight);
    }

    // 处理受伤
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
        }
    }

    // 处理死亡
    die() {
        const index = monsters.indexOf(this);
        if (index > -1) {
            monsters.splice(index, 1); // 从怪物列表中移除
        }
        player.exp += 20; // 玩家获得经验值
        if (player.exp >= player.expToLevelUp) {
            levelUp();
        }
    }
}

// 玩家跳跃
function jump() {
    if (player.grounded) {
        player.dy = -player.jumpPower;
        player.grounded = false;
    }
}

// 玩家升级
function levelUp() {
    player.level += 1;
    player.exp = 0;
    player.expToLevelUp += 50; // 下一级需要更多经验
}

// 玩家经验条绘制
function drawExpBar() {
    const barWidth = 200;
    const barHeight = 20;
    const expRatio = player.exp / player.expToLevelUp;

    ctx.fillStyle = '#ffffff'; // 白色背景
    ctx.fillRect(20, 20, barWidth, barHeight); // 绘制经验条背景
    ctx.fillStyle = '#00ff00'; // 绿色经验条
    ctx.fillRect(20, 20, barWidth * expRatio, barHeight); // 绘制经验条进度
    ctx.fillStyle = '#000000'; // 等级文本颜色
    ctx.font = '16px Arial';
    ctx.fillText(`Level: ${player.level}`, 20, 55); // 显示等级
}

// 玩家移动逻辑
function movePlayer() {
    player.x += player.dx;
    player.dy += player.gravity;
    player.y += player.dy;

    // 边界检测
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // 玩家落地
    if (player.y + player.height >= platformY) {
        player.y = platformY - player.height;
        player.dy = 0;
        player.grounded = true;
    }
}

// 检测子弹是否击中怪物
function checkBulletCollision() {
    bullets.forEach((bullet, bIndex) => {
        monsters.forEach((monster, mIndex) => {
            if (
                bullet.x < monster.x + monster.width &&
                bullet.x + bullet.width > monster.x &&
                bullet.y < monster.y + monster.height &&
                bullet.y + bullet.height > monster.y
            ) {
                monster.takeDamage(50); // 每次命中造成 50 点伤害
                bullets.splice(bIndex, 1); // 删除子弹
            }
        });
    });
}

// 游戏更新
function update() {
    movePlayer();
    updateBullets();
    monsters.forEach(monster => monster.update());
    checkBulletCollision(); // 检查子弹与怪物的碰撞
}

// 绘制游戏元素
function draw() {
    drawBackground(); // 绘制黑色背景
    drawPlatform();   // 绘制平台
    drawPlayer();     // 绘制玩家
    drawBullets();    // 绘制子弹
    monsters.forEach(monster => monster.draw()); // 绘制怪物
    drawExpBar();     // 绘制经验条
}

// 游戏循环
function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// 处理按键按下
function keyDown(e) {
    keys[e.key] = true;
    if (keys['a'] || keys['A']) {
        player.dx = -player.speed;
        player.facingRight = false;
    } else if (keys['d'] || keys['D']) {
        player.dx = player.speed;
        player.facingRight = true;
    }
    if (keys['w'] || keys['W'] || keys[' '] || keys['Space']) {
        jump(); // 玩家跳跃
    }
    if (keys['j'] || keys['J']) {
        shootBullet(); // 玩家射击
    }
}

// 处理按键释放
function keyUp(e) {
    keys[e.key] = false;
    if (!keys['a'] && !keys['d']) {
        player.dx = 0;
    }
}

// 初始化怪物
function initMonsters() {
    for (let i = 0; i < 3; i++) {
        monsters.push(new Monster());
    }
}

// 事件监听
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// 开始游戏
initMonsters();
gameLoop();
