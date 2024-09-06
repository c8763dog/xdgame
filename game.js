const player = document.getElementById('player');
const container = document.querySelector('.game-container');
const bulletSize = 30;
const playerSize = 100;
const monsterSize = 50;
const bigMonsterScale = 2;
const platformY = container.clientHeight - playerSize;

const playerSpeed = 10;
const bulletSpeed = 10;
const monsterSpeed = 2;

let playerX = 100;
let playerY = platformY;
let bullets = [];
let monsters = [];
let monsterImages = {
    move: [],
    stand: [],
    hit: [],
    die: []
};

// Load monster images
function loadMonsterImages() {
    const imageSources = {
        move: ['assets/move_0.png', 'assets/move_1.png', 'assets/move_2.png'],
        stand: ['assets/stand_0.png', 'assets/stand_1.png', 'assets/stand_2.png'],
        hit: ['assets/hit1_0.png'],
        die: ['assets/die1_0.png', 'assets/die1_1.png', 'assets/die1_2.png']
    };

    Object.keys(imageSources).forEach(state => {
        imageSources[state].forEach(src => {
            const img = new Image();
            img.src = src;
            monsterImages[state].push(img);
        });
    });
}

// Create and display monsters
function createMonster() {
    const monster = document.createElement('div');
    monster.className = 'monster';
    monster.style.backgroundImage = `url('assets/move_0.png')`; // Example of setting initial state
    monster.style.left = `${Math.random() * (container.clientWidth - monsterSize)}px`;
    monster.style.top = `${platformY - monsterSize}px`;
    container.appendChild(monster);
    monsters.push(monster);
}

// Update player position
function updatePlayerPosition() {
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}

// Update bullets
function updateBullets() {
    bullets.forEach(bullet => {
        let bulletX = parseFloat(bullet.style.left);
        bulletX += bulletSpeed;
        bullet.style.left = `${bulletX}px`;

        if (bulletX > container.clientWidth) {
            container.removeChild(bullet);
            bullets = bullets.filter(b => b !== bullet);
        }
    });
}

// Move monsters
function updateMonsters() {
    monsters.forEach(monster => {
        let monsterX = parseFloat(monster.style.left);
        monsterX += monsterSpeed;
        monster.style.left = `${monsterX}px`;

        if (monsterX < 0 || monsterX + monsterSize > container.clientWidth) {
            monsterSpeed = -monsterSpeed; // Bounce back
        }
    });
}

// Shoot a bullet
function shootBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${playerX + playerSize}px`;
    bullet.style.top = `${playerY + playerSize / 2 - bulletSize / 2}px`;
    container.appendChild(bullet);
    bullets.push(bullet);
}

// Key press handling
function handleKeyPress(event) {
    switch (event.code) {
        case 'ArrowRight':
            playerX += playerSpeed;
            break;
        case 'ArrowLeft':
            playerX -= playerSpeed;
            break;
        case 'Space':
            shootBullet();
            break;
    }

    if (playerX < 0) playerX = 0;
    if (playerX > container.clientWidth - playerSize) playerX = container.clientWidth - playerSize;

    updatePlayerPosition();
}

document.addEventListener('keydown', handleKeyPress);

function gameLoop() {
    updateBullets();
    updateMonsters();
    requestAnimationFrame(gameLoop);
}

loadMonsterImages();
createMonster();
gameLoop();
