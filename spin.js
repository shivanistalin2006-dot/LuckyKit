if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('spinBtn');
    const overlay = document.getElementById('overlay');
    const resultMsg = document.getElementById('resultMsg');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');

    const sectors = [
        {color: "#ff0000", label: "Loss"},
        {color: "#ff7f00", label: "Win"},
        {color: "#ffff00", label: "Loss"},
        {color: "#00ff00", label: "Big Win"},
        {color: "#0000ff", label: "Loss"},
        {color: "#4b0082", label: "Win"},
        {color: "#9400d3", label: "Loss"},
        {color: "#ff00ff", label: "Jackpot"}
    ];
    
    const tot = sectors.length;
    const arc = 2 * Math.PI / tot;
    let rotation = 0;
    let isSpinning = false;

    function drawWheel() {
        sectors.forEach((sector, i) => {
            const ang = arc * i + rotation;
            ctx.beginPath();
            ctx.fillStyle = sector.color;
            ctx.moveTo(200, 200);
            ctx.arc(200, 200, 200, ang, ang + arc);
            ctx.lineTo(200, 200);
            ctx.fill();
            
            ctx.save();
            ctx.translate(200, 200);
            ctx.rotate(ang + arc / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 20px sans-serif";
            ctx.fillText(sector.label, 180, 10);
            ctx.restore();
        });
} else {
    const _init = () => {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('spinBtn');
    const overlay = document.getElementById('overlay');
    const resultMsg = document.getElementById('resultMsg');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');

    const sectors = [
        {color: "#ff0000", label: "Loss"},
        {color: "#ff7f00", label: "Win"},
        {color: "#ffff00", label: "Loss"},
        {color: "#00ff00", label: "Big Win"},
        {color: "#0000ff", label: "Loss"},
        {color: "#4b0082", label: "Win"},
        {color: "#9400d3", label: "Loss"},
        {color: "#ff00ff", label: "Jackpot"}
    ];
    
    const tot = sectors.length;
    const arc = 2 * Math.PI / tot;
    let rotation = 0;
    let isSpinning = false;

    function drawWheel() {
        sectors.forEach((sector, i) => {
            const ang = arc * i + rotation;
            ctx.beginPath();
            ctx.fillStyle = sector.color;
            ctx.moveTo(200, 200);
            ctx.arc(200, 200, 200, ang, ang + arc);
            ctx.lineTo(200, 200);
            ctx.fill();
            
            ctx.save();
            ctx.translate(200, 200);
            ctx.rotate(ang + arc / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 20px sans-serif";
            ctx.fillText(sector.label, 180, 10);
            ctx.restore();
        };
    _init();
}
    }

    drawWheel();

    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        if(window.ArcadeSounds) window.ArcadeSounds.playClick();
        isSpinning = true;
        
        let spinAngle = Math.random() * Math.PI * 2 + Math.PI * 10;
        let start = null;
        let duration = 3000;
        let initialRotation = rotation;

        function animate(timestamp) {
            if (!start) start = timestamp;
            let progress = timestamp - start;
            if (progress < duration) {
                let easeOut = 1 - Math.pow(1 - progress / duration, 3);
                rotation = initialRotation + spinAngle * easeOut;
                drawWheel();
                requestAnimationFrame(animate);
            } else {
                rotation = initialRotation + spinAngle;
                drawWheel();
                isSpinning = false;
                determineResult();
            }
        }
        requestAnimationFrame(animate);
    });

    function determineResult() {
        let degrees = (rotation * 180 / Math.PI) % 360;
        let pointerAngle = (360 - degrees + 270) % 360;
        let sectorIndex = Math.floor(pointerAngle / (360 / tot));
        let result = sectors[sectorIndex].label;

        if(result.includes("Win") || result.includes("Jackpot")) {
            resultMsg.textContent = "You Won: " + result;
            if(window.ArcadeCore) window.ArcadeCore.trackWin("spin.html");
        } else {
            resultMsg.textContent = "Try Again!";
        }
        overlay.classList.remove('hidden');
    }

    closeOverlayBtn.addEventListener('click', () => {
        if(window.ArcadeSounds) window.ArcadeSounds.playClick();
        overlay.classList.add('hidden');
    });
});
