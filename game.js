const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏参数
const playerWidth = 100;
const playerHeight = 100;
const bulletSize = 30;
const monsterWidth = 22;
const monsterHeight = 37;
const bigMonsterWidth = 44; // 大怪物的宽度
const bigMonsterHeight = 74; // 大怪物的高度
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
    die: [],
    big: [] // 大怪物的图像
};

// 背景
const background = new Image();

// 音乐
const backgroundMusic = new Audio('assets/sheshoucun.mp3'); // 确保音乐文件路径正确

// 加载所有资源
function loadImages() {
    player.image.src = 'assets/a.png'; // 玩家图片
    bulletImage.src = 'assets/b.png'; // 子弹图片
    background.src = 'assets/bp.png'; // 背景图片

    // 加载怪物图像
    ['move_0.png', 'move_1.png', 'move_2.png'].forEach(src => {
        const img = new Image();
        img.src = `assets/${src}`;
        monsterImages.move.push(img);
    });
    ['stand_0.png', 'stand_1.png', 'stand_2.png'].forEach(src => {
        const img = new Image();
        img.src = `assets/${src}`;
        monsterImages.stand.push(img);
    });
    ['hit1_0.png'].forEach(src => {
        const img = new Image();
        img.src = `assets/${src}`;
        monsterImages.hit.push(img);
    });
    ['die1_0.png', 'die1_1.png', 'die1_2.png'].forEach(src => {
        const img = new Image();
        img.src = `assets/${src}`;
        monsterImages.die.push(img);
    });
    // 加载大怪物图像（使用同样的图像，只是放大）
    ['move_0.png', 'move_1.png', 'move_2.png'].forEach(src => {
        const img = new Image();
        img.src = `assets/${src}`;
        monsterImages.big.push(img);
    });
    ['stand_0.png', 'stand_1.png', 'stand_2.png'].forEach(src => {
        const img = new Image();
        img.src = `assets/${src}`;
        monsterImages.big.push(img);
    });
    ['hit1_0.png'].forEach(src => {
        const img = new Image();
        img.src = `assets/${src}`;
        monsterImages.big.push(img);
    });
    ['die1_0.png', 'die1_1.png', 'die1_2.png'].forEach(src => {
        const img = new Image();
        img.src = `assets/${src}`;
        monsterImages.big.push(img);
    });
}

// 播放背景音乐
function playBackgroundMusic() {
    backgroundMusic.loop = true; // 循环播放
    backgroundMusic.volume = 0.5; // 设置音量
    backgroundMusic.play().catch(error => {
        console.error('Error playing background music:', error);
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
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y - 25, player.width, 10);
    ctx.fillStyle = 'yellow';
    ctx.fillRect(player.x, player.y - 25, (player.width * player.experience) / experienceForLevelUp, 10);

    // 绘制等级数字
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Level: ${Math.floor(player.experience / experienceForLevelUp) + 1}`, player.x, player.y - 40);
}

// 绘制怪物
function drawMonsters() {
    monsters.forEach(monster => {
        if (!monster.dead) {
            const stateImages = monster.images[monster.currentState];
            const image = stateImages[monster.frameIndex];
            const width = monster.isBig ? bigMonsterWidth : monsterWidth;
            const height = monster.isBig ? bigMonsterHeight : monsterHeight;
            ctx.drawImage(image, monster.x, monster.y, width, height); // 保持原始尺寸

            // 绘制怪物血量条
            ctx.fillStyle = 'red';
            ctx.fillRect(monster.x, monster.y - 10, width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(monster.x, monster.y - 10, (width * monster.health) / 100, 5);
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
            if (monster.x < 0 || monster.x + (monster.isBig ? bigMonsterWidth : monsterWidth) > canvas.width) {
                monster.vx = -monster.vx;
            }

            // 检查怪物与子弹的碰撞
            bullets.forEach(bullet => {
                if (
                    bullet.x < monster.x + (monster.isBig ? bigMonsterWidth : monsterWidth) &&
                    bullet.x + bulletSize > monster.x &&
                    bullet.y < monster.y + (monster.isBig ? bigMonsterHeight : monsterHeight) &&
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
                        // 触发升级事件（例如，显示升级效果）
                    }
                }
            });

            // 检查怪物与玩家的碰撞
            if (
                player.x < monster.x + (monster.isBig ? bigMonsterWidth : monsterWidth) &&
                player.x + player.width > monster.x &&
                player.y < monster.y + (monster.isBig ? bigMonsterHeight : monsterHeight) &&
                player.y + player.height > monster.y
            ) {
                player.health -= 1; // 玩家受伤
                if (player.health <= 0) {
                    // 处理玩家死亡
                }
            }

            // 处理怪物死亡后的行为
            if (monster.dead && Date.now() - monster.deathTime > 1000) {
                monsters.splice(monsters.indexOf(monster), 1);
            }
        }
    });
}

// 更新子弹位置
function updateBullets() {
    bullets.forEach(bullet => {
        bullet.y -= 10; // 子弹向上移动
        if (bullet.y < 0) {
            bullets.splice(bullets.indexOf(bullet), 1); // 移除超出画布的子弹
        }
    });
}

// 生成怪物
function spawnMonster(isBig = false) {
    const monster = {
        x: Math.random() * (canvas.width - monsterWidth),
        y: platformY - (isBig ? bigMonsterHeight : monsterHeight),
        width: isBig ? bigMonsterWidth : monsterWidth,
        height: isBig ? bigMonsterHeight : monsterHeight,
        vx: Math.random() * 2 + 1, // 随机速度
        vy: 0,
        isBig: isBig,
        images: monsterImages,
        currentState: 'move',
        frameIndex: 0,
        frameDelay: 100, // 帧延迟（毫秒）
        elapsedTime: 0,
        health: 100,
        dead: false,
        deathTime: 0
    };
    monsters.push(monster);
}

// 初始设置
function initialize() {
    canvas.width = 800;
    canvas.height = 600;
    loadImages();
    playBackgroundMusic();
    setInterval(() => spawnMonster(false), monsterRespawnTime);
    setInterval(() => spawnMonster(true), monsterRespawnTime * 2); // 每两倍时间生成大怪物
    gameLoop();
}

// 开始游戏
initialize();
