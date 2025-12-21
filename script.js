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
const timerText = document.getElementById('timer-text');

let isMoving = false;
let isLocked = false; 
let currentStage = 0;
let timerInterval = null;
let enemyX = 0, enemyY = 0;
let currentEnemySpeed = 0;
let enemySize = 80;

// 【修正箇所】最大サイズを初期サイズの2倍（160px）に固定
const MAX_SIZE = 160;

const storyData = [
    {
        type: "choice",
        message: "正しい道へ運べ！",
        timeLimit: 5,
        left: { text: "死の沼", isDie: true, reason: "「沼にはまりました。」" },
        right: { text: "怪しい道", isDie: false }
    },
    {
        type: "escape",
        message: "若凪から逃げろ！",
        timeLimit: 7,
        baseSpeed: 6.0 
    }
];

function setupStage() {
    clearInterval(timerInterval);
    isLocked = false;
    isMoving = false;
    enemySize = 80; 

    const stage = storyData[currentStage];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    playerRoot.classList.remove('is-dragging');
    playerRoot.style.left = `${centerX - 40}px`;
    playerRoot.style.top = `${centerY - 40}px`;
    
    // 敵を画面外に配置
    enemyX = Math.random() > 0.5 ? -200 : window.innerWidth + 100;
    enemyY = Math.random() > 0.5 ? -200 : window.innerHeight + 100;
    updateEnemyStyle();

    player.classList.remove('hidden');
    explosion.classList.add('hidden');
    successEffect.classList.add('hidden');
    leftChoice.classList.remove('correct-flash', 'hidden');
    rightChoice.classList.remove('correct-flash', 'hidden');
    statusMessage.innerText = stage.message;

    if (stage.type === "choice") {
        enemy.classList.add('hidden');
        leftChoice.innerText = stage.left.text;
        rightChoice.innerText = stage.right.text;
    } else {
        leftChoice.classList.add('hidden');
        rightChoice.classList.add('hidden');
        enemy.classList.remove('hidden');
        currentEnemySpeed = stage.baseSpeed;
    }

    const duration = stage.timeLimit * 1000;
    let startTime = Date.now();

    timerInterval = setInterval(() => {
        let now = Date.now();
        let elapsed = now - startTime;
        let remaining = Math.max(0, (duration - elapsed) / 1000);
        
        timerBar.style.width = `${(remaining / stage.timeLimit) * 100}%`;
        timerText.innerText = remaining.toFixed(1);

        if (stage.type === "escape" && !isLocked) {
            currentEnemySpeed += 0.12; 
            
            // 巨大化制限：160pxまで
            if (enemySize < MAX_SIZE) {
                enemySize += 3.0; 
            }
            
            updateEnemyStyle();
            moveEnemy();
        }

        if (remaining <= 0) {
            clearInterval(timerInterval);
            if (stage.type === "escape" && !isLocked) handleSuccess();
            else if (!isLocked) triggerExplosion("「ノロマやなぁ！時間切れや！」");
        }
    }, 30);
}

function updateEnemyStyle() {
    enemy.style.width = enemySize + "px";
    enemy.style.height = enemySize + "px";
    enemy.style.fontSize = (enemySize * 0.8) + "px";
    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";
}

function moveEnemy() {
    const px = parseInt(playerRoot.style.left) + 40;
    const py = parseInt(playerRoot.style.top) + 40;
    const ex = enemyX + (enemySize / 2);
    const ey = enemyY + (enemySize / 2);

    const dx = px - ex;
    const dy = py - ey;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 接触判定
    if (distance < (enemySize / 2) + 15) {
        triggerExplosion("「逃げ場なんて、最初から無かったんや。」");
        return;
    }

    enemyX += (dx / distance) * currentEnemySpeed;
    enemyY += (dy / distance) * currentEnemySpeed;
}

function handleSuccess() {
    if (isLocked) return;
    isLocked = true;
    clearInterval(timerInterval);
    successEffect.classList.remove('hidden');
    setTimeout(() => {
        currentStage++;
        if(currentStage >= storyData.length) {
            alert("完全クリア！");
            currentStage = 0;
        }
        setupStage();
    }, 1000);
}

function triggerExplosion(reason) {
    if (isLocked) return;
    isLocked = true; 
    clearInterval(timerInterval);
    player.classList.add('hidden'); 
    explosion.classList.remove('hidden');
    setTimeout(() => { 
        deathReason.innerText = reason; 
        overlay.classList.remove('hidden'); 
    }, 600);
}

playerRoot.addEventListener('mousedown', startDrag);
playerRoot.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(); }, {passive: false});
function startDrag() { if (!isLocked) { isMoving = true; playerRoot.classList.add('is-dragging'); } }
window.addEventListener('mousemove', drag);
window.addEventListener('touchmove', (e) => drag(e.touches[0]), {passive: false});
function drag(e) {
    if (!isMoving || isLocked) return;
    playerRoot.style.left = `${e.clientX - 40}px`;
    playerRoot.style.top = `${e.clientY - 40}px`;
}
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);
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
    }
}
function processChoice(choice, element) {
    if (choice.isDie) triggerExplosion(choice.reason);
    else { element.classList.add('correct-flash'); handleSuccess(); }
}
function isInside(x, y, rect) { return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom; }
function resetGame() { overlay.classList.add('hidden'); currentStage = 0; setupStage(); }
window.addEventListener('load', setupStage);
window.addEventListener('resize', setupStage);
