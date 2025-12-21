// ...（中略：変数の宣言などはそのまま）
let enemySize = 80; 
const MAX_ENEMY_SIZE = Math.min(window.innerWidth, window.innerHeight) * 0.8; // 画面の8割を最大サイズに設定

// ...（setupStage関数内の変更点）
    timerInterval = setInterval(() => {
        let now = Date.now();
        let elapsed = now - startTime;
        let remaining = Math.max(0, (duration - elapsed) / 1000);
        
        timerBar.style.width = `${(remaining / stage.timeLimit) * 100}%`;
        timerText.innerText = remaining.toFixed(1);

        if (stage.type === "escape" && !isLocked) {
            currentEnemySpeed += 0.12; 
            
            // 最大サイズを超えないように巨大化
            if (enemySize < MAX_ENEMY_SIZE) {
                enemySize += 4.0; 
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

// ...（以下、moveEnemyなどの関数は前回と同様）
