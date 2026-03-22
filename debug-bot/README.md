# 🤖 Furious Debug Bot

Robô automatizado de análise e correção de logs em tempo real para o **Furious World Cup 26**.

## 🚀 Início Rápido

```bash
# Na raiz do projeto, iniciar o debug bot:
npm run debug-bot
```

## 📂 Estrutura

```
debug-bot/
├── src/
│   ├── index.js          # Orquestrador principal + CLI interativa
│   ├── watcher.js        # File watcher (chokidar)
│   ├── analyzer.js       # Análise AST (ts-morph) — 7 regras
│   ├── fixer.js          # Motor de correção + backup
│   ├── ui-bridge.js      # WebSocket server (porta 9876)
│   └── vscode-extension/
│       ├── extension.js  # Extensão VS Code
│       └── package.json  # Manifesto da extensão
├── logs/                 # Logs do robô
├── backups/              # Backups automáticos
└── package.json
```

## 🛠️ Funcionalidades

### CLI Interativa
Ao iniciar, o bot exibe um terminal interativo com os comandos:

| Comando | Alias | Descrição |
|---------|-------|-----------|
| `scan [dir]` | `s` | Escanear diretório por issues |
| `rollback` | `rb` | Rollback da última correção |
| `history` | `h` | Ver histórico de backups |
| `status` | `st` | Status do bot |
| `rules` | `r` | Listar regras de análise |
| `clear` | `c` | Limpar issues pendentes |
| `help` | `?` | Mostrar ajuda |
| `exit` | `q` | Encerrar o bot |

### Regras de Análise (AST)

1. **Missing Null Check** — Acesso a propriedade sem optional chaining
2. **Unsubscribed Observable** — `.subscribe()` sem unsubscribe/DestroyRef
3. **Console Statement** — `console.log()` ao invés de DebugService
4. **Empty Catch Block** — Bloco catch vazio silenciando erros
5. **Unused Import** — Imports não utilizados
6. **Async Without Await** — Funções async sem await
7. **Type Assertion to Any** — Uso de `as any`

### Fluxo de Detecção

1. Bot detecta mudança em arquivo `.ts`
2. Analisa o arquivo com ts-morph (AST)
3. Exibe issues encontradas no terminal
4. Pergunta: `[1] Aplicar correção` / `[2] Ignorar` / `[3] Rollback`
5. Se aplicar: cria backup → modifica arquivo → registra log

### Frontend (Admin Panel)

O overlay do Debug Bot aparece automaticamente na rota `/painel-admin`.

- Widget flutuante com lista de issues em tempo real
- Botão laranja **"Aplicar correção"** e **"Ignorar"**
- Design glassmorphism com tema escuro

### Extensão VS Code

```bash
# Instalar dependências da extensão
cd debug-bot/src/vscode-extension
npm install

# Testar no Extension Development Host
# No VS Code: F5 → Extension Development Host
```

**Funcionalidades:**
- Diagnostics inline (underline ondulado)
- Code actions: "Aplicar correção" / "Ignorar"
- Hover tooltip com diff do código
- Status bar com contagem de issues

## 🔌 Arquitetura

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Watcher    │───>│   Analyzer   │───>│    Fixer      │
│  (chokidar)  │    │  (ts-morph)  │    │  (backup+fix) │
└──────────────┘    └──────────────┘    └──────────────┘
                          │
                    ┌─────┴─────┐
                    │ UI Bridge  │
                    │    (WS)    │
                    └─────┬─────┘
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         ┌────────┐  ┌────────┐  ┌────────┐
         │  CLI   │  │Angular │  │VS Code │
         │Terminal│  │Overlay │  │Extension│
         └────────┘  └────────┘  └────────┘
```

## 🔮 Extensibilidade

O bot está preparado para integração com IA externa:

```javascript
import { Analyzer } from './analyzer.js';
const analyzer = new Analyzer(projectRoot);

// Adicionar regra customizada (ex: via OpenAI)
analyzer.addRule({
  id: 'ai-suggestion',
  name: 'AI Suggestion',
  description: 'Sugestões geradas por IA',
  severity: 'suggestion',
  analyze: async (sourceFile, filePath) => {
    // Integração com API OpenAI
    return [];
  },
});
```
