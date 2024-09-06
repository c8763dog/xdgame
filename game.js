const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏参数
const playerWidth = 100;
const playerHeight = 100;
const bulletSize = 30;
const monsterWidth = 22;
const monsterHeight = 37;
const platformY = 640; // 平台高度
const gravity = 0.5; // 重力加速度
const jumpStrength = -12; // 跳跃力量
const monsterRespawnTime = 5000; // 怪物重生时间（毫秒）
const maxMonsters = 5; // 最大怪物数量
const playerHealth = 100; // 玩家血量
const playerExperience = 0; // 玩家经验
const experienceForLevelUp = 100; // 升级所需经验

// 玩家
const player = {
    x: 100,
    y: platformY - playerHeight,
    width: playerWidth,
    height: playerHeight,
    speed: 7, // 增加速度
    vx: 0,
    vy: 0,
    jumping: false,
    crouching: false,
    facingRight: true,
    image: new Image(),
    health: playerHealth,
    experience: playerExperience
};

// 子弹
const bullets = [];
const bulletImage = new Image();

// 怪物
const monsters = [];
const monsterImages = {
    move: [],
    stand: [],
    hit: [],
    die: []
};

// 背景
const background = new Image();

// 音乐
const backgroundMusic = document.getElementById('backgroundMusic');

// 加载所有资源
function loadImages() {
    player.image.src = '/assets/a.png'; // 玩家图片
    bulletImage.src = '/assets/b.png'; // 子弹图片
    background.src = '/assets/bp.png'; // 背景图片

    // 加载怪物图像
    ['move_0.png', 'move_1.png', 'move_2.png'].forEach(src => {
        const img = new Image();
        img.src = `/assets/${src}`;
        monsterImages.move.push(img);
    });
    ['stand_0.png', 'stand_1.png', 'stand_2.png'].forEach(src => {
        const img = new Image();
        img.src = `/assets/${src}`;
        monsterImages.stand.push(img);
    });
    ['hit1_0.png'].forEach(src => {
        const img = new Image();
        img.src = `/assets/${src}`;
        monsterImages.hit.push(img);
    });
    ['die1_0.png', 'die1_1.png', 'die1_2.png'].forEach(src => {
        const img = new Image();
        img.src = `/assets/${src}`;
        monsterImages.die.push(img);
    });
}

// 游戏循环
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayer();
    drawMonsters();
    drawBullets();
    updatePlayer();
    updateMonsters();
    updateBullets();
    requestAnimationFrame(gameLoop);
}

// 绘制背景
function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

// 绘制玩家
function drawPlayer() {
    ctx.save();
    if (!player.facingRight) {
        ctx.scale(-1, 1);
        ctx.drawImage(player.image, -player.x - player.width, player.y, player.width, player.height);
    } else {
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    }
    ctx.restore();

    // 绘制血量条
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y - 10, player.width, 10);
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y - 10, (player.width * player.health) / playerHealth, 10);

    // 绘制经验条
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y - 25, player.width, 10);
    ctx.fillStyle = 'cyan';
    ctx.fillRect(player.x, player.y - 25, (player.width * player.experience) / experienceForLevelUp, 10);
}

// 绘制怪物
function drawMonsters() {
    monsters.forEach(monster => {
        if (!monster.dead) {
            const stateImages = monster.images[monster.currentState];
            const image = stateImages[monster.frameIndex];
            ctx.drawImage(image, monster.x, monster.y, monsterWidth, monsterHeight);

            // 绘制怪物血量条
            ctx.fillStyle = 'red';
            ctx.fillRect(monster.x, monster.y - 10, monsterWidth, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(monster.x, monster.y - 10, (monsterWidth * monster.health) / 100, 5);
        }
    });
}

// 绘制子弹
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.drawImage(bulletImage, bullet.x, bullet.y, bulletSize, bulletSize);
    });
}

// 更新玩家位置
function updatePlayer() {
    player.vx *= 0.9; // 平滑的移动减速

    player.x += player.vx;
    player.y += player.vy;

    // 添加重力
    if (player.y + player.height < platformY) {
        player.vy += gravity;
    } else {
        player.y = platformY - player.height;
        player.vy = 0;
        player.jumping = false;
    }

    // 确保玩家不移出画布
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// 更新怪物
function updateMonsters() {
    monsters.forEach(monster => {
        if (!monster.dead) {
            monster.elapsedTime += 1000 / 60; // Assuming 60 FPS
            if (monster.elapsedTime > monster.frameDelay) {
                monster.elapsedTime = 0;
                monster.frameIndex = (monster.frameIndex + 1) % monster.images[monster.currentState].length;
            }

            // 让怪物在平台上移动
            monster.x += monster.vx;
            if (monster.x < 0 || monster.x + monsterWidth > canvas.width) {
                monster.vx = -monster.vx;
            }

            // 检查怪物与子弹的碰撞
            bullets.forEach(bullet => {
                if (
                    bullet.x < monster.x + monsterWidth &&
                    bullet.x + bulletSize > monster.x &&
                    bullet.y < monster.y + monsterHeight &&
                    bullet.y + bulletSize > monster.y
                ) {
                    monster.currentState = 'die';
                    monster.frameIndex = 0;
                    monster.dead = true;
                    monster.deathTime = Date.now();
                    bullets.splice(bullets.indexOf(bullet), 1); // 移除子弹
                    player.experience += 10; // 获得经验
                    if (player.experience >= experienceForLevelUp) {
                        player.experience = 0; // 升级后清空经验
                        // 处理升级逻辑
                    }
                }
            });
        }
    });

    // 重生怪物
    monsters.forEach(monster => {
        if (monster.dead && Date.now() - monster.deathTime > monsterRespawnTime) {
            monster.dead = false;
            monster.currentState = 'stand';
            monster.frameIndex = 0;
            monster.x = Math.random() * (canvas.width - monsterWidth);
            monster.y = platformY - monsterHeight;
            monster.health = 100; // 恢复怪物血量
        }
    });

    // 如果怪物数量不足，则添加新的怪物
    if (monsters.length < maxMonsters) {
        createMonster();
    }
}

// 更新子弹
function updateBullets() {
    bullets.forEach(bullet => {
        bullet.x += bullet.vx; // 根据方向移动子弹
        if (bullet.x > canvas.width || bullet.x < 0) {
            bullets.shift(); // 子弹超出屏幕时移除
        }
    });
}

// 创建怪物
function createMonster() {
    const monster = {
        x: Math.random() * (canvas.width - monsterWidth),
        y: platformY - monsterHeight,
        width: monsterWidth,
        height: monsterHeight,
        images: monsterImages,
        currentState: 'stand',
        frameIndex: 0,
        frameDelay: 500,
        elapsedTime: 0,
        dead: false,
        deathTime: 0,
        vx: Math.random() > 0.5 ? 2 : -2, // 随机初始方向
        health: 100
    };
    monsters.push(monster);
}

// 发射子弹
function shootBullet() {
    const bullet = {
        x: player.x + (player.facingRight ? player.width : -bulletSize),
        y: player.y + player.height / 2 - bulletSize / 2,
        vx: player.facingRight ? 10 : -10
    };
    bullets.push(bullet);
}

// 控制玩家移动
document.addEventListener('keydown', function (e) {
    switch (e.code) {
        case 'ArrowRight':
            player.facingRight = true;
            player.vx = player.speed;
            break;
        case 'ArrowLeft':
            player.facingRight = false;
            player.vx = -player.speed;
            break;
        case 'Space':
            if (!player.jumping) {
                player.vy = jumpStrength;
                player.jumping = true;
            }
            break;
        case 'ControlLeft':
            player.crouching = true;
            player.height = playerWidth / 2; // 蹲下时减少高度
            break;
        case 'ShiftLeft':
            shootBullet();
            break;
    }
});

// 控制玩家停止移动
document.addEventListener('keyup', function (e) {
    switch (e.code) {
        case 'ArrowRight':
        case 'ArrowLeft':
            player.vx = 0;
            break;
        case 'ControlLeft':
            player.crouching = false;
            player.height = playerWidth; // 恢复高度
            break;
    }
});

// 初始化
function init() {
    canvas.width = 1580;
    canvas.height = 877;
    loadImages();
    gameLoop();
}

init();
