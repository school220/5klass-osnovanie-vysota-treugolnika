/**
 * =============================================================================
 * 5th Grade Mathematics: Interactive Smartboard Web Application
 * Topic: Triangle Base and Height (Основание и высота треугольника)
 * Optimized for High-Resolution Touch Smartboards (Zero-lag, 60fps, Kid-Friendly)
 * =============================================================================
 */

// =============================================================================
// 1. AUDIO SYNTHESIZER (Web Audio API - 100% Offline, Zero Network Delay)
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
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.22, 0.15), idx * 75);
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
      setTimeout(() => this.playTone(f, 'sine', 0.45, 0.18), i * 180);
    });
  }
}

const sfx = new SoundFX();

// =============================================================================
// 2. CONFETTI CANNON (Lightweight & Hardware-Accelerated)
// =============================================================================
class ConfettiCannon {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.running = false;
    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(count = 50) {
    if (!this.canvas) return;
    const colors = ['#dc2626', '#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width * (0.2 + Math.random() * 0.6),
        y: this.canvas.height * 0.45 + (Math.random() * 40 - 20),
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
    if (!this.ctx) return;
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
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
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
    if (!this.canvas) return;
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
    if (!this.canvas) return;
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

    if (penToggleBtn) penToggleBtn.addEventListener('click', () => this.toggle());
    if (closePenBtn) closePenBtn.addEventListener('click', () => this.deactivate());
    if (clearBtn) clearBtn.addEventListener('click', () => this.clear());

    if (eraserBtn) {
      eraserBtn.addEventListener('click', () => {
        this.isEraser = !this.isEraser;
        eraserBtn.classList.toggle('active', this.isEraser);
        sfx.playClick();
      });
    }

    document.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.color = dot.getAttribute('data-color');
        this.isEraser = false;
        if (eraserBtn) eraserBtn.classList.remove('active');
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
    if (this.overlay) this.overlay.classList.add('active');
    const btn = document.getElementById('penToggleBtn');
    if (btn) btn.classList.add('active');
    sfx.playClick();
  }

  deactivate() {
    this.active = false;
    if (this.overlay) this.overlay.classList.remove('active');
    const btn = document.getElementById('penToggleBtn');
    if (btn) btn.classList.remove('active');
    sfx.playClick();
  }

  clear() {
    if (!this.ctx) return;
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
    if (this.displayBtn && this.dropdown) {
      this.displayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dropdown.classList.toggle('show');
        sfx.playClick();
      });

      document.addEventListener('click', (e) => {
        const widget = document.getElementById('timerWidget');
        if (widget && !widget.contains(e.target)) {
          this.dropdown.classList.remove('show');
        }
      });
    }

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        this.isRunning ? this.pause() : this.start();
        sfx.playClick();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.reset();
        sfx.playPop();
      });
    }

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
    if (this.toggleBtn) {
      this.toggleBtn.textContent = '⏸ Пауза';
      this.toggleBtn.classList.remove('play');
      this.toggleBtn.classList.add('pause');
    }
    if (this.displayBtn) this.displayBtn.classList.add('running');

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
    if (this.toggleBtn) {
      this.toggleBtn.textContent = '▶ Старт';
      this.toggleBtn.classList.remove('pause');
      this.toggleBtn.classList.add('play');
    }
    if (this.displayBtn) this.displayBtn.classList.remove('running');
  }

  reset() {
    this.pause();
    this.totalSeconds = this.initialSeconds;
    this.render();
  }

  render() {
    if (!this.display) return;
    const mins = Math.floor(this.totalSeconds / 60);
    const secs = this.totalSeconds % 60;
    this.display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

const lessonTimer = new LessonTimer();

// =============================================================================
// 5. GLOBAL STEP NAVIGATION & UTILITIES
// =============================================================================
function switchStep(stepId) {
  // Update header navigation buttons
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-step') === stepId);
  });

  // Switch active stage section
  document.querySelectorAll('.stage-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const targetSec = document.getElementById(`sec-${stepId}`);
  if (targetSec) {
    targetSec.classList.add('active');
  }

  const stage = document.querySelector('.lesson-stage');
  if (stage) stage.scrollTo({ top: 0, behavior: 'smooth' });
  sfx.playClick();

  // Lazy render graphics for that step
  if (stepId === 'step1') {
    renderStep1Svg();
  } else if (stepId === 'step2') {
    renderStep2Svg();
  } else if (stepId === 'step3') {
    renderStep3RulerSvg();
    renderStep3AreaSvg();
  } else if (stepId === 'step4') {
    renderStep4SVGs();
  }
}
window.switchStep = switchStep;

// Header Nav Click Listeners
document.querySelectorAll('.step-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const step = btn.getAttribute('data-step');
    if (step) switchStep(step);
  });
});

// Sound Toggle
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
if (soundToggleBtn && soundIcon) {
  soundToggleBtn.addEventListener('click', () => {
    const enabled = sfx.toggle();
    soundIcon.textContent = enabled ? '🔊' : '🔇';
    soundToggleBtn.style.opacity = enabled ? '1' : '0.6';
  });
}

// Fullscreen Toggle
const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.warn(err));
    } else {
      document.exitFullscreen();
    }
    sfx.playClick();
  });
}

// =============================================================================
// 6. STEP 1: WHAT IS A BASE? (0–10 MIN)
// =============================================================================
let s1CurrentBase = 'BC'; // 'BC', 'AC', 'AB'

function setStep1Base(baseName) {
  s1CurrentBase = baseName;

  // Toggle button active state
  ['BC', 'AC', 'AB'].forEach(b => {
    const btn = document.getElementById(`btnS1${b}`);
    if (btn) btn.classList.toggle('active', b === baseName);
  });

  // Update Status Pill
  const label = document.getElementById('s1ActiveBaseLabel');
  const tip = document.getElementById('s1VertexTip');

  if (baseName === 'BC') {
    if (label) label.textContent = 'Основание: сторона BC (нижняя) ➔ Вершина A напротив';
    if (tip) tip.innerHTML = '🎯 <strong>Противолежащая вершина:</strong> Напротив стороны <strong>BC</strong> лежит вершина <strong>A</strong>! Из неё опускается высота <strong>AH ⊥ BC</strong>!';
  } else if (baseName === 'AC') {
    if (label) label.textContent = 'Основание: сторона AC (правая боковая) ➔ Вершина B напротив';
    if (tip) tip.innerHTML = '🎯 <strong>Противолежащая вершина:</strong> Напротив стороны <strong>AC</strong> лежит вершина <strong>B</strong>! Из неё опускается высота <strong>BH ⊥ AC</strong>!';
  } else {
    if (label) label.textContent = 'Основание: сторона AB (левая боковая) ➔ Вершина C напротив';
    if (tip) tip.innerHTML = '🎯 <strong>Противолежащая вершина:</strong> Напротив стороны <strong>AB</strong> лежит вершина <strong>C</strong>! Из неё опускается высота <strong>CH ⊥ AB</strong>!';
  }

  sfx.playPop();
  renderStep1Svg();
}
window.setStep1Base = setStep1Base;
window.setTriangleBase = setStep1Base; // alias

function setTriType(type) {
  document.querySelectorAll('.tt-item').forEach(item => item.classList.remove('active'));
  const map = { acute: 'ttAcute', right: 'ttRight', obtuse: 'ttObtuse' };
  const el = document.getElementById(map[type]);
  if (el) el.classList.add('active');
  sfx.playClick();
}
window.setTriType = setTriType;

function renderStep1Svg() {
  const g = document.getElementById('s1SvgContent') || document.getElementById('triangleSvgGroup');
  if (!g) return;
  g.innerHTML = '';

  // Triangle ABC coordinates on grid
  // Grid: 620 x 360
  const A = { x: 280, y: 55, label: 'A' };
  const B = { x: 90,  y: 290, label: 'B' };
  const C = { x: 530, y: 290, label: 'C' };

  // Shaded polygon
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`);
  poly.setAttribute('fill', '#eff6ff');
  poly.setAttribute('stroke', '#cbd5e1');
  poly.setAttribute('stroke-width', '2');
  g.appendChild(poly);

  // Helper for drawing sides
  const drawSide = (p1, p2, name, isBase) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    line.setAttribute('stroke', isBase ? '#dc2626' : '#2563eb');
    line.setAttribute('stroke-width', isBase ? '8' : '3.5');
    line.setAttribute('stroke-linecap', 'round');
    line.style.cursor = 'pointer';
    line.addEventListener('click', () => setStep1Base(name));
    g.appendChild(line);

    // Label
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', mx + (isBase && p1.y === p2.y ? 0 : (mx < 280 ? -28 : 28)));
    text.setAttribute('y', my + (p1.y === p2.y ? 32 : 5));
    text.setAttribute('font-family', 'var(--font-main)');
    text.setAttribute('font-size', isBase ? '18' : '15');
    text.setAttribute('font-weight', '900');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', isBase ? '#dc2626' : '#64748b');
    text.textContent = isBase ? `ОСНОВАНИЕ ${name}` : `сторона ${name}`;
    text.style.cursor = 'pointer';
    text.addEventListener('click', () => setStep1Base(name));
    g.appendChild(text);
  };

  drawSide(B, C, 'BC', s1CurrentBase === 'BC');
  drawSide(A, C, 'AC', s1CurrentBase === 'AC');
  drawSide(A, B, 'AB', s1CurrentBase === 'AB');

  // Height and opposite vertex calculation
  let topVertex = A;
  let hTarget = { x: 280, y: 290 };
  let hName = 'AH';

  if (s1CurrentBase === 'BC') {
    topVertex = A;
    hTarget = { x: 280, y: 290 };
    hName = 'AH';
  } else if (s1CurrentBase === 'AC') {
    topVertex = B;
    // Perpendicular from B to AC:
    // AC line: from (280,55) to (530,290) -> dx=250, dy=235
    hTarget = { x: 405, y: 172 };
    hName = 'BH';
  } else {
    topVertex = C;
    // Perpendicular from C to AB:
    // AB line: from (280,55) to (90,290) -> dx=-190, dy=235
    hTarget = { x: 195, y: 160 };
    hName = 'CH';
  }

  // Draw height line
  const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  hLine.setAttribute('x1', topVertex.x);
  hLine.setAttribute('y1', topVertex.y);
  hLine.setAttribute('x2', hTarget.x);
  hLine.setAttribute('y2', hTarget.y);
  hLine.setAttribute('stroke', '#047857');
  hLine.setAttribute('stroke-width', '4.5');
  hLine.setAttribute('stroke-dasharray', '8,5');
  hLine.setAttribute('stroke-linecap', 'round');
  g.appendChild(hLine);

  // Height label
  const hMidX = (topVertex.x + hTarget.x) / 2 + (s1CurrentBase === 'BC' ? 18 : 22);
  const hMidY = (topVertex.y + hTarget.y) / 2;
  const hText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  hText.setAttribute('x', hMidX);
  hText.setAttribute('y', hMidY);
  hText.setAttribute('font-family', 'var(--font-mono)');
  hText.setAttribute('font-size', '17');
  hText.setAttribute('font-weight', '900');
  hText.setAttribute('fill', '#047857');
  hText.textContent = `Высота h (${hName} ⊥)`;
  g.appendChild(hText);

  // 90° Right Angle Marker
  const ra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  ra.setAttribute('x', hTarget.x - (s1CurrentBase === 'BC' ? 16 : 10));
  ra.setAttribute('y', hTarget.y - (s1CurrentBase === 'BC' ? 16 : 10));
  ra.setAttribute('width', '16');
  ra.setAttribute('height', '16');
  ra.setAttribute('fill', 'rgba(16, 185, 129, 0.3)');
  ra.setAttribute('stroke', '#10b981');
  ra.setAttribute('stroke-width', '2.5');
  g.appendChild(ra);

  // Draw Vertices circles
  [A, B, C].forEach(v => {
    const isOpposite = v === topVertex;

    // Pulsing aura for opposite vertex
    if (isOpposite) {
      const aura = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      aura.setAttribute('cx', v.x);
      aura.setAttribute('cy', v.y);
      aura.setAttribute('r', '18');
      aura.setAttribute('fill', 'rgba(220, 38, 38, 0.25)');
      g.appendChild(aura);
    }

    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', v.x);
    c.setAttribute('cy', v.y);
    c.setAttribute('r', isOpposite ? '11' : '7.5');
    c.setAttribute('fill', isOpposite ? '#dc2626' : '#1e293b');
    c.setAttribute('stroke', '#ffffff');
    c.setAttribute('stroke-width', '3');
    g.appendChild(c);

    const l = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    l.setAttribute('x', v.x + (v.x < 200 ? -28 : (v.x > 400 ? 28 : 0)));
    l.setAttribute('y', v.y + (v.y < 100 ? -16 : 28));
    l.setAttribute('text-anchor', v.x < 200 ? 'end' : (v.x > 400 ? 'start' : 'middle'));
    l.setAttribute('font-family', 'var(--font-mono)');
    l.setAttribute('font-size', isOpposite ? '21' : '18');
    l.setAttribute('font-weight', '900');
    l.setAttribute('fill', isOpposite ? '#dc2626' : '#0f172a');
    l.textContent = isOpposite ? `${v.label} (ВЕРШИНА НАПРОТИВ)` : v.label;
    g.appendChild(l);
  });
}

// =============================================================================
// 7. STEP 2: THREE CASES OF HEIGHT (10–22 MIN)
// =============================================================================
let s2CurrentCase = 'a'; // 'a', 'b', 'c'
let s2HlMode = 'height'; // 'height', 'base', 'angle'

function selectCase(caseKey) {
  s2CurrentCase = caseKey;

  // Update tabs
  ['a', 'b', 'c'].forEach(k => {
    const btn = document.getElementById(`btnCase${k.toUpperCase()}`);
    if (btn) btn.classList.toggle('active', k === caseKey);
  });

  // Descriptions
  const title = document.getElementById('caseHeadTitle');
  const desc = document.getElementById('caseHeadDesc');
  const metaphor = document.getElementById('obtuseMetaphorCard');

  if (caseKey === 'a') {
    if (title) title.textContent = 'Случай а: В прямоугольном △ABC (∠C = 90°)';
    if (desc) desc.innerHTML = 'Основание — сторона BC. Так как угол ∠C = 90°, сторона AC уже стоит строго под прямым углом! Значит, <strong>сама боковая сторона AC и есть высота</strong> (AC ⊥ BC)!';
    if (metaphor) metaphor.style.display = 'none';
  } else if (caseKey === 'b') {
    if (title) title.textContent = 'Случай b: В остроугольном △DEF (все углы < 90°)';
    if (desc) desc.innerHTML = 'Основание — сторона EF. Из противолежащей вершины D опускаем перпендикуляр DG прямо на сторону EF. <strong>Высота лежит строго ВНУТРИ треугольника!</strong>';
    if (metaphor) metaphor.style.display = 'none';
  } else {
    if (title) title.textContent = 'Случай c: В тупоугольном △WXY (угол ∠X > 90°)';
    if (desc) desc.innerHTML = 'Основание — отрезок XY. Вершина W нависает сбоку, и перпендикуляр не попадает на отрезок XY! <strong>Продлеваем основание пунктиром влево, и высота WZ падает СНАРУЖИ!</strong>';
    if (metaphor) metaphor.style.display = 'block';
  }

  sfx.playClick();
  renderStep2Svg();
}
window.selectCase = selectCase;
window.switchHeightCase = selectCase; // alias

function setS2Hl(mode) {
  s2HlMode = mode;
  const map = { height: 'btnS2HlHeight', base: 'btnS2HlBase', angle: 'btnS2HlAngle' };
  ['height', 'base', 'angle'].forEach(m => {
    const btn = document.getElementById(map[m]);
    if (btn) btn.classList.toggle('active', m === mode);
  });
  sfx.playPop();
  renderStep2Svg();
}
window.setS2Hl = setS2Hl;
window.toggleCaseHighlight = setS2Hl; // alias

function renderStep2Svg() {
  const g = document.getElementById('s2SvgContent') || document.getElementById('caseSvgGroup');
  if (!g) return;
  g.innerHTML = '';

  const addLabel = (txt, x, y, col, sz = '17', anchor = 'middle') => {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('font-family', 'var(--font-main)');
    t.setAttribute('font-size', sz);
    t.setAttribute('font-weight', '900');
    t.setAttribute('fill', col);
    t.setAttribute('text-anchor', anchor);
    t.textContent = txt;
    g.appendChild(t);
  };

  if (s2CurrentCase === 'a') {
    // Case a: Right triangle ABC (C is 90°)
    const C = { x: 170, y: 280, label: 'C' };
    const B = { x: 490, y: 280, label: 'B' };
    const A = { x: 170, y: 65,  label: 'A' };

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`);
    poly.setAttribute('fill', '#eff6ff');
    poly.setAttribute('stroke', '#94a3b8');
    poly.setAttribute('stroke-width', '2');
    g.appendChild(poly);

    // Hypotenuse AB
    const abLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    abLine.setAttribute('x1', A.x);
    abLine.setAttribute('y1', A.y);
    abLine.setAttribute('x2', B.x);
    abLine.setAttribute('y2', B.y);
    abLine.setAttribute('stroke', '#3b82f6');
    abLine.setAttribute('stroke-width', '3');
    g.appendChild(abLine);

    // Base BC
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', C.x);
    baseLine.setAttribute('y1', C.y);
    baseLine.setAttribute('x2', B.x);
    baseLine.setAttribute('y2', B.y);
    baseLine.setAttribute('stroke', '#dc2626');
    baseLine.setAttribute('stroke-width', s2HlMode === 'base' ? '8' : '5');
    baseLine.setAttribute('stroke-linecap', 'round');
    g.appendChild(baseLine);

    // Height AC (Side of right angle)
    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', A.x);
    hLine.setAttribute('y1', A.y);
    hLine.setAttribute('x2', C.x);
    hLine.setAttribute('y2', C.y);
    hLine.setAttribute('stroke', '#047857');
    hLine.setAttribute('stroke-width', s2HlMode === 'height' ? '8' : '5');
    hLine.setAttribute('stroke-linecap', 'round');
    g.appendChild(hLine);

    // Right angle square
    const ra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ra.setAttribute('x', C.x);
    ra.setAttribute('y', C.y - 22);
    ra.setAttribute('width', '22');
    ra.setAttribute('height', '22');
    ra.setAttribute('fill', s2HlMode === 'angle' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(16, 185, 129, 0.25)');
    ra.setAttribute('stroke', s2HlMode === 'angle' ? '#d97706' : '#10b981');
    ra.setAttribute('stroke-width', '3');
    g.appendChild(ra);

    addLabel('90°', C.x + 11, C.y - 6, '#047857', '12');
    addLabel('Основание BC', 330, 312, '#dc2626', '18');
    addLabel('Боковая сторона AC = ВЫСОТА h', 160, 175, '#047857', '17', 'end');
    addLabel('A (вершина)', A.x, A.y - 14, '#0f172a', '18');
    addLabel('B', B.x + 18, B.y + 6, '#0f172a', '18');
    addLabel('C (90°)', C.x - 18, C.y + 24, '#0f172a', '18');

  } else if (s2CurrentCase === 'b') {
    // Case b: Acute triangle DEF
    const D = { x: 300, y: 65,  label: 'D' };
    const E = { x: 120, y: 280, label: 'E' };
    const F = { x: 500, y: 280, label: 'F' };
    const G = { x: 300, y: 280, label: 'G' };

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${D.x},${D.y} ${E.x},${E.y} ${F.x},${F.y}`);
    poly.setAttribute('fill', '#eff6ff');
    poly.setAttribute('stroke', '#3b82f6');
    poly.setAttribute('stroke-width', '3');
    g.appendChild(poly);

    // Base EF
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', E.x);
    baseLine.setAttribute('y1', E.y);
    baseLine.setAttribute('x2', F.x);
    baseLine.setAttribute('y2', F.y);
    baseLine.setAttribute('stroke', '#dc2626');
    baseLine.setAttribute('stroke-width', s2HlMode === 'base' ? '8' : '5');
    baseLine.setAttribute('stroke-linecap', 'round');
    g.appendChild(baseLine);

    // Height DG
    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', D.x);
    hLine.setAttribute('y1', D.y);
    hLine.setAttribute('x2', G.x);
    hLine.setAttribute('y2', G.y);
    hLine.setAttribute('stroke', '#047857');
    hLine.setAttribute('stroke-width', s2HlMode === 'height' ? '7' : '4.5');
    hLine.setAttribute('stroke-dasharray', '7,4');
    hLine.setAttribute('stroke-linecap', 'round');
    g.appendChild(hLine);

    // Right angle at G
    const ra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ra.setAttribute('x', G.x - 18);
    ra.setAttribute('y', G.y - 18);
    ra.setAttribute('width', '18');
    ra.setAttribute('height', '18');
    ra.setAttribute('fill', s2HlMode === 'angle' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(16, 185, 129, 0.25)');
    ra.setAttribute('stroke', s2HlMode === 'angle' ? '#d97706' : '#10b981');
    ra.setAttribute('stroke-width', '2.5');
    g.appendChild(ra);

    addLabel('Основание EF', 310, 315, '#dc2626', '18');
    addLabel('Высота DG (ВНУТРИ ФИГУРЫ)', 315, 175, '#047857', '17', 'start');
    addLabel('D', D.x, D.y - 14, '#0f172a', '18');
    addLabel('E', E.x - 16, E.y + 6, '#0f172a', '18');
    addLabel('F', F.x + 18, F.y + 6, '#0f172a', '18');
    addLabel('G (⊥)', G.x, G.y + 24, '#047857', '16');

  } else {
    // Case c: Obtuse triangle WXY (Height WZ outside)
    const W = { x: 140, y: 65,  label: 'W' };
    const X = { x: 260, y: 280, label: 'X' };
    const Y = { x: 510, y: 280, label: 'Y' };
    const Z = { x: 140, y: 280, label: 'Z' };

    // Shaded Triangle
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${W.x},${W.y} ${X.x},${X.y} ${Y.x},${Y.y}`);
    poly.setAttribute('fill', '#eff6ff');
    poly.setAttribute('stroke', '#3b82f6');
    poly.setAttribute('stroke-width', '3');
    g.appendChild(poly);

    // Extension dashed line from X to Z
    const extLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    extLine.setAttribute('x1', Z.x);
    extLine.setAttribute('y1', Z.y);
    extLine.setAttribute('x2', X.x);
    extLine.setAttribute('y2', X.y);
    extLine.setAttribute('stroke', '#ef4444');
    extLine.setAttribute('stroke-width', '3.5');
    extLine.setAttribute('stroke-dasharray', '6,5');
    g.appendChild(extLine);

    // Base XY
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', X.x);
    baseLine.setAttribute('y1', X.y);
    baseLine.setAttribute('x2', Y.x);
    baseLine.setAttribute('y2', Y.y);
    baseLine.setAttribute('stroke', '#dc2626');
    baseLine.setAttribute('stroke-width', s2HlMode === 'base' ? '8' : '5');
    baseLine.setAttribute('stroke-linecap', 'round');
    g.appendChild(baseLine);

    // Height WZ outside
    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', W.x);
    hLine.setAttribute('y1', W.y);
    hLine.setAttribute('x2', Z.x);
    hLine.setAttribute('y2', Z.y);
    hLine.setAttribute('stroke', '#047857');
    hLine.setAttribute('stroke-width', s2HlMode === 'height' ? '7' : '4.5');
    hLine.setAttribute('stroke-dasharray', '7,4');
    hLine.setAttribute('stroke-linecap', 'round');
    g.appendChild(hLine);

    // Right angle at Z
    const ra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ra.setAttribute('x', Z.x);
    ra.setAttribute('y', Z.y - 18);
    ra.setAttribute('width', '18');
    ra.setAttribute('height', '18');
    ra.setAttribute('fill', s2HlMode === 'angle' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(16, 185, 129, 0.25)');
    ra.setAttribute('stroke', s2HlMode === 'angle' ? '#d97706' : '#10b981');
    ra.setAttribute('stroke-width', '2.5');
    g.appendChild(ra);

    addLabel('Основание XY', 385, 312, '#dc2626', '18');
    addLabel('Продолжение стороны (пунктир)', 200, 312, '#ef4444', '13');
    addLabel('Высота WZ (СНАРУЖИ!)', 130, 175, '#047857', '17', 'end');
    addLabel('W (нависает)', W.x, W.y - 14, '#0f172a', '18');
    addLabel('X (тупой угол)', X.x, X.y - 14, '#0f172a', '16');
    addLabel('Y', Y.x + 18, Y.y + 6, '#0f172a', '18');
    addLabel('Z (точка падения)', Z.x, Z.y + 24, '#047857', '16');
  }
}

// Task 2 from Textbook Showcase
function showEFGCase(side) {
  ['EG', 'EF', 'FG'].forEach(s => {
    const btn = document.getElementById(`btnEFG_${s}`);
    if (btn) btn.classList.toggle('active', s === side);
  });

  const box = document.getElementById('girlAnswerBox');
  if (!box) return;

  if (side === 'FG') {
    box.innerHTML = `
      <span class="girl-emoji">👧</span>
      <div class="girl-text">
        <strong>Ответ на вопрос девочки в учебнике (стр. 92):</strong><br>
        «Если основание — отрезок <strong>FG</strong>, то противолежащая вершина — <strong>E</strong>, а высота — отрезок <strong>EK</strong> (так как EK ⊥ FG)!»
      </div>
    `;
    sfx.playSuccess();
    confetti.fire(35);
  } else if (side === 'EG') {
    box.innerHTML = `
      <span class="girl-emoji">📐</span>
      <div class="girl-text">
        <strong>Случай 1 (Основание EG):</strong> Противолежащая вершина <strong>F</strong> ➔ Опускаем высоту <strong>FH ⊥ EG</strong>!
      </div>
    `;
    sfx.playPop();
  } else {
    box.innerHTML = `
      <span class="girl-emoji">📐</span>
      <div class="girl-text">
        <strong>Случай 2 (Основание EF):</strong> Противолежащая вершина <strong>G</strong> ➔ Опускаем высоту <strong>GJ ⊥ EF</strong>!
      </div>
    `;
    sfx.playPop();
  }
}
window.showEFGCase = showEFGCase;
window.showEFGHeight = showEFGCase; // alias

// =============================================================================
// 8. STEP 3: SET SQUARE & AREA FORMULA S = (a · h) : 2 (22–32 MIN)
// =============================================================================
let s3RulerApplied = true;

function animateRulerSlide() {
  s3RulerApplied = true;
  const btnApply = document.getElementById('btnRulerSlide') || document.getElementById('btnRulerApply');
  const btnReset = document.getElementById('btnRulerReset') || document.getElementById('btnRulerHide');
  if (btnApply) btnApply.classList.add('active');
  if (btnReset) btnReset.classList.remove('active');
  sfx.playSuccess();
  renderStep3RulerSvg();
}
window.animateRulerSlide = animateRulerSlide;
window.applySetSquare = animateRulerSlide; // alias

function resetRulerView() {
  s3RulerApplied = false;
  const btnApply = document.getElementById('btnRulerSlide') || document.getElementById('btnRulerApply');
  const btnReset = document.getElementById('btnRulerReset') || document.getElementById('btnRulerHide');
  if (btnApply) btnApply.classList.remove('active');
  if (btnReset) btnReset.classList.add('active');
  sfx.playClick();
  renderStep3RulerSvg();
}
window.resetRulerView = resetRulerView;
window.hideSetSquare = resetRulerView; // alias

function renderStep3RulerSvg() {
  const g = document.getElementById('s3RulerSvgContent') || document.getElementById('rulerSvgGroup');
  if (!g) return;
  g.innerHTML = '';

  const A = { x: 280, y: 50 };
  const B = { x: 110, y: 260 };
  const C = { x: 470, y: 260 };
  const H = { x: 280, y: 260 };

  // Base Triangle ABC
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`);
  poly.setAttribute('fill', '#eff6ff');
  poly.setAttribute('stroke', '#2563eb');
  poly.setAttribute('stroke-width', '3');
  g.appendChild(poly);

  // Red base BC
  const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  baseLine.setAttribute('x1', B.x);
  baseLine.setAttribute('y1', B.y);
  baseLine.setAttribute('x2', C.x);
  baseLine.setAttribute('y2', C.y);
  baseLine.setAttribute('stroke', '#dc2626');
  baseLine.setAttribute('stroke-width', '6');
  baseLine.setAttribute('stroke-linecap', 'round');
  g.appendChild(baseLine);

  // Height line AH
  const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  hLine.setAttribute('x1', A.x);
  hLine.setAttribute('y1', A.y);
  hLine.setAttribute('x2', H.x);
  hLine.setAttribute('y2', H.y);
  hLine.setAttribute('stroke', '#047857');
  hLine.setAttribute('stroke-width', '4');
  hLine.setAttribute('stroke-dasharray', '6,4');
  g.appendChild(hLine);

  // Set square (Угольник 90°)
  if (s3RulerApplied) {
    const ruler = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    ruler.setAttribute('points', `${H.x},${H.y} ${H.x},${A.y} ${H.x + 140},${H.y}`);
    ruler.setAttribute('fill', 'rgba(245, 158, 11, 0.45)');
    ruler.setAttribute('stroke', '#d97706');
    ruler.setAttribute('stroke-width', '3');
    g.appendChild(ruler);

    // Inner cutout of drafting triangle
    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    inner.setAttribute('points', `${H.x + 20},${H.y - 20} ${H.x + 20},${A.y + 60} ${H.x + 90},${H.y - 20}`);
    inner.setAttribute('fill', '#ffffff');
    inner.setAttribute('stroke', '#d97706');
    inner.setAttribute('stroke-width', '2');
    g.appendChild(inner);

    // Right angle marker on ruler
    const ra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ra.setAttribute('x', H.x);
    ra.setAttribute('y', H.y - 18);
    ra.setAttribute('width', '18');
    ra.setAttribute('height', '18');
    ra.setAttribute('fill', 'rgba(220, 38, 38, 0.35)');
    ra.setAttribute('stroke', '#dc2626');
    ra.setAttribute('stroke-width', '2');
    g.appendChild(ra);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', H.x + 45);
    txt.setAttribute('y', H.y - 50);
    txt.setAttribute('font-family', 'var(--font-main)');
    txt.setAttribute('font-size', '15');
    txt.setAttribute('font-weight', '900');
    txt.setAttribute('fill', '#92400e');
    txt.textContent = 'УГОЛЬНИК 90°';
    g.appendChild(txt);
  }

  // Label tags
  const addT = (txt, x, y, col) => {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('font-family', 'var(--font-main)');
    t.setAttribute('font-size', '16');
    t.setAttribute('font-weight', '900');
    t.setAttribute('fill', col);
    t.textContent = txt;
    g.appendChild(t);
  };

  addT('Основание a (сторона BC)', 240, 290, '#dc2626');
  addT('Высота h (AH ⊥ BC)', 270, 160, '#047857');
  addT('A', A.x - 5, A.y - 12, '#0f172a');
  addT('B', B.x - 18, B.y + 6, '#0f172a');
  addT('C', C.x + 12, C.y + 6, '#0f172a');
}

function renderStep3AreaSvg() {
  const svg = document.getElementById('s3AreaVisualSvg') || document.getElementById('areaHalfSvg');
  if (!svg) return;
  svg.innerHTML = '';

  // Surrounding rectangle
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '60');
  rect.setAttribute('y', '25');
  rect.setAttribute('width', '300');
  rect.setAttribute('height', '100');
  rect.setAttribute('fill', 'rgba(226, 232, 240, 0.4)');
  rect.setAttribute('stroke', '#94a3b8');
  rect.setAttribute('stroke-width', '2');
  rect.setAttribute('stroke-dasharray', '6,4');
  svg.appendChild(rect);

  // Triangle inside (half of rectangle)
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', '60,125 360,125 210,25');
  poly.setAttribute('fill', '#eff6ff');
  poly.setAttribute('stroke', '#2563eb');
  poly.setAttribute('stroke-width', '3');
  svg.appendChild(poly);

  // Red base
  const bLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  bLine.setAttribute('x1', '60');
  bLine.setAttribute('y1', '125');
  bLine.setAttribute('x2', '360');
  bLine.setAttribute('y2', '125');
  bLine.setAttribute('stroke', '#dc2626');
  bLine.setAttribute('stroke-width', '5');
  svg.appendChild(bLine);

  // Height line
  const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  hLine.setAttribute('x1', '210');
  hLine.setAttribute('y1', '25');
  hLine.setAttribute('x2', '210');
  hLine.setAttribute('y2', '125');
  hLine.setAttribute('stroke', '#047857');
  hLine.setAttribute('stroke-width', '3');
  hLine.setAttribute('stroke-dasharray', '5,4');
  svg.appendChild(hLine);

  // Base text
  const bTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  bTxt.setAttribute('x', '210');
  bTxt.setAttribute('y', '152');
  bTxt.setAttribute('font-family', 'var(--font-mono)');
  bTxt.setAttribute('font-size', '16');
  bTxt.setAttribute('font-weight', '900');
  bTxt.setAttribute('text-anchor', 'middle');
  bTxt.setAttribute('fill', '#dc2626');
  bTxt.textContent = 'Основание a';
  svg.appendChild(bTxt);

  // Height text
  const hTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  hTxt.setAttribute('x', '225');
  hTxt.setAttribute('y', '80');
  hTxt.setAttribute('font-family', 'var(--font-mono)');
  hTxt.setAttribute('font-size', '16');
  hTxt.setAttribute('font-weight', '900');
  hTxt.setAttribute('fill', '#047857');
  hTxt.textContent = 'h';
  svg.appendChild(hTxt);
}

// =============================================================================
// 9. STEP 4: WORKBOOK PRACTICE & TRAPS (32–45 MIN)
// =============================================================================
function switchPracTab(tabNum) {
  [1, 2, 3].forEach(n => {
    const btn = document.getElementById(`btnPracTab${n}`);
    const view = document.getElementById(`pracView${n}`);
    if (btn) btn.classList.toggle('active', n === tabNum);
    if (view) view.classList.toggle('active', n === tabNum);
  });
  sfx.playClick();
}
window.switchPracTab = switchPracTab;

function toggleSubAnswer(id) {
  const panel = document.getElementById(`ansPanel${id}`) || document.getElementById(`subAns${id}`);
  if (panel) {
    panel.classList.toggle('show');
    sfx.playPop();
  }
}
window.toggleSubAnswer = toggleSubAnswer;
window.revealSubcaseAns = toggleSubAnswer; // alias

function renderStep4SVGs() {
  // SVG 1a (Obtuse triangle with BD outside)
  const svg1a = document.getElementById('s4Svg1a') || document.getElementById('svgSub1a');
  if (svg1a && !svg1a.hasChildNodes()) {
    svg1a.innerHTML = `
      <polygon points="120,35 190,150 330,150" fill="#eff6ff" stroke="#2563eb" stroke-width="2.5"/>
      <line x1="120" y1="150" x2="190" y2="150" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4,4"/>
      <line x1="190" y1="150" x2="330" y2="150" stroke="#dc2626" stroke-width="4.5"/>
      <line x1="120" y1="35" x2="120" y2="150" stroke="#047857" stroke-width="3.5" stroke-dasharray="5,4"/>
      <rect x="120" y="135" width="15" height="15" fill="rgba(16,185,129,0.3)" stroke="#10b981" stroke-width="2"/>
      <text x="110" y="30" font-weight="900" font-size="15" fill="#0f172a">B</text>
      <text x="185" y="168" font-weight="900" font-size="15" fill="#0f172a">A</text>
      <text x="335" y="158" font-weight="900" font-size="15" fill="#0f172a">C</text>
      <text x="105" y="168" font-weight="900" font-size="15" fill="#047857">D</text>
      <text x="240" y="172" fill="#dc2626" font-weight="900" font-size="13">Основание AC</text>
      <text x="40" y="95" fill="#047857" font-weight="900" font-size="13">Высота BD ⊥</text>
    `;
  }

  // SVG 1b (Base AC at top, BD downwards)
  const svg1b = document.getElementById('s4Svg1b') || document.getElementById('svgSub1b');
  if (svg1b && !svg1b.hasChildNodes()) {
    svg1b.innerHTML = `
      <polygon points="80,45 320,45 200,150" fill="#eff6ff" stroke="#2563eb" stroke-width="2.5"/>
      <line x1="80" y1="45" x2="320" y2="45" stroke="#dc2626" stroke-width="4.5"/>
      <line x1="200" y1="150" x2="200" y2="45" stroke="#047857" stroke-width="3.5" stroke-dasharray="5,4"/>
      <rect x="200" y="45" width="15" height="15" fill="rgba(16,185,129,0.3)" stroke="#10b981" stroke-width="2"/>
      <text x="70" y="40" font-weight="900" font-size="15" fill="#0f172a">A</text>
      <text x="325" y="40" font-weight="900" font-size="15" fill="#0f172a">C</text>
      <text x="200" y="172" font-weight="900" font-size="15" fill="#0f172a">B</text>
      <text x="200" y="35" font-weight="900" font-size="15" fill="#047857">D</text>
      <text x="140" y="30" fill="#dc2626" font-weight="900" font-size="13">Основание AC сверху</text>
      <text x="220" y="105" fill="#047857" font-weight="900" font-size="13">Высота BD ⊥</text>
    `;
  }
}
window.renderPracticeSubcases = renderStep4SVGs; // alias

// Interactive Workbook Cards 1-6 Click Handler
const wbCardExplanations = {
  1: 'Угол ∠B = 90° прямой, значит сторона BC ⊥ AB и выходит из вершины C!',
  2: 'Из противолежащей вершины E опущен перпендикуляр EG на продолжение основания FD (∠G = 90°).',
  3: '⚠️ Ловушка! На рисунке два перпендикуляра (RS и QT), но к стороне PQ из вершины R проведён именно RS ⊥ PQ!',
  4: '⚠️ Ловушка! Отрезок LP ⊥ KM, а нам нужно основание LM! На него опущен перпендикуляр KN ⊥ LM.',
  5: 'Прямой угол (90°) у точки D лежит на стороне AC (BD ⊥ AC).',
  6: 'Высота FH опущена под прямым углом на пунктирное продолжение стороны EG (FH ⊥ EG).'
};

function handleWbClick(cardNum, choice, isCorrect) {
  const card = document.getElementById(`wbCard${cardNum}`);
  const slot = document.getElementById(`slot${cardNum}`);
  const fb = document.getElementById(`wicFb${cardNum}`) || document.getElementById(`wbHint${cardNum}`);

  if (card) {
    const buttons = card.querySelectorAll('.wic-btn, .wb-opt-btn');
    buttons.forEach(b => {
      b.classList.remove('active-correct', 'active-wrong', 'correct', 'wrong');
      if (b.textContent.includes(choice)) {
        b.classList.add(isCorrect ? 'active-correct' : 'active-wrong');
      }
    });
  }

  if (slot) {
    slot.textContent = choice;
    slot.classList.toggle('filled-correct', isCorrect);
    slot.classList.toggle('filled-wrong', !isCorrect);
  }

  if (fb) {
    if (isCorrect) {
      fb.className = 'wic-feedback correct show';
      fb.innerHTML = `✓ <strong>Верно!</strong> ${wbCardExplanations[cardNum]}`;
      sfx.playSuccess();
      confetti.fire(35);
    } else {
      fb.className = 'wic-feedback wrong show';
      fb.innerHTML = `✕ <strong>Ошибка!</strong> Попробуй другой вариант. Внимательно посмотри, куда падает угол 90°!`;
      sfx.playWrong();
    }
  }
}
window.handleWbClick = handleWbClick;
window.checkWbAnswer = handleWbClick; // alias

// =============================================================================
// 10. STEP 5: FINAL QUIZ (5 KEY QUESTIONS ON TRIANGLE BASE & HEIGHT)
// =============================================================================
const quizData = [
  {
    q: '1. Чему равна сумма всех трёх углов абсолютно любого треугольника?',
    options: ['90°', '180°', '360°', '100°'],
    answer: 1,
    hint: 'Правильно! Сумма углов в любом треугольнике всегда равна 180°!'
  },
  {
    q: '2. Сколько всего высот можно провести в одном треугольнике?',
    options: ['Только 1', 'Ровно 2', 'Ровно 3 (к каждой из трёх сторон)', 'Бесконечно много'],
    answer: 2,
    hint: 'Супер! У любого треугольника 3 стороны, поэтому можно опустить 3 разные высоты!'
  },
  {
    q: '3. В каком треугольнике высота совпадает с его собственной боковой стороной?',
    options: ['В остроугольном', 'В прямоугольном', 'В тупоугольном', 'Ни в каком'],
    answer: 1,
    hint: 'Отлично! В прямоугольном треугольнике стороны прямого угла уже перпендикулярны!'
  },
  {
    q: '4. В каком треугольнике высота падает СНАРУЖИ на продолжение основания?',
    options: ['В прямоугольном', 'В равностороннем', 'В тупоугольном', 'В остроугольном'],
    answer: 2,
    hint: 'Точно! Вершина нависает сбоку, поэтому опускаем высоту на пунктирную дорожку!'
  },
  {
    q: '5. Основание треугольника a = 10 см, а высота h = 6 см. Чему равна его площадь S?',
    options: ['60 см²', '30 см²', '16 см²', '40 см²'],
    answer: 1,
    hint: 'Браво! S = (a · h) : 2 = (10 · 6) : 2 = 60 : 2 = 30 см² (половина прямоугольника)!'
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
  const qIndexEl = document.getElementById('quizQIndex');
  const qTextEl = document.getElementById('quizQuestionText');
  const grid = document.getElementById('quizOptionsGrid');
  const feedbackBar = document.getElementById('quizFeedbackBar');

  if (qIndexEl) qIndexEl.textContent = `${quizState.index + 1} / ${quizData.length}`;
  if (qTextEl) qTextEl.textContent = qObj.q;

  if (grid) {
    grid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    qObj.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<span class="opt-letter">${letters[idx]}</span> <span>${opt}</span>`;
      btn.addEventListener('click', () => selectQuizAnswer(idx, btn));
      grid.appendChild(btn);
    });
  }

  if (feedbackBar) feedbackBar.classList.remove('show');
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
    const scoreEl = document.getElementById('quizScore');
    if (scoreEl) scoreEl.textContent = `${quizState.score} ⭐`;
    buttonEl.classList.add('correct');
    if (feedbackIcon) feedbackIcon.textContent = '🎉';
    if (feedbackMsg) feedbackMsg.textContent = qObj.hint;
    sfx.playSuccess();
    confetti.fire(50);
  } else {
    buttonEl.classList.add('wrong');
    const options = document.querySelectorAll('.quiz-option-btn');
    if (options[qObj.answer]) options[qObj.answer].classList.add('correct');
    if (feedbackIcon) feedbackIcon.textContent = '🤔';
    if (feedbackMsg) feedbackMsg.textContent = `Ошибка! ${qObj.hint}`;
    sfx.playWrong();
  }

  if (feedbackBar) feedbackBar.classList.add('show');
}

function nextQuizQuestion() {
  if (quizState.index < quizData.length - 1) {
    quizState.index++;
    renderQuizQuestion();
    sfx.playClick();
  } else {
    const body = document.getElementById('quizBody');
    const finishCard = document.getElementById('quizFinishCard');
    const summary = document.getElementById('quizFinalSummary');

    if (body) body.style.display = 'none';
    if (finishCard) finishCard.style.display = 'flex';
    if (summary) {
      summary.textContent = `Вы правильно ответили на ${quizState.score} из ${quizData.length} вопросов!`;
    }
    sfx.playSuccess();
    confetti.fire(120);
  }
}
window.nextQuizQuestion = nextQuizQuestion;

function restartQuiz() {
  quizState.index = 0;
  quizState.score = 0;
  const scoreEl = document.getElementById('quizScore');
  const body = document.getElementById('quizBody');
  const finishCard = document.getElementById('quizFinishCard');

  if (scoreEl) scoreEl.textContent = '0 ⭐';
  if (body) body.style.display = 'flex';
  if (finishCard) finishCard.style.display = 'none';

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
    title: 'Блок 2 — Три случая высот, периметр и площадь',
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

  const title = document.getElementById('nbTitle');
  const time = document.getElementById('nbTime');
  const content = document.getElementById('notebookContent');
  const modal = document.getElementById('notebookModal');

  if (title) title.textContent = data.title;
  if (time) time.textContent = data.time;
  if (content) content.innerHTML = data.html;
  if (modal) modal.classList.add('active');

  sfx.playClick();
}
window.openNotebookModal = openNotebookModal;

function closeNotebookModal() {
  const modal = document.getElementById('notebookModal');
  if (modal) modal.classList.remove('active');
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

// =============================================================================
// 12. INITIALIZATION ON DOM READY
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  renderStep1Svg();
  renderStep2Svg();
  renderStep3RulerSvg();
  renderStep3AreaSvg();
  renderStep4SVGs();
  renderQuizQuestion();
});
