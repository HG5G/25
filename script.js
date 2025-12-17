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
let deathFallTimer; 

// ==========================================================
// 2. منطق التحكم (اللمس واللوحة)
// ==========================================================

// دالة البدء والقفز الموحدة
function handleAction() {
    if (isGameOver) return;

    if (!isGameStarted) {
        // بدء اللعبة
        startScreen.style.display = 'none';
        isGameStarted = true;
        score = 0; 
        scoreDisplay.innerText = score; 
        animationTimerId = setInterval(animateBird, 100); 
        createPipes(); 
    } else {
        // القفز أثناء اللعب
        jump();
    }
}

// التحكم عن طريق لوحة المفاتيح (المسطرة)
document.addEventListener('keydown', (e) => {
    if (e.keyCode === 32) { 
        handleAction();
    }
});

// ********** إضافة التحكم عن طريق اللمس للهواتف **********
gameContainer.addEventListener('touchstart', (e) => {
    e.preventDefault(); // منع التمرير الافتراضي للمتصفح أثناء اللعب
    handleAction();
}, { passive: false });
// ******************************************************

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
        if (isGameStarted) { 
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
// 3. منطق الأنابيب والاصطدام (من اليمين لليسار)
// ==========================================================

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function createPipes() {
    let bottomPipeHeight = randomNumber(100, containerHeight - pipeGap - 100); 
    let topPipeHeight = containerHeight - bottomPipeHeight - pipeGap; 
    let pipeRight = -pipeWidth; 

    const topPipe = document.createElement('div');
    const bottomPipe = document.createElement('div');

    if (!isGameOver) {
        topPipe.classList.add('pipe', 'top-pipe');
        bottomPipe.classList.add('pipe', 'bottom-pipe');
        topPipe.style.height = topPipeHeight + 'px';
        bottomPipe.style.height = bottomPipeHeight + 'px';
        bottomPipe.style.bottom = 0 + 'px'; 
        topPipe.style.right = pipeRight + 'px'; 
        bottomPipe.style.right = pipeRight + 'px'; 
        gameContainer.appendChild(topPipe);
        gameContainer.appendChild(bottomPipe);
    }

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
            }

            if (pipeRight >= containerWidth) { 
                clearInterval(pipeTimerId);
                topPipe.remove();
                bottomPipe.remove();
                return;
            }

            if (
                pipeLeft < birdLeft + birdDiameter &&
                pipeLeft + pipeWidth > birdLeft && 
                (birdBottom < bottomPipeHeight || birdBottom > containerHeight - topPipeHeight - birdDiameter) 
            ) {
                gameOver("اصطدمت بحاجز!");
            }
        }
    }

    let pipeTimerId = setInterval(movePipe, 20); 
    if (!isGameOver && isGameStarted) {
        setTimeout(createPipes, 3000); 
    }
}

// ==========================================================
// 4. النهاية والسقوط
// ==========================================================

function deathFall() {
    deathFallTimer = setInterval(() => {
        birdBottom -= gravity * 2; 
        bird.style.bottom = birdBottom + 'px';
        if (birdBottom <= -birdDiameter) {
            clearInterval(deathFallTimer);
            startScreen.style.display = 'flex'; 
            birdBottom = containerHeight / 2;
            bird.src = birdImages[0]; 
            bird.style.transform = `rotate(0deg)`; 
            drawBird(); 
            isGameOver = false; 
        }
    }, 20);
}

function gameOver(reason) {
    if (isGameOver) return;
    clearInterval(gameTimerId); 
    clearInterval(animationTimerId); 
    isGameOver = true;
    isGameStarted = false;
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
    startScreen.querySelector('h1').innerText = `انتهت اللعبة!`;
    startScreen.querySelector('p').innerHTML = `نقاطك: <b>${score}</b>. المس الشاشة للبدء من جديد.`;
    bird.src = "bird_dead.png"; 
    bird.style.transform = `rotate(90deg)`; 
    deathFall(); 
}

drawBird(); 
startGameLoop();
