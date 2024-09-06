// 游戏设置
const player = {
    element: document.getElementById('player'),
    x: 0,
    y: 640,
    speed: 5,
    jumping: false,
    jumpHeight: 0,
    maxJumpHeight: 150,
    facingRight: true,
    health: 100,
    experience: 0,
    level: 1
};

const bullets = [];
const monsters = [];
const bulletSpeed = 10;
const gravity = 0.5;
const jumpSpeed = 10;
const monsterSpeed = 2;

// 播放背景音乐
const backgroundMusic = new Audio('assets/sheshoucun.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
backgroundMusic.play().catch(error => {
    console.error('Error playing background music:', error);
});

// 生成多个怪物
function createMonsters(count) {
    for (let i = 0; i < count; i++) {
        const monster = {
            element: document.createElement('img'),
            x: Math.random() * window.innerWidth,
            y: 640, // 固定在平台上
            width: 22,
            height: 37,
            health: 50,
            moving: true
        };
        monster.element.src = 'assets/c.png'; // 你提供的怪物图片
        monster.element.style.position = 'absolute';
        monster.element.style.width = monster.width + 'px';
        monster.element.style.height = monster.height + 'px';
        monster.element.style.left = monster.x + 'px';
        monster.element.style.top = monster.y + 'px';
        document.getElementById('gameCanvas').appendChild(monster.element);
        monsters.push(monster);
    }
}

createMonsters(15);

// 控制玩家移动
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            movePlayer(-player.speed, 0);
            break;
        case 'ArrowRight':
            movePlayer(player.speed, 0);
            break;
        case 'ArrowDown':
            crouchPlayer();
            break;
        case ' ':
            if (!player.jumping) {
                jumpPlayer();
            }
            break;
        case 'd':
            shootBullet();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown') {
        standUpPlayer();
    }
});

// 移动玩家
function movePlayer(dx, dy) {
    player.x += dx;
    player.element.style.left = player.x + 'px';
    if (dx < 0) {
        player.facingRight = false;
        player.element.style.transform = 'scaleX(-1)';
    } else if (dx > 0) {
        player.facingRight = true;
        player.element.style.transform = 'scaleX(1)';
    }
}

// 玩家跳跃
function jumpPlayer() {
    player.jumping = true;
    let jumpInterval = setInterval(() => {
        if (player.jumpHeight < player.maxJumpHeight) {
            player.y -= jumpSpeed;
            player.jumpHeight += jumpSpeed;
        } else {
            clearInterval(jumpInterval);
            let fallInterval = setInterval(() => {
                if (player.y < 640) {
                    player.y += gravity;
                } else {
                    player.y = 640;
                    player.jumping = false;
                    player.jumpHeight = 0;
                    clearInterval(fallInterval);
                }
                player.element.style.top = player.y + 'px';
            }, 20);
        }
        player.element.style.top = player.y + 'px';
    }, 20);
}

// 玩家蹲下
function crouchPlayer() {
    player.element.style.height = '50px';
}

// 玩家站立
function standUpPlayer() {
    player.element.style.height = '100px';
}

// 发射子弹
function shootBullet() {
    const bullet = {
        element: document.createElement('img'),
        x: player.x + (player.facingRight ? 100 : -30), // 根据方向调整发射位置
        y: player.y + 50, // 子弹从角色下方发射
        width: 30,
        height: 30
    };
    bullet.element.src = 'assets/b.png'; // 子弹图片
    bullet.element.style.position = 'absolute';
    bullet.element.style.width = bullet.width + 'px';
    bullet.element.style.height = bullet.height + 'px';
    bullet.element.style.left = bullet.x + 'px';
    bullet.element.style.top = bullet.y + 'px';
    document.getElementById('gameCanvas').appendChild(bullet.element);
    bullets.push(bullet);
    
    // 移动子弹
    const bulletInterval = setInterval(() => {
        bullet.x += (player.facingRight ? bulletSpeed : -bulletSpeed);
        bullet.element.style.left = bullet.x + 'px';
        
        // 检查子弹是否超出屏幕
        if (bullet.x < 0 || bullet.x > window.innerWidth) {
            clearInterval(bulletInterval);
            bullet.element.remove();
        }
        
        // 检查子弹是否碰到怪物
        monsters.forEach(monster => {
            if (bullet.x < monster.x + monster.width &&
                bullet.x + bullet.width > monster.x &&
                bullet.y < monster.y + monster.height &&
                bullet.y + bullet.height > monster.y) {
                    monster.health -= 10;
                    if (monster.health <= 0) {
                        monster.element.remove();
                        monsters.splice(monsters.indexOf(monster), 1);
                        // 更新玩家经验值
                        player.experience += 10;
                        if (player.experience >= 100) {
                            player.experience = 0;
                            player.level += 1;
                        }
                    }
                    bullet.element.remove();
                    clearInterval(bulletInterval);
            }
        });
    }, 20);
}

// 更新怪物位置和状态
function updateMonsters() {
    monsters.forEach(monster => {
        if (monster.moving) {
            monster.x -= monsterSpeed; // 每次更新怪物向左移动
            if (monster.x < 0) {
                monster.x = window.innerWidth;
            }
            monster.element.style.left = monster.x + 'px';
        }
    });
    requestAnimationFrame(updateMonsters);
}

updateMonsters();

// 游戏循环
function gameLoop() {
    // 检查玩家与怪物的碰撞
    monsters.forEach(monster => {
        if (player.x < monster.x + monster.width &&
            player.x + 100 > monster.x &&
            player.y < monster.y + monster.height &&
            player.y + 100 > monster.y) {
                player.health -= 10;
                if (player.health <= 0) {
                    alert('游戏结束');
                    player.health = 100; // 重置玩家血量
                    player.experience = 0; // 重置玩家经验
                    player.level = 1; // 重置玩家等级
                    player.x = 0; // 重置玩家位置
                    player.y = 640; // 重置玩家位置
                }
        }
    });
    requestAnimationFrame(gameLoop);
}

gameLoop();
