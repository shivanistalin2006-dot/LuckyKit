export function drawConnections(boardElement) {
    let svg = document.getElementById('board-svg');
    if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = "board-svg";
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.pointerEvents = "none";
        svg.style.zIndex = "2";
        boardElement.appendChild(svg);
    }
    svg.innerHTML = ''; // clear

    const getCoords = (num) => {
        let r = Math.floor((num - 1) / 10);
        let actualCol = (num - 1) % 10;
        let c = (r % 2 === 0) ? actualCol : (9 - actualCol);
        return {
            x: c * 10 + 5,
            y: (9 - r) * 10 + 5
        };
    };

    const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };
    const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };

    // Draw Ladders
    for (let [start, end] of Object.entries(ladders)) {
        let p1 = getCoords(parseInt(start));
        let p2 = getCoords(end);
        
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const offsetX = Math.cos(angle + Math.PI/2) * 2.5; // Wider ladder
        const offsetY = Math.sin(angle + Math.PI/2) * 2.5;

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.style.stroke = "#8B4513"; // SaddleBrown real wood color
        g.style.strokeWidth = "1.2";
        g.style.strokeLinecap = "round";
        g.style.filter = "drop-shadow(1px 1px 2px rgba(0,0,0,0.8))";

        const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line1.setAttribute("x1", p1.x + offsetX); line1.setAttribute("y1", p1.y + offsetY);
        line1.setAttribute("x2", p2.x + offsetX); line1.setAttribute("y2", p2.y + offsetY);
        g.appendChild(line1);

        const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line2.setAttribute("x1", p1.x - offsetX); line2.setAttribute("y1", p1.y - offsetY);
        line2.setAttribute("x2", p2.x - offsetX); line2.setAttribute("y2", p2.y - offsetY);
        g.appendChild(line2);

        // Draw rungs
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const steps = Math.floor(dist / 4);
        for(let i=1; i<steps; i++) {
            let rx = p1.x + (p2.x - p1.x) * (i/steps);
            let ry = p1.y + (p2.y - p1.y) * (i/steps);
            const rung = document.createElementNS("http://www.w3.org/2000/svg", "line");
            rung.setAttribute("x1", rx + offsetX); rung.setAttribute("y1", ry + offsetY);
            rung.setAttribute("x2", rx - offsetX); rung.setAttribute("y2", ry - offsetY);
            rung.style.strokeWidth = "1";
            g.appendChild(rung);
        }
        svg.appendChild(g);
    }

    // Draw Snakes
    for (let [start, end] of Object.entries(snakes)) {
        let p1 = getCoords(parseInt(start)); // Head
        let p2 = getCoords(end); // Tail
        
        // Bezier curve to make it snake-like
        const cx1 = p1.x + (p2.x - p1.x) * 0.2 + (Math.random() * 15 - 7.5);
        const cy1 = p1.y + (p2.y - p1.y) * 0.2 + (Math.random() * 15 - 7.5);
        const cx2 = p1.x + (p2.x - p1.x) * 0.8 + (Math.random() * 15 - 7.5);
        const cy2 = p1.y + (p2.y - p1.y) * 0.8 + (Math.random() * 15 - 7.5);

        // Snake Body (Thick, real snake colors)
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`);
        path.style.stroke = "#15803d"; // Dark green real snake body
        path.style.strokeWidth = "2.5";
        path.style.fill = "none";
        path.style.strokeLinecap = "round";
        path.style.filter = "drop-shadow(2px 2px 2px rgba(0,0,0,0.9))";
        
        // Snake Underbelly (Light green, dashed to look like scales)
        const pathUnder = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathUnder.setAttribute("d", `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`);
        pathUnder.style.stroke = "#4ade80"; 
        pathUnder.style.strokeWidth = "1.5";
        pathUnder.style.strokeDasharray = "1 1.5";
        pathUnder.style.fill = "none";
        pathUnder.style.strokeLinecap = "round";

        svg.appendChild(path);
        svg.appendChild(pathUnder);

        // Snake Head Emoji 🐍
        const head = document.createElementNS("http://www.w3.org/2000/svg", "text");
        head.setAttribute("x", p1.x);
        head.setAttribute("y", p1.y + 1.5); // Slight vertical offset to center emoji
        head.setAttribute("font-size", "5px"); // Scales with viewBox 100x100
        head.setAttribute("text-anchor", "middle");
        head.setAttribute("dominant-baseline", "middle");
        head.textContent = "🐍";
        head.style.filter = "drop-shadow(1px 1px 1px rgba(0,0,0,0.8))";
        
        // Rotate head to face the body direction
        const angle = Math.atan2(cy1 - p1.y, cx1 - p1.x) * (180 / Math.PI) - 90;
        head.setAttribute("transform", `rotate(${angle}, ${p1.x}, ${p1.y})`);
        
        svg.appendChild(head);
    }
}
