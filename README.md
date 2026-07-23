# 🧪 Laboratório Quimera — Puzzle Game

[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://fiopsptbr4780.github.io/PuzzleGames/)

Jogo de dedução científica para browser, em português europeu. Os jogadores assumem papéis de cientistas presos no **Laboratório Quimera** após um lockdown de emergência e devem resolver cinco puzzles para identificar o culpado, a substância e o local do incidente.

---

## 📁 Estrutura de Ficheiros

```
PuzzleGames/
├── index.html      ← Página principal do jogo
├── styles.css      ← Folha de estilos (tema escuro sci-fi)
├── script.js       ← Lógica do jogo (puzzles, timer, carrossel, dossiês)
└── README.md       ← Este ficheiro
```

---

## 🎮 Como Jogar

1. Abre `index.html` num browser (ou acede via GitHub Pages).
2. Escolhe a **dificuldade** (Fácil / Normal / Difícil).
3. Resolve os **5 puzzles** em sequência:
   - **P1** — Código do Terminal (código alfanumérico + setor de origem)
   - **P2** — Log de Acesso (identifica quem e a que horas)
   - **P3** — Substância (seleciona o agente correto)
   - **P4** — Credencial Roubada (identifica o proprietário)
   - **P5** — Local do Vetor (onde foi libertado o agente)
4. Submete a **Solução Final** com culpado + substância + local.
5. Usa as **💡 Dicas** quando necessário (penalizam a pontuação).

---

## 🧩 Cenário ALPHA

| Campo | Resposta |
|---|---|
| Culpado | Arquiteto de Sistemas |
| Substância | Neurotoxina B |
| Local | Sala de Descontaminação |
| Código Terminal | Q-17 / Armazenamento Térmico |
| Log de Acesso | SISTEMAS / 03:00 |

---

## ⚙️ Tecnologias

- HTML5 semântico
- CSS3 com variáveis e media queries
- JavaScript vanilla (sem dependências externas)
- `localStorage` para persistência de pontuação e histórico

---

## 🚀 Deploy via GitHub Pages

1. No repositório, vai a **Settings → Pages**.
2. Em *Source*, seleciona o branch `main` e a pasta `/ (root)`.
3. Guarda — o jogo fica disponível em `https://fiopsptbr4780.github.io/PuzzleGames/`.

---

## 📝 Notas de Versão

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | 2026-07-23 | Versão inicial — Cenário ALPHA completo |
| 1.1 | — | Previsto: Cenário BETA (Geneticista) |

---

## 📄 Licença

Projeto pessoal — uso livre para fins não comerciais.
