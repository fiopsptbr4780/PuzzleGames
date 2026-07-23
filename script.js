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
const scenarios = { ALPHA: { culprit: 'Arquiteto de Sistemas', substance: 'NEUROTOXINA B', location: 'Sala de Descontaminação', p1code: 'Q-17', p1sector: 'Armazenamento Térmico', p3: 'NEUROTOXINA B', p4: 'Engenheiro de Segurança', p5: 'Sala de Descontaminação', gridLog: 'Arquiteto de Sistemas / 03:00', info: 'Cenário ALPHA ativo.', hints: ['A combinação correta junta um código alfanumérico e o setor de origem da amostra.', 'A resposta tem de mencionar quem acedeu ao terminal e a hora 03:00.', 'No cenário base, a substância é a opção mais perigosa da lista.', 'A credencial roubada pertence ao responsável pela segurança física.', 'O vetor aponta para a divisão crítica ligada ao controlo de agentes biológicos.'] } };
const el = id => document.getElementById(id);
const norm = s => String(s || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
function save(){ localStorage.setItem('quimeraState', JSON.stringify({score:state.score, attempts:state.attempts, timer:state.timer, difficulty:state.difficulty})); }
function load(){ const raw = localStorage.getItem('quimeraState'); if(!raw) return; try{ const d = JSON.parse(raw); state.score=d.score||0; state.attempts=d.attempts||[]; state.timer=d.timer||0; state.difficulty=d.difficulty||'normal'; }catch(e){} }
function render(){ el('scoreDisplay').textContent = state.score; el('difficultyDisplay').textContent = ({easy:'Fácil',normal:'Normal',hard:'Difícil'})[state.difficulty]; el('timerDisplay').textContent = new Date(state.timer*1000).toISOString().slice(14,19); el('historyList').innerHTML = state.attempts.slice(-20).reverse().map(a=>`<div class="history-item ${a.ok?'ok':'fail'}"><strong>${a.puzzle}</strong> — ${a.ok?'Certo':'Errado'} — ${a.detail}</div>`).join('') || '<div class="small">Sem tentativas ainda.</div>'; const s = scenarios[state.activeScenario]; ['gridOrigem','gridLog','gridAgente','gridChave','gridAlvo'].forEach((k,i)=>{ el(k).textContent = [s.p1sector,s.gridLog,s.substance,s.p4,s.location][i]; }); el('btnAbrirArquivo').disabled = !(state.solved.p1&&state.solved.p2&&state.solved.p3&&state.solved.p4&&state.solved.p5); }
function addAttempt(puzzle, ok, detail){ state.attempts.push({time: new Date().toLocaleTimeString(), puzzle, ok, detail}); if(ok) state.score += ({easy:10,normal:15,hard:20})[state.difficulty]; else state.score = Math.max(0, state.score - 2); save(); render(); }
function showHint(key, box){ state.hintLevel[key] = Math.min(3, state.hintLevel[key]+1); const hints = { p1:['Pensa no formato do código.', 'Q-17 é a leitura correta.', 'O setor é Armazenamento Térmico.'], p2:['Inclui a palavra SISTEMAS.', 'Inclui também 03:00.', 'A frase confirma atividade no terminal.'], p3:['No cenário ALPHA é NEUROTOXINA B.', 'Usa a opção mais perigosa.', 'Confere a pista do arquivo.'], p4:['É a credencial de segurança física.', 'Não é o geneticista.', 'A chave associada é Engenheiro de Segurança.'], p5:['A sala ligada ao mecanismo é a correta.', 'Não é Reatores.', 'É Sala de Descontaminação.'] }; el(box).textContent = hints[key][state.hintLevel[key]-1] || hints[key][2]; el(box).classList.remove('hidden'); state.score = Math.max(0, state.score - 1); save(); render(); }
function validatePuzzle1(){ const ok = norm(el('p1codigo').value) === 'Q-17' && norm(el('p1setor').value) === 'ARMAZENAMENTO TERMICO'; el('p1Resultado').textContent = ok ? 'Puzzle 1 correto.' : 'Puzzle 1 incorreto.'; el('p1Resultado').className = 'result ' + (ok?'ok':'fail'); el('p1Resultado').classList.remove('hidden'); state.solved.p1 = ok; addAttempt('Puzzle 1', ok, `${el('p1codigo').value} | ${el('p1setor').value}`); if(ok) state.score += 5; }
function validatePuzzle2(){ const v = norm(el('p2frase').value); const ok = v.includes('SISTEMAS') && v.includes('03:00'); el('p2Resultado').textContent = ok ? 'Puzzle 2 correto.' : 'Puzzle 2 incorreto.'; el('p2Resultado').className = 'result ' + (ok?'ok':'fail'); el('p2Resultado').classList.remove('hidden'); state.solved.p2 = ok; addAttempt('Puzzle 2', ok, el('p2frase').value.slice(0,60)); }
function validatePuzzle3(){ const ok = norm(el('p3substancia').value) === state.activeScenario && norm(el('p3substancia').value) === 'NEUROTOXINA B'; }
function validateSimple(id, expected, puzzle){ const ok = norm(el(id).value) === norm(expected); el(`${puzzle}Resultado`).textContent = ok ? `${puzzle.replace('p','Puzzle ')} correto.` : `${puzzle.replace('p','Puzzle ')} incorreto.`; el(`${puzzle}Resultado`).className = 'result ' + (ok?'ok':'fail'); el(`${puzzle}Resultado`).classList.remove('hidden'); state.solved[puzzle] = ok; addAttempt(puzzle.replace('p','Puzzle '), ok, el(id).value); }
function validatePuzzle3b(){ const ok = norm(el('p3substancia').value) === norm(scenarios[state.activeScenario].substance); el('p3Resultado').textContent = ok ? 'Puzzle 3 correto.' : 'Puzzle 3 incorreto.'; el('p3Resultado').className = 'result ' + (ok?'ok':'fail'); el('p3Resultado').classList.remove('hidden'); state.solved.p3 = ok; addAttempt('Puzzle 3', ok, el('p3substancia').value); }
function validatePuzzle4(){ const ok = norm(el('p4chave').value) === norm(scenarios[state.activeScenario].p4); el('p4Resultado').textContent = ok ? 'Puzzle 4 correto.' : 'Puzzle 4 incorreto.'; el('p4Resultado').className = 'result ' + (ok?'ok':'fail'); el('p4Resultado').classList.remove('hidden'); state.solved.p4 = ok; addAttempt('Puzzle 4', ok, el('p4chave').value); }
function validatePuzzle5(){ const ok = norm(el('p5sala').value) === norm(scenarios[state.activeScenario].p5); el('p5Resultado').textContent = ok ? 'Puzzle 5 correto.' : 'Puzzle 5 incorreto.'; el('p5Resultado').className = 'result ' + (ok?'ok':'fail'); el('p5Resultado').classList.remove('hidden'); state.solved.p5 = ok; addAttempt('Puzzle 5', ok, el('p5sala').value); }
function generateDossiers(){ const n = Number(el('numJogadores').value); const list = ['Engenheiro de Segurança','Arquiteto de Sistemas','Geneticista','Chefe de Bioquímica','Perito de Vantagem','Diretor do Lab'].slice(0,n); el('listaDossies').innerHTML = list.map((r,i)=>`<div class="dossier-card"><h3>${r}</h3><p>Histórico e objetivo oculto ${i+1}.</p></div>`).join(''); el('dossiesInfo').textContent = `${n} dossiês gerados.`; }
function openArquivo(){ el('arquivoConteudo').classList.remove('hidden'); el('arquivoFeedback').textContent = 'Arquivo aberto.'; el('arquivoFeedback').className = 'result ok'; el('arquivoFeedback').classList.remove('hidden'); }
function verifyAccusation(){ const s = scenarios[state.activeScenario]; const ok = norm(el('acusadoNome').value) === norm(s.culprit) && norm(el('acusadoLocal').value) === norm(s.location) && norm(el('acusadoSubstancia').value) === norm(s.substance); el('acusacaoResultado').textContent = ok ? 'Teoria final correta.' : 'Teoria final incorreta.'; el('acusacaoResultado').className = 'result ' + (ok?'ok':'fail'); el('acusacaoResultado').classList.remove('hidden'); addAttempt('Acusação final', ok, `${el('acusadoNome').value} | ${el('acusadoLocal').value} | ${el('acusadoSubstancia').value}`); }
function tick(){ state.timer++; render(); save(); }
function startTimer(){ if(state.timerHandle) return; state.timerHandle = setInterval(tick, 1000); }
function reset(){ state.solved = { p1:false,p2:false,p3:false,p4:false,p5:false }; state.score = 0; state.timer = 0; state.attempts = []; state.hintLevel = { p1:0,p2:0,p3:0,p4:0,p5:0 }; ['hint1','hint2','hint3','hint4','hint5','p1Resultado','p2Resultado','p3Resultado','p4Resultado','p5Resultado','acusacaoResultado','arquivoFeedback'].forEach(id=>{ el(id).classList.add('hidden'); el(id).textContent=''; }); el('arquivoConteudo').classList.add('hidden'); render(); save(); }
load(); render(); generateDossiers(); startTimer();
el('btnGerarDossies').addEventListener('click', generateDossiers);
el('btnReset').addEventListener('click', reset);
el('btnPuzzle1').addEventListener('click', validatePuzzle1);
el('btnPuzzle2').addEventListener('click', validatePuzzle2);
el('btnPuzzle3').addEventListener('click', validatePuzzle3b);
el('btnPuzzle4').addEventListener('click', validatePuzzle4);
el('btnPuzzle5').addEventListener('click', validatePuzzle5);
el('btnHint1').addEventListener('click', ()=>showHint('p1','hint1'));
el('btnHint2').addEventListener('click', ()=>showHint('p2','hint2'));
el('btnHint3').addEventListener('click', ()=>showHint('p3','hint3'));
el('btnHint4').addEventListener('click', ()=>showHint('p4','hint4'));
el('btnHint5').addEventListener('click', ()=>showHint('p5','hint5'));
el('btnAbrirArquivo').addEventListener('click', openArquivo);
el('btnVerificarAcusacao').addEventListener('click', verifyAccusation);
el('difficultySelect').addEventListener('change', e=>{ state.difficulty = e.target.value; save(); render(); });
