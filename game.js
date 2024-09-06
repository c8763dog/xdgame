const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
    airSpeedMultiplier: 1.5, // 空中速度增加
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
let enemies = []; // 敌人数组
let keys = {};
let mapOffsetX = 0; // 地图的偏移量，用于地图扩展

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
        ctx.fillRect(this.x - mapOffsetX, this.y, this.width, this.height);  // 绘制橙色方块
    }
}

// Enemy Class (白色敌人方块)
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = 2;
    }

    update() {
        // 简单的左右移动逻辑
        this.x -= this.speed;
        if (this.x + this.width < 0) {
            this.x = canvas.width + Math.random() * 500; // 重置敌人位置
        }
    }

    draw() {
        ctx.fillStyle = '#FFFFFF'; // 白色敌人
        ctx.fillRect(this.x - mapOffsetX, this.y, this.width, this.height);  // 绘制白色敌人方块
    }
}

// 玩家移动和跳跃逻辑
function movePlayer() {
    // 空中移动速度增加
    const speed = player.grounded ? player.speed : player.speed * player.airSpeedMultiplier;
    player.x += player.dx * speed;
    player.y += player.dy;

    // 地图扩展逻辑：当玩家向右移动时，地图向前扩展
    if (player.x + player.width / 2 > canvas.width / 2) {
        mapOffsetX += player.dx * speed; // 根据玩家的移动调整地图的偏移量
        player.x = canvas.width / 2 - player.width / 2; // 将玩家固定在画面中间
    }

    // 添加重力
    if (!player.grounded) {
        player.dy += player.gravity;
    }

    // 防止玩家掉出平台
    if (player.y + player.height >= platformY) {
        player.y = platformY - player.height;
        player.dy = 0;
        player.grounded = true; // 玩家触地
    }
}

// 绘制玩家
function drawPlayer() {
    ctx.fillStyle = '#00ff00';  // 绿色玩家
    ctx.fillRect(player.x, player.y, player.width, player.height);  // 绘制玩家为绿色矩形
}

// 玩家跳跃
function jump() {
    if (player.grounded) {
        player.dy = -player.jumpPower;  // 向上跳
        player.grounded = false;  // 跳起后不再接触地面
    }
}

// 玩家攻击：发射橙色方块
function shootBullet() {
    const bulletDirection = player.dx >= 0 ? 'right' : 'left'; // 根据玩家方向发射子弹
    bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, bulletDirection));
}

// 处理按键按下
function keyDown(e) {
    if (e.key === 'a' || e.key === 'A') {
        player.dx = -1;  // 左移
    } else if (e.key === 'd' || e.key === 'D') {
        player.dx = 1;  // 右移
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
}

// 绘制平台
function drawPlatform() {
    ctx.fillStyle = '#654321'; // 棕色平台
    ctx.fillRect(-mapOffsetX, platformY, canvas.width + mapOffsetX, groundHeight); // 随地图扩展的可移动平台
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
        if (bullet.x < 0 || bullet.x > canvas.width + mapOffsetX) {
            bullets.splice(index, 1); // 删除超出边界的子弹
        }
    });
}

// 更新敌人
function updateEnemies() {
    enemies.forEach(enemy => enemy.update());
}

// 游戏更新
function update() {
    movePlayer();
    updateBullets();
    updateEnemies();
}

// 绘制游戏元素
function draw() {
    drawBackground(); // 绘制黑色背景
    drawPlatform();   // 绘制平台
    drawPlayer();     // 绘制玩家
    drawExpBar();     // 绘制经验条

    // 绘制子弹
    bullets.forEach(bullet => bullet.draw());

    // 绘制敌人
    enemies.forEach(enemy => enemy.draw());
}

// 游戏循环
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 初始化敌人
function initEnemies() {
    enemies.push(new Enemy(canvas.width + 200, platformY - 50)); // 生成白色敌人
}

// 事件监听
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// 开始游戏
initEnemies();
gameLoop();
