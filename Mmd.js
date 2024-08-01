const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const pacMan = {
    x: 50,
    y: 50,
    size: 20,
    speed: 2,
    direction: 'right',
};

const foods = [];
const initialFoodCount = 20;
let currentLevel = 1;
let score = 0;

const ghosts = [
    { x: 100, y: 100, size: 20, speed: 1, direction: 'down' },
    { x: 300, y: 300, size: 20, speed: 1, direction: 'up' }
];

const walls = [
    { x: 150, y: 0, width: 10, height: 400 },
    { x: 250, y: 200, width: 10, height: 400 }
];

// صداها
const eatSound = new Audio('eat.mp3');
const winSound = new Audio('win.mp3');
const gameOverSound = new Audio('gameover.mp3');

// تنظیم اندازه کانواس برای موبایل
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

function createFoods() {
    for (let i = 0; i < initialFoodCount; i++) {
        foods.push({
            x: Math.floor(Math.random() * (canvas.width - 20)) + 10,
            y: Math.floor(Math.random() * (canvas.height - 20)) + 10,
            size: 5
        });
    }
}

function increaseDifficulty() {
    currentLevel++;
    pacMan.speed += 0.5;
    ghosts.forEach(ghost => {
        ghost.speed += 0.5;
    });
    walls.push(
        { x: Math.floor(Math.random() * canvas.width), y: Math.floor(Math.random() * canvas.height), width: 10, height: 100 },
        { x: Math.floor(Math.random() * canvas.width), y: Math.floor(Math.random() * canvas.height), width: 10, height: 100 }
    );
}

function nextLevel() {
    if (foods.length === 0) {
        winSound.play();
        document.getElementById('message').innerText = `تبریک! به مرحله ${currentLevel + 1} رسیدید.`;
        setTimeout(() => {
            document.getElementById('message').innerText = '';
            increaseDifficulty();
            createFoods();
            drawScore();
        }, 2000);
    }
}

document.addEventListener('keydown', changeDirection);
document.addEventListener('touchstart', handleTouch);

function handleTouch(event) {
    const touch = event.touches[0];
    const x = touch.clientX / canvas.width;
    const y = touch.clientY / canvas.height;

    if (x < 0.5 && y < 0.5) pacMan.direction = 'up';
    else if (x < 0.5 && y >= 0.5) pacMan.direction = 'down';
    else if (x >= 0.5 && y < 0.5) pacMan.direction = 'left';
    else if (x >= 0.5 && y >= 0.5) pacMan.direction = 'right';
}

function changeDirection(event) {
    switch(event.key) {
        case 'ArrowUp':
            pacMan.direction = 'up';
            break;
        case 'ArrowDown':
            pacMan.direction = 'down';
            break;
        case 'ArrowLeft':
            pacMan.direction = 'left';
            break;
        case 'ArrowRight':
            pacMan.direction = 'right';
            break;
    }
}

function movePacMan() {
    let newX = pacMan.x;
    let newY = pacMan.y;

    switch(pacMan.direction) {
        case 'up':
            newY -= pacMan.speed;
            break;
        case 'down':
            newY += pacMan.speed;
            break;
        case 'left':
            newX -= pacMan.speed;
            break;
        case 'right':
            newX += pacMan.speed;
            break;
    }

    if (!checkWallCollision(newX, newY)) {
        pacMan.x = newX;
        pacMan.y = newY;
    }

    // برخورد با دیوارها
    if (pacMan.x < 0) pacMan.x = canvas.width;
    if (pacMan.x > canvas.width) pacMan.x = 0;
    if (pacMan.y < 0) pacMan.y = canvas.height;
    if (pacMan.y > canvas.height) pacMan.y = 0;
}

function drawPacMan() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(pacMan.x, pacMan.y, pacMan.size, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(pacMan.x, pacMan.y);
    ctx.closePath();
    ctx.fill();
}

function drawFood() {
    ctx.fillStyle = 'red';
    foods.forEach(food => {
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function checkCollision() {
    foods.forEach((food, index) => {
        const distance = Math.hypot(pacMan.x - food.x, pacMan.y - food.y);
        if (distance < pacMan.size + food.size) {
            foods.splice(index, 1);
            eatSound.play();  // پخش صدای خوردن
            score += 10;
            document.getElementById('score').innerText = `امتیاز: ${score}`;
            nextLevel();
        }
    });
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        switch(ghost.direction) {
            case 'up':
                ghost.y -= ghost.speed;
                if (ghost.y < 0) ghost.direction = 'down';
                break;
            case 'down':
                ghost.y += ghost.speed;
                if (ghost.y > canvas.height) ghost.direction = 'up';
                break;
            case 'left':
                ghost.x -= ghost.speed;
                if (ghost.x < 0) ghost.direction = 'right';
                break;
            case 'right':
                ghost.x += ghost.speed;
                if (ghost.x > canvas.width) ghost.direction = 'left';
                break;
        }
    });
}

function drawGhosts() {
    ctx.fillStyle = 'blue';
    ghosts.forEach(ghost => {
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, ghost.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function checkGhostCollision() {
    ghosts.forEach(ghost => {
        const distance = Math.hypot(pacMan.x - ghost.x, pacMan.y - ghost.y);
        if (distance < pacMan.size + ghost.size) {
            gameOverSound.play();  // پخش صدای شکست
            document.getElementById('message').innerText = 'بازی تمام شد! پک‌من خورده شد!';
            setTimeout(() => {
                document.location.reload();
            }, 2000);
        }
    });
}

function drawWalls() {
    ctx.fillStyle = 'gray';
    walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

function checkWallCollision(x, y) {
    return walls.some(wall => {
        return (
            x > wall.x &&
            x < wall.x + wall.width &&
            y > wall.y &&
            y < wall.y + wall.height
        );
    });
}

function drawLevel() {
    document.getElementById('level').innerText = `مرحله: ${currentLevel}`;
}

function drawScore() {
    document.getElementById('score').innerText = `امتیاز: ${score}`;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePacMan();
    drawPacMan();
    drawFood();
    checkCollision();
    moveGhosts();
    drawGhosts();
    checkGhostCollision();
    drawWalls();
    drawLevel();
    requestAnimationFrame(gameLoop);
}

createFoods();
gameLoop();
