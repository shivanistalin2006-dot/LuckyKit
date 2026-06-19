"use strict";

const state = {
  level: 1,
  score: 0,
  lives: 3,
  streak: 0,
  maxStreak: 0,
  combo: 1,
  correct: 0,
  total: 0,
  accuracy: 100,
  highScore: Number(localStorage.getItem("mindlink_highscore") || 0),
  sequence: [],
  inputSequence: [],
  showing: false,
  locked: false,
  paused: false,
  timer: null
};

const ITEM_SETS = [
  ["🍎","🔵","⭐","🍌","🍊","🔴","🟢","🍓"],
  ["🟢","🔴","🔵","🟡","🟣","🟠"],
  ["1","2","3","4","5","6","7","8","9"],
  ["★","♠","♦","♥","♣","⚡","☀","☁"]
];

const $ = (id) => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
}

function updateHUD() {
  $("levelText").textContent = state.level;
  $("scoreText").textContent = state.score;
  $("comboText").textContent = `x${state.combo}`;
  $("livesText").textContent = "❤️".repeat(state.lives);
  $("streakText").textContent = state.streak;
  $("accuracyText").textContent = `${state.accuracy}%`;
  $("homeHighScore").textContent = state.highScore;
  $("pauseInfo").textContent = `Level ${state.level} | Score ${state.score}`;
}

function createParticles() {
  const p = $("particles"), s = $("sparkles"), d = $("dust");
  p.innerHTML = ""; s.innerHTML = ""; d.innerHTML = "";
  for (let i = 0; i < 34; i++) {
    const el = document.createElement("span");
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${80 + Math.random() * 20}%`;
    el.style.animationDelay = `${Math.random() * 9}s`;
    el.style.animationDuration = `${7 + Math.random() * 5}s`;
    p.appendChild(el);
  }
  for (let i = 0; i < 16; i++) {
    const el = document.createElement("span");
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${Math.random() * 100}%`;
    el.style.animationDelay = `${Math.random() * 2}s`;
    s.appendChild(el);
  }
  for (let i = 0; i < 24; i++) {
    const el = document.createElement("span");
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${Math.random() * 100}%`;
    el.style.animationDelay = `${Math.random() * 12}s`;
    d.appendChild(el);
  }
}

function playTone(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const notes = {
      correct: [523, 659, 784],
      wrong: [220, 180],
      level: [523, 659, 784, 1046],
      gameover: [400, 320, 220]
    }[type] || [440];

    osc.type = "sine";
    gain.gain.setValueAtTime(0.22, now);
    notes.forEach((f, i) => osc.frequency.setValueAtTime(f, now + i * 0.12));
    gain.gain.exponentialRampToValueAtTime(0.001, now + notes.length * 0.14 + 0.08);
    osc.start(now);
    osc.stop(now + notes.length * 0.14 + 0.1);
  } catch (_) {}
}

function getLevelItems(level) {
  const set = ITEM_SETS[Math.floor(Math.random() * ITEM_SETS.length)];
  const len = level + 2;
  const seq = [];
  for (let i = 0; i < len; i++) seq.push(set[Math.floor(Math.random() * set.length)]);
  return seq;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function renderSequence() {
  $("sequenceItems").innerHTML = "";
  state.sequence.forEach((it) => {
    const el = document.createElement("div");
    el.className = "item";
    el.textContent = it;
    $("sequenceItems").appendChild(el);
  });
}

function renderInputItems() {
  $("inputItems").innerHTML = "";

  const distractors = ITEM_SETS.flat().filter(x => !state.sequence.includes(x));
  const candidates = shuffle([...state.sequence, ...distractors]);
  const used = [];
  const final = [];

  for (const item of candidates) {
    if (!used.includes(item)) {
      used.push(item);
      final.push(item);
    }
    if (final.length >= Math.max(8, state.sequence.length + 4)) break;
  }

  state.sequence.forEach((required) => {
    if (!final.includes(required)) final.unshift(required);
  });

  const uniq = [...new Set(final)].slice(0, Math.max(8, state.sequence.length + 4));

  uniq.forEach((it) => {
    const el = document.createElement("div");
    el.className = "item";
    el.textContent = it;
    el.addEventListener("click", () => handleClick(it, el));
    $("inputItems").appendChild(el);
  });
}

function startSequenceRound() {
  state.showing = true;
  state.locked = true;
  state.inputSequence = [];
  $("yourSeq").innerHTML = "";
  $("statusText").textContent = "Watch the sequence carefully...";
  $("sequenceItems").style.opacity = "1";
  $("sequenceItems").style.transform = "scale(1)";
  $("sequenceItems").style.display = "flex";
  $("inputItems").innerHTML = "";

  state.sequence = getLevelItems(state.level);
  renderSequence();

  clearTimeout(state.timer);
  state.timer = setTimeout(() => {
    $("sequenceItems").style.opacity = "0";
    $("statusText").textContent = "Now choose the correct items!";
    setTimeout(() => {
      state.showing = false;
      state.locked = false;
      $("sequenceItems").innerHTML = "";
      renderInputItems();
      $("statusText").textContent = "Tap the items in order";
    }, 700);
  }, 2200 + state.level * 350);
}

function nextLevel() {
  state.level += 1;
  state.combo = 1;
  state.streak = 0;
  playTone("level");
  updateHUD();
  startSequenceRound();
}

function handleClick(item, el) {
  if (state.locked || state.showing || state.paused) return;

  const index = state.inputSequence.length;
  const expected = state.sequence[index];

  if (item === expected) {
    el.classList.add("correct");
    state.inputSequence.push(item);
    state.correct += 1;
    state.total += 1;
    state.streak += 1;
    state.maxStreak = Math.max(state.maxStreak, state.streak);

    if (state.streak >= 5) state.combo = 5;
    else if (state.streak >= 3) state.combo = 3;
    else if (state.streak >= 2) state.combo = 2;
    else state.combo = 1;

    let points = 100 * state.combo;
    if (state.streak > 1) points += 50;
    state.score += points;

    const ch = document.createElement("i");
    ch.textContent = item;
    $("yourSeq").appendChild(ch);

    state.accuracy = Math.round((state.correct / state.total) * 100);
    updateHUD();
    playTone("correct");

    if (state.inputSequence.length === state.sequence.length) {
      state.locked = true;
      setTimeout(() => {
        if (state.score > state.highScore) {
          state.highScore = state.score;
          localStorage.setItem("mindlink_highscore", String(state.highScore));
        }
        updateHUD();
        nextLevel();
      }, 700);
    }
  } else {
    el.classList.add("wrong");
    state.lives -= 1;
    state.total += 1;
    state.streak = 0;
    state.combo = 1;
    state.accuracy = Math.round((state.correct / state.total) * 100);
    updateHUD();
    playTone("wrong");

    if (state.lives <= 0) {
      setTimeout(endGame, 600);
    }
  }
}

function startGame() {
  state.level = 1;
  state.score = 0;
  state.lives = 3;
  state.streak = 0;
  state.maxStreak = 0;
  state.combo = 1;
  state.correct = 0;
  state.total = 0;
  state.accuracy = 100;
  state.sequence = [];
  state.inputSequence = [];
  state.showing = false;
  state.locked = false;
  state.paused = false;

  $("newHigh").hidden = true;
  $("sequenceItems").style.opacity = "1";
  $("sequenceItems").style.display = "flex";
  $("sequenceItems").innerHTML = "";
  $("inputItems").innerHTML = "";
  $("yourSeq").innerHTML = "";
  $("statusText").textContent = "Get ready...";
  updateHUD();
  showScreen("gameScreen");
  setTimeout(startSequenceRound, 500);
}

function endGame() {
  playTone("gameover");
  $("finalScore").textContent = state.score;
  $("finalLevel").textContent = state.level;
  $("finalAccuracy").textContent = `${state.accuracy}%`;
  $("finalStreak").textContent = state.maxStreak;

  const isNew = state.score >= state.highScore;
  $("newHigh").hidden = !isNew;
  if (isNew) {
    state.highScore = state.score;
    localStorage.setItem("mindlink_highscore", String(state.highScore));
  }

  updateHUD();
  showScreen("gameOverScreen");
}

function showHome() {
  state.paused = false;
  $("homeHighScore").textContent = state.highScore;
  showScreen("homeScreen");
}

function showHowTo() {
  showScreen("howToScreen");
}

function pauseGame() {
  if ($("gameScreen").classList.contains("active")) {
    state.paused = true;
    showScreen("pauseScreen");
  }
}

function resumeGame() {
  state.paused = false;
  showScreen("gameScreen");
}

function quitGame() {
  state.paused = false;
  showHome();
}

function bindUI() {
  $("startBtn").addEventListener("click", startGame);
  $("howToBtn").addEventListener("click", showHowTo);
  $("backFromHowTo").addEventListener("click", showHome);
  $("homeBtn").addEventListener("click", showHome);
  $("pauseBtn").addEventListener("click", pauseGame);
  $("resumeBtn").addEventListener("click", resumeGame);
  $("quitBtn").addEventListener("click", quitGame);
  $("retryBtn").addEventListener("click", startGame);
  $("homeFromGoBtn").addEventListener("click", showHome);
}

document.addEventListener("DOMContentLoaded", () => {
  createParticles();
  bindUI();
  updateHUD();
  showHome();
});