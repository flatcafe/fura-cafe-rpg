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
    }
];

function initPlayer() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // ぬるーっと戻る挙動のためtransitionを一時的に有効にする状態で位置指定
    playerRoot.classList.remove('dragging');
    playerRoot.style.left = `${centerX - 40}px`;
    playerRoot.style.top = `${centerY - 40}px`;
    
    player.classList.remove('hidden', 'shaking');
    explosion.classList.add('hidden');
    successEffect.classList.add('hidden');
    leftChoice.classList.remove('correct-flash');
    rightChoice.classList.remove('correct-flash');
    
    isDragging = false;
    isProcessing = false; 
    
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
    playerRoot.classList.add('dragging'); // transitionをオフにする
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
}

window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function endDrag(e) {
    if (!isDragging || isProcessing) return;
    isDragging = false;
    playerRoot.classList.remove('dragging'); // transitionをオンにする
    player.classList.remove('shaking');
    
    // 指を離した瞬間の座標で判定
    const px = parseInt(playerRoot.style.left) + 40;
    const py = parseInt(playerRoot.style.top) + 40;
    
    const rectL = leftChoice.getBoundingClientRect();
    const rectR = rightChoice.getBoundingClientRect();
    const stage = storyData[currentStage];

    if (isInside(px, py, rectL)) {
        handleChoice(stage.left, leftChoice);
    } else if (isInside(px, py, rectR)) {
        handleChoice(stage.right, rightChoice);
    } else {
        // どこでもない場所で離したらぬるーっと戻る
        initPlayer();
    }
}

function handleChoice(choice, element) {
    isProcessing = true;
    if (choice.isDie) {
        triggerExplosion(choice.reason);
    } else {
        element.classList.add('correct-flash');
        successEffect.classList.remove('hidden');
        setTimeout(() => {
            if (choice.isClear) {
                alert("クリア！");
                location.reload();
            } else {
                currentStage++;
                if(currentStage >= storyData.length) {
                    alert("全ステージクリア！");
                    location.reload();
                } else {
                    initPlayer();
                }
            }
        }, 1000);
    }
}

function isInside(x, y, rect) {
    return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
}

function triggerExplosion(reason) {
    player.classList.add('hidden');
    explosion.classList.remove('hidden');
    setTimeout(() => die(reason), 600);
}

function die(reason) {
    overlay.classList.remove('hidden');
    deathReason.innerText = reason;
}

function resetGame() {
    overlay.classList.add('hidden');
    currentStage = 0;
    initPlayer();
}
