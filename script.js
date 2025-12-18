// ==========================================================
// 1. تعريف العناصر والثوابت
// ==========================================================

const gameContainer = document.querySelector('.game-container');
const bird = document.getElementById('bird');
const startScreen = document.getElementById('startScreen');
const scoreDisplay = document.getElementById('scoreDisplay'); 
const cloudsContainer = document.querySelector('.clouds-container'); 
const timerDisplay = document.getElementById('timerDisplay'); 

// عناصر الواجهة الاحترافية المطورة
const initialInstructions = document.getElementById('initialInstructions');
const gameOverStats = document.getElementById('gameOverStats');
const finalScore = document.getElementById('finalScore');
const finalTime = document.getElementById('finalTime');
const heroBird = document.getElementById('heroBird'); 
const mainTitle = document.getElementById('mainTitle'); 

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

// متغيرات الوقت والسكور العالي
let startTime;
let timerInterval;
let highScore = localStorage.getItem('flappyHighScore') || 0;

// ==========================================================
// 2. منطق التحكم وعداد الوقت
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
    currentPipeClass = 'level-1';
    
    startScreen.style.display = 'none';
    startScreen.style.pointerEvents = 'none';
    mainTitle.style.display = 'block'; 
    heroBird.src = "bird_up.png"; 
    heroBird.style.transform = "scale(1)"; 

    scoreDisplay.innerText = score;
    timerDisplay.innerText = "00:00"; 
    
    bird.style.display = 'block'; 
    bird.src = birdImages[0];
    bird.style.opacity = "1"; 
    bird.style.zIndex = "10"; 
    bird.style.transform = `rotate(0deg)`;

    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000); 

    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
    clearTimeout(pipeSpawnTimer);
    clearInterval(gameTimerId);
    clearInterval(animationTimerId);
    
    animationTimerId = setInterval(animateBird, 100); 
    startGameLoop(); 
    // تأخير بسيط لضمان استقرار الأبعاد على الموبايل قبل بدء صنع الأنابيب
    setTimeout(createPipes, 100); 
}

document.addEventListener('keydown', (e) => {
    if (e.code === "Space") handleAction();
});

gameContainer.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    handleAction();
}, { passive: false });

function animateBird() {
    birdImageIndex = (birdImageIndex + 1) % birdImages.length; 
    bird.src = birdImages[birdImageIndex];
}

function drawBird() {
    bird.style.bottom = birdBottom + 'px';
    bird.style.left = birdLeft + 'px';
    if (!isGameOver) {
        const rotationAngle = (birdBottom - containerHeight / 2) / 4; 
        bird.style.transform = `rotate(${rotationAngle}deg)`;
    }
}

function startGameLoop() {
    gameTimerId = setInterval(() => {
        if (isGameStarted && !isGameOver) { 
            birdBottom -= gravity; 
            drawBird();
            if (birdBottom <= 0) gameOver("سقطت!");
            if (birdBottom >= containerHeight - birdDiameter) gameOver("اصطدمت بالسقف!");
        }
    }, 20); 
}

function jump() {
    if (birdBottom < containerHeight - birdDiameter - 10) {
        birdBottom += jumpStrength; 
    }
}

// ==========================================================
// 3. منطق الأنابيب والتصادم الدقيق (المحسن للموبايل)
// ==========================================================

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function createPipes() {
    if (isGameOver || !isGameStarted) return; 

    let bottomPipeHeight = randomNumber(100, containerHeight - pipeGap - 100); 
    let topPipeHeight = containerHeight - bottomPipeHeight - pipeGap; 
    let pipeRight = -pipeWidth; 

    const topPipe = document.createElement('div');
    const bottomPipe = document.createElement('div');

    topPipe.classList.add('pipe', 'top-pipe', currentPipeClass);
    bottomPipe.classList.add('pipe', 'bottom-pipe', currentPipeClass);
    
    topPipe.style.height = topPipeHeight + 'px';
    bottomPipe.style.height = bottomPipeHeight + 'px';
    bottomPipe.style.bottom = (containerHeight - topPipeHeight) + 'px'; // تعديل لضمان الالتصاق بالسقف
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

            // حساب النقاط
            if (pipeLeft < birdLeft && !hasScored) {
                score++;
                scoreDisplay.innerText = score;
                hasScored = true;

                if (score % 10 === 0 && score <= 50) {
                    pipeSpeed += 0.3; 
                    if (spawnInterval > 1500) spawnInterval -= 250; 
                    let level = score / 10;
                    currentPipeClass = `level-${level + 1}`;
                }
            }

            if (pipeRight >= containerWidth + pipeWidth) { 
                clearInterval(pipeTimerId);
                topPipe.remove();
                bottomPipe.remove();
                return;
            }

            // الكشف الدقيق عن التصادم باستخدامgetBoundingClientRect (حل مشكلة الموبايل)
            const birdRect = bird.getBoundingClientRect();
            const topPipeRect = topPipe.getBoundingClientRect();
            const bottomPipeRect = bottomPipe.getBoundingClientRect();

            if (
                birdRect.right > topPipeRect.left + 8 && 
                birdRect.left < topPipeRect.right - 8 && 
                (birdRect.top < topPipeRect.bottom - 5 || birdRect.bottom > bottomPipeRect.top + 5)
            ) {
                gameOver("اصطدمت!");
            }
        } else {
            clearInterval(pipeTimerId);
        }
    }

    let pipeTimerId = setInterval(movePipe, 20); 
    pipeSpawnTimer = setTimeout(createPipes, spawnInterval); 
}

// ==========================================================
// 4. نظام السحاب
// ==========================================================

function createCloud() {
    if (document.querySelectorAll('.cloud').length >= 4) return;
    const cloud = document.createElement('img');
    const cloudImages = ["cloud1.png", "cloud2.png", "cloud3.png", "cloud4.png"];
    cloud.src = cloudImages[Math.floor(Math.random() * cloudImages.length)];
    cloud.classList.add('cloud');
    let cloudSpeed = 0.6; 
    let cloudRight = -250; 
    const lanes = [400, 520, 620];
    let cloudBottom = lanes[Math.floor(Math.random() * lanes.length)] + randomNumber(-15, 15);
    let cloudSize = randomNumber(130, 180); 
    let cloudOpacity = randomNumber(5, 8) / 10;
    cloud.style.width = cloudSize + 'px';
    cloud.style.bottom = cloudBottom + 'px';
    cloud.style.right = cloudRight + 'px';
    cloud.style.opacity = cloudOpacity;
    cloudsContainer.appendChild(cloud);
    let cloudTimer = setInterval(() => {
        cloudRight += cloudSpeed;
        cloud.style.right = cloudRight + 'px';
        if (cloudRight > containerWidth + 300) {
            clearInterval(cloudTimer);
            cloud.remove();
        }
    }, 20);
}
setInterval(createCloud, 10000);

// ==========================================================
// 5. النهاية والسقوط والنتائج
// ==========================================================

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

function gameOver(reason) {
    if (isGameOver) return;
    isGameOver = true;
    isGameStarted = false;

    clearInterval(timerInterval); 
    clearInterval(gameTimerId); 
    clearInterval(animationTimerId); 
    clearTimeout(pipeSpawnTimer);

    // تحديث الرقم القياسي
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
    }

    bird.src = "bird_dead.png"; 
    bird.style.zIndex = "200"; 
    bird.style.transform = `rotate(90deg)`; 
    bird.style.opacity = "1"; 

    mainTitle.style.display = 'none'; 
    heroBird.src = "bird_dead.png"; 
    heroBird.style.transform = "scale(1.5) rotate(90deg)"; 

    if(initialInstructions) initialInstructions.style.display = 'none';
    if(gameOverStats) gameOverStats.style.display = 'block';
    
    finalScore.innerText = score;
    finalTime.innerText = timerDisplay.innerText;
    
    // إضافة عرض السكور العالي (اختياري إذا أضفت عنصر له في HTML)
    const highScoreElement = document.getElementById('highScore');
    if(highScoreElement) highScoreElement.innerText = highScore;

    deathFall(); 
}

// تشغيل أولي
drawBird();
bird.style.display = 'none'; 
setTimeout(createCloud, 1000);
