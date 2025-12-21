const playerRoot = document.getElementById('player-root');
const player = document.getElementById('player');
const explosion = document.getElementById('explosion');
const overlay = document.getElementById('overlay');
const deathReason = document.getElementById('death-reason');
const leftChoice = document.getElementById('choice-left');
const rightChoice = document.getElementById('choice-right');
const statusMessage = document.getElementById('status-message');

let isDragging = false;
let currentStage = 0;

// ストーリー/システムデータ
// ここを書き換えるだけでステージを増やせます
const storyData = [
    {
        message: "ステージ1：りりを導け",
        left: { text: "安全そうな道", isDie: true, reason: "「安全な道？そんなもんあるわけないやろ！」" },
        right: { text: "怪しい洞窟", isDie: false } // 右が正解
    },
    {
        message: "ステージ2：お腹が空いたようだ",
        left: { text: "腐った肉", isDie: false }, // 左が正解
        right: { text: "金のリンゴ", isDie: true, reason: "「成金趣味はあかん。爆発しろ！」" }
    },
    {
        message: "最終ステージ：再始動の扉",
        left: { text: "戻る", isDie: true, reason: "「後退は許さん！」" },
        right: { text: "進む", isDie: false, isClear: true } // クリア
    }
];

function initPlayer() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    playerRoot.style.left = `${centerX - 40}px`;
    playerRoot.style.top = `${centerY - 40}px`;
    
    player.classList.remove('hidden');
    explosion.classList.add('hidden');
    isDragging = false;
    
    // 現在のステージ情報を反映
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
    isDragging = true;
    player.classList.add('shaking');
}

window.addEventListener('mousemove', drag);
window.addEventListener('touchmove', (e) => drag(e.touches[0]));

function drag(e) {
    if (!isDragging) return;
    const x = e.clientX - 40;
    const y = e.clientY - 40;
    playerRoot.style.left = `${x}px`;
    playerRoot.style.top = `${y}px`;
    checkCollision(e.clientX, e.clientY);
}

window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    player.classList.remove('shaking');
    
    // 判定外で離したらリセット
    if (!isOverChoice(parseInt(playerRoot.style.left) + 40, parseInt(playerRoot.style.top) + 40)) {
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
        handleChoice(stage.left);
    } else if (isInside(px, py, rectR)) {
        handleChoice(stage.right);
    }
}

function handleChoice(choice) {
    isDragging = false;
    if (choice.isDie) {
        triggerExplosion(choice.reason);
    } else if (choice.isClear) {
        alert("全ステージクリア！12/28 配信をお楽しみに！");
        location.reload();
    } else {
        // 次のステージへ
        currentStage++;
        initPlayer();
    }
}

function isInside(x, y, rect) {
    return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
}

function triggerExplosion(reason) {
    player.classList.add('hidden');
    explosion.classList.remove('hidden');
    player.classList.remove('shaking');
    setTimeout(() => die(reason), 600);
}

function die(reason) {
    deathReason.innerText = reason;
    overlay.classList.remove('hidden');
}

function resetGame() {
    overlay.classList.add('hidden');
    currentStage = 0; // 最初から
    initPlayer();
}
