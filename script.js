const playerRoot = document.getElementById('player-root');
const player = document.getElementById('player');
const overlay = document.getElementById('overlay');
const deathReason = document.getElementById('death-reason');
const leftChoice = document.getElementById('choice-left');
const rightChoice = document.getElementById('choice-right');

let isDragging = false;

// ドラッグ開始
playerRoot.addEventListener('mousedown', startDrag);
playerRoot.addEventListener('touchstart', startDrag);

function startDrag(e) {
    isDragging = true;
    player.classList.add('shaking');
    playerRoot.style.cursor = 'grabbing';
}

// 動かしている最中
window.addEventListener('mousemove', drag);
window.addEventListener('touchmove', (e) => drag(e.touches[0]));

function drag(e) {
    if (!isDragging) return;
    
    // マウス位置に追従（少し遅れる「隙」を作っています）
    const x = e.clientX - 30;
    const y = e.clientY - 30;
    playerRoot.style.left = `${x}px`;
    playerRoot.style.top = `${y}px`;

    checkCollision(x, y);
}

// 指を離した時の判定（理不尽死）
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    player.classList.remove('shaking');
    
    // 選択肢の上じゃない場所で離すと死亡
    die("「最後まで責任持って運べや！」 by 若凪");
}

function checkCollision(x, y) {
    const rectL = leftChoice.getBoundingClientRect();
    const rectR = rightChoice.getBoundingClientRect();

    // 左の選択肢に触れた
    if (x > rectL.left && x < rectL.right && y > rectL.top && y < rectL.bottom) {
        die("「安全な道？そんなもんあるわけないやろ！」");
    }
    // 右の選択肢に触れた
    if (x > rectR.left && x < rectR.right && y > rectR.top && y < rectR.bottom) {
        // ここに次のステージへの処理を書けますが、今はとりあえず死
        die("「怪しい洞窟に入って即クリーパー。お疲れ様。」");
    }
}

function die(reason) {
    isDragging = false;
    deathReason.innerText = reason;
    overlay.classList.remove('hidden');
}

function resetGame() {
    location.reload();
}
