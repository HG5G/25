// ==========================================================
// 1. تعريف العناصر والثوابت
// ==========================================================

const gameContainer = document.querySelector('.game-container');
const bird = document.getElementById('bird');
const startScreen = document.getElementById('startScreen');
const scoreDisplay = document.getElementById('scoreDisplay'); 

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
const pipeWidth = 60;   

let isGameOver = false;
let isGameStarted = false;
let gameTimerId; 
let score = 0;
let deathFallTimer; // مهم جداً لمسحه عند إعادة البدء

// ==========================================================
// 2. منطق التحكم (اللمس واللوحة)
// ==========================================================

function handleAction() {
    // إذا كان العصفور بيموت دلوقتي (بيقع)، نمنع البدء حتى ينتهي السقوط
    if (deathFallTimer) return; 

    if (!isGameStarted) {
        resetGame(); // دالة جديدة لتنظيف كل شيء قبل البدء
        startScreen.style.display = 'none';
        isGameStarted = true;
        animationTimerId = setInterval(animateBird, 100); 
        createPipes(); 
    } else if (!isGameOver) {
        jump();
    }
}

// إعادة ضبط اللعبة بالكامل
function resetGame() {
    // 1. إيقاف كل المؤقتات القديمة تماماً
    clearInterval(gameTimerId);
    clearInterval(animationTimerId);
    clearInterval(deathFallTimer);
    deathFallTimer = null; 

    // 2. مسح أي أنابيب قديمة من الشاشة
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());

    // 3. إعادة العصفور لمكانه ووضعه الطبيعي
    isGameOver = false;
    score = 0;
    scoreDisplay.innerText = score;
    birdBottom = containerHeight / 2;
    bird.src = birdImages[0];
    bird.style.transform = `rotate(0deg)`;
    drawBird();
}

// التحكم (مسطرة + لمس)
document.addEventListener('keydown', (e) => { if (e.keyCode === 32) handleAction(); });
gameContainer.addEventListener('touchstart', (e) => { e.preventDefault(); handleAction(); }, { passive: false });

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
            if (birdBottom <= 0) gameOver("سقطت بعيداً!");
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
// 3. منطق الأنابيب (من اليمين لليسار)
// ==========================================================

function createPipes() {
    if (isGameOver || !isGameStarted) return;

    let bottomPipeHeight = Math.floor(Math.random() * (containerHeight - pipeGap - 200)) + 100;
    let topPipeHeight = containerHeight - bottomPipeHeight - pipeGap; 
    let pipeRight = -pipeWidth; 

    const topPipe = document.createElement('div');
    const bottomPipe = document.createElement('div');

    topPipe.classList.add('pipe', 'top-pipe');
    bottomPipe.classList.add('pipe', 'bottom-pipe');
    topPipe.style.height = topPipeHeight + 'px';
    bottomPipe.style.height = bottomPipeHeight + 'px';
    topPipe.style.right = pipeRight + 'px'; 
    bottomPipe.style.right = pipeRight + 'px'; 
    bottomPipe.style.bottom = '0px';

    gameContainer.appendChild(topPipe);
    gameContainer.appendChild(bottomPipe);

    let hasScored = false; 
    let pipeTimer = setInterval(() => {
        if (isGameStarted && !isGameOver) {
            pipeRight += pipeSpeed; 
            topPipe.style.right = pipeRight + 'px'; 
            bottomPipe.style.right = pipeRight + 'px'; 

            const pipeLeft = containerWidth - pipeRight - pipeWidth; 
            if (pipeLeft < birdLeft && !hasScored) {
                score++;
                scoreDisplay.innerText = score;
                hasScored = true;
            }

            if (pipeRight >= containerWidth) { 
                clearInterval(pipeTimer);
                topPipe.remove();
                bottomPipe.remove();
            }

            if (pipeLeft < birdLeft + birdDiameter && pipeLeft + pipeWidth > birdLeft && 
                (birdBottom < bottomPipeHeight || birdBottom > containerHeight - topPipeHeight - birdDiameter)) {
                gameOver("اصطدمت بحاجز!");
            }
        } else {
            clearInterval(pipeTimer); // إيقاف حركة الأنبوب عند الموت
        }
    }, 20);

    if (!isGameOver) setTimeout(createPipes, 3000); 
}

// ==========================================================
// 4. النهاية والسقوط الدرامي
// ==========================================================

function gameOver(reason) {
    if (isGameOver) return;
    isGameOver = true;
    isGameStarted = false;
    clearInterval(animationTimerId);

    bird.src = "bird_dead.png"; 
    bird.style.transform = `rotate(90deg)`; 

    // بدء السقوط
    deathFallTimer = setInterval(() => {
        birdBottom -= gravity * 4; 
        bird.style.bottom = birdBottom + 'px';
        if (birdBottom <= -birdDiameter) {
            clearInterval(deathFallTimer);
            deathFallTimer = null; // تصفير المؤقت للسماح بالبدء من جديد
            startScreen.style.display = 'flex'; 
            startScreen.querySelector('h1').innerText = `انتهت اللعبة!`;
            startScreen.querySelector('p').innerHTML = `نقاطك: <b>${score}</b>. المس للبدء.`;
        }
    }, 20);
}

drawBird(); 
startGameLoop();
