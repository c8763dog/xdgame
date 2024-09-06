const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 绘制黑色背景
function drawBackground() {
    ctx.fillStyle = '#000000';  // 黑色背景
    ctx.fillRect(0, 0, canvas.width, canvas.height);  // 填充整个画布为黑色
}

// 游戏变量
const groundHeight = 100;
const platformY = canvas.height - groundHeight;
const experienceBarHeight = 20;

let player = {
    x: 100,
    y: platformY - 50, // 玩家出生位置
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
    gravity: 0.8,
    jumpPower: 15,
    grounded: true,
    jumpPressed: false,
    exp: 0, // 玩家经验值
    expToLevelUp: 100, // 每个等级所需经验值
};

let bullets = [];
let squares = [];
let keys = {};
let gameOver = false;

// Bullet Class (橙色攻击方块)
class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 10;
        this.direction = direction;
    }

    update() {
        this.x += this.direction === 'right' ? this.speed : -this.speed;
    }

    draw() {
        ctx.fillStyle = '#FFA500';  // 橙色子弹
        ctx.fillRect(this.x, this.y, this.width, this.height);  // 绘制橙色方块
    }
}

// Square Class (用于生成紫色、青蓝色、青灰色方块)
class Square {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);  // 绘制不同颜色的方块
    }
}

// 玩家移动和跳跃逻辑
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    // 添加重力
    if (!player.grounded) {
        player.dy += player.gravity;
    }

    // 边界检测，防止玩家移出画布
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // 防止玩家掉出平台
    if (player.y + player.height >= platformY) {
        player.y = platformY - player.height;
        player.dy = 0;
        player.grounded = true;
    }
}

// 绘制玩家
function drawPlayer() {
    ctx.fillStyle = '#00ff00';  // 绿色玩家
    ctx.fillRect(player.x, player.y, player.width, player.height);  // 绘制玩家为绿色矩形
}

// 玩家跳跃
function jump() {
    if (player.grounded && !player.jumpPressed) {
        player.dy = -player.jumpPower;  // 向上跳
        player.grounded = false;  // 跳起后不再接触地面
        player.jumpPressed = true;  // 防止连续跳跃
    }
}

// 玩家攻击：发射橙色方块
function shootBullet() {
    const bulletDirection = player.dx >= 0 ? 'right' : 'left'; // 根据玩家方向发射子弹
    bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, bulletDirection));
}

// 生成紫色、青蓝色和青灰色方块
function generateSquares() {
    const colors = ['#800080', '#008080', '#708090']; // 紫色、青蓝色、青灰色
    for (let i = 0; i < colors.length; i++) {
        squares.push(new Square(Math.random() * canvas.width, Math.random() * (platformY - 30), colors[i]));
    }
}

// 处理按键按下
function keyDown(e) {
    if (e.key === 'a' || e.key === 'A') {
        player.dx = -player.speed;  // 左移
    } else if (e.key === 'd' || e.key === 'D') {
        player.dx = player.speed;  // 右移
    } else if (e.key === 'w' || e.key === 'W' || e.key === ' ') {
        jump();  // 跳跃
    } else if (e.key === 'j' || e.key === 'J') {
        shootBullet();  // 发射子弹
    }
}

// 处理按键释放
function keyUp(e) {
    if (e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
        player.dx = 0;  // 停止移动
    }
    if (e.key === 'w' || e.key === 'W' || e.key === ' ') {
        player.jumpPressed = false;  // 松开跳跃键
    }
}

// 绘制平台
function drawPlatform() {
    ctx.fillStyle = '#654321'; // 棕色平台
    ctx.fillRect(0, platformY, canvas.width, groundHeight); // 绘制平台
}

// 绘制经验条
function drawExpBar() {
    const expBarWidth = 200;
    const expBarX = (canvas.width - expBarWidth) / 2; // 居中
    const expRatio = player.exp / player.expToLevelUp;

    ctx.fillStyle = '#ffffff'; // 白色背景
    ctx.fillRect(expBarX, canvas.height - experienceBarHeight - 10, expBarWidth, experienceBarHeight); // 绘制经验条背景
    ctx.fillStyle = '#00ff00'; // 绿色经验条
    ctx.fillRect(expBarX, canvas.height - experienceBarHeight - 10, expBarWidth * expRatio, experienceBarHeight); // 绘制经验条进度
}

// 更新子弹
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(index, 1); // 删除超出边界的子弹
        }
    });
}

// 游戏更新
function update() {
    movePlayer();
    updateBullets();
}

// 绘制游戏元素
function draw() {
    drawBackground(); // 绘制黑色背景
    drawPlatform();   // 绘制平台
    drawPlayer();     // 绘制玩家
    drawExpBar();     // 绘制经验条

    // 绘制子弹
    bullets.forEach(bullet => bullet.draw());

    // 绘制紫色、青蓝色和青灰色方块
    squares.forEach(square => square.draw());
}

// 游戏循环
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 事件监听
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// 生成方块
generateSquares();

// 开始游戏
gameLoop();
