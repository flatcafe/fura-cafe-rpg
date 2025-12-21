const playerRoot = document.getElementById('player-root');
const player = document.getElementById('player');
const explosion = document.getElementById('explosion');
const successEffect = document.getElementById('success-effect');
const overlay = document.getElementById('overlay');
const deathReason = document.getElementById('death-reason');
const leftChoice = document.getElementById('choice-left');
const rightChoice = document.getElementById('choice-right');
const statusMessage = document.getElementById('status-message');

let isDragging = false;
let isProcessing = false; 
let currentStage = 0;

const storyData = [
    {
        message: "ステージ1：りりを導け",
        left: { text: "安全そうな道", isDie: true, reason: "「安全な道？そんなもんあるわけないやろ！」" },
        right: { text: "怪しい洞窟", isDie: false }
    },
    {
        message: "ステージ2：お腹が空いたようだ",
        left: { text: "腐った肉", isDie: false },
        right: { text: "金のリンゴ", isDie: true, reason: "「成金趣味はあかん。爆発しろ！」" }
    },
    {
        message: "最終ステージ：再始動の扉",
        left: { text: "戻る", isDie: true, reason: "「後退は許さん！」" },
        right: { text: "進む", isDie: false, isClear: true }
    }
];

function initPlayer() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // 位置リセット
    playerRoot.style.left = `${centerX - 40}px`;
    playerRoot.style.top = `${centerY - 40}px`;
    
    // クラスのリセット（演出の残骸を消す）
    player.classList.remove('hidden', 'shaking');
    explosion.classList.add('hidden');
    successEffect.classList.add('hidden');
    leftChoice.classList.remove('correct-flash');
    rightChoice.classList.remove('correct-flash');
    
    isDragging = false;
    isProcessing = false; // 操作ロック解除
    
    const stage = storyData[currentStage];
    statusMessage.innerText = stage.message;
    leftChoice.innerText = stage.left.text;
    rightChoice.innerText = stage.right.text;
}

window.addEventListener('load', initPlayer);
window.addEventListener('resize', initPlayer);

playerRoot.addEventListener('mousedown', startDrag);
playerRoot.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(); });

function startDrag() {
    if (isProcessing) return;
    isDragging = true;
    player.classList.add('shaking');
}

window.addEventListener('mousemove', drag);
window.addEventListener('touchmove', (e) => drag(e.touches[0]));

function drag(e) {
    if (!isDragging || isProcessing) return;
    const x = e.clientX - 40;
    const y = e.clientY - 40;
    playerRoot.style.left = `${x}px`;
    playerRoot.style.top = `${y}px`;
    checkCollision(e.clientX, e.clientY);
}

window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function endDrag() {
    if (!isDragging || isProcessing) return;
    isDragging = false;
    player.classList.remove('shaking');
    
    const px = parseInt(playerRoot.style.left) + 40;
    const py = parseInt(playerRoot.style.top) + 40;

    if (!isOverChoice(px, py)) {
        triggerExplosion("「中途半端に放り出すな！」 by 若凪");
    }
}

function isOverChoice(px, py) {
    const rectL = leftChoice.getBoundingClientRect();
    const rectR = rightChoice.getBoundingClientRect();
    return isInside(px, py, rectL) || isInside(px, py, rectR);
}

function checkCollision(px, py) {
    const rectL = leftChoice.getBoundingClientRect();
    const rectR = rightChoice.getBoundingClientRect();
    const stage = storyData[currentStage];

    if (isInside(px, py, rectL)) {
        handleChoice(stage.left, leftChoice);
    } else if (isInside(px, py, rectR)) {
        handleChoice(stage.right, rightChoice);
    }
}

function handleChoice(choice, element) {
    if (isProcessing) return; // 二重処理防止
    
    isDragging = false;
    isProcessing = true; // 操作をロック
    player.classList.remove('shaking');

    if (choice.isDie) {
        triggerExplosion(choice.reason);
    } else {
        // 【修正】正解演出：クラスを付与してからウェイトを置く
        element.classList.add('correct-flash');
        successEffect.classList.remove('hidden');
        
        setTimeout(() => {
            if (choice.isClear) {
                alert("全ステージクリア！12/28 配信をお楽しみに！");
                location.reload();
            } else {
                currentStage++;
                initPlayer();
            }
        }, 1000); // 演出時間を1秒に延長
    }
}

function isInside(x, y, rect) {
    return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
}

function triggerExplosion(reason) {
    isProcessing = true;
    player.classList.add('hidden');
    explosion.classList.remove('hidden');
    setTimeout(() => die(reason), 600);
}

function die(reason) {
    deathReason.innerText = reason;
    overlay.classList.remove('hidden');
}

function resetGame() {
    overlay.classList.add('hidden');
    currentStage = 0;
    initPlayer();
}
