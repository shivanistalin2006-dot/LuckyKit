if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
    const cardsContainer = document.getElementById('cardsContainer');
    const overlay = document.getElementById('overlay');
    const resultMsg = document.getElementById('resultMsg');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');

    let isGameOver = false;

    function initGame() {
        cardsContainer.innerHTML = '';
        isGameOver = false;
        overlay.classList.add('hidden');
        
        const outcomes = ['WIN', 'LOSE', 'LOSE'];
        outcomes.sort(() => Math.random() - 0.5);

        outcomes.forEach(outcome => {
            const card = document.createElement('div');
            card.classList.add('card');
            
            const content = document.createElement('div');
            content.classList.add('content');
            content.textContent = outcome === 'WIN' ? '🔮' : '💀';
            card.appendChild(content);

            card.addEventListener('click', () => {
                if (isGameOver || card.classList.contains('flipped')) return;
                if(window.ArcadeSounds) window.ArcadeSounds.playClick();
                
                card.classList.add('flipped');
                isGameOver = true;

                setTimeout(() => {
                    if (outcome === 'WIN') {
                        resultMsg.textContent = "You saw the future! YOU WIN!";
                        if(window.ArcadeCore) window.ArcadeCore.trackWin("pickcard.html");
                    } else {
                        resultMsg.textContent = "Your fate is sealed. YOU LOSE!";
                    }
                    overlay.classList.remove('hidden');
                }, 800);
            });
} else {
    const _init = () => {
    const cardsContainer = document.getElementById('cardsContainer');
    const overlay = document.getElementById('overlay');
    const resultMsg = document.getElementById('resultMsg');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');

    let isGameOver = false;

    function initGame() {
        cardsContainer.innerHTML = '';
        isGameOver = false;
        overlay.classList.add('hidden');
        
        const outcomes = ['WIN', 'LOSE', 'LOSE'];
        outcomes.sort(() => Math.random() - 0.5);

        outcomes.forEach(outcome => {
            const card = document.createElement('div');
            card.classList.add('card');
            
            const content = document.createElement('div');
            content.classList.add('content');
            content.textContent = outcome === 'WIN' ? '🔮' : '💀';
            card.appendChild(content);

            card.addEventListener('click', () => {
                if (isGameOver || card.classList.contains('flipped')) return;
                if(window.ArcadeSounds) window.ArcadeSounds.playClick();
                
                card.classList.add('flipped');
                isGameOver = true;

                setTimeout(() => {
                    if (outcome === 'WIN') {
                        resultMsg.textContent = "You saw the future! YOU WIN!";
                        if(window.ArcadeCore) window.ArcadeCore.trackWin("pickcard.html");
                    } else {
                        resultMsg.textContent = "Your fate is sealed. YOU LOSE!";
                    }
                    overlay.classList.remove('hidden');
                }, 800);
            };
    _init();
}

            cardsContainer.appendChild(card);
        });
    }

    closeOverlayBtn.addEventListener('click', () => {
        if(window.ArcadeSounds) window.ArcadeSounds.playClick();
        initGame();
    });

    initGame();
});
