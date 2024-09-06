const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 玩家对象
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    vx: 0,
    vy: 0,
    jumping: false,
    image: new Image(),
};

// 子弹对象
const bullets = [];
const bulletSpeed = 7;
const bulletImage = new Image();

// 怪物对象
const monsters = [];
const monsterSpeed = 1;
const monsterImages = {
    move: [],
    stand: [],
    hit: [],
    die: [],
    big: []
};

// 背景音乐
const backgroundMusic = new Audio('assets/sheshoucun.mp3');

// 加载所有资源
function loadImages() {
    player.image.src = 'assets/a.png'; // 玩家图片
    bulletImage.src = 'assets/b.png'; // 子弹图片
    const background = new Image();
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

// 发射子弹
function shootBullet() {
    if (bullets.length < 10) { // 限制最多同时存在的子弹数量
        bullets.push({
            x: player.x + player.width / 2 - 5,
            y: player.y,
            width: 10,
            height: 10,
            vx: 0,
            vy: -bulletSpeed
        });
    }
}

// 更新子弹位置
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y += bullet.vy;

        // 如果子弹离开画布，则移除它
        if (bullet.y + bullet.height < 0) {
            bullets.splice(i, 1);
        }
    }
}

// 绘制子弹
function drawBullets() {
    for (const bullet of bullets) {
        ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// 生成怪物
function spawnMonster(isBig) {
    const monster = {
        x: Math.random() * (canvas.width - 100),
        y: -100,
        width: isBig ? 200 : 100,
        height: isBig ? 200 : 100,
        vy: monsterSpeed,
        image: isBig ? monsterImages.big[0] : monsterImages.move[0]
    };
    monsters.push(monster);
}

// 更新怪物位置
function updateMonsters() {
    for (let i = monsters.length - 1; i >= 0; i--) {
        const monster = monsters[i];
        monster.y += monster.vy;

        // 如果怪物离开画布，则移除它
        if (monster.y > canvas.height) {
            monsters.splice(i, 1);
        }
    }
}

// 绘制怪物
function drawMonsters() {
    for (const monster of monsters) {
        ctx.drawImage(monster.image, monster.x, monster.y, monster.width, monster.height);
    }
}

// 更新玩家位置
function updatePlayer() {
    player.x += player.vx;
    player.y += player.vy;

    // 碰撞检测和平台检测
    if (player.y + player.height > canvas.height - 50) { // 假设平台在底部
        player.y = canvas.height - player.height - 50;
        player.vy = 0;
        player.jumping = false;
    } else {
        player.vy += 0.5; // 重力加速度
    }

    // 防止玩家移出画布
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// 绘制玩家
function drawPlayer() {
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
}

// 处理键盘输入
function handleKeyDown(event) {
    switch (event.code) {
        case 'ArrowLeft':
            player.vx = -player.speed;
            break;
        case 'ArrowRight':
            player.vx = player.speed;
            break;
        case 'Space':
            if (!player.jumping) {
                player.vy = -10; // 跳跃速度
                player.jumping = true;
            }
            break;
        case 'KeyZ':
            shootBullet(); // 按 Z 键发射子弹
            break;
    }
}

function handleKeyUp(event) {
    switch (event.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
            player.vx = 0;
            break;
    }
}

// 游戏循环
function gameLoop() {
    updatePlayer();
    updateBullets();
    updateMonsters();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawMonsters();
    requestAnimationFrame(gameLoop);
}

// 初始化游戏
function initialize() {
    loadImages();
    playBackgroundMusic();
    setInterval(() => spawnMonster(false), 5000); // 每5秒生成普通怪物
    setInterval(() => spawnMonster(true), 10000); // 每10秒生成大怪物
    gameLoop();
}

// 播放背景音乐
function playBackgroundMusic() {
    backgroundMusic.loop = true;
    backgroundMusic.play();
}

// 事件监听
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

initialize();
