// 1. تحديد العناصر من HTML
const gameContainer = document.querySelector('.game-container');
const bird = document.querySelector('.bird');

// 2. تحديد الثوابت الأساسية للعبة
const containerHeight = 700; // يجب أن تتطابق مع الـ CSS
const containerWidth = 500;  // يجب أن تتطابق مع الـ CSS
const birdDiameter = 40;     // حجم الطائر
let birdBottom = containerHeight / 2; // موضع الطائر الأولي من الأسفل (نصف الارتفاع)
let gravity = 3; // قوة الجاذبية (كم بكسل سينزل في كل تحديث)
let isGameOver = false;
let gameTimerId; // لتعقب دالة التحديث الرئيسية

// 3. تحديد موضع الطائر باستخدام JavaScript
function drawBird() {
    // تحديد الموضع العمودي للطائر من أسفل الحاوية
    bird.style.bottom = birdBottom + 'px';
    // تحديد الموضع الأفقي (ثابت تقريباً)
    bird.style.left = 50 + 'px';
}

// 4. دالة حركة اللعبة الأساسية (Game Loop)
function startGame() {
    // هذا سيحدث كل 20 ملي ثانية
    gameTimerId = setInterval(() => {
        // تطبيق الجاذبية: إنقاص موضع الطائر في كل مرة
        birdBottom = birdBottom - gravity;

        // تحديث موضع الطائر على الشاشة
        drawBird();

        // **تحقق من الاصطدام بالأرض**
        if (birdBottom <= 0) {
            gameOver();
        }

    }, 20); // 20 ملي ثانية (بمعدل 50 إطار/ثانية تقريباً)
}

drawBird(); // نرسم الطائر في موقعه الأولي
startGame(); // نبدأ حركة الجاذبية فوراً

// 5. دالة القفز
function jump() {
    // نتأكد أن الطائر لا يقفز للأعلى خارج الشاشة
    if (birdBottom < containerHeight - birdDiameter - 10) {
        // زيادة موضع الطائر بقيمة القفزة
        birdBottom = birdBottom + 50; // قوة القفزة
    }
    drawBird();
}

// 6. الاستماع لضغط المسطرة
document.addEventListener('keydown', (e) => {
    // كود زر المسطرة هو 32
    if (e.keyCode === 32) {
        jump();
    }
});

// 7. دالة إنهاء اللعبة (سنكملها لاحقاً)
function gameOver() {
    clearInterval(gameTimerId); // إيقاف الحلقة الأساسية
    isGameOver = true;
    console.log('انتهت اللعبة! اصطدام بالأرض.');
}
