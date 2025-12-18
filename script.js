// ==========================================================
// 1. تعريف العناصر والثوابت
// ==========================================================
const gameContainer = document.querySelector('.game-container');
const bird = document.getElementById('bird');
const startScreen = document.getElementById('startScreen');
const scoreDisplay = document.getElementById('scoreDisplay'); 
const cloudsContainer = document.querySelector('.clouds-container'); 
const timerDisplay = document.getElementById('timerDisplay'); 

// عناصر الواجهة الاحترافية
const initialInstructions = document.getElementById('initialInstructions');
const gameOverStats = document.getElementById('gameOverStats');
const finalScore = document.getElementById('finalScore');
const finalTime = document.getElementById('finalTime');
const heroBird = document.getElementById('heroBird'); 
const mainTitle = document.getElementById('mainTitle'); 

// --- نظام الأصوات ---
const jumpSound = new Audio('jump.mp3');
const hitSound = new Audio('hit.mp3');
const scoreSound = new Audio('score.mp3');
const backgroundMusic = new Audio('background.mp3');
backgroundMusic.loop = true; 
backgroundMusic.volume = 0.4; // مستوى صوت هادئ للموسيقى

const birdImages = ["bird_up.png", "bird_down.png"]; 
let birdImageIndex = 0; 
let animationTimerId; 

const containerHeight = 700; 
const containerWidth = 500;
const birdDiameter = 40;     
let birdBottom = containerHeight / 2; 
const birdLeft = 50; 

let gravity = 2.5;      
let jumpStrength = 45;  
let pipeGap = 200;      
let pipeSpeed = 4;      
let spawnInterval = 3000; 
const pipeWidth = 60;   
let currentPipeClass = 'level-1'; 

let isGameOver = false;
let isGameStarted = false;
let gameTimerId; 
let score = 0;
let deathFallTimer; 
let pipeSpawnTimer; 

let startTime;
let timerInterval;
let highScore = localStorage.getItem('flappyHighScore') || 0;

// ==========================================================
// 2. منطق التحكم والوقت
// ==========================================================
function updateTimer() {
    let now = Date.now();
    let diff = now - startTime;
    let mins = Math.floor(diff / 60000);
    let secs = Math.floor((diff % 60000) / 1000);
    timerDisplay.innerText = (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs);
}

function handleAction() {
    if (isGameOver && birdBottom > -birdDiameter) return;
    if (!isGameStarted) {
        resetGame(); 
        backgroundMusic.play().catch(() => {}); // بدء الموسيقى عند أول تفاعل
    } else {
        jump();
    }
}

function resetGame() {
    isGameOver = false;
    isGameStarted = true;
    score = 0;
    birdBottom = containerHeight / 2;
    pipeSpeed = 4;
    spawnInterval = 3000;
    
    startScreen.style.display = 'none';
    startScreen.style.pointerEvents = 'none';
    mainTitle.style.display = 'block'; 
    heroBird.src = "bird_up.png"; 
    heroBird.style.transform = "scale(1)"; 

    scoreDisplay.innerText = score;
    timerDisplay.innerText = "00:00"; 
    
    // إخفاء العصفور الصغير من الخلفية وإظهاره للعب
    bird.style.display = 'block'; 
    bird.src = birdImages[0];
    bird.style.opacity = "1"; 
    bird.style.zIndex = "10"; 
    bird.style.transform = `rotate(0deg)`;
    bird.style.left = birdLeft + 'px';

    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000); 

    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
    clearTimeout(pipeSpawnTimer);
    clearInterval(gameTimerId);
    clearInterval(animationTimerId);
    
    animationTimerId = setInterval(animateBird, 100); 
    startGameLoop(); 
    setTimeout(createPipes, 100); 
}

function jump() {
    if (birdBottom < containerHeight - birdDiameter - 10) {
        birdBottom += jumpStrength; 
        jumpSound.currentTime = 0; // تصفير الوقت للقفز السريع
        jumpSound.play();
    }
}

// ==========================================================
// 3. الأنابيب والتصادم (الحاجز الصلب)
// ==========================================================
function createPipes() {
    if (isGameOver || !isGameStarted) return; 

    let bottomPipeHeight = Math.floor(Math.random() * (containerHeight - pipeGap - 200) + 100); 
    let topPipeHeight = containerHeight - bottomPipeHeight - pipeGap; 
    let pipeRight = -pipeWidth; 

    const topPipe = document.createElement('div');
    const bottomPipe = document.createElement('div');
    topPipe.classList.add('pipe', 'top-pipe', currentPipeClass);
    bottomPipe.classList.add('pipe', 'bottom-pipe', currentPipeClass);
    topPipe.style.height = topPipeHeight + 'px';
    bottomPipe.style.height = bottomPipeHeight + 'px';
    topPipe.style.top = 0; 
    bottomPipe.style.bottom = 0;
    topPipe.style.right = pipeRight + 'px'; 
    bottomPipe.style.right = pipeRight + 'px'; 
    gameContainer.appendChild(topPipe);
    gameContainer.appendChild(bottomPipe);

    let hasScored = false; 

    function movePipe() {
        if (isGameStarted && !isGameOver) {
            pipeRight += pipeSpeed; 
            topPipe.style.right = pipeRight + 'px'; 
            bottomPipe.style.right = pipeRight + 'px'; 
            const pipeLeft = containerWidth - pipeRight - pipeWidth; 

            if (pipeLeft < birdLeft && !hasScored) {
                score++;
                scoreDisplay.innerText = score;
                hasScored = true;
                scoreSound.play(); // صوت النقطة

                if (score % 10 === 0 && score <= 50) {
                    pipeSpeed += 0.3; 
                    if (spawnInterval > 1500) spawnInterval -= 250; 
                }
            }

            if (pipeRight >= containerWidth + pipeWidth) { 
                clearInterval(pipeTimerId);
                topPipe.remove();
                bottomPipe.remove();
                return;
            }

            // التصادم الدقيق
            const birdRect = bird.getBoundingClientRect();
            const topPipeRect = topPipe.getBoundingClientRect();
            const bottomPipeRect = bottomPipe.getBoundingClientRect();

            if (
                birdRect.right > topPipeRect.left + 5 && 
                birdRect.left < topPipeRect.right - 5 && 
                (birdRect.top < topPipeRect.bottom - 2 || birdRect.bottom > bottomPipeRect.top + 2)
            ) {
                clearInterval(pipeTimerId); // إيقاف الأنبوب ليعمل كحاجز
                gameOver();
            }
        } else {
            clearInterval(pipeTimerId);
        }
    }
    let pipeTimerId = setInterval(movePipe, 20); 
    pipeSpawnTimer = setTimeout(createPipes, spawnInterval); 
}

// ==========================================================
// 4. النهاية والنتائج
// ==========================================================
function gameOver() {
    if (isGameOver) return;
    isGameOver = true;
    isGameStarted = false;

    hitSound.play(); // صوت الارتطام
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    clearInterval(timerInterval); 
    clearInterval(gameTimerId); 
    clearInterval(animationTimerId); 
    clearTimeout(pipeSpawnTimer);

    // تثبيت العصفور أفقياً
    bird.style.left = bird.offsetLeft + 'px';

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
    }

    bird.src = "bird_dead.png"; 
    bird.style.transform = `rotate(90deg)`; 

    mainTitle.style.display = 'none'; 
    heroBird.src = "bird_dead.png"; 
    heroBird.style.transform = "scale(1.5) rotate(90deg)"; 

    initialInstructions.style.display = 'none';
    gameOverStats.style.display = 'block';
    finalScore.innerText = score;
    finalTime.innerText = timerDisplay.innerText;
    
    deathFall(); 
}

function deathFall() {
    clearInterval(deathFallTimer);
    deathFallTimer = setInterval(() => {
        birdBottom -= gravity * 4; 
        bird.style.bottom = birdBottom + 'px';
        if (birdBottom <= -birdDiameter) {
            clearInterval(deathFallTimer);
            startScreen.style.display = 'flex'; 
            startScreen.style.pointerEvents = 'all';
            bird.style.display = 'none'; 
        }
    }, 20);
}

function animateBird() {
    birdImageIndex = (birdImageIndex + 1) % birdImages.length; 
    bird.src = birdImages[birdImageIndex];
}

function drawBird() {
    bird.style.bottom = birdBottom + 'px';
    if (!isGameOver) {
        const rotationAngle = (birdBottom - containerHeight / 2) / 4; 
        bird.style.transform = `rotate(${rotationAngle}deg)`;
    }
}

function createCloud() {
    if (document.querySelectorAll('.cloud').length >= 4) return;
    const cloud = document.createElement('img');
    const cloudImages = ["cloud1.png", "cloud2.png", "cloud3.png", "cloud4.png"];
    cloud.src = cloudImages[Math.floor(Math.random() * cloudImages.length)];
    cloud.classList.add('cloud');
    let cloudRight = -250; 
    cloud.style.bottom = Math.floor(Math.random() * 200 + 400) + 'px';
    cloud.style.right = cloudRight + 'px';
    cloudsContainer.appendChild(cloud);
    let cloudTimer = setInterval(() => {
        cloudRight += 0.6;
        cloud.style.right = cloudRight + 'px';
        if (cloudRight > containerWidth + 300) {
            clearInterval(cloudTimer);
            cloud.remove();
        }
    }, 20);
}
setInterval(createCloud, 10000);

// تشغيل أولي (إخفاء العصفور الصغير)
drawBird();
bird.style.display = 'none';
