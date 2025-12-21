const playerRoot = document.getElementById('player-root');
const player = document.getElementById('player');
const explosion = document.getElementById('explosion');
const overlay = document.getElementById('overlay');
const deathReason = document.getElementById('death-reason');
const leftChoice = document.getElementById('choice-left');
const rightChoice = document.getElementById('choice-right');

let isDragging = false;
const startPos = { x: window.innerWidth / 2 - 40, y: window.innerHeight / 2 - 40 };

// 初期位置にセット
function initPlayer() {
    playerRoot.style.left = `${startPos.x}px`;
    playerRoot.style.top = `${startPos.y}px`;
    player.classList.remove('hidden');
    explosion.classList.add('hidden');
    isDragging = false;
}

initPlayer();

// ドラッグ開始
playerRoot.addEventListener('mousedown', startDrag);
playerRoot.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(); });

function startDrag() {
    isDragging = true;
    player.classList.add('shaking');
}

// 移動中
window.addEventListener('mousemove', drag);
window.addEventListener('touchmove', (e) => drag(e.touches[0]));

function drag(e) {
    if (!isDragging) return;
    
    const x = e.clientX - 40;
    const y = e.clientY - 40;
    playerRoot.style.left = `${x}px`;
    playerRoot.style.top = `${y}px`;

    // 移動中に選択肢に触れたかチェック
    checkCollision(x + 40, y + 40);
}

// 指を離した時
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function endDrag() {
    if (!isDragging) return;
    
    // 選択肢に到達せずに離した場合は爆発してリセット
    triggerExplosion("「中途半端に放り出すな！」 by 若凪");
    setTimeout(initPlayer, 1200); 
}

function checkCollision(px, py) {
    const rectL = leftChoice.getBoundingClientRect();
    const rectR = rightChoice.getBoundingClientRect();

    if (isInside(px, py, rectL)) {
        isDragging = false;
        triggerExplosion("「安全な道？そんなもんあるわけないやろ！」");
    } else if (isInside(px, py, rectR)) {
        isDragging = false;
        triggerExplosion("「怪しい洞窟に入って即クリーパー。お疲れ様。」");
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
    initPlayer();
}
