const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏参数
const playerWidth = 100;
const playerHeight = 100;
const bulletSize = 30;
const monsterWidth = 22;
const monsterHeight = 37;
const bigMonsterWidth = 44; // 大怪物宽度
const bigMonsterHeight = 74; // 大怪物高度
const platformY = 640; // 平台高度
const gravity = 0.5; // 重力加速度
const jumpStrength = -12; // 跳跃力量
const monsterRespawnTime = 5000; // 怪物重生时间（毫秒）
const maxMonsters = 15; // 最大怪物数量
const playerHealth = 100; // 玩家血量
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
    experience: 0,
    level: 1
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
    big: [] // 大怪物图像
};

// 背景
const background = new Image();

// 音乐
const backgroundMusic = new Audio('assets/sheshoucun.mp3'); // 确保音乐文件路径正确

// 加载所有资源
function loadImages() {
    // 玩家图片
    player.image.src = 'assets/a.png'; 

    // 子弹图片
    bulletImage.src = 'assets/b.png';

    // 背景图片
    background.src = 'assets/bp.png';

    // 加载怪物图像
    ['move_0.png', 'move_1.png', 'move_2.png'].forEach(src => {
        const img = new Image();
        img.src = 'assets/' + src;
        monsterImages.move.push(img);
    });
    ['stand_0.png', 'stand_1.png', 'stand_2.png'].forEach(src => {
        const img = new Image();
        img.src = 'assets/' + src;
        monsterImages.stand.push(img);
    });
    ['hit1_0.png'].forEach(src => {
        const img = new Image();
        img.src = 'assets/' + src;
        monsterImages.hit.push(img);
    });
    ['die1_0.png', 'die1_1.png', 'die1_2.png'].forEach(src => {
        const img = new Image();
        img.src = 'assets/' + src;
        monsterImages.die.push(img);
    });

    // 大怪物图像（使用相同的图片，但体积调整）
    ['move_0.png', 'move_1.png', 'move_2.png'].forEach(src => {
        const img = new Image();
        img.src = 'assets/' + src;
        monsterImages.big.push(img);
    });
    ['stand_0.png', 'stand_1.png', 'stand_2.png'].forEach(src => {
        const img = new Image();
        img.src = 'assets/' + src;
        monsterImages.big.push(img);
    });
    ['hit1_0.png'].forEach(src => {
        const img = new Image();
        img.src = 'assets/' + src;
        monsterImages.big.push(img);
    });
    ['die1_0.png', 'die1_1.png', 'die1_2.png'].forEach(src => {
        const img = new Image();
        img.src = 'assets/' + src;
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
    ctx.fillText(`Level: ${player.level}`, player.x, player.y - 40);
}

// 绘制怪物
function drawMonsters() {
    monsters.forEach(monster => {
        if (!monster.dead) {
            const stateImages = monster.images[monster.currentState];
            const image = stateImages[monster.frameIndex];
            ctx.drawImage(image, monster.x, monster.y, monster.width, monster.height); // 保持原始尺寸

            // 绘制怪物血量条
            ctx.fillStyle = 'red';
            ctx.fillRect(monster.x, monster.y - 10, monster.width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(monster.x, monster.y - 10, (monster.width * monster.health) / 100, 5);
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
            if (monster.x < 0 || monster.x + monster.width > canvas.width) {
                monster.vx = -monster.vx;
            }

            // 检查怪物与子弹的碰撞
            bullets.forEach(bullet => {
                if (
                    bullet.x < monster.x + monster.width &&
                    bullet.x + bulletSize > monster.x &&
                    bullet.y < monster.y + monster.height &&
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
                        player.level += 1;
                        // 处理升级逻辑，例如召唤大怪物
                        if (player.level % 5 === 0) {
                            createBigMonster();
                        }
                    }
                }
            });
        }
    });

    // 处理怪物死亡后的时间
    monsters.forEach(monster => {
        if (monster.dead && Date.now() - monster.deathTime > 1000) {
            monsters.splice(monsters.indexOf(monster), 1);
            if (monsters.length < maxMonsters) {
                createMonster();
            }
        }
    });
}

// 更新子弹位置
function updateBullets() {
    bullets.forEach(bullet => {
        bullet.y -= 10;
        if (bullet.y < 0) {
            bullets.splice(bullets.indexOf(bullet), 1);
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
        vx: Math.random() * 2 - 1, // 随机方向
        vy: 0,
        images: {
            move: monsterImages.move,
            stand: monsterImages.stand,
            hit: monsterImages.hit,
            die: monsterImages.die
        },
        currentState: 'stand',
        frameIndex: 0,
        frameDelay: 100,
        elapsedTime: 0,
        health: 100,
        dead: false,
        deathTime: 0
    };
    monsters.push(monster);
}

// 创建大怪物
function createBigMonster() {
    const bigMonster = {
        x: Math.random() * (canvas.width - bigMonsterWidth),
        y: platformY - bigMonsterHeight,
        width: bigMonsterWidth,
        height: bigMonsterHeight,
        vx: Math.random() * 2 - 1,
        vy: 0,
        images: {
            move: monsterImages.big,
            stand: monsterImages.big,
            hit: monsterImages.big,
            die: monsterImages.big
        },
        currentState: 'move',
        frameIndex: 0,
        frameDelay: 100,
        elapsedTime: 0,
        health: 500,
        dead: false,
        deathTime: 0
    };
    monsters.push(bigMonster);
}

// 初始化
function init() {
    loadImages();
    playBackgroundMusic();
    gameLoop();
}

init();
