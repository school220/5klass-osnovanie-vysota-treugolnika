/**
 * 5th Grade Mathematics: Interactive Smartboard Web Application
 * Topic: Triangle Base and Height (Основание и высота треугольника)
 */

// =============================================================================
// 1. AUDIO SYNTHESIZER (Web Audio API - Works 100% Offline)
// =============================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.22, 0.15), idx * 80);
    });
  }

  playClick() {
    this.playTone(600, 'sine', 0.05, 0.08);
  }

  playPop() {
    this.playTone(850, 'sine', 0.08, 0.12);
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    this.playTone(220, 'sawtooth', 0.25, 0.1);
  }

  playChime() {
    if (!this.enabled) return;
    this.init();
    [784, 659, 587, 523].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.5, 0.2), i * 200);
    });
  }
}

const sfx = new SoundFX();

// =============================================================================
// 2. CONFETTI CANNON (Optimized for 60fps)
// =============================================================================
class ConfettiCannon {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(count = 45) {
    const colors = ['#dc2626', '#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width * (0.2 + Math.random() * 0.6),
        y: this.canvas.height * 0.4 + (Math.random() * 50 - 25),
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        alpha: 1,
        gravity: 0.42
      });
    }

    if (!this.running) {
      this.running = true;
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rSpeed;
      p.alpha -= 0.009;

      if (p.alpha <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.running = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new ConfettiCannon('confettiCanvas');

// =============================================================================
// 3. WHITEBOARD PEN / DRAWING OVERLAY (Touch & Stylus optimized)
// =============================================================================
class WhiteboardPen {
  constructor() {
    this.overlay = document.getElementById('drawingOverlay');
    this.canvas = document.getElementById('drawingCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.color = '#f59e0b';
    this.lineWidth = 4;
    this.isEraser = false;
    this.active = false;
    this.lastX = 0;
    this.lastY = 0;

    this.initCanvasSize();
    this.bindEvents();
    window.addEventListener('resize', () => this.initCanvasSize());
  }

  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    const penToggleBtn = document.getElementById('penToggleBtn');
    const closePenBtn = document.getElementById('closePenBtn');
    const clearBtn = document.getElementById('clearCanvasBtn');
    const eraserBtn = document.getElementById('eraserBtn');

    penToggleBtn.addEventListener('click', () => this.toggle());
    closePenBtn.addEventListener('click', () => this.deactivate());
    clearBtn.addEventListener('click', () => this.clear());

    eraserBtn.addEventListener('click', () => {
      this.isEraser = !this.isEraser;
      eraserBtn.classList.toggle('active', this.isEraser);
      sfx.playClick();
    });

    document.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.color = dot.getAttribute('data-color');
        this.isEraser = false;
        eraserBtn.classList.remove('active');
        sfx.playClick();
      });
    });

    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.lineWidth = parseInt(btn.getAttribute('data-size'), 10);
        sfx.playClick();
      });
    });

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.active) return;
      this.isDrawing = true;
      try { this.canvas.setPointerCapture(e.pointerId); } catch(err) {}

      const pos = getPos(e);
      this.lastX = pos.x;
      this.lastY = pos.y;

      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      if (this.isEraser) {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.lineWidth = this.lineWidth * 4;
      } else {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDrawing || !this.active) return;
      const pos = getPos(e);

      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();

      this.lastX = pos.x;
      this.lastY = pos.y;
      e.preventDefault();
    }, { passive: false });

    const endPointer = (e) => {
      if (this.isDrawing) {
        this.isDrawing = false;
        try { this.canvas.releasePointerCapture(e.pointerId); } catch(err) {}
      }
    };

    this.canvas.addEventListener('pointerup', endPointer);
    this.canvas.addEventListener('pointercancel', endPointer);
  }

  toggle() {
    this.active ? this.deactivate() : this.activate();
  }

  activate() {
    this.active = true;
    this.overlay.classList.add('active');
    document.getElementById('penToggleBtn').classList.add('active');
    sfx.playClick();
  }

  deactivate() {
    this.active = false;
    this.overlay.classList.remove('active');
    document.getElementById('penToggleBtn').classList.remove('active');
    sfx.playClick();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    sfx.playPop();
  }
}

const whiteboardPen = new WhiteboardPen();

// =============================================================================
// 4. LESSON TIMER (45 MINS & PRESETS)
// =============================================================================
class LessonTimer {
  constructor() {
    this.totalSeconds = 45 * 60;
    this.initialSeconds = 45 * 60;
    this.timerId = null;
    this.isRunning = false;

    this.display = document.getElementById('timerDisplay');
    this.displayBtn = document.getElementById('timerDisplayBtn');
    this.dropdown = document.getElementById('timerDropdown');
    this.toggleBtn = document.getElementById('timerToggleBtn');
    this.resetBtn = document.getElementById('timerResetBtn');

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.displayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dropdown.classList.toggle('show');
      sfx.playClick();
    });

    document.addEventListener('click', (e) => {
      if (!document.getElementById('timerWidget').contains(e.target)) {
        this.dropdown.classList.remove('show');
      }
    });

    this.toggleBtn.addEventListener('click', () => {
      this.isRunning ? this.pause() : this.start();
      sfx.playClick();
    });

    this.resetBtn.addEventListener('click', () => {
      this.reset();
      sfx.playPop();
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.getAttribute('data-mins'), 10);
        this.setTimer(mins);
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sfx.playClick();
      });
    });
  }

  setTimer(minutes) {
    this.pause();
    this.totalSeconds = minutes * 60;
    this.initialSeconds = this.totalSeconds;
    this.render();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.toggleBtn.textContent = '⏸ Пауза';
    this.toggleBtn.classList.remove('play');
    this.toggleBtn.classList.add('pause');
    this.displayBtn.classList.add('running');

    this.timerId = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.render();
      } else {
        this.pause();
        sfx.playChime();
        confetti.fire(60);
        alert('⏰ Время этапа урока истекло!');
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.timerId);
    this.toggleBtn.textContent = '▶ Старт';
    this.toggleBtn.classList.remove('pause');
    this.toggleBtn.classList.add('play');
    this.displayBtn.classList.remove('running');
  }

  reset() {
    this.pause();
    this.totalSeconds = this.initialSeconds;
    this.render();
  }

  render() {
    const mins = Math.floor(this.totalSeconds / 60);
    const secs = this.totalSeconds % 60;
    this.display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

const lessonTimer = new LessonTimer();

// =============================================================================
// 5. STEP NAVIGATION & FULLSCREEN
// =============================================================================
function switchStep(stepId) {
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-step') === stepId);
  });

  document.querySelectorAll('.stage-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const targetSec = document.getElementById(`sec-${stepId}`);
  if (targetSec) {
    targetSec.classList.add('active');
  }

  document.querySelector('.lesson-stage').scrollTo({ top: 0, behavior: 'smooth' });
  sfx.playClick();

  if (stepId === 'step1') {
    renderTriangleBaseSvg();
  } else if (stepId === 'step2') {
    renderCaseSvg();
  } else if (stepId === 'step3') {
    renderRulerSvg();
    renderAreaHalfSvg();
  } else if (stepId === 'step4') {
    renderPracticeSubcases();
  }
}
window.switchStep = switchStep;

document.querySelectorAll('.step-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const step = btn.getAttribute('data-step');
    switchStep(step);
  });
});

// Sound Toggle
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
soundToggleBtn.addEventListener('click', () => {
  const enabled = sfx.toggle();
  soundIcon.textContent = enabled ? '🔊' : '🔇';
  soundToggleBtn.style.opacity = enabled ? '1' : '0.6';
});

// Fullscreen Toggle
const fullscreenBtn = document.getElementById('fullscreenBtn');
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.warn(err));
  } else {
    document.exitFullscreen();
  }
  sfx.playClick();
});

// =============================================================================
// 6. STEP 1: INTERACTIVE TRIANGLE WITH ANY BASE SELECTION
// =============================================================================
let currentTriangleBase = 'BC'; // 'BC', 'AC', 'AB'

function setTriangleBase(baseName) {
  currentTriangleBase = baseName;
  document.getElementById('btnBaseBC').classList.toggle('active', baseName === 'BC');
  document.getElementById('btnBaseAC').classList.toggle('active', baseName === 'AC');
  document.getElementById('btnBaseAB').classList.toggle('active', baseName === 'AB');

  const tag = document.getElementById('currentBaseTag');
  if (baseName === 'BC') {
    tag.textContent = 'Основание: сторона BC (красная) ➔ Вершина A напротив';
  } else if (baseName === 'AC') {
    tag.textContent = 'Основание: сторона AC (красная) ➔ Вершина B напротив';
  } else {
    tag.textContent = 'Основание: сторона AB (красная) ➔ Вершина C напротив';
  }

  sfx.playPop();
  renderTriangleBaseSvg();
}
window.setTriangleBase = setTriangleBase;

function renderTriangleBaseSvg() {
  const group = document.getElementById('triangleSvgGroup');
  if (!group) return;
  group.innerHTML = '';

  // Vertices of triangle ABC
  const A = { x: 300, y: 60, label: 'A' };
  const B = { x: 120, y: 280, label: 'B' };
  const C = { x: 480, y: 280, label: 'C' };

  // Fill triangle background
  const fillPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  fillPoly.setAttribute('points', `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`);
  fillPoly.setAttribute('fill', '#eff6ff');
  group.appendChild(fillPoly);

  // Helper for sides
  const drawSide = (p1, p2, isBase, label) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    line.setAttribute('stroke', isBase ? '#dc2626' : '#2563eb');
    line.setAttribute('stroke-width', isBase ? '6' : '3');
    line.setAttribute('stroke-linecap', 'round');
    group.appendChild(line);

    // Side label
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', midX + (isBase && p1.y === p2.y ? 0 : (midX < 300 ? -25 : 25)));
    text.setAttribute('y', midY + (p1.y === p2.y ? 26 : 0));
    text.setAttribute('font-family', 'var(--font-main)');
    text.setAttribute('font-size', '16');
    text.setAttribute('font-weight', '900');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', isBase ? '#dc2626' : '#64748b');
    text.textContent = isBase ? `${label} (ОСНОВАНИЕ)` : label;
    group.appendChild(text);
  };

  drawSide(B, C, currentTriangleBase === 'BC', 'BC');
  drawSide(A, C, currentTriangleBase === 'AC', 'AC');
  drawSide(A, B, currentTriangleBase === 'AB', 'AB');

  // Height line drop based on selected base
  let topVertex = A;
  let hTarget = { x: 300, y: 280 };
  let hName = 'AH';

  if (currentTriangleBase === 'BC') {
    topVertex = A;
    hTarget = { x: 300, y: 280 };
    hName = 'AH';
  } else if (currentTriangleBase === 'AC') {
    topVertex = B;
    // Projected perpendicular onto AC
    hTarget = { x: 380, y: 158 };
    hName = 'BH';
  } else {
    topVertex = C;
    // Projected perpendicular onto AB
    hTarget = { x: 220, y: 158 };
    hName = 'CH';
  }

  // Draw height line
  const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  hLine.setAttribute('x1', topVertex.x);
  hLine.setAttribute('y1', topVertex.y);
  hLine.setAttribute('x2', hTarget.x);
  hLine.setAttribute('y2', hTarget.y);
  hLine.setAttribute('stroke', '#047857');
  hLine.setAttribute('stroke-width', '4');
  hLine.setAttribute('stroke-dasharray', '6,4');
  group.appendChild(hLine);

  // Height label
  const hMidX = (topVertex.x + hTarget.x) / 2 + 18;
  const hMidY = (topVertex.y + hTarget.y) / 2;
  const hText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  hText.setAttribute('x', hMidX);
  hText.setAttribute('y', hMidY);
  hText.setAttribute('font-family', 'var(--font-mono)');
  hText.setAttribute('font-size', '16');
  hText.setAttribute('font-weight', '900');
  hText.setAttribute('fill', '#047857');
  hText.textContent = `Высота h (${hName} ⊥)`;
  group.appendChild(hText);

  // 90° right angle marker
  const rightAngle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rightAngle.setAttribute('x', hTarget.x - (currentTriangleBase === 'BC' ? 14 : 8));
  rightAngle.setAttribute('y', hTarget.y - (currentTriangleBase === 'BC' ? 14 : 8));
  rightAngle.setAttribute('width', '14');
  rightAngle.setAttribute('height', '14');
  rightAngle.setAttribute('fill', 'rgba(16, 185, 129, 0.3)');
  rightAngle.setAttribute('stroke', '#10b981');
  rightAngle.setAttribute('stroke-width', '2');
  group.appendChild(rightAngle);

  // Draw Vertices circles
  [A, B, C].forEach(v => {
    const isOpposite = v === topVertex;
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', v.x);
    c.setAttribute('cy', v.y);
    c.setAttribute('r', isOpposite ? '10' : '7');
    c.setAttribute('fill', isOpposite ? '#dc2626' : '#1e293b');
    c.setAttribute('stroke', '#ffffff');
    c.setAttribute('stroke-width', '2.5');
    group.appendChild(c);

    const l = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    l.setAttribute('x', v.x + (v.x < 300 ? -24 : (v.x === 300 ? 0 : 20)));
    l.setAttribute('y', v.y + (v.y < 100 ? -12 : 24));
    l.setAttribute('text-anchor', v.x === 300 ? 'middle' : 'start');
    l.setAttribute('font-family', 'var(--font-mono)');
    l.setAttribute('font-size', '20');
    l.setAttribute('font-weight', '900');
    l.setAttribute('fill', isOpposite ? '#dc2626' : '#0f172a');
    l.textContent = isOpposite ? `${v.label} (ПРОТИВОЛЕЖАЩАЯ)` : v.label;
    group.appendChild(l);
  });
}

function showTriTypeDemo(type) {
  document.querySelectorAll('.type-mini-card').forEach(c => c.classList.remove('active'));
  document.getElementById(`tt-${type}`).classList.add('active');
  sfx.playClick();
}
window.showTriTypeDemo = showTriTypeDemo;

// =============================================================================
// 7. STEP 2: THREE CASES OF HEIGHT (стр. 91-92)
// =============================================================================
let currentCase = 'a'; // 'a', 'b', 'c'
let caseHighlight = 'height'; // 'height', 'base', 'angle'

function switchHeightCase(caseKey) {
  currentCase = caseKey;
  document.querySelectorAll('.case-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`caseTab${caseKey.toUpperCase()}`).classList.add('active');

  const banner = document.getElementById('caseDescBanner');
  const title = document.getElementById('caseTitleText');
  const body = document.getElementById('caseBodyText');

  if (caseKey === 'a') {
    title.textContent = 'Случай а: Прямоугольный треугольник △ABC (AC ⊥ BC)';
    body.textContent = 'Основание BC, противолежащая вершина A. Так как угол ∠C = 90°, сторона AC уже перпендикулярна основанию. Сама боковая сторона AC и есть высота!';
  } else if (caseKey === 'b') {
    title.textContent = 'Случай b: Остроугольный треугольник △DEF (DG ⊥ EF)';
    body.textContent = 'Основание EF, противолежащая вершина D. Опускаем перпендикуляр DG по клеточкам строго вниз на сторону EF. Высота лежит ВНУТРИ треугольника!';
  } else {
    title.textContent = 'Случай c: Тупоугольный треугольник △WXY (WZ ⊥ XY снаружи!)';
    body.textContent = 'Основание YX, вершина W «нависает» сбоку. Прямой перпендикуляр не попадает на саму сторону! Поэтому продолжаем сторону YX пунктиром влево (до Z), и высота WZ падает СНАРУЖИ!';
  }

  sfx.playClick();
  renderCaseSvg();
}
window.switchHeightCase = switchHeightCase;

function toggleCaseHighlight(feat) {
  caseHighlight = feat;
  document.querySelectorAll('.case-act-btn').forEach(b => b.classList.remove('active'));
  if (feat === 'height') document.getElementById('btnHlHeight').classList.add('active');
  if (feat === 'base') document.getElementById('btnHlBase').classList.add('active');
  if (feat === 'angle') document.getElementById('btnHlAngle').classList.add('active');
  sfx.playPop();
  renderCaseSvg();
}
window.toggleCaseHighlight = toggleCaseHighlight;

function renderCaseSvg() {
  const group = document.getElementById('caseSvgGroup');
  if (!group) return;
  group.innerHTML = '';

  if (currentCase === 'a') {
    // Right triangle ABC (C is 90°)
    const C = { x: 180, y: 280, label: 'C (90°)' };
    const B = { x: 460, y: 280, label: 'B' };
    const A = { x: 180, y: 70, label: 'A' };

    // Fill
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`);
    poly.setAttribute('fill', '#eff6ff');
    poly.setAttribute('stroke', '#94a3b8');
    poly.setAttribute('stroke-width', '2');
    group.appendChild(poly);

    // Base BC
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', C.x);
    baseLine.setAttribute('y1', C.y);
    baseLine.setAttribute('x2', B.x);
    baseLine.setAttribute('y2', B.y);
    baseLine.setAttribute('stroke', '#dc2626');
    baseLine.setAttribute('stroke-width', caseHighlight === 'base' ? '7' : '5');
    group.appendChild(baseLine);

    // Height AC (Side)
    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', A.x);
    hLine.setAttribute('y1', A.y);
    hLine.setAttribute('x2', C.x);
    hLine.setAttribute('y2', C.y);
    hLine.setAttribute('stroke', '#047857');
    hLine.setAttribute('stroke-width', caseHighlight === 'height' ? '7' : '5');
    group.appendChild(hLine);

    // Right angle square
    const ra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ra.setAttribute('x', C.x);
    ra.setAttribute('y', C.y - 18);
    ra.setAttribute('width', '18');
    ra.setAttribute('height', '18');
    ra.setAttribute('fill', 'rgba(16, 185, 129, 0.25)');
    ra.setAttribute('stroke', '#10b981');
    ra.setAttribute('stroke-width', '2.5');
    group.appendChild(ra);

    // Labels
    const addLbl = (txt, x, y, col, sz = '17') => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x);
      t.setAttribute('y', y);
      t.setAttribute('font-family', 'var(--font-main)');
      t.setAttribute('font-size', sz);
      t.setAttribute('font-weight', '900');
      t.setAttribute('fill', col);
      t.textContent = txt;
      group.appendChild(t);
    };

    addLbl('Основание BC', 320, 310, '#dc2626');
    addLbl('Боковая сторона AC = ВЫСОТА h', 160, 175, '#047857');
    addLbl('A', 170, 55, '#0f172a');
    addLbl('B', 475, 290, '#0f172a');
    addLbl('C', 155, 305, '#0f172a');

  } else if (currentCase === 'b') {
    // Acute triangle DEF (Height DG inside)
    const D = { x: 300, y: 70, label: 'D' };
    const E = { x: 140, y: 280, label: 'E' };
    const F = { x: 480, y: 280, label: 'F' };
    const G = { x: 300, y: 280, label: 'G' };

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${D.x},${D.y} ${E.x},${E.y} ${F.x},${F.y}`);
    poly.setAttribute('fill', '#eff6ff');
    poly.setAttribute('stroke', '#2563eb');
    poly.setAttribute('stroke-width', '3');
    group.appendChild(poly);

    // Base EF
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', E.x);
    baseLine.setAttribute('y1', E.y);
    baseLine.setAttribute('x2', F.x);
    baseLine.setAttribute('y2', F.y);
    baseLine.setAttribute('stroke', '#dc2626');
    baseLine.setAttribute('stroke-width', '5');
    group.appendChild(baseLine);

    // Height DG inside
    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', D.x);
    hLine.setAttribute('y1', D.y);
    hLine.setAttribute('x2', G.x);
    hLine.setAttribute('y2', G.y);
    hLine.setAttribute('stroke', '#047857');
    hLine.setAttribute('stroke-width', '4');
    hLine.setAttribute('stroke-dasharray', '6,4');
    group.appendChild(hLine);

    // Right angle at G
    const ra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ra.setAttribute('x', G.x - 16);
    ra.setAttribute('y', G.y - 16);
    ra.setAttribute('width', '16');
    ra.setAttribute('height', '16');
    ra.setAttribute('fill', 'rgba(16, 185, 129, 0.25)');
    ra.setAttribute('stroke', '#10b981');
    ra.setAttribute('stroke-width', '2');
    group.appendChild(ra);

    const addLbl = (txt, x, y, col, sz = '17') => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x);
      t.setAttribute('y', y);
      t.setAttribute('font-family', 'var(--font-main)');
      t.setAttribute('font-size', sz);
      t.setAttribute('font-weight', '900');
      t.setAttribute('fill', col);
      t.textContent = txt;
      group.appendChild(t);
    };

    addLbl('Основание EF', 310, 310, '#dc2626');
    addLbl('Высота DG (ВНУТРИ)', 315, 180, '#047857');
    addLbl('D', 295, 55, '#0f172a');
    addLbl('E', 120, 290, '#0f172a');
    addLbl('F', 495, 290, '#0f172a');
    addLbl('G', 295, 305, '#047857');

  } else {
    // Obtuse triangle WXY (Height WZ outside on extension)
    const W = { x: 150, y: 70, label: 'W' };
    const Y = { x: 280, y: 280, label: 'Y' };
    const X = { x: 490, y: 280, label: 'X' };
    const Z = { x: 150, y: 280, label: 'Z' };

    // Fill triangle
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${W.x},${W.y} ${Y.x},${Y.y} ${X.x},${X.y}`);
    poly.setAttribute('fill', '#eff6ff');
    poly.setAttribute('stroke', '#2563eb');
    poly.setAttribute('stroke-width', '3');
    group.appendChild(poly);

    // Extension dashed line from Y to Z
    const extLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    extLine.setAttribute('x1', Z.x);
    extLine.setAttribute('y1', Z.y);
    extLine.setAttribute('x2', Y.x);
    extLine.setAttribute('y2', Y.y);
    extLine.setAttribute('stroke', '#ef4444');
    extLine.setAttribute('stroke-width', '3');
    extLine.setAttribute('stroke-dasharray', '5,5');
    group.appendChild(extLine);

    // Base YX
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', Y.x);
    baseLine.setAttribute('y1', Y.y);
    baseLine.setAttribute('x2', X.x);
    baseLine.setAttribute('y2', X.y);
    baseLine.setAttribute('stroke', '#dc2626');
    baseLine.setAttribute('stroke-width', '6');
    group.appendChild(baseLine);

    // Height WZ outside
    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', W.x);
    hLine.setAttribute('y1', W.y);
    hLine.setAttribute('x2', Z.x);
    hLine.setAttribute('y2', Z.y);
    hLine.setAttribute('stroke', '#047857');
    hLine.setAttribute('stroke-width', '5');
    hLine.setAttribute('stroke-dasharray', '6,4');
    group.appendChild(hLine);

    // Right angle at Z
    const ra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ra.setAttribute('x', Z.x);
    ra.setAttribute('y', Z.y - 18);
    ra.setAttribute('width', '18');
    ra.setAttribute('height', '18');
    ra.setAttribute('fill', 'rgba(16, 185, 129, 0.25)');
    ra.setAttribute('stroke', '#10b981');
    ra.setAttribute('stroke-width', '2');
    group.appendChild(ra);

    const addLbl = (txt, x, y, col, sz = '17') => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x);
      t.setAttribute('y', y);
      t.setAttribute('font-family', 'var(--font-main)');
      t.setAttribute('font-size', sz);
      t.setAttribute('font-weight', '900');
      t.setAttribute('fill', col);
      t.textContent = txt;
      group.appendChild(t);
    };

    addLbl('Основание YX', 380, 310, '#dc2626');
    addLbl('Продолжение стороны', 160, 310, '#ef4444', '14');
    addLbl('Высота WZ (СНАРУЖИ!)', 140, 180, '#047857');
    addLbl('W', 140, 55, '#0f172a');
    addLbl('Y', 280, 265, '#0f172a');
    addLbl('X', 505, 290, '#0f172a');
    addLbl('Z', 130, 295, '#047857');
  }
}

function showEFGHeight(base) {
  document.querySelectorAll('.th-btn').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const bubble = document.getElementById('efgDialogBubble');
  if (base === 'FG') {
    bubble.innerHTML = `
      <span class="dialog-avatar">👧</span>
      <div class="dialog-content">
        <strong>Ответ на вопрос девочки в учебнике:</strong>
        «Если основанием является сторона <strong>FG</strong>, то противолежащая вершина — <strong>E</strong>, а высота — отрезок <strong>EK</strong> (так как EK ⊥ FG)!»
      </div>
    `;
    sfx.playSuccess();
    confetti.fire(35);
  } else if (base === 'EG') {
    bubble.innerHTML = `
      <span class="dialog-avatar">📐</span>
      <div class="dialog-content">
        <strong>Основание EG:</strong> Противолежащая вершина <strong>F</strong>, опускаем перпендикуляр FH ➔ <strong>высота FH ⊥ EG</strong>!
      </div>
    `;
    sfx.playPop();
  } else {
    bubble.innerHTML = `
      <span class="dialog-avatar">📐</span>
      <div class="dialog-content">
        <strong>Основание EF:</strong> Противолежащая вершина <strong>G</strong>, опускаем перпендикуляр GJ ➔ <strong>высота GJ ⊥ EF</strong>!
      </div>
    `;
    sfx.playPop();
  }
}
window.showEFGHeight = showEFGHeight;

// =============================================================================
// 8. STEP 3: SET SQUARE & AREA HALF-RECTANGLE
// =============================================================================
let setSquareActive = true;

function applySetSquare() {
  setSquareActive = true;
  document.getElementById('btnRulerApply').classList.add('active');
  document.getElementById('btnRulerHide').classList.remove('active');
  sfx.playSuccess();
  renderRulerSvg();
}
window.applySetSquare = applySetSquare;

function hideSetSquare() {
  setSquareActive = false;
  document.getElementById('btnRulerHide').classList.add('active');
  document.getElementById('btnRulerApply').classList.remove('active');
  sfx.playClick();
  renderRulerSvg();
}
window.hideSetSquare = hideSetSquare;

function renderRulerSvg() {
  const group = document.getElementById('rulerSvgGroup');
  if (!group) return;
  group.innerHTML = '';

  const A = { x: 300, y: 50 };
  const B = { x: 140, y: 260 };
  const C = { x: 460, y: 260 };
  const H = { x: 300, y: 260 };

  // Base Triangle
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`);
  poly.setAttribute('fill', '#eff6ff');
  poly.setAttribute('stroke', '#2563eb');
  poly.setAttribute('stroke-width', '3');
  group.appendChild(poly);

  // Red base BC
  const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  baseLine.setAttribute('x1', B.x);
  baseLine.setAttribute('y1', B.y);
  baseLine.setAttribute('x2', C.x);
  baseLine.setAttribute('y2', C.y);
  baseLine.setAttribute('stroke', '#dc2626');
  baseLine.setAttribute('stroke-width', '6');
  group.appendChild(baseLine);

  // Green Height AH
  const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  hLine.setAttribute('x1', A.x);
  hLine.setAttribute('y1', A.y);
  hLine.setAttribute('x2', H.x);
  hLine.setAttribute('y2', H.y);
  hLine.setAttribute('stroke', '#047857');
  hLine.setAttribute('stroke-width', '4');
  hLine.setAttribute('stroke-dasharray', '6,4');
  group.appendChild(hLine);

  // Set Square (Прямоугольный треугольник-угольник)
  if (setSquareActive) {
    const ruler = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    ruler.setAttribute('points', `${H.x},${H.y} ${H.x},${A.y} ${H.x + 130},${H.y}`);
    ruler.setAttribute('fill', 'rgba(245, 158, 11, 0.45)');
    ruler.setAttribute('stroke', '#d97706');
    ruler.setAttribute('stroke-width', '3');
    group.appendChild(ruler);

    // Inner cutout of set square
    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    inner.setAttribute('points', `${H.x + 18},${H.y - 18} ${H.x + 18},${A.y + 55} ${H.x + 85},${H.y - 18}`);
    inner.setAttribute('fill', '#ffffff');
    inner.setAttribute('stroke', '#d97706');
    inner.setAttribute('stroke-width', '2');
    group.appendChild(inner);

    // Right angle badge on ruler
    const ra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ra.setAttribute('x', H.x);
    ra.setAttribute('y', H.y - 16);
    ra.setAttribute('width', '16');
    ra.setAttribute('height', '16');
    ra.setAttribute('fill', 'rgba(220, 38, 38, 0.3)');
    ra.setAttribute('stroke', '#dc2626');
    ra.setAttribute('stroke-width', '2');
    group.appendChild(ra);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', H.x + 40);
    txt.setAttribute('y', H.y - 50);
    txt.setAttribute('font-family', 'var(--font-main)');
    txt.setAttribute('font-size', '15');
    txt.setAttribute('font-weight', '900');
    txt.setAttribute('fill', '#92400e');
    txt.textContent = 'УГОЛЬНИК 90°';
    group.appendChild(txt);
  }

  // Text labels
  const addT = (txt, x, y, col) => {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('font-family', 'var(--font-main)');
    t.setAttribute('font-size', '16');
    t.setAttribute('font-weight', '900');
    t.setAttribute('fill', col);
    t.textContent = txt;
    group.appendChild(t);
  };

  addT('Основание a (сторона BC)', 280, 285, '#dc2626');
  addT('Высота h (AH ⊥ BC)', 280, 160, '#047857');
}

function renderAreaHalfSvg() {
  const svg = document.getElementById('areaHalfSvg');
  if (!svg) return;
  svg.innerHTML = '';

  // Surrounding Rectangle: w = 240, h = 100, x = 80, y = 30
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '80');
  rect.setAttribute('y', '30');
  rect.setAttribute('width', '240');
  rect.setAttribute('height', '100');
  rect.setAttribute('fill', 'rgba(226, 232, 240, 0.4)');
  rect.setAttribute('stroke', '#94a3b8');
  rect.setAttribute('stroke-width', '2');
  rect.setAttribute('stroke-dasharray', '6,4');
  svg.appendChild(rect);

  // Triangle inside (half of rectangle)
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', '80,130 320,130 200,30');
  poly.setAttribute('fill', '#eff6ff');
  poly.setAttribute('stroke', '#2563eb');
  poly.setAttribute('stroke-width', '3');
  svg.appendChild(poly);

  // Red base
  const bLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  bLine.setAttribute('x1', '80');
  bLine.setAttribute('y1', '130');
  bLine.setAttribute('x2', '320');
  bLine.setAttribute('y2', '130');
  bLine.setAttribute('stroke', '#dc2626');
  bLine.setAttribute('stroke-width', '5');
  svg.appendChild(bLine);

  // Height line
  const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  hLine.setAttribute('x1', '200');
  hLine.setAttribute('y1', '30');
  hLine.setAttribute('x2', '200');
  hLine.setAttribute('y2', '130');
  hLine.setAttribute('stroke', '#047857');
  hLine.setAttribute('stroke-width', '3');
  hLine.setAttribute('stroke-dasharray', '4,4');
  svg.appendChild(hLine);

  // Base text
  const bTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  bTxt.setAttribute('x', '200');
  bTxt.setAttribute('y', '155');
  bTxt.setAttribute('font-family', 'var(--font-mono)');
  bTxt.setAttribute('font-size', '16');
  bTxt.setAttribute('font-weight', '900');
  bTxt.setAttribute('text-anchor', 'middle');
  bTxt.setAttribute('fill', '#dc2626');
  bTxt.textContent = 'Основание a';
  svg.appendChild(bTxt);

  // Height text
  const hTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  hTxt.setAttribute('x', '215');
  hTxt.setAttribute('y', '85');
  hTxt.setAttribute('font-family', 'var(--font-mono)');
  hTxt.setAttribute('font-size', '16');
  hTxt.setAttribute('font-weight', '900');
  hTxt.setAttribute('fill', '#047857');
  hTxt.textContent = 'h';
  svg.appendChild(hTxt);
}

// =============================================================================
// 9. STEP 4: PRACTICE & WORKBOOK CARDS
// =============================================================================
function switchPracTab(num) {
  document.querySelectorAll('.prac-tab').forEach((t, i) => {
    t.classList.toggle('active', i + 1 === num);
  });
  document.querySelectorAll('.prac-view').forEach((v, i) => {
    v.classList.toggle('active', i + 1 === num);
  });
  sfx.playClick();
}
window.switchPracTab = switchPracTab;

function revealSubcaseAns(id) {
  const el = document.getElementById(`subAns${id}`);
  el.classList.toggle('show');
  sfx.playPop();
}
window.revealSubcaseAns = revealSubcaseAns;

function renderPracticeSubcases() {
  // SVG 1a (Obtuse triangle with BD outside)
  const svg1a = document.getElementById('svgSub1a');
  if (svg1a && !svg1a.hasChildNodes()) {
    svg1a.innerHTML = `
      <polygon points="120,40 190,160 320,160" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <line x1="120" y1="160" x2="190" y2="160" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4"/>
      <line x1="190" y1="160" x2="320" y2="160" stroke="#dc2626" stroke-width="4"/>
      <line x1="120" y1="40" x2="120" y2="160" stroke="#047857" stroke-width="3" stroke-dasharray="5,4"/>
      <rect x="120" y="145" width="15" height="15" fill="rgba(16,185,129,0.3)" stroke="#10b981" stroke-width="2"/>
      <text x="110" y="35" font-weight="900" font-size="14">B</text>
      <text x="185" y="178" font-weight="900" font-size="14">A</text>
      <text x="325" y="170" font-weight="900" font-size="14">C</text>
      <text x="110" y="178" font-weight="900" font-size="14">D</text>
      <text x="230" y="180" fill="#dc2626" font-weight="900" font-size="13">Основание AC</text>
      <text x="40" y="100" fill="#047857" font-weight="900" font-size="13">Высота BD ⊥</text>
    `;
  }

  // SVG 1b (Base AC at top, BD downwards/upwards)
  const svg1b = document.getElementById('svgSub1b');
  if (svg1b && !svg1b.hasChildNodes()) {
    svg1b.innerHTML = `
      <polygon points="80,50 300,50 190,160" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <line x1="80" y1="50" x2="300" y2="50" stroke="#dc2626" stroke-width="4"/>
      <line x1="190" y1="160" x2="190" y2="50" stroke="#047857" stroke-width="3" stroke-dasharray="5,4"/>
      <rect x="190" y="50" width="15" height="15" fill="rgba(16,185,129,0.3)" stroke="#10b981" stroke-width="2"/>
      <text x="70" y="45" font-weight="900" font-size="14">A</text>
      <text x="305" y="45" font-weight="900" font-size="14">C</text>
      <text x="190" y="180" font-weight="900" font-size="14">B</text>
      <text x="190" y="40" font-weight="900" font-size="14">D</text>
      <text x="130" y="35" fill="#dc2626" font-weight="900" font-size="13">Основание AC сверху</text>
      <text x="210" y="110" fill="#047857" font-weight="900" font-size="13">Высота BD ⊥</text>
    `;
  }
}

// Workbook interactive validation
const wbExplanations = {
  1: 'Угол ∠B = 90° прямой, значит сторона BC ⊥ AB и выходит из вершины C!',
  2: 'Из противолежащей вершины E опущен перпендикуляр EG на продолжение основания FD (∠G = 90°).',
  3: 'Ловушка! На рисунке два перпендикуляра (RS и QT), но к стороне PQ из вершины R проведён именно RS ⊥ PQ!',
  4: 'Ловушка! Отрезок LP ⊥ KM, а нам нужно основание LM! На него опущен перпендикуляр KN ⊥ LM.',
  5: 'Прямой угол (90°) у точки D лежит на стороне AC (BD ⊥ AC).',
  6: 'Высота FH опущена под прямым углом на пунктирное продолжение стороны EG (FH ⊥ EG).'
};

function checkWbAnswer(cardNum, ansText, isCorrect) {
  const card = document.getElementById(`wbCard${cardNum}`);
  const slot = document.getElementById(`slot${cardNum}`);
  const hint = document.getElementById(`wbHint${cardNum}`);
  const buttons = card.querySelectorAll('.wb-opt-btn');

  buttons.forEach(btn => {
    btn.classList.remove('correct', 'wrong');
    if (btn.textContent.includes(ansText)) {
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
    }
  });

  if (isCorrect) {
    slot.textContent = ansText;
    slot.classList.add('filled-correct');
    hint.textContent = `✓ Верно! ${wbExplanations[cardNum]}`;
    sfx.playSuccess();
    confetti.fire(35);
  } else {
    hint.textContent = `✕ Ошибка! Попробуй другой вариант.`;
    sfx.playWrong();
  }
}
window.checkWbAnswer = checkWbAnswer;

// =============================================================================
// 10. CLASSROOM QUIZ (5 KEY QUESTIONS ON TRIANGLE HEIGHT)
// =============================================================================
const quizData = [
  {
    q: '1. Чему равна сумма всех трёх углов любого треугольника?',
    options: ['90°', '180°', '360°', '100°'],
    answer: 1,
    hint: 'Правильно! Сумма углов в абсолютно любом треугольнике всегда равна 180°!'
  },
  {
    q: '2. Сколько всего высот можно провести в одном треугольнике?',
    options: ['Только 1', 'Ровно 2', 'Ровно 3 (к каждой стороне)', 'Бесконечно много'],
    answer: 2,
    hint: 'Супер! У треугольника 3 стороны, поэтому к каждому основанию можно провести свою высоту (всего 3)!'
  },
  {
    q: '3. В каком треугольнике высота совпадает с его боковой стороной?',
    options: ['В остроугольном', 'В прямоугольном', 'В тупоугольном', 'Ни в каком'],
    answer: 1,
    hint: 'Отлично! В прямоугольном треугольнике стороны прямого угла уже перпендикулярны друг другу!'
  },
  {
    q: '4. В каком треугольнике высота падает СНАРУЖИ на продолжение стороны?',
    options: ['В прямоугольном', 'В равностороннем', 'В тупоугольном', 'В остроугольном'],
    answer: 2,
    hint: 'Точно! Вершина нависает сбоку, поэтому опускаем высоту на пунктирное продолжение основания!'
  },
  {
    q: '5. Основание треугольника a = 10 см, а высота h = 6 см. Чему равна его площадь S?',
    options: ['60 см²', '30 см²', '16 см²', '40 см²'],
    answer: 1,
    hint: 'Браво! S = (a · h) : 2 = (10 · 6) : 2 = 60 : 2 = 30 см² (не забывай делить на 2)!'
  }
];

let quizState = {
  index: 0,
  score: 0,
  answered: false
};

function renderQuizQuestion() {
  quizState.answered = false;
  const qObj = quizData[quizState.index];
  document.getElementById('quizQIndex').textContent = `${quizState.index + 1} / ${quizData.length}`;
  document.getElementById('quizQuestionText').textContent = qObj.q;

  const grid = document.getElementById('quizOptionsGrid');
  grid.innerHTML = '';

  const letters = ['A', 'B', 'C', 'D'];
  qObj.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.innerHTML = `<span class="opt-letter">${letters[idx]}</span> <span>${opt}</span>`;
    btn.addEventListener('click', () => selectQuizAnswer(idx, btn));
    grid.appendChild(btn);
  });

  const feedbackBar = document.getElementById('quizFeedbackBar');
  feedbackBar.classList.remove('show');
}

function selectQuizAnswer(selectedIndex, buttonEl) {
  if (quizState.answered) return;
  quizState.answered = true;

  const qObj = quizData[quizState.index];
  const isCorrect = selectedIndex === qObj.answer;
  const feedbackBar = document.getElementById('quizFeedbackBar');
  const feedbackMsg = document.getElementById('feedbackMsg');
  const feedbackIcon = document.getElementById('feedbackIcon');

  if (isCorrect) {
    quizState.score++;
    document.getElementById('quizScore').textContent = `${quizState.score} ⭐`;
    buttonEl.classList.add('correct');
    feedbackIcon.textContent = '🎉';
    feedbackMsg.textContent = qObj.hint;
    sfx.playSuccess();
    confetti.fire(50);
  } else {
    buttonEl.classList.add('wrong');
    const options = document.querySelectorAll('.quiz-option-btn');
    if (options[qObj.answer]) options[qObj.answer].classList.add('correct');
    feedbackIcon.textContent = '🤔';
    feedbackMsg.textContent = `Ошибка! ${qObj.hint}`;
    sfx.playWrong();
  }

  feedbackBar.classList.add('show');
}

function nextQuizQuestion() {
  if (quizState.index < quizData.length - 1) {
    quizState.index++;
    renderQuizQuestion();
    sfx.playClick();
  } else {
    document.getElementById('quizBody').style.display = 'none';
    const finishCard = document.getElementById('quizFinishCard');
    finishCard.style.display = 'flex';
    document.getElementById('quizFinalSummary').textContent =
      `Вы правильно ответили на ${quizState.score} из ${quizData.length} вопросов!`;
    sfx.playSuccess();
    confetti.fire(120);
  }
}
window.nextQuizQuestion = nextQuizQuestion;

function restartQuiz() {
  quizState.index = 0;
  quizState.score = 0;
  document.getElementById('quizScore').textContent = '0 ⭐';
  document.getElementById('quizBody').style.display = 'flex';
  document.getElementById('quizFinishCard').style.display = 'none';
  renderQuizQuestion();
  sfx.playClick();
}
window.restartQuiz = restartQuiz;

// =============================================================================
// 11. NOTEBOOK MODAL CONTENT & LOGIC ("Запиши в тетрадь")
// =============================================================================
const notebookData = {
  1: {
    title: 'Блок 1 — Элементы треугольника и основание',
    time: 'Рекомендуемое время: ~8 минут',
    mins: 8,
    html: `
      <div class="nb-lesson-topic">Тема: Основание и высота треугольника.</div>
      <div class="nb-box">
        <h4>1. Элементы треугольника (△ABC):</h4>
        <p>Имеет <strong>3 вершины</strong> (A, B, C), <strong>3 стороны</strong> (AB, BC, AC) и <strong>3 угла</strong>.</p>
        <p><span class="nb-formula-highlight">Сумма углов: ∠A + ∠B + ∠C = 180°</span></p>
      </div>
      <div class="nb-box">
        <h4>2. Основание и противолежащая вершина:</h4>
        <p><strong>Основанием</strong> треугольника может быть <em>любая из трёх его сторон</em> (не обязательно нижняя!).</p>
        <p>Вершина, которая не лежит на основании, называется <span class="nb-formula-highlight">противолежащей вершиной</span>.</p>
      </div>
      <div class="nb-box">
        <h4>3. Определение высоты (h):</h4>
        <p><strong>Высота треугольника (h)</strong> — это перпендикуляр (отрезок под прямым углом 90°), опущенный из противолежащей вершины на основание (или на его продолжение).</p>
        <p><span class="nb-formula-highlight">Знак ⊥ читается «перпендикулярно» (под углом 90°)</span></p>
      </div>
    `
  },
  2: {
    title: 'Блок 2 — Запись высот, периметр и площадь',
    time: 'Рекомендуемое время: ~9 минут',
    mins: 9,
    html: `
      <div class="nb-lesson-topic">Блок 2: Три случая высоты и формулы</div>
      <div class="nb-box">
        <h4>1. Три случая высоты:</h4>
        <p>1) <strong>△ABC (прямоугольный):</strong> BC — основание, AC — высота (AC ⊥ BC, совпадает со стороной!).</p>
        <p>2) <strong>△DEF (остроугольный):</strong> EF — основание, DG — высота <em>внутри</em> треугольника (DG ⊥ EF).</p>
        <p>3) <strong>△WXY (тупоугольный):</strong> YX — основание, WZ — высота <em>снаружи</em> на продолжение основания (WZ ⊥ XY).</p>
      </div>
      <div class="nb-box">
        <h4>2. Формула периметра (P):</h4>
        <p><span class="nb-formula-highlight">P = a + b + c</span> (сумма длин всех 3 сторон)</p>
      </div>
      <div class="nb-box">
        <h4>3. Формула площади треугольника (S):</h4>
        <p><span class="nb-formula-highlight">S = (a · h) : 2</span></p>
        <p><em>(Так как треугольник составляет ровно половину прямоугольника со сторонами a и h!)</em></p>
      </div>
      <div class="nb-box">
        <h4>4. Обратные формулы по площади:</h4>
        <p>Высота: <span class="nb-formula-highlight">h = (2 · S) : a</span> &nbsp;|&nbsp; Основание: <span class="nb-formula-highlight">a = (2 · S) : h</span></p>
      </div>
    `
  },
  3: {
    title: 'Блок 3 — Образцы решения задач для тетради',
    time: 'Рекомендуемое время: ~5 минут',
    mins: 5,
    html: `
      <div class="nb-lesson-topic">Блок 3: Образцы решения задач</div>
      <div class="nb-box">
        <h4>Задача 1 (по клеточкам со стр. 91 учебника):</h4>
        <p><strong>Дано:</strong> основание a = 4 см, высота h = 3 см. <strong>Найти:</strong> S.</p>
        <p><strong>Решение:</strong></p>
        <p>S = (a · h) : 2 = (4 · 3) : 2 = 12 : 2 = <span class="nb-formula-highlight">6 (см²)</span>.</p>
        <p><em>(У обоих треугольников одинаковое основание 4 см и высота 3 см, поэтому площади равны!)</em></p>
        <p><strong>Ответ:</strong> S = 6 см².</p>
      </div>
      <div class="nb-box">
        <h4>Задача 2 (Нахождение высоты по площади):</h4>
        <p><strong>Дано:</strong> треугольник, S = 20 см², основание a = 8 см. <strong>Найти:</strong> h.</p>
        <p><strong>Решение:</strong></p>
        <p>h = (2 · S) : a = (2 · 20) : 8 = 40 : 8 = <span class="nb-formula-highlight">5 (см)</span> — высота.</p>
        <p><strong>Ответ:</strong> высота h = 5 см.</p>
      </div>
    `
  }
};

let activeNotebookBlock = 1;

function openNotebookModal(blockNum) {
  activeNotebookBlock = blockNum;
  const data = notebookData[blockNum];
  if (!data) return;

  document.getElementById('nbTitle').textContent = data.title;
  document.getElementById('nbTime').textContent = data.time;
  document.getElementById('notebookContent').innerHTML = data.html;

  document.getElementById('notebookModal').classList.add('active');
  sfx.playClick();
}
window.openNotebookModal = openNotebookModal;

function closeNotebookModal() {
  document.getElementById('notebookModal').classList.remove('active');
  sfx.playClick();
}
window.closeNotebookModal = closeNotebookModal;

function startNotebookCountdown() {
  const data = notebookData[activeNotebookBlock];
  if (data && data.mins) {
    lessonTimer.setTimer(data.mins);
    lessonTimer.start();
    closeNotebookModal();
  }
}
window.startNotebookCountdown = startNotebookCountdown;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  renderTriangleBaseSvg();
  renderCaseSvg();
  renderRulerSvg();
  renderAreaHalfSvg();
  renderPracticeSubcases();
  renderQuizQuestion();
});
