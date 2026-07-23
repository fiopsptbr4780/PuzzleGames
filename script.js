// ============================================
// GAME STATE & CONFIGURATION
// ============================================

const GAME_STATE = {
  currentDifficulty: 'easy',
  timerStartTime: null,
  timerInterval: null,
  totalScore: 0,
  attempts: 0,
  hintsUsed: 0,
  attemptsHistory: [],
  unlockedHints: [],
};

const DIFFICULTY_CONFIG = {
  easy: {
    timeLimit: 25 * 60, // 25 minutes
    hintsAvailable: 5,
    hintThresholds: [5 * 60, 10 * 60, 15 * 60, 20 * 60],
  },
  medium: {
    timeLimit: 20 * 60, // 20 minutes
    hintsAvailable: 3,
    hintThresholds: [3 * 60, 10 * 60, 15 * 60],
  },
  hard: {
    timeLimit: 15 * 60, // 15 minutes
    hintsAvailable: 1,
    hintThresholds: [10 * 60],
  },
};

const HINTS = [
  {
    id: 'hint-1',
    text: '💡 A credencial foi perdida pelo Engenheiro de Segurança. Procura o local onde foi deixada.',
    difficulty: ['easy', 'medium', 'hard'],
  },
  {
    id: 'hint-2',
    text: '🕐 Os logs mostram atividade às 03:00. Identifica quem tinha acesso ao terminal nessa hora.',
    difficulty: ['easy', 'medium'],
  },
  {
    id: 'hint-3',
    text: '🧪 A substância usada não é um vírus tradicional. Procura no dossiê do Geneticista.',
    difficulty: ['easy'],
  },
  {
    id: 'hint-4',
    text: '🚪 O local do crime é onde os protocolos de segurança podem ser desativados.',
    difficulty: ['easy'],
  },
  {
    id: 'hint-5',
    text: '🔍 Arquiteto de Sistemas + Neurotoxina B + Sala de Descontaminação = Solução principal.',
    difficulty: ['easy'],
  },
];

const DOSSIES = [
  {
    titulo: 'Dossiê – Engenheiro de Segurança',
    corpo: `
      <p><strong>Nota direta:</strong> "Perdi o meu cartão às 02:30 no refeitório."</p>
      <p><strong>Perfil:</strong> Responsável por credenciais de acesso e sistemas físicos de proteção.</p>
      <p><strong>Ligação ao puzzle:</strong> A credencial desviada é usada na preparação do mecanismo para a Sala de Descontaminação.</p>
      <p><strong>Motivação:</strong> Sem acesso direto, é um peão involuntário na trama.</p>
    `,
  },
  {
    titulo: 'Dossiê – Arquiteto de Sistemas',
    corpo: `
      <p><strong>Perfil:</strong> Administra o terminal central, incluindo módulo de Armazenamento Térmico.</p>
      <p><strong>Log chave:</strong> Atividade identificada às 03:00, associada a manipulação de protocolos de segurança.</p>
      <p><strong>Ligação ao puzzle:</strong> A combinação de "SISTEMAS" e "03:00" aponta para este papel como principal suspeito.</p>
      <p><strong>Motivação:</strong> Acesso total aos sistemas críticos do laboratório.</p>
    `,
  },
  {
    titulo: 'Dossiê – Geneticista',
    corpo: `
      <p><strong>Perfil:</strong> Gestora de amostras, incluindo Neurotoxina B e Solvente C, com acesso ao Armazenamento Térmico.</p>
      <p><strong>Cenários alternativos:</strong> Em determinadas configurações, o Geneticista pode ser o culpado ou nenhum culpado direto é identificado.</p>
      <p><strong>Ligação ao puzzle:</strong> As pistas de Origem e Agente ligam o seu trabalho às salas de Armazenamento Térmico e Reatores.</p>
    `,
  },
];

const CORRECT_SOLUTION = {
  culpado: 'Arquiteto de Sistemas',
  substancia: 'Neurotoxina B',
  local: 'Sala de Descontaminação',
};

// ============================================
// DOM ELEMENTS
// ============================================

const carousel = document.getElementById('carousel3d');
const cards = Array.from(document.querySelectorAll('.card-3d'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const navIndicators = document.getElementById('navIndicators');
const timerValue = document.getElementById('timerValue');
const timerContainer = document.getElementById('timerContainer');
const solverBtn = document.getElementById('solverBtn');
const solverResult = document.getElementById('solverResult');
const scoreValue = document.getElementById('scoreValue');
const attemptsValue = document.getElementById('attemptsValue');
const hintsUsedValue = document.getElementById('hintsUsedValue');
const attemptsHistory = document.getElementById('attemptsHistory');
const hintsContainer = document.getElementById('hintsContainer');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const dossieBackdrop = document.getElementById('dossieBackdrop');
const dossieTitleEl = document.getElementById('dossieTitle');
const dossieBodyEl = document.getElementById('dossieBody');
const closeBtn = document.getElementById('closeDossieBtn');

// ============================================
// INITIALIZATION
// ============================================

function initGame() {
  loadGameState();
  renderCarousel();
  renderHints();
  startTimer();
  setupEventListeners();
  updateScoreDisplay();
}

function loadGameState() {
  const saved = localStorage.getItem('puzzleGameState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(GAME_STATE, parsed);
    } catch (e) {
      console.warn('Failed to load saved game state');
    }
  }
}

function saveGameState() {
  localStorage.setItem('puzzleGameState', JSON.stringify(GAME_STATE));
}

// ============================================
// CAROUSEL FUNCTIONALITY
// ============================================

let activeIndex = 0;
const angleStep = 26;
const gap = 60;
const depth = 220;

function renderCarousel() {
  navIndicators.innerHTML = '';
  cards.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = 'nav-indicator-dot' + (idx === activeIndex ? ' active' : '');
    dot.dataset.index = idx;
    dot.addEventListener('click', () => setActiveIndex(idx));
    navIndicators.appendChild(dot);
  });
  layoutCards();
}

function setActiveIndex(newIndex) {
  const total = cards.length;
  activeIndex = (newIndex + total) % total;
  layoutCards();
  updateIndicators();
}

function layoutCards() {
  cards.forEach((card, idx) => {
    const offset = idx - activeIndex;
    const rotateY = offset * angleStep;
    const translateX = offset * (gap + 40);
    const translateZ = -Math.abs(offset) * depth;
    const scale = idx === activeIndex ? 1 : 1 - Math.min(Math.abs(offset) * 0.09, 0.25);

    card.style.transform = `
      translate3d(${translateX}px, -50%, ${translateZ}px)
      rotateY(${rotateY}deg)
      scale(${scale})
    `;

    card.classList.toggle('active', idx === activeIndex);
    card.classList.toggle('inactive', idx !== activeIndex);
    card.style.zIndex = String(100 - Math.abs(offset));
  });
}

function updateIndicators() {
  const dots = navIndicators.querySelectorAll('.nav-indicator-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === activeIndex);
  });
}

// ============================================
// TIMER FUNCTIONALITY
// ============================================

function startTimer() {
  if (!GAME_STATE.timerStartTime) {
    GAME_STATE.timerStartTime = Date.now();
  }

  if (GAME_STATE.timerInterval) {
    clearInterval(GAME_STATE.timerInterval);
  }

  GAME_STATE.timerInterval = setInterval(updateTimer, 1000);
  updateTimer(); // Initial call
}

function updateTimer() {
  const config = DIFFICULTY_CONFIG[GAME_STATE.currentDifficulty];
  const elapsed = Math.floor((Date.now() - GAME_STATE.timerStartTime) / 1000);
  const remaining = Math.max(0, config.timeLimit - elapsed);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  timerValue.classList.remove('warning', 'critical');

  if (remaining <= config.timeLimit * 0.25) {
    timerValue.classList.add('critical');
  } else if (remaining <= config.timeLimit * 0.5) {
    timerValue.classList.add('warning');
  }

  if (remaining === 0) {
    clearInterval(GAME_STATE.timerInterval);
    timerValue.textContent = 'TEMPO ESGOTADO!';
    solverBtn.disabled = true;
  }

  // Unlock hints based on time
  checkHintThresholds(elapsed);
}

function checkHintThresholds(elapsed) {
  const config = DIFFICULTY_CONFIG[GAME_STATE.currentDifficulty];
  config.hintThresholds.forEach((threshold, idx) => {
    if (elapsed >= threshold && !GAME_STATE.unlockedHints.includes(idx)) {
      GAME_STATE.unlockedHints.push(idx);
      renderHints();
    }
  });
}

// ============================================
// HINTS SYSTEM
// ============================================

function renderHints() {
  hintsContainer.innerHTML = '';

  const availableHints = HINTS.filter((h) => h.difficulty.includes(GAME_STATE.currentDifficulty));

  availableHints.forEach((hint, idx) => {
    const isUnlocked = GAME_STATE.unlockedHints.includes(idx);
    const hintEl = document.createElement('div');
    hintEl.className = `hint ${isUnlocked ? 'unlocked' : 'locked'}`;
    hintEl.textContent = isUnlocked ? hint.text : '🔒 Dica bloqueada (desbloqueada pelo tempo)';

    if (isUnlocked) {
      hintEl.addEventListener('click', () => {
        if (!hintEl.dataset.used) {
          GAME_STATE.hintsUsed++;
          hintEl.dataset.used = 'true';
          updateScoreDisplay();
          saveGameState();
        }
      });
    }

    hintsContainer.appendChild(hintEl);
  });
}

// ============================================
// SOLVER & SCORING
// ============================================

function calculateScore() {
  const config = DIFFICULTY_CONFIG[GAME_STATE.currentDifficulty];
  const elapsed = Math.floor((Date.now() - GAME_STATE.timerStartTime) / 1000);
  const timeBonus = Math.max(0, config.timeLimit - elapsed) / 10; // Bonus por tempo restante
  const hintsDeduction = GAME_STATE.hintsUsed * 50;
  const baseScore = 1000;

  return Math.max(0, baseScore + timeBonus - hintsDeduction);
}

function handleSolveAttempt() {
  const culpado = document.getElementById('culpadoSelect').value;
  const substancia = document.getElementById('substanciaSelect').value;
  const local = document.getElementById('localSelect').value;

  const isCorrect =
    culpado === CORRECT_SOLUTION.culpado &&
    substancia === CORRECT_SOLUTION.substancia &&
    local === CORRECT_SOLUTION.local;

  GAME_STATE.attempts++;
  const score = isCorrect ? calculateScore() : 0;
  GAME_STATE.totalScore += score;

  const attemptRecord = {
    attempt: GAME_STATE.attempts,
    correct: isCorrect,
    score: score,
    timestamp: new Date().toLocaleTimeString('pt-PT'),
  };

  GAME_STATE.attemptsHistory.push(attemptRecord);
  saveGameState();
  updateScoreDisplay();
  renderAttemptsHistory();

  if (isCorrect) {
    solverResult.textContent = `✔ CORRETO! Pontuação: ${score} | Tempo: ${document.getElementById('timerValue').textContent}`;
    solverResult.classList.remove('fail');
    solverResult.classList.add('ok');
    showConfetti();
    solverBtn.disabled = true;
  } else {
    solverResult.textContent = `✖ Combinação incorreta. Explora as pistas e tenta novamente!`;
    solverResult.classList.remove('ok');
    solverResult.classList.add('fail');
  }
}

// ============================================
// SCORE DISPLAY
// ============================================

function updateScoreDisplay() {
  scoreValue.textContent = GAME_STATE.totalScore.toLocaleString('pt-PT');
  attemptsValue.textContent = GAME_STATE.attempts;
  hintsUsedValue.textContent = GAME_STATE.hintsUsed;
  renderAttemptsHistory();
}

function renderAttemptsHistory() {
  attemptsHistory.innerHTML = '';

  if (GAME_STATE.attemptsHistory.length === 0) {
    attemptsHistory.textContent = 'Nenhuma tentativa ainda.';
    return;
  }

  GAME_STATE.attemptsHistory.slice(-5).forEach((record) => {
    const item = document.createElement('div');
    item.className = `attempt-item ${record.correct ? 'success' : 'failure'}`;
    item.textContent = `#${record.attempt} - ${record.correct ? '✔ Correto' : '✖ Incorreto'} (${record.score} pts) - ${record.timestamp}`;
    attemptsHistory.appendChild(item);
  });
}

// ============================================
// MODAL DOSSIE
// ============================================

function openDossie(idx) {
  const data = DOSSIES[idx] || DOSSIES[0];
  dossieTitleEl.textContent = data.titulo;
  dossieBodyEl.innerHTML = data.corpo;
  dossieBackdrop.classList.add('open');
}

function closeDossie() {
  dossieBackdrop.classList.remove('open');
}

// ============================================
// CONFETTI ANIMATION (Success Feedback)
// ============================================

function showConfetti() {
  const confettiPieces = 30;
  for (let i = 0; i < confettiPieces; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = ['#8ef0a0', '#6fd7ff', '#9fb7ff', '#ffa500'][Math.floor(Math.random() * 4)];
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '999';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';

    document.body.appendChild(confetti);

    const duration = 2 + Math.random() * 1;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = elapsed / duration;

      if (progress >= 1) {
        confetti.remove();
        return;
      }

      confetti.style.top = Math.random() * 100 + 'vh';
      confetti.style.opacity = 1 - progress;
      requestAnimationFrame(animate);
    };

    animate();
  }
}

// ============================================
// DIFFICULTY SELECTOR
// ============================================

function setDifficulty(difficulty) {
  GAME_STATE.currentDifficulty = difficulty;
  GAME_STATE.timerStartTime = Date.now();
  GAME_STATE.attempts = 0;
  GAME_STATE.hintsUsed = 0;
  GAME_STATE.unlockedHints = [];
  GAME_STATE.attemptsHistory = [];
  GAME_STATE.totalScore = 0;

  solverBtn.disabled = false;
  solverResult.textContent = '';
  solverResult.classList.remove('ok', 'fail');

  updateScoreDisplay();
  renderHints();
  startTimer();

  difficultyBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
  });

  saveGameState();
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  prevBtn.addEventListener('click', () => setActiveIndex(activeIndex - 1));
  nextBtn.addEventListener('click', () => setActiveIndex(activeIndex + 1));

  let wheelDebounce = null;
  carousel.addEventListener(
    'wheel',
    (evt) => {
      evt.preventDefault();
      if (wheelDebounce) return;
      wheelDebounce = setTimeout(() => (wheelDebounce = null), 220);

      const delta = evt.deltaY || evt.deltaX;
      if (delta > 0) {
        setActiveIndex(activeIndex + 1);
      } else if (delta < 0) {
        setActiveIndex(activeIndex - 1);
      }
    },
    { passive: false }
  );

  let touchStartX = null;
  let touchEndX = null;

  carousel.addEventListener('touchstart', (evt) => {
    if (evt.touches.length === 1) {
      touchStartX = evt.touches[0].clientX;
    }
  });

  carousel.addEventListener('touchmove', (evt) => {
    if (evt.touches.length === 1) {
      touchEndX = evt.touches[0].clientX;
    }
  });

  carousel.addEventListener('touchend', () => {
    if (touchStartX !== null && touchEndX !== null) {
      const deltaX = touchEndX - touchStartX;
      if (Math.abs(deltaX) > 30) {
        if (deltaX < 0) {
          setActiveIndex(activeIndex + 1);
        } else {
          setActiveIndex(activeIndex - 1);
        }
      }
    }
    touchStartX = null;
    touchEndX = null;
  });

  cards.forEach((card, idx) => {
    card.addEventListener('click', (evt) => {
      if (evt.target.closest('.open-dossie-btn') || evt.target.closest('.card-3d')) {
        openDossie(idx);
      }
    });
  });

  closeBtn.addEventListener('click', closeDossie);
  dossieBackdrop.addEventListener('click', (evt) => {
    if (evt.target === dossieBackdrop) {
      closeDossie();
    }
  });

  solverBtn.addEventListener('click', handleSolveAttempt);

  difficultyBtns.forEach((btn) => {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
  });
}

// ============================================
// START GAME
// ============================================

window.addEventListener('DOMContentLoaded', initGame);
