const playerRoot = document.getElementById('player-root');
const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const explosion = document.getElementById('explosion');
const successEffect = document.getElementById('success-effect');
const overlay = document.getElementById('overlay');
const deathReason = document.getElementById('death-reason');
const leftChoice = document.getElementById('choice-left');
const rightChoice = document.getElementById('choice-right');
const statusMessage = document.getElementById('status-message');
const timerBar = document.getElementById('timer-bar');

let isMoving = false;
let isLocked = false; 
let currentStage = 0;
let timerInterval = null;
let enemyX = 0, enemyY = 0;

const storyData = [
    {
        type: "choice",
        message: "【ゲーム1】正しい道へ運べ！",
        timeLimit: 5,
        left: { text: "死の沼", isDie: true, reason: "「沼にはまりました。」" },
        right: { text: "怪しい道", isDie: false }
    },
    {
        type: "escape",
        message: "【ゲーム2】若凪から逃げろ！",
        timeLimit: 7,
        enemySpeed: 3.5 // 追いかけてくる速度
    }
];

function initPlayer() {
    const stage = storyData[currentStage];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    playerRoot.classList.remove('is-dragging');
    playerRoot.style.left = `${centerX - 40}px`;
    playerRoot.style.top = `${centerY - 40}px`;
    
    // 敵の初期位置（画面端）
    enemyX = 0; enemyY = 0;
    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";

    // モード別の表示切り替え
    if (stage.type === "choice") {
        leftChoice.classList.remove('hidden');
        rightChoice.classList.remove('hidden');
        enemy.classList.add('hidden');
        leftChoice.innerText = stage.left.text;
        rightChoice.innerText = stage.right.text;
    } else {
        leftChoice.classList.add('hidden');
        rightChoice.classList.add('hidden');
        enemy.classList.remove('hidden');
    }

    player.classList.remove('hidden');
    explosion.classList.add('hidden');
    successEffect.classList.add('hidden');
    leftChoice.classList.remove('correct-flash');
    rightChoice.classList.remove('correct-flash');
    
    isMoving = false;
    isLocked = false; 
    statusMessage.innerText = stage.message;
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    const stage = storyData[currentStage];
    let duration = stage.timeLimit * 1000;
    let elapsed = 0;
    
    timerInterval = setInterval(() => {
        elapsed += 50;
        let percentage = 100 - (elapsed / duration * 100);
        timerBar.style.width = `${percentage}%`;

        if (stage.type === "escape") moveEnemy();

        if (percentage <= 0) {
            clearInterval(timerInterval);
            if (stage.type === "escape") {
                handleSuccess(); // 逃げ切れば成功
            } else {
                triggerExplosion("「時間切れや！」");
            }
        }
    }, 50);
}

function moveEnemy() {
    if (isLocked) return;
    const stage = storyData[currentStage];
    const px = parseInt(playerRoot.style.left);
    const py = parseInt(playerRoot.style.top);

    // プレイヤーに向かって少しずつ移動（追跡ロジック）
    const dx = px - enemyX;
    const dy = py - enemyY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 50) { // 接触判定
        triggerExplosion("「捕まえたで！逃がさへんよ。」");
        return;
    }

    enemyX += (dx / distance) * stage.enemySpeed;
    enemyY += (dy / distance) * stage.enemySpeed;
    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";
}

function handleSuccess() {
    isLocked = true;
    successEffect.classList.remove('hidden');
    setTimeout(() => {
        currentStage++;
        if(currentStage >= storyData.length) {
            alert("完全クリア！");
            currentStage = 0;
        }
        initPlayer();
    }, 1000);
}

// ドラッグ操作系イベント
playerRoot.addEventListener('mousedown', startDrag);
playerRoot.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(); });
window.addEventListener('mousemove', drag);
window.addEventListener('touchmove', (e) => drag(e.touches[0]));
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function startDrag() { if (!isLocked) { isMoving = true; playerRoot.classList.add('is-dragging'); } }
function drag(e) {
    if (!isMoving || isLocked) return;
    playerRoot.style.left = `${e.clientX - 40}px`;
    playerRoot.style.top = `${e.clientY - 40}px`;
}
function endDrag() {
    if (!isMoving || isLocked) return;
    isMoving = false;
    playerRoot.classList.remove('is-dragging');
    
    const stage = storyData[currentStage];
    if (stage.type === "choice") {
        const px = parseInt(playerRoot.style.left) + 40;
        const py = parseInt(playerRoot.style.top) + 40;
        const rectL = leftChoice.getBoundingClientRect();
        const rectR = rightChoice.getBoundingClientRect();
        if (isInside(px, py, rectL)) processChoice(stage.left, leftChoice);
        else if (isInside(px, py, rectR)) processChoice(stage.right, rightChoice);
        else initPlayer();
    }
}

function processChoice(choice, element) {
    clearInterval(timerInterval);
    if (choice.isDie) triggerExplosion(choice.reason);
    else {
        element.classList.add('correct-flash');
        handleSuccess();
    }
}

function isInside(x, y, rect) { return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom; }

function triggerExplosion(reason) {
    isLocked = true; clearInterval(timerInterval);
    player.classList.add('hidden'); explosion.classList.remove('hidden');
    setTimeout(() => { deathReason.innerText = reason; overlay.classList.remove('hidden'); }, 600);
}

function resetGame() { overlay.classList.add('hidden'); currentStage = 0; initPlayer(); }

window.addEventListener('load', initPlayer);
window.addEventListener('resize', initPlayer);
