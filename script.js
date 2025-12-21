const playerRoot = document.getElementById('player-root');
const player = document.getElementById('player');
const explosion = document.getElementById('explosion');
const overlay = document.getElementById('overlay');
const deathReason = document.getElementById('death-reason');
const leftChoice = document.getElementById('choice-left');
const rightChoice = document.getElementById('choice-right');

let isDragging = false;

function initPlayer() {
    // 確実に現在の画面中央を計算
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    playerRoot.style.left = `${centerX - 40}px`;
    playerRoot.style.top = `${centerY - 40}px`;
    
    player.classList.remove('hidden');
    explosion.classList.add('hidden');
    isDragging = false;
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
    
    // 判定内に入っていない状態で離したら爆発
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
