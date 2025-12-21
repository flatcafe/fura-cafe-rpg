const playerRoot = document.getElementById('player-root');
const player = document.getElementById('player');
const explosion = document.getElementById('explosion');
const overlay = document.getElementById('overlay');
const deathReason = document.getElementById('death-reason');
const leftChoice = document.getElementById('choice-left');
const rightChoice = document.getElementById('choice-right');

let isDragging = false;

// 初期位置を画面中央に設定する関数
function initPlayer() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // playerRootのサイズ(80px)の半分を引いて中央寄せ
    playerRoot.style.left = `${(screenWidth / 2) - 40}px`;
    playerRoot.style.top = `${(screenHeight / 2) - 40}px`;
    
    player.classList.remove('hidden');
    explosion.classList.add('hidden');
    isDragging = false;
}

// 起動時と画面リサイズ時に位置を合わせる
window.addEventListener('load', initPlayer);
window.addEventListener('resize', initPlayer);

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

    checkCollision(e.clientX, e.clientY);
}

// 指を離した時
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    player.classList.remove('shaking');
    
    // 選択肢に触れていない状態で離したら爆発
    triggerExplosion("「中途半端に放り出すな！」 by 若凪");
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
    return x > rect.left && x < rect.right && y > rect.bottom - 120 && y < rect.bottom;
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
