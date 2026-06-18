/* ========================================
   ULTIMATE TRUCK RACER - BLACK GOLD EDITION
   Complete Working Vanilla JavaScript
   ======================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ========================================
// CONFIG
// ========================================
const CONFIG = {
  roadWidth: 520,
  lanes: 3,
  truckWidth: 68,
  truckHeight: 112,
  truckBaseSpeed: 5.2,
  nitroSpeed: 8.5,
  fuelDrain: 0.028,
  fuelPickup: 28,
  coinValue: 10,
  xpPerCoin: 12,
  xpPerSecond: 1,
  levelXP: 120,
  trafficBaseSpeed: 3.2,
  trafficSpeedStep: 0.28,
  weatherChangeTime: 28000,
  dayNightTime: 45000,
  maxParticles: 250,
  saveKey: "utr_black_gold_save_v1",
};

// ========================================
// DOM ELEMENTS
// ========================================
const els = {
  startScreen: document.getElementById("start-screen"),
  pauseMenu: document.getElementById("pause-menu"),
  gameOverScreen: document.getElementById("game-over-screen"),
  garageScreen: document.getElementById("garage-screen"),
  shopScreen: document.getElementById("shop-screen"),
  hud: document.getElementById("hud"),
  mobileControls: document.getElementById("mobile-controls"),
  score: document.getElementById("score"),
  highScore: document.getElementById("high-score"),
  coins: document.getElementById("coins"),
  xp: document.getElementById("xp"),
  level: document.getElementById("level"),
  distance: document.getElementById("distance"),
  fuelFill: document.getElementById("fuel-fill"),
  fuelValue: document.getElementById("fuel-value"),
  finalScore: document.getElementById("final-score"),
  finalHighscore: document.getElementById("final-highscore"),
  finalCoins: document.getElementById("final-coins"),
  finalLevel: document.getElementById("final-level"),
  finalDistance: document.getElementById("final-distance"),
  finalXp: document.getElementById("final-xp"),
  shopCoins: document.getElementById("shop-coins"),
  truckList: document.getElementById("truck-list"),
  shopItems: document.getElementById("shop-items"),
  truckPreview: document.getElementById("truck-preview"),
  pauseBtn: document.getElementById("pause-btn"),
};

// ========================================
// CANVAS SIZE
// ========================================
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const pctx = els.truckPreview.getContext("2d");

// ========================================
// AUDIO
// ========================================
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}
function beep(type) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g);
  g.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  const presets = {
    click: [620, 0.08, "triangle"],
    coin: [980, 0.12, "sine"],
    crash: [140, 0.25, "sawtooth"],
    nitro: [300, 0.14, "square"],
    level: [1100, 0.2, "sine"],
  };
  const [freq, dur, wave] = presets[type] || presets.click;
  o.type = wave;
  o.frequency.setValueAtTime(freq, now);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.16, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  o.start(now);
  o.stop(now + dur + 0.02);
}

// ========================================
// GAME DATA
// ========================================
const truckTypes = {
  gold: { name: "Gold Truck", color: "#d4af37", cabin: "#fff0a8", price: 0, unlocked: true, speed: 5.2, fuelCap: 100 },
  monster: { name: "Monster Truck", color: "#ff4444", cabin: "#ffb0b0", price: 500, unlocked: false, speed: 5.5, fuelCap: 120 },
  cyber: { name: "Cyber Truck", color: "#00ff88", cabin: "#afffe0", price: 1000, unlocked: false, speed: 5.9, fuelCap: 140 },
};

const shopCatalog = [
  { id: "unlockMonster", name: "Unlock Monster Truck", price: 500, desc: "Unlocks a heavy red beast.", type: "unlockTruck" },
  { id: "unlockCyber", name: "Unlock Cyber Truck", price: 1000, desc: "Unlocks a futuristic racer.", type: "unlockTruck" },
  { id: "speedUp", name: "Upgrade Speed", price: 300, desc: "Permanent speed boost.", type: "upgradeSpeed" },
  { id: "fuelUp", name: "Upgrade Fuel", price: 250, desc: "Permanent fuel boost.", type: "upgradeFuel" },
  { id: "lifePack", name: "Extra Life", price: 180, desc: "Refills fuel instantly.", type: "fuelPack" },
];

let saveData = {
  highScore: 0,
  coinsBank: 0,
  selectedTruck: "gold",
  unlockedTrucks: ["gold"],
  speedBonus: 0,
  fuelBonus: 0,
};

function loadSave() {
  try {
    const raw = localStorage.getItem(CONFIG.saveKey);
    if (raw) saveData = { ...saveData, ...JSON.parse(raw) };
  } catch {}
}
function save() {
  try {
    localStorage.setItem(CONFIG.saveKey, JSON.stringify(saveData));
  } catch {}
}
loadSave();

let state = {
  running: false,
  paused: false,
  over: false,
  score: 0,
  coins: 0,
  xp: 0,
  level: 1,
  distance: 0,
  fuel: 100,
  weather: "sunny",
  timeOfDay: "day",
  startTime: performance.now(),
  lastSpawn: 0,
  lastCoinSpawn: 0,
  lastFuelSpawn: 0,
  lastPowerSpawn: 0,
  lastWeatherSwap: 0,
  lastCycleSwap: 0,
  screenShake: 0,
  nitroUntil: 0,
  shieldUntil: 0,
  magnetUntil: 0,
  turboUntil: 0,
  policeUntil: 0,
};

const keys = { left: false, right: false, nitro: false };

const player = {
  x: 0,
  y: 0,
  w: CONFIG.truckWidth,
  h: CONFIG.truckHeight,
  lane: 1,
  speed: CONFIG.truckBaseSpeed,
};

let traffic = [];
let coins = [];
let fuelPickups = [];
let powerUps = [];
let particles = [];
let roadScroll = 0;
let laneDashScroll = 0;
let bgScroll = 0;
let cityScroll = 0;
let selectedTruck = saveData.selectedTruck in truckTypes ? saveData.selectedTruck : "gold";

// ========================================
// HELPERS
// ========================================
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function roadMetrics() {
  const x = (canvas.width - CONFIG.roadWidth) / 2;
  const laneW = CONFIG.roadWidth / CONFIG.lanes;
  return { x, laneW, left: x, right: x + CONFIG.roadWidth };
}

function laneCenter(lane) {
  const m = roadMetrics();
  return m.left + lane * m.laneW + (m.laneW - player.w) / 2;
}

function resetPlayer() {
  player.lane = 1;
  player.x = laneCenter(1);
  player.y = canvas.height - player.h - 28;
  const t = truckTypes[selectedTruck];
  player.speed = t.speed + (saveData.speedBonus || 0);
}

function addParticle(x, y, vx, vy, size, color, life) {
  if (particles.length >= CONFIG.maxParticles) particles.shift();
  particles.push({ x, y, vx, vy, size, color, life });
}

function burst(x, y, color, count = 18, power = 3) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rand(0.5, power);
    addParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(1.5, 4), color, rand(0.4, 0.9));
  }
}

function rectsHit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function circleRectHit(c, r) {
  const cx = clamp(c.x, r.x, r.x + r.w);
  const cy = clamp(c.y, r.y, r.y + r.h);
  const dx = c.x - cx, dy = c.y - cy;
  return dx * dx + dy * dy < c.r * c.r;
}

function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// ========================================
// UI
// ========================================
function showOnly(screen) {
  [els.startScreen, els.pauseMenu, els.gameOverScreen, els.garageScreen, els.shopScreen].forEach(s => s.classList.add("hidden"));
  if (screen) screen.classList.remove("hidden");
}
function updateHUD() {
  els.score.textContent = Math.floor(state.score);
  els.highScore.textContent = saveData.highScore;
  els.coins.textContent = state.coins;
  els.xp.textContent = Math.floor(state.xp);
  els.level.textContent = state.level;
  els.distance.textContent = `${Math.floor(state.distance)}m`;
  const pct = clamp(state.fuel, 0, 100);
  els.fuelFill.style.width = `${pct}%`;
  els.fuelValue.textContent = `${Math.floor(pct)}%`;
}
function renderGarage() {
  els.truckList.innerHTML = "";
  Object.entries(truckTypes).forEach(([id, t]) => {
    const unlocked = saveData.unlockedTrucks.includes(id);
    const box = document.createElement("div");
    box.className = "truck-item" + (selectedTruck === id ? " selected" : "") + (!unlocked ? " locked" : "");
    box.innerHTML = `<div class="truck-name">${t.name}</div><div class="truck-status">${unlocked ? "Unlocked" : `Locked - ${t.price} coins`}</div>`;
    box.addEventListener("click", () => {
      if (!unlocked) return;
      selectedTruck = id;
      saveData.selectedTruck = id;
      save();
      renderGarage();
      drawTruckPreview();
      beep("click");
    });
    els.truckList.appendChild(box);
  });
  drawTruckPreview();
}
function renderShop() {
    els.shopCoins.textContent = saveData.coinsBank + state.coins;
  els.shopItems.innerHTML = "";
  shopCatalog.forEach(item => {
    const box = document.createElement("div");
    box.className = "shop-item";
    box.innerHTML = `<div class="shop-name">${item.name}</div><div class="shop-price">${item.price} coins</div><div class="shop-desc">${item.desc}</div>`;
    box.addEventListener("click", () => buyItem(item));
    els.shopItems.appendChild(box);
  });
}
function drawTruckPreview() {
  const t = truckTypes[selectedTruck];
  pctx.clearRect(0, 0, els.truckPreview.width, els.truckPreview.height);
  pctx.fillStyle = "#111";
  pctx.fillRect(0, 0, els.truckPreview.width, els.truckPreview.height);
  drawTruckShape(pctx, 95, 55, 110, 75, t.color, t.cabin, false, true);
}

// ========================================
// GAME FLOW
// ========================================
function startGame() {
  ensureAudio();
  beep("click");
  state = {
    ...state,
    running: true,
    paused: false,
    over: false,
    score: 0,
    coins: 0,
    xp: 0,
    level: 1,
    distance: 0,
    fuel: truckTypes[selectedTruck].fuelCap + (saveData.fuelBonus || 0),
    weather: "sunny",
    timeOfDay: "day",
    startTime: performance.now(),
    lastSpawn: 0,
    lastCoinSpawn: 0,
    lastFuelSpawn: 0,
    lastPowerSpawn: 0,
    lastWeatherSwap: 0,
    lastCycleSwap: 0,
    screenShake: 0,
    nitroUntil: 0,
    shieldUntil: 0,
    magnetUntil: 0,
    turboUntil: 0,
    policeUntil: 0,
  };
  traffic = [];
  coins = [];
  fuelPickups = [];
  powerUps = [];
  particles = [];
  roadScroll = 0;
  laneDashScroll = 0;
  bgScroll = 0;
  cityScroll = 0;
  resetPlayer();
  showOnly(null);
  els.hud.classList.remove("hidden");
  document.querySelector(".truck-footer").style.display = "none";
  if (isTouchDevice()) els.mobileControls.classList.remove("hidden");
  else els.mobileControls.classList.add("hidden");
}

function pauseGame() {
  if (!state.running || state.over) return;
  state.paused = !state.paused;
  showOnly(state.paused ? els.pauseMenu : null);
  els.hud.classList.toggle("hidden", state.paused);
}
function restartGame() {
  showOnly(null);
  startGame();
}
function quitToMenu() {
  state.running = false;
  state.paused = false;
  state.over = false;
  els.hud.classList.add("hidden");
  els.mobileControls.classList.add("hidden");
  showOnly(els.startScreen);
  document.querySelector(".truck-footer").style.display = "block";
}
function gameOver() {
  state.running = false;
  state.over = true;
  saveData.highScore = Math.max(saveData.highScore, Math.floor(state.score));
  saveData.coinsBank = (saveData.coinsBank || 0) + state.coins;
  save();
  els.finalScore.textContent = Math.floor(state.score);
  els.finalHighscore.textContent = saveData.highScore;
  els.finalCoins.textContent = state.coins;
  els.finalLevel.textContent = state.level;
  els.finalDistance.textContent = `${Math.floor(state.distance)}m`;
  els.finalXp.textContent = Math.floor(state.xp);
  showOnly(els.gameOverScreen);
  els.hud.classList.add("hidden");
  els.mobileControls.classList.add("hidden");
  document.querySelector(".truck-footer").style.display = "block";
  beep("crash");
}

// ========================================
// SHOP
// ========================================
function buyItem(item) {
  ensureAudio();
  if (state.coins < item.price) return;
  state.coins -= item.price;

  if (item.id === "unlockMonster" &&
    !saveData.unlockedTrucks.includes("monster")) {
    saveData.unlockedTrucks.push("monster");
}

if (item.id === "unlockCyber" &&
    !saveData.unlockedTrucks.includes("cyber")) {
    saveData.unlockedTrucks.push("cyber");
}
  if (item.type === "upgradeSpeed") saveData.speedBonus = (saveData.speedBonus || 0) + 0.35;
  if (item.type === "upgradeFuel") saveData.fuelBonus = (saveData.fuelBonus || 0) + 15;
  if (item.type === "fuelPack") state.fuel = Math.min(100 + (saveData.fuelBonus || 0), state.fuel + 50);

  save();
  renderShop();
  renderGarage();
  updateHUD();
  beep("click");
}

// ========================================
// POWER-UPS
// ========================================
function activatePower(type) {
  const now = performance.now();
  if (type === "nitro") state.nitroUntil = now + 4500;
  if (type === "shield") state.shieldUntil = now + 7000;
  if (type === "magnet") state.magnetUntil = now + 7000;
  if (type === "turbo") state.turboUntil = now + 6000;
  if (type === "life") state.fuel = Math.min(100 + (saveData.fuelBonus || 0), state.fuel + 45);
  beep("level");
}
function active(name) {
  const now = performance.now();
  if (name === "nitro") return now < state.nitroUntil || keys.nitro;
  if (name === "shield") return now < state.shieldUntil;
  if (name === "magnet") return now < state.magnetUntil;
  if (name === "turbo") return now < state.turboUntil;
  return false;
}

// ========================================
// SPAWN
// ========================================
function spawnTraffic() {
  const m = roadMetrics();
  const lane = Math.floor(Math.random() * CONFIG.lanes);
  const w = rand(52, 62);
  const h = rand(84, 110);
  traffic.push({
    x: m.left + lane * m.laneW + (m.laneW - w) / 2 + rand(-6, 6),
    y: -h - 20,
    w, h,
    lane,
    color: choice(["#ff4444", "#44ff88", "#4d8dff", "#ff8b2d", "#d9d9d9"]),
    speed: CONFIG.trafficBaseSpeed + state.level * CONFIG.trafficSpeedStep + rand(0, 1.4),
  });
}
function spawnCoin() {
  const m = roadMetrics();
  coins.push({ x: rand(m.left + 20, m.right - 20), y: -20, r: 12, vy: 2.3 + state.level * 0.18, t: 0 });
}
function spawnFuel() {
  const m = roadMetrics();
  fuelPickups.push({ x: rand(m.left + 28, m.right - 28), y: -30, w: 24, h: 32, vy: 2.4 + state.level * 0.12 });
}
function spawnPower() {
  const m = roadMetrics();
  powerUps.push({
    x: rand(m.left + 30, m.right - 30),
    y: -30,
    r: 16,
    vy: 2.7 + state.level * 0.12,
    type: choice(["nitro", "shield", "magnet", "turbo", "life"]),
  });
}

// ========================================
// UPDATE
// ========================================
function update(dt) {
  if (!state.running || state.paused || state.over) return;

  const now = performance.now();
  const nitro = active("nitro");
  const turbo = active("turbo");
  const speed = player.speed + (nitro ? 3.2 : 0) + (turbo ? 1.3 : 0);

  if (keys.left) player.x -= speed;
  if (keys.right) player.x += speed;

  const m = roadMetrics();
  player.x = clamp(player.x, m.left + 6, m.right - player.w - 6);

  roadScroll += speed * 1.4;
  laneDashScroll += speed * 1.7;
  bgScroll += speed * 0.22;
  cityScroll += speed * 0.12;

  state.distance += speed * 0.16;
  state.score += speed * 0.08 + state.level * 0.02;
  state.xp += CONFIG.xpPerSecond * dt + (state.coins > 0 ? 0 : 0);

  state.fuel -= CONFIG.fuelDrain * (1 + state.level * 0.13) * (nitro ? 1.25 : 1) * dt * 60;
  if (state.fuel <= 0) return gameOver();

  if (state.xp >= state.level * CONFIG.levelXP) {
    state.level++;
    state.xp = 0;
    beep("level");
    burst(player.x + player.w / 2, player.y + player.h / 2, "#d4af37", 24, 4);
  }

  if (now - state.lastSpawn > Math.max(420, 950 - state.level * 55)) {
    spawnTraffic();
    state.lastSpawn = now;
  }
  if (now - state.lastCoinSpawn > Math.max(260, 700 - state.level * 25)) {
    spawnCoin();
    state.lastCoinSpawn = now;
  }
  if (now - state.lastFuelSpawn > 5000) {
    if (Math.random() < 0.6) spawnFuel();
    state.lastFuelSpawn = now;
  }
  if (now - state.lastPowerSpawn > 8000) {
    if (Math.random() < 0.55) spawnPower();
    state.lastPowerSpawn = now;
  }
  if (now - state.lastWeatherSwap > CONFIG.weatherChangeTime) {
    state.weather = choice(["sunny", "rain", "night", "fog"]);
    state.lastWeatherSwap = now;
  }
  if (now - state.lastCycleSwap > CONFIG.dayNightTime) {
    state.timeOfDay = state.timeOfDay === "day" ? "night" : "day";
    state.lastCycleSwap = now;
  }

  traffic.forEach((v, i) => {
    v.y += v.speed * (1 + state.level * 0.03);
    if (rectsHit(player, v)) {
      if (active("shield")) {
        traffic.splice(i, 1);
        burst(v.x + v.w / 2, v.y + v.h / 2, "#00ff88", 24, 4);
        state.shieldUntil = 0;
      } else {
        state.fuel -= 20;
        state.screenShake = 14;
        traffic.splice(i, 1);
        beep("crash");
        burst(v.x + v.w / 2, v.y + v.h / 2, "#ff4444", 28, 4.5);
      }
    }
    if (v.y > canvas.height + 140) traffic.splice(i, 1);
  });

  coins.forEach((c, i) => {
    c.y += c.vy;
    c.t += dt;
    if (active("magnet")) {
      const dx = (player.x + player.w / 2) - c.x;
      const dy = (player.y + player.h / 2) - c.y;
      const d = Math.hypot(dx, dy);
      if (d < 240) {
        c.x += dx * 0.08;
        c.y += dy * 0.08;
      }
    }
    if (circleRectHit(c, player)) {
      state.coins += CONFIG.coinValue;
      state.xp += CONFIG.xpPerCoin;
      burst(c.x, c.y, "#d4af37", 18, 3.2);
      coins.splice(i, 1);
      beep("coin");
    } else if (c.y > canvas.height + 50) coins.splice(i, 1);
  });

  fuelPickups.forEach((f, i) => {
    f.y += f.vy;
    if (rectsHit(player, f)) {
      state.fuel = Math.min(100 + (saveData.fuelBonus || 0), state.fuel + CONFIG.fuelPickup);
      burst(f.x, f.y, "#ff8800", 20, 3);
      fuelPickups.splice(i, 1);
      beep("coin");
    } else if (f.y > canvas.height + 50) fuelPickups.splice(i, 1);
  });

  powerUps.forEach((p, i) => {
    p.y += p.vy;
    if (circleRectHit(p, player)) {
      activatePower(p.type);
      burst(p.x, p.y, "#ffffff", 24, 3.5);
      powerUps.splice(i, 1);
    } else if (p.y > canvas.height + 50) powerUps.splice(i, 1);
  });

  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.01;
    p.life -= 0.012;
    if (p.life <= 0) particles.splice(i, 1);
  });

  if (state.screenShake > 0) state.screenShake *= 0.86;
  updateHUD();
}

// ========================================
// DRAWING
// ========================================
function skyColor() {
  if (state.weather === "night") return "#050510";
  if (state.weather === "rain") return "#1b1c26";
  if (state.weather === "fog") return "#2a2a2a";
  return "#09121f";
}
function drawBackground() {
  ctx.fillStyle = skyColor();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const horizon = canvas.height * 0.42;
  const grad = ctx.createLinearGradient(0, horizon, 0, canvas.height);
  grad.addColorStop(0, "#0b0b0f");
  grad.addColorStop(1, "#050505");
  ctx.fillStyle = grad;
  ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);
}
function drawCity() {
  const horizon = canvas.height * 0.35;
  for (let i = -1; i < 18; i++) {
    const x = i * 95 - (cityScroll % 95);
    const h = 60 + ((i * 37) % 180);
    ctx.fillStyle = i % 3 === 0 ? "#181818" : "#101010";
    ctx.fillRect(x, horizon - h, 80, h);
    ctx.fillStyle = state.timeOfDay === "night" ? "rgba(255,215,120,0.8)" : "rgba(255,200,90,0.4)";
    for (let wy = horizon - h + 10; wy < horizon - 10; wy += 18) {
      for (let wx = x + 10; wx < x + 70; wx += 16) {
        if (Math.random() > 0.5) ctx.fillRect(wx, wy, 7, 10);
      }
    }
  }
}
function drawRoad() {
  const m = roadMetrics();
  ctx.fillStyle = "#151515";
  ctx.fillRect(m.left, 0, CONFIG.roadWidth, canvas.height);

  const borderGrad = ctx.createLinearGradient(m.left - 10, 0, m.left - 2, 0);
  borderGrad.addColorStop(0, "#d4af37");
  borderGrad.addColorStop(1, "#6f5612");
  ctx.fillStyle = borderGrad;
  ctx.fillRect(m.left - 10, 0, 10, canvas.height);
  ctx.fillRect(m.right, 0, 10, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 3;
  ctx.setLineDash([44, 28]);
  ctx.lineDashOffset = -laneDashScroll;
  for (let i = 1; i < CONFIG.lanes; i++) {
    const x = m.left + i * m.laneW;
    ctx.beginPath();
    ctx.moveTo(x, -50);
    ctx.lineTo(x, canvas.height + 50);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}
function drawTruckShape(g, x, y, w, h, body, cabin, nitro, preview = false) {
  g.save();
  g.shadowColor = body;
  g.shadowBlur = 20;

  g.fillStyle = "rgba(0,0,0,0.45)";
  g.beginPath();
  g.ellipse(x + w / 2, y + h + 6, w / 2 + 8, 10, 0, 0, Math.PI * 2);
  g.fill();

  g.shadowBlur = 0;
  g.fillStyle = "#101010";
  g.fillRect(x - 6, y + 18, 12, 25);
  g.fillRect(x + w - 6, y + 18, 12, 25);
  g.fillRect(x - 6, y + h - 35, 12, 25);
  g.fillRect(x + w - 6, y + h - 35, 12, 25);

  g.fillStyle = "#d4af37";
  g.fillRect(x - 3, y + 24, 6, 14);
  g.fillRect(x + w - 3, y + 24, 6, 14);
  g.fillRect(x - 3, y + h - 29, 6, 14);
  g.fillRect(x + w - 3, y + h - 29, 6, 14);

  g.fillStyle = body;
  g.fillRect(x, y + 30, w, h - 40);
  g.fillStyle = cabin;
  g.fillRect(x + 5, y, w - 10, 36);
  g.fillStyle = "#8fd8ff";
  g.fillRect(x + 11, y + 6, w - 22, 18);

  g.fillStyle = "#fff8c6";
  g.beginPath();
  g.ellipse(x + 12, y + 10, 5, 7, 0, 0, Math.PI * 2);
  g.ellipse(x + w - 12, y + 10, 5, 7, 0, 0, Math.PI * 2);
  g.fill();

  g.fillStyle = "rgba(255,255,140,0.18)";
  g.beginPath();
  g.ellipse(x + 12, y + 14, 13, 18, 0, 0, Math.PI * 2);
  g.ellipse(x + w - 12, y + 14, 13, 18, 0, 0, Math.PI * 2);
  g.fill();

  if (nitro) {
    const fx = preview ? x + 16 : x + 15;
    g.fillStyle = "#ff6b00";
    g.beginPath();
    g.moveTo(fx, y + h);
    g.lineTo(fx + 10, y + h + rand(15, 24));
    g.lineTo(fx + 20, y + h);
    g.fill();
    g.fillStyle = "#ffd000";
    g.beginPath();
    g.moveTo(fx + 10, y + h);
    g.lineTo(fx + 16, y + h + rand(10, 16));
    g.lineTo(fx + 22, y + h);
    g.fill();
  }

  g.restore();
}
function drawTruck() {
  const t = truckTypes[selectedTruck];
  drawTruckShape(ctx, player.x, player.y, player.w, player.h, t.color, t.cabin, active("nitro"));
  if (active("shield")) {
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(player.x + player.w / 2, player.y + player.h / 2, player.w / 2 + 12, player.h / 2 + 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
function drawTraffic() {
  traffic.forEach(v => {
    drawTruckShape(ctx, v.x, v.y, v.w, v.h, v.color, "#bcbcbc", false);
  });
}
function drawCoins() {
  coins.forEach(c => {
    ctx.fillStyle = "rgba(212,175,55,0.25)";
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r + 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff0a8";
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("¤", c.x, c.y + 0.5);
  });
}
function drawFuel() {
  fuelPickups.forEach(f => {
    ctx.fillStyle = "rgba(255,120,0,0.18)";
    ctx.fillRect(f.x - 20, f.y - 25, 40, 50);
    ctx.fillStyle = "#ff6b00";
    ctx.fillRect(f.x - 12, f.y - 15, 24, 32);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("F", f.x, f.y + 1);
  });
}
function drawPowerUps() {
  powerUps.forEach(p => {
    const map = {
      nitro: ["#ff6b00", "⚡"],
      shield: ["#00ff88", "⛨"],
      magnet: ["#4da3ff", "⌁"],
      turbo: ["#d4af37", "T"],
      life: ["#ff4455", "♥"],
    };
    const [col, sym] = map[p.type];
    ctx.fillStyle = `rgba(255,255,255,0.16)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sym, p.x, p.y + 0.5);
  });
}
function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}
function drawWeather() {
  if (state.weather === "rain") {
    ctx.strokeStyle = "rgba(160,190,255,0.55)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 90; i++) {
      const x = (i * 83 + roadScroll * 3) % canvas.width;
      const y = (i * 51 + bgScroll * 5) % canvas.height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 4, y + 12);
      ctx.stroke();
    }
  }
  if (state.weather === "fog") {
    ctx.fillStyle = "rgba(210,210,210,0.13)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (state.timeOfDay === "night") {
    ctx.fillStyle = "rgba(0,0,25,0.34)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
function render() {
  ctx.save();
  if (state.screenShake > 1) {
    ctx.translate(rand(-state.screenShake, state.screenShake), rand(-state.screenShake, state.screenShake));
  }

  drawBackground();
  drawCity();
  drawRoad();
  drawTraffic();
  drawCoins();
  drawFuel();
  drawPowerUps();
  drawTruck();
  drawParticles();
  drawWeather();

  ctx.restore();
}

// ========================================
// LOOP
// ========================================
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  if (state.running && !state.paused && !state.over) update(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ========================================
// INPUT
// ========================================
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "Shift") { keys.nitro = true; ensureAudio(); beep("nitro"); }
  if (e.key === "Escape" && state.running) pauseGame();
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "Shift") keys.nitro = false;
});

function bindHold(btn, onDown, onUp) {
  if (!btn) return;
  btn.addEventListener("mousedown", onDown);
  btn.addEventListener("mouseup", onUp);
  btn.addEventListener("mouseleave", onUp);
  btn.addEventListener("touchstart", e => { e.preventDefault(); onDown(); }, { passive: false });
  btn.addEventListener("touchend", e => { e.preventDefault(); onUp(); }, { passive: false });
}
bindHold(document.getElementById("mobile-left"), () => keys.left = true, () => keys.left = false);
bindHold(document.getElementById("mobile-right"), () => keys.right = true, () => keys.right = false);
bindHold(document.getElementById("mobile-nitro"), () => { keys.nitro = true; ensureAudio(); beep("nitro"); }, () => keys.nitro = false);

// ========================================
// BUTTONS
// ========================================
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("garage-btn").addEventListener("click", () => { ensureAudio(); renderGarage(); renderShop(); showOnly(els.garageScreen); beep("click"); });
document.getElementById("shop-btn").addEventListener("click", () => { ensureAudio(); renderShop(); showOnly(els.shopScreen); beep("click"); });
document.getElementById("resume-btn").addEventListener("click", pauseGame);
document.getElementById("restart-btn").addEventListener("click", restartGame);
document.getElementById("quit-btn").addEventListener("click", quitToMenu);
document.getElementById("game-over-restart").addEventListener("click", restartGame);
document.getElementById("game-over-menu").addEventListener("click", quitToMenu);
document.getElementById("garage-back").addEventListener("click", () => showOnly(els.startScreen));
document.getElementById("shop-back").addEventListener("click", () => showOnly(els.startScreen));
els.pauseBtn.addEventListener("click", pauseGame);

// Ensure clicks unlock audio
["start-btn","garage-btn","shop-btn","resume-btn","restart-btn","quit-btn","game-over-restart","game-over-menu","garage-back","shop-back","pause-btn"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("pointerdown", ensureAudio);
});

// ========================================
// INITIAL STATE
// ========================================
showOnly(els.startScreen);
els.hud.classList.add("hidden");
els.mobileControls.classList.toggle("hidden", !isTouchDevice());
renderGarage();
updateHUD();
resetPlayer();