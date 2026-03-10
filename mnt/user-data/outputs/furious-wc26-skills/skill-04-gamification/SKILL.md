---
name: furious-wc26-gamification
description: >
  Skill de gamificação e engajamento do FURIOUS WORLD CUP 26. Ativar SEMPRE
  que implementar ou modificar: sistema de desafios, Hall da Fama, rankings,
  missões, recompensas, conquistas, badges, streaks, eventos especiais,
  modo "Desafie o Mundo", time dos sonhos, quizzes, notificações de
  engajamento. Termos gatilho: "desafio", "missão", "conquista", "badge",
  "ranking", "Hall da Fama", "recompensa", "streak", "evento", "quiz",
  "time dos sonhos", "engajamento", "retenção", "gamificação".
---

# SKILL 04 — Gamificação & Engajamento

## Filosofia de Design
Cada interação deve gerar uma micro-recompensa emocional. O usuário deve
sempre ter **algo para fazer amanhã** no app.

---

## 1. Hall da Fama

### Categorias de Ranking

| Categoria | Critério de Pontuação | Reset |
|---|---|---|
| 🏆 Grandes Colecionadores | % de conclusão do álbum (peso 3x lendárias) | Nunca |
| ⚡ Primeiros a Completar | Timestamp de conclusão do álbum 100% | Permanente |
| 🌟 Caçadores de Lendárias | Total de figurinhas Lendárias coletadas | Mensal |
| 🎯 Mestres dos Desafios | Pontos acumulados em desafios semanais | Semanal |
| 🤝 Reis da Troca | Volume e qualidade de trocas realizadas | Mensal |

### Exibição do Hall da Fama
- Top 100 global por categoria
- Top 10 entre amigos
- Posição do usuário atual sempre visível (mesmo fora do top 100)
- Emblema especial permanente para os top 3 de cada categoria sazonal

---

## 2. Sistema de Desafios

### Tipos de Desafio

**Desafios Semanais (rotaciona toda segunda-feira)**
```
Exemplo de desafios:
- "Monte o time ideal da Copa 2022 na sua posição favorita"
- "Quem foi o artilheiro da Copa 2022? Use sua figurinha para responder"
- "Complete a seleção da Argentina no seu álbum esta semana"
- "Faça 3 trocas bem-sucedidas"
- "Abra 10 pacotes"
```

**Desafios Temáticos (eventos especiais)**
```
- "Aniversário da Copa 2022": desafios relâmpago de 48h
- "Contagem regressiva Copa 2026": missões diárias nos 26 dias antes da Copa
- "Final da Copa": desafio especial no dia da final
```

**Desafios de Conhecimento (Quiz Fúria)**
```
Formato: pergunta + 4 opções + dica via figurinha do acervo do usuário
Tempo: 30 segundos por pergunta
Streak bonus: acertar 5 seguidas = multiplicador x2 de pontos
```

### Estrutura de Recompensas por Desafio
```typescript
interface ChallengeReward {
  furyCoins: number;           // Moeda básica
  specialPack?: PackType;      // Pacote bônus
  badge?: BadgeId;             // Emblema exclusivo
  hallOfFamePoints: number;    // Pontos para ranking
  exclusiveSticker?: boolean;  // Figurinha de desafio (só obtida assim)
}
```

---

## 3. Sistema de Conquistas (Badges)

### Badges Permanentes
| Badge | Critério | Raridade |
|---|---|---|
| 🎴 Primeiro Pacote | Abrir o 1º pacote | Comum |
| 🌍 Colecionador Global | Ter figurinha de 10+ seleções | Especial |
| ⚽ Artilheiro | Ter todos os top artilheiros da 2022 | Épica |
| 👑 Rei das Trocas | Completar 50 trocas | Épica |
| 💎 Álbum Completo 2022 | 100% de conclusão da edição 2022 | Lendária |
| 🔥 FURIOUS | Ter todas as figurinhas FURIOUS de uma Copa | FURIOUS |
| 🏅 Hall da Fama | Entrar no Top 10 de qualquer categoria | Lendária |

### Badges Sazonais (expiram, mas ficam no perfil com data)
- Badges de eventos especiais
- Badges de primeiros completadores

---

## 4. Sistema de Missões Diárias

Gerar 3 missões diárias personalizadas por usuário:
```
LÓGICA DE PERSONALIZAÇÃO:
- Se álbum < 30% completo → missões focadas em abrir pacotes
- Se álbum 30-70% → missões focadas em trocas
- Se álbum > 70% → missões focadas em desafios e lendárias
- Sempre 1 missão social (convidar amigo, fazer troca, visitar praça)
```

Exemplos de missões:
- "Abra 2 pacotes hoje" → 50 Fúria Coins
- "Faça 1 troca na Praça" → 30 Fúria Coins + 1 pacote básico
- "Responda 1 quiz" → 40 Fúria Coins
- "Visite o álbum de um amigo" → 20 Fúria Coins

---

## 5. Notificações de Engajamento (Push)

```
GATILHOS PARA NOTIFICAÇÃO:
✅ Novo desafio semanal disponível (segunda-feira, 10h local)
✅ Missão diária disponível (horário de acordar do usuário)
✅ Oferta de troca recebida na Praça
✅ Match automático de troca encontrado
✅ Usuário subiu no ranking (top 50 alcançado)
✅ Figurinha rara saiu em pacote de amigo ("Fulano pegou uma Lendária!")
✅ Contador de streak em risco (não jogou há 20h)
✅ Evento especial nas próximas 24h

❌ NÃO notificar mais de 3x por dia por padrão
❌ NÃO notificar entre 22h e 8h (horário local)
❌ Usuário pode personalizar frequência e tipos
```

---

## Regras Imutáveis desta Skill
- Todo desafio deve ter recompensa clara antes de ser publicado
- Badges nunca são removidos do perfil (apenas podem ser "desbloqueados" ou não)
- Missões diárias NUNCA podem expirar antes das 23:59 do dia corrente
- Streak de missões diárias: perder 1 dia zera o streak (sem exceções, para manter integridade)
- Figurinhas exclusivas de desafio não podem ser obtidas por nenhum outro meio
