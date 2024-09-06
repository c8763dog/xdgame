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
};

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

// 处理按键按下
function keyDown(e) {
    if (e.key === 'a' || e.key === 'A') {
        player.dx = -player.speed;  // 左移
    } else if (e.key === 'd' || e.key === 'D') {
        player.dx = player.speed;  // 右移
    } else if (e.key === 'w' || e.key === 'W' || e.key === ' ') {
        jump();  // 跳跃
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

// 游戏更新
function update() {
    movePlayer();
}

// 绘制游戏元素
function draw() {
    drawBackground(); // 绘制黑色背景
    drawPlatform();   // 绘制平台
    drawPlayer();     // 绘制玩家
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

// 开始游戏
gameLoop();
