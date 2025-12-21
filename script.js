const playerRoot = document.getElementById('player-root');
const player = document.getElementById('player');
const explosion = document.getElementById('explosion');
const successEffect = document.getElementById('success-effect');
const overlay = document.getElementById('overlay');
const deathReason = document.getElementById('death-reason');
const leftChoice = document.getElementById('choice-left');
const rightChoice = document.getElementById('choice-right');
const statusMessage = document.getElementById('status-message');

let isMoving = false;
let isLocked = false; 
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
        right: { text: "金のリンゴ", isDie: true, reason: "「成金趣味はあかん。爆竹を食らえ！」" }
    }
];

function initPlayer() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // transitionを有効にした状態で中央に戻す（ぬるーっと戻る）
    playerRoot.classList.remove('is-dragging');
    playerRoot.style.left = `${centerX - 40}px`;
    playerRoot.style.top = `${centerY - 40}px`;
    
    player.classList.remove('hidden');
    explosion.classList.add('hidden');
    successEffect.classList.add('hidden');
    leftChoice.classList.remove('correct-flash');
    rightChoice.classList.remove('correct-flash');
    
    isMoving = false;
    isLocked = false; 
    
    const stage = storyData[currentStage];
    statusMessage.innerText = stage.message;
    leftChoice.innerText = stage.left.text;
    rightChoice.innerText = stage.right.text;
}

window.addEventListener('load', initPlayer);
window.addEventListener('resize', initPlayer);

// ドラッグ開始
playerRoot.addEventListener('mousedown', startDrag);
playerRoot.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(); });

function startDrag() {
    if (isLocked) return;
    isMoving = true;
    playerRoot.classList.add('is-dragging'); // 瞬時に動くようにする
}

// 移動中
window.addEventListener('mousemove', drag);
window.addEventListener('touchmove', (e) => drag(e.touches[0]));

function drag(e) {
    if (!isMoving || isLocked) return;
    playerRoot.style.left = `${e.clientX - 40}px`;
    playerRoot.style.top = `${e.clientY - 40}px`;
}

// 指を離した時
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function endDrag() {
    if (!isMoving || isLocked) return;
    isMoving = false;
    
    // transition（ぬるーっと戻る設定）を復活させる
    playerRoot.classList.remove('is-dragging');

    const px = parseInt(playerRoot.style.left) + 40;
    const py = parseInt(playerRoot.style.top) + 40;
    
    const rectL = leftChoice.getBoundingClientRect();
    const rectR = rightChoice.getBoundingClientRect();
    const stage = storyData[currentStage];

    if (isInside(px, py, rectL)) {
        processChoice(stage.left, leftChoice);
    } else if (isInside(px, py, rectR)) {
        processChoice(stage.right, rightChoice);
    } else {
        // どこでもない場所で離したら、ぬるーっと中央に戻るだけ（爆発しない）
        initPlayer();
    }
}

function processChoice(choice, element) {
    isLocked = true; 
    if (choice.isDie) {
        // 死亡時のみ爆発
        player.classList.add('hidden');
        explosion.classList.remove('hidden');
        setTimeout(() => {
            deathReason.innerText = choice.reason;
            overlay.classList.remove('hidden');
        }, 600);
    } else {
        // 正解演出
        element.classList.add('correct-flash');
        successEffect.classList.remove('hidden');
        setTimeout(() => {
            currentStage++;
            if(currentStage >= storyData.length) {
                alert("全ステージクリア！12/28をお楽しみに！");
                currentStage = 0;
            }
            initPlayer();
        }, 1000);
    }
}

function isInside(x, y, rect) {
    return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
}

function resetGame() {
    overlay.classList.add('hidden');
    currentStage = 0;
    initPlayer();
}
