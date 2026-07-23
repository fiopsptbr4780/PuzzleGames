const state = {
  activeScenario: 'ALPHA',
  solved: { p1: false, p2: false, p3: false, p4: false, p5: false },
  score: 0,
  attempts: [],
  hintLevel: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0 },
  timer: 0,
  timerRunning: false,
  timerHandle: null,
  difficulty: 'normal'
};

const scenarios = {
  ALPHA: {
    culprit: 'Arquiteto de Sistemas',
    substance: 'NEUROTOXINA B',
    location: 'Sala de Descontaminação',
    p1code: 'Q-17',
    p1sector: 'Armazenamento Térmico',
    p3: 'NEUROTOXINA B',
    p4: 'Engenheiro de Segurança',
    p5: 'Sala de Descontaminação',
    gridLog: 'Arquiteto de Sistemas / 03:00',
    info: 'Cenário ALPHA ativo.',
    hints: [
      'A combinação correta junta um código alfanumérico e o setor de origem da amostra.',
      'A resposta tem de mencionar quem acedeu ao terminal e a hora 03:00.',
      'No cenário base, a substância é a opção mais perigosa da lista.',
      'A credencial roubada pertence ao responsável pela segurança física.',
      'O vetor aponta para a divisão crítica ligada ao controlo de agentes biológicos.'
    ]
  }
};

const el = id => document.getElementById(id);
const norm = s => String(s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

function save() {
  localStorage.setItem('quimeraState', JSON.stringify({
    score: state.score,
    attempts: state.attempts,
    timer: state.timer,
    difficulty: state.difficulty
  }));
}

function load() {
  const raw = localStorage.getItem('quimeraState');
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    state.score = d.score || 0;
    state.attempts = d.attempts || [];
    state.timer = d.timer || 0;
    state.difficulty = d.difficulty || 'normal';
  } catch (e) {}
}

function render() {
  el('scoreDisplay').textContent = state.score;
  el('difficultyDisplay').textContent = ({ easy: 'Fácil', normal: 'Normal', hard: 'Difícil' })[state.difficulty];
  el('timerDisplay').textContent = new Date(state.timer * 1000).toISOString().slice(14, 19);
  const history = el('historyList');
  if (history) {
    history.innerHTML = state.attempts.slice(-20).reverse().map(a =>
      `<div class="attempt-item ${a.ok ? 'success' : 'failure'}">${a.ok ? '✅' : '❌'} [${a.puzzle}] ${a.input} — ${a.time}</div>`
    ).join('') || '<span style="color:var(--muted)">Nenhuma tentativa ainda.</span>';
  }
  renderHints();
}

function renderHints() {
  const sc = scenarios[state.activeScenario];
  const container = el('hintsContainer');
  if (!container) return;
  container.innerHTML = sc.hints.map((h, i) => {
    const unlocked = state.hintLevel[`p${i + 1}`] > 0;
    return `<div class="hint ${unlocked ? 'unlocked' : 'locked'}">
      <strong>Dica ${i + 1}${unlocked ? '' : ' 🔒'}:</strong> ${unlocked ? h : 'Usa o botão de dica no puzzle correspondente para desbloquear.'}
    </div>`;
  }).join('');
}

function giveHint(puzzle) {
  const sc = scenarios[state.activeScenario];
  const idx = parseInt(puzzle.replace('p', '')) - 1;
  if (state.hintLevel[puzzle] === 0) {
    state.hintLevel[puzzle] = 1;
    state.score = Math.max(0, state.score - (state.difficulty === 'hard' ? 20 : state.difficulty === 'easy' ? 5 : 10));
    save();
    render();
  }
  alert(`💡 Dica: ${sc.hints[idx]}`);
}

function logAttempt(puzzle, input, ok) {
  state.attempts.push({ puzzle, input, ok, time: new Date().toLocaleTimeString('pt-PT') });
  save();
  render();
}

function showResult(id, ok, msg) {
  const div = el(id);
  if (!div) return;
  div.className = `solver-result ${ok ? 'ok' : 'fail'}`;
  div.textContent = (ok ? '✅ ' : '❌ ') + msg;
  div.classList.remove('hidden');
}

function points() {
  return state.difficulty === 'hard' ? 30 : state.difficulty === 'easy' ? 10 : 20;
}

function checkP1() {
  const sc = scenarios[state.activeScenario];
  const ok = norm(el('p1code').value) === norm(sc.p1code) && norm(el('p1sector').value) === norm(sc.p1sector);
  if (ok && !state.solved.p1) { state.solved.p1 = true; state.score += points(); }
  logAttempt('P1', `${el('p1code').value} / ${el('p1sector').value}`, ok);
  showResult('resultP1', ok, ok ? 'Código correto! Acesso ao terminal concedido.' : 'Combinação incorreta. Tenta novamente.');
}

function checkP2() {
  const ans = norm(el('p2input').value);
  const ok = ans.includes('SISTEMAS') && ans.includes('0300');
  if (ok && !state.solved.p2) { state.solved.p2 = true; state.score += points(); }
  logAttempt('P2', el('p2input').value, ok);
  showResult('resultP2', ok, ok ? 'Log identificado corretamente!' : 'Resposta incorreta. A frase deve mencionar quem e a que horas.');
}

function checkP3() {
  const sc = scenarios[state.activeScenario];
  const ok = norm(el('p3select').value) === norm(sc.p3);
  if (ok && !state.solved.p3) { state.solved.p3 = true; state.score += points(); }
  logAttempt('P3', el('p3select').value, ok);
  showResult('resultP3', ok, ok ? 'Substância identificada corretamente!' : 'Substância incorreta.');
}

function checkP4() {
  const sc = scenarios[state.activeScenario];
  const ok = norm(el('p4select').value) === norm(sc.p4);
  if (ok && !state.solved.p4) { state.solved.p4 = true; state.score += points(); }
  logAttempt('P4', el('p4select').value, ok);
  showResult('resultP4', ok, ok ? 'Credencial corretamente identificada!' : 'Proprietário incorreto.');
}

function checkP5() {
  const sc = scenarios[state.activeScenario];
  const ok = norm(el('p5select').value) === norm(sc.p5);
  if (ok && !state.solved.p5) { state.solved.p5 = true; state.score += points(); }
  logAttempt('P5', el('p5select').value, ok);
  showResult('resultP5', ok, ok ? 'Local do vetor identificado!' : 'Local incorreto.');
}

function checkFinal() {
  const sc = scenarios[state.activeScenario];
  const ok =
    norm(el('finalCulprit').value) === norm(sc.culprit) &&
    norm(el('finalSubstance').value) === norm(sc.substance) &&
    norm(el('finalLocation').value) === norm(sc.location);
  if (ok) { state.score += state.difficulty === 'hard' ? 100 : state.difficulty === 'easy' ? 30 : 50; save(); }
  logAttempt('FINAL', `${el('finalCulprit').value} / ${el('finalSubstance').value} / ${el('finalLocation').value}`, ok);
  showResult('resultFinal', ok,
    ok ? `🎉 Caso resolvido! Culpado: ${sc.culprit} | Substância: ${sc.substance} | Local: ${sc.location}` :
         'Solução incorreta. Revê as pistas e tenta novamente.');
}

/* ===== TIMER ===== */
el('btnStartTimer').addEventListener('click', () => {
  if (state.timerRunning) return;
  state.timerRunning = true;
  state.timerHandle = setInterval(() => {
    state.timer++;
    const tv = el('timerDisplay');
    tv.textContent = new Date(state.timer * 1000).toISOString().slice(14, 19);
    tv.className = 'timer-value' + (state.timer > 600 ? ' critical' : state.timer > 300 ? ' warning' : '');
    save();
  }, 1000);
});

el('btnStopTimer').addEventListener('click', () => {
  clearInterval(state.timerHandle);
  state.timerRunning = false;
});

el('btnResetTimer').addEventListener('click', () => {
  clearInterval(state.timerHandle);
  state.timerRunning = false;
  state.timer = 0;
  el('timerDisplay').textContent = '00:00';
  el('timerDisplay').className = 'timer-value';
  save();
});

/* ===== DIFICULDADE ===== */
document.querySelectorAll('.difficulty-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.difficulty = btn.dataset.diff;
    save();
    render();
  });
});

/* ===== CARROSSEL ===== */
let carouselIndex = 0;

function updateCarousel() {
  const cards = document.querySelectorAll('.card-3d');
  const total = cards.length;
  cards.forEach((card, i) => {
    const offset = i - carouselIndex;
    card.classList.toggle('active', offset === 0);
    card.classList.toggle('inactive', offset !== 0);
    card.style.transform = `translateX(-50%) translateY(-50%) translateZ(${offset === 0 ? 0 : -120}px) rotateY(${offset * 30}deg) translateX(${offset * 55}%)`;
    card.style.opacity = Math.abs(offset) > 1 ? '0' : offset === 0 ? '1' : '0.55';
    card.style.zIndex = total - Math.abs(offset);
  });
  document.querySelectorAll('.nav-indicator-dot').forEach((dot, i) => dot.classList.toggle('active', i === carouselIndex));
}

function carouselNext() {
  carouselIndex = (carouselIndex + 1) % document.querySelectorAll('.card-3d').length;
  updateCarousel();
}

function carouselPrev() {
  const total = document.querySelectorAll('.card-3d').length;
  carouselIndex = (carouselIndex - 1 + total) % total;
  updateCarousel();
}

/* ===== DOSSIÊ MODAL ===== */
const dossies = [
  { title: 'Arquiteto de Sistemas', body: '<p><strong>Acesso:</strong> Terminal Central às 03:00.</p><p><strong>Nota:</strong> O log de acesso foi registado com a sua credencial ativa.</p>' },
  { title: 'Engenheiro de Segurança', body: '<p><strong>Declaração:</strong> Perdi o meu cartão às 02:30 no refeitório.</p><p><strong>Nota:</strong> A sua credencial foi usada 30 minutos depois do desaparecimento.</p>' },
  { title: 'Geneticista', body: '<p><strong>Alibi:</strong> Videoconferência externa confirmada das 00:00 às 05:00.</p><p><strong>Nota:</strong> Cenário BETA — suspeito principal diferente.</p>' }
];

function openDossie(index) {
  el('dossieTitle').textContent = dossies[index].title;
  el('dossieBody').innerHTML = dossies[index].body;
  el('dossieBackdrop').classList.add('open');
}

function closeDossie(e) {
  if (e.target === el('dossieBackdrop')) el('dossieBackdrop').classList.remove('open');
}

function closeDossieBtn() {
  el('dossieBackdrop').classList.remove('open');
}

/* ===== NAV DOTS ===== */
function buildNavDots() {
  const total = document.querySelectorAll('.card-3d').length;
  const container = el('navDots');
  container.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('span');
    dot.className = 'nav-indicator-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => { carouselIndex = i; updateCarousel(); });
    container.appendChild(dot);
  }
}

/* ===== UTILITÁRIOS ===== */
function clearHistory() {
  if (confirm('Limpar todo o histórico de tentativas?')) {
    state.attempts = [];
    save();
    render();
  }
}

function resetGame() {
  if (confirm('Reiniciar o jogo? A pontuação e histórico serão apagados.')) {
    clearInterval(state.timerHandle);
    state.timerRunning = false;
    state.timer = 0;
    state.score = 0;
    state.attempts = [];
    state.solved = { p1: false, p2: false, p3: false, p4: false, p5: false };
    state.hintLevel = { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0 };
    localStorage.removeItem('quimeraState');
    render();
    ['resultP1','resultP2','resultP3','resultP4','resultP5','resultFinal'].forEach(id => {
      const e = el(id); if (e) e.classList.add('hidden');
    });
  }
}

/* ===== INIT ===== */
load();
buildNavDots();
updateCarousel();
render();
