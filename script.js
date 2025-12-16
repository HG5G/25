// 1. تحديد العناصر من HTML
const gameContainer = document.querySelector('.game-container');
const bird = document.getElementById('bird');
const startScreen = document.getElementById('startScreen');

// 2. تحديد الثوابت والمتغيرات
const containerHeight = 700; 
const containerWidth = 500;
const birdDiameter = 40;     
let birdBottom = containerHeight / 2; // موضع الطائر الأولي من الأسفل
let birdLeft = 50; // موضع الطائر الأفقي
let gravity = 3; 
let jumpStrength = 50; 
let pipeGap = 180; // الفجوة بين الأنبوب العلوي والسفلي
let pipeSpeed = 5; // سرعة حركة الأنابيب
let isGameOver = false;
let isGameStarted = false;
let gameTimerId; 
let pipeTimerId; 
let score = 0;

// ==========================================================
// A. منطق الطائر واللعبة الأساسي
// ==========================================================

// 3. دالة الرسم (تحديث موضع الطائر)
function drawBird() {
    bird.style.bottom = birdBottom + 'px';
    bird.style.left = birdLeft + 'px';
}

// 4. دالة حركة اللعبة الأساسية (Game Loop)
function startGameLoop() {
    gameTimerId = setInterval(() => {
        if (isGameStarted) {
            // تطبيق الجاذبية
            birdBottom -= gravity;
            drawBird();

            // تحقق من الاصطدام بالأرض
            if (birdBottom <= 0) {
                gameOver();
            }
        }
    }, 20); 
}

// 5. دالة القفز
function jump() {
    if (!isGameStarted || isGameOver) return; 

    // منع القفز خارج السقف
    if (birdBottom < containerHeight - birdDiameter - 10) {
        birdBottom += jumpStrength; 
    }
    drawBird();
}

// 6. التحكم في ضغط المسطرة (Spacebar)
document.addEventListener('keydown', (e) => {
    if (e.keyCode === 32) { // 32 هو كود المسطرة
        
        if (!isGameStarted) {
            // البدء: إخفاء الشاشة وبدء الأنابيب
            startScreen.style.display = 'none';
            isGameStarted = true;
            score = 0; // إعادة تعيين النتيجة
            createPipes(); // البدء في إنشاء الأنابيب
        } 
        
        if (isGameStarted && !isGameOver) {
            jump();
        }
    }
});

// ==========================================================
// B. منطق الأنابيب والاصطدام
// ==========================================================

// دالة توليد رقم عشوائي بين حدين (لارتفاع الأنابيب)
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function createPipes() {
    // تحديد ارتفاع عشوائي للأنبوب السفلي (بين 100 و 400 بكسل)
    let bottomPipeHeight = randomNumber(100, 400); 
    // تحديد ارتفاع الأنبوب العلوي بناءً على الفجوة
    let topPipeHeight = containerHeight - bottomPipeHeight - pipeGap; 
    let pipeLeft = containerWidth; // تبدأ الأنابيب من أقصى اليمين

    // 1. إنشاء عنصر الأنبوب العلوي
    const topPipe = document.createElement('div');
    const bottomPipe = document.createElement('div');

    if (!isGameOver) {
        topPipe.classList.add('pipe', 'top-pipe');
        bottomPipe.classList.add('pipe', 'bottom-pipe');
        
        // إعداد خصائص الارتفاع والموقع
        topPipe.style.height = topPipeHeight + 'px';
        bottomPipe.style.height = bottomPipeHeight + 'px';
        bottomPipe.style.bottom = 0 + 'px'; // الأنبوب السفلي يبدأ من الأسفل
        
        // إضافتها إلى حاوية اللعبة
        gameContainer.appendChild(topPipe);
        gameContainer.appendChild(bottomPipe);
    }

    // 2. دالة تحريك الأنبوب والتحقق من الاصطدام
    function movePipe() {
        if (isGameStarted && !isGameOver) {
            pipeLeft -= pipeSpeed; // تحريك الأنبوب نحو اليسار
            topPipe.style.right = pipeLeft + 'px';
            bottomPipe.style.right = pipeLeft + 'px';

            // إذا خرج الأنبوب من الشاشة
            if (pipeLeft <= -60) {
                clearInterval(pipeTimerId);
                gameContainer.removeChild(topPipe);
                gameContainer.removeChild(bottomPipe);
                return;
            }

            // 3. التحقق من الاصطدام (Collision Detection)
            if (
                // هل الأنبوب في المدى الأفقي للطائر؟
                pipeLeft < birdLeft + birdDiameter &&
                pipeLeft + 60 > birdLeft && 
                
                // هل الطائر اصطدم بالأنبوب العلوي أو السفلي؟
                (birdBottom < bottomPipeHeight || birdBottom > containerHeight - topPipeHeight - birdDiameter) 
            ) {
                gameOver();
            }
        }
    }

    // تشغيل دالة التحريك كل 20 ملي ثانية
    let pipeTimerId = setInterval(movePipe, 20); 

    // إنشاء أنبوب جديد كل 3 ثواني
    if (!isGameOver) {
        setTimeout(createPipes, 3000); 
    }
}

// ==========================================================
// C. دالة إنهاء اللعبة وإعادة التعيين
// ==========================================================

function gameOver() {
    if (isGameOver) return;
    
    // إيقاف جميع الحلقات
    clearInterval(gameTimerId); 
    isGameOver = true;
    isGameStarted = false;
    
    // إزالة جميع الأنابيب الموجودة
    const pipes = document.querySelectorAll('.pipe');
    pipes.forEach(pipe => {
        pipe.remove();
    });

    // إعادة وضع الطائر في المنتصف
    birdBottom = containerHeight / 2;
    drawBird();

    // إظهار شاشة النهاية
    startScreen.querySelector('h1').innerText = 'انتهت اللعبة!';
    startScreen.querySelector('p').innerText = 'اضغط المسطرة للبدء من جديد.';
    startScreen.style.display = 'flex'; 

    // إعادة تعيين حالة اللعبة للبداية
    isGameOver = false;
}

// 8. تشغيل اللعبة (لتبدأ حلقة الجاذبية ولكنها لا تعمل إلا عند ضغط المسطرة)
drawBird(); 
startGameLoop();
