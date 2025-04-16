// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

canvas.width = 800;
canvas.height = 600;

// Game state
let score = 0;
let lives = 3;
let gameRunning = true;
let lastShot = 0;
const shootDelay = 300;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    size: 40,
    speed: 7,
    color: '#3498db'
};

// Bullets
const bullets = [];

// Enemies
const enemies = [];
const enemyTypes = ['👾', '👽', '🤖', '👹', '☠️'];

// Stars
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 3 + 1
    });
}

// Controls
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code in keys) keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
    if (e.code in keys) keys[e.code] = false;
});

// Game loop
function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    update(timestamp);
    render();
    requestAnimationFrame(gameLoop);
}

function update(timestamp) {
    // Player movement
    if (keys.ArrowLeft) player.x = Math.max(player.size/2, player.x - player.speed);
    if (keys.ArrowRight) player.x = Math.min(canvas.width - player.size/2, player.x + player.speed);
    
    // Shooting
    if (keys.Space && timestamp - lastShot > shootDelay) {
        shoot();
        lastShot = timestamp;
    }
    
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        
        // Remove off-screen bullets
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check collisions with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                // Increase score based on enemy type
                score += enemies[j].type === '👾' ? 10 : 
                         enemies[j].type === '👽' ? 15 : 
                         enemies[j].type === '🤖' ? 20 : 25;
                scoreElement.textContent = `Score: ${score}`;
                
                // Remove enemy and bullet
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        
        // Remove off-screen enemies
        if (enemies[i].y > canvas.height + 50) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (checkCollision(enemies[i], player)) {
            lives--;
            livesElement.textContent = `Lives: ${'💖'.repeat(lives)}`;
            enemies.splice(i, 1);
            
            if (lives <= 0) {
                gameOver();
            }
        }
    }
    
    // Spawn new enemies
    if (Math.random() < 0.02) {
        spawnEnemy();
    }
    
    // Update stars
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

function render() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw player (as a ship)
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.size/2);
    ctx.lineTo(player.x - player.size/2, player.y + player.size/2);
    ctx.lineTo(player.x + player.size/2, player.y + player.size/2);
    ctx.closePath();
    ctx.fill();
    
    // Draw bullets
    ctx.fillStyle = '#f1c40f';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 15);
    });
    
    // Draw enemies (as emojis)
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    enemies.forEach(enemy => {
        ctx.fillText(enemy.type, enemy.x, enemy.y);
    });
}

function shoot() {
    bullets.push({
        x: player.x,
        y: player.y - player.size/2,
        speed: 10,
        width: 4,
        height: 15
    });
}

function spawnEnemy() {
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    enemies.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -40,
        type: type,
        size: 30,
        speed: 2 + Math.random() * 3
    });
}

function checkCollision(obj1, obj2) {
    // Simple distance-based collision
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size || obj1.width) / 2 + (obj2.size || obj2.width) / 2;
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function restartGame() {
    // Reset game state
    score = 0;
    lives = 3;
    gameRunning = true;
    
    // Clear arrays
    bullets.length = 0;
    enemies.length = 0;
    
    // Reset HUD
    scoreElement.textContent = `Score: ${score}`;
    livesElement.textContent = `Lives: ${'💖'.repeat(lives)}`;
    gameOverScreen.classList.add('hidden');
    
    // Reset player position
    player.x = canvas.width / 2;
    player.y = canvas.height - 60;
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Start game
requestAnimationFrame(gameLoop);