---
name: furious-wc26-album-mechanics
description: >
  Skill de mecânicas centrais do álbum FURIOUS WORLD CUP 26. Ativar SEMPRE
  que houver implementação ou modificação de: estrutura do álbum, sistema de
  pacotes, figurinhas, raridades, organização por seleção/Copa, sistema de
  trocas, praça de trocas, pacotes virtuais, lógica de probabilidade,
  repetidas, álbum visual, páginas do álbum, cards de jogadores. Termos
  gatilho: "figurinha", "pacote", "álbum", "raridade", "troca", "repetida",
  "coleção", "seleção", "time", "Copa 2022", "Copa 2026".
---

# SKILL 02 — Mecânicas Centrais do Álbum

## Fundamento de Design
O FURIOUS WORLD CUP 26 deve replicar **a satisfação emocional** dos álbuns
físicos da Panini, com camadas digitais de interatividade que o físico não
consegue oferecer.

---

## 1. Estrutura Hierárquica do Acervo

```
ÁLBUM
├── Copa do Mundo 2022 (Qatar)
│   ├── Capa & Introdução (figurinhas #001–010)
│   ├── Mascote & Bola Oficial (figurinhas #011–015)
│   ├── Estádios (figurinhas #016–023)
│   ├── Seleção A → Z
│   │   ├── Escudo (#A01)
│   │   ├── Foto Oficial do Time (#A02)
│   │   └── Jogadores (#A03 … #An)
│   └── [32 seleções]
└── Copa do Mundo 2026 (USA/CAN/MEX)
    ├── Capa & Introdução
    ├── Mascote & Bola Oficial
    ├── Estádios (figurinhas dos 16 estádios)
    ├── Seleção A → Z
    │   ├── Escudo
    │   ├── Foto Oficial do Time
    │   └── Jogadores
    └── [48 seleções]
```

### Numeração Obrigatória
- Formato: `[EDIÇÃO]-[SIGLA_PAÍS]-[SEQUÊNCIA]`
- Exemplos: `2022-BRA-01`, `2026-FRA-07`, `2022-SPECIAL-001`
- Figurinhas especiais (estádios, mascotes, bola): `2022-SPECIAL-XX`

---

## 2. Sistema de Raridades

| Tier | Nome | Cor | Probabilidade em Pacote | Descrição |
|---|---|---|---|---|
| 1 | Comum | Cinza/Prata | 60% | Jogadores de base do elenco |
| 2 | Especial | Azul | 25% | Titulares e destaques |
| 3 | Épica | Roxo | 10% | Artilheiros, campeões, MVP |
| 4 | Lendária | Dourado/Fogo | 4% | Ícones da Copa (Messi, Mbappé...) |
| 5 | FURIOUS | Vermelho Holográfico | 1% | Ultra-raras, 1 por edição por seleção |

### Regras de Raridade
- Figurinhas de Escudo e Foto Oficial do Time: sempre **Especial** ou acima
- Figurinhas de Estádio: sempre **Especial**
- Mascote e Bola Oficial: **Épica**
- A raridade é atributo permanente da figurinha, não pode ser alterado

---

## 3. Sistema de Pacotes

### Tipos de Pacote
| Tipo | Qtd. Figurinhas | Garantias | Custo |
|---|---|---|---|
| Pacote Básico | 5 | Nenhuma | 100 Fúria Coins |
| Pacote Plus | 10 | 1 Especial mínimo | 180 Fúria Coins |
| Pacote Elite | 20 | 1 Épica mínimo | 300 Fúria Coins |
| Pacote Lendário | 5 | 1 Lendária garantida | 500 Fúria Coins |
| Pacote Copa | 15 | 3 Especiais + 1 FURIOUS chance | 250 Fúria Coins |

### Lógica de Probabilidade Adaptativa
```
SE (percentual_album_completo < 50%):
    boost_comuns = +10%
    objetivo: preencher base do álbum rapidamente

SE (percentual_album_completo >= 50% e < 80%):
    boost_especiais = +8%
    reduz_comuns = -5%
    objetivo: acelerar a fase intermediária

SE (percentual_album_completo >= 80%):
    boost_epicas = +5%
    boost_lendarias = +2%
    reduz_comuns = -15%
    objetivo: tornar o final emocionante e recompensador

ANTI-PITY: A cada 50 pacotes sem Lendária, +0.5% acumulativo até sair uma
```

---

## 4. Sistema de Repetidas e Trocas

### Inventário de Repetidas
- Figurinhas além da 1ª cópia vão automaticamente para "Minha Coleção de Repetidas"
- Máximo de 5 cópias por figurinha no inventário de repetidas
- Excedente pode ser convertido em Fúria Coins (1 comum = 5, 1 lendária = 100)

### Praça de Trocas
```
FLUXO DE TROCA:
1. Usuário A cria oferta: "Tenho [figurinha X] → Quero [figurinha Y]"
2. Sistema faz matching automático com outras ofertas compatíveis
3. Se match encontrado → notificação para ambos confirmarem
4. Se não → oferta fica pública na Praça por 72h
5. Usuário B vê a oferta e aceita manualmente
6. Troca confirmada → ambos recebem as figurinhas instantaneamente
```

### Grupos de Troca
- Usuário pode criar grupos privados (até 20 membros)
- Dentro do grupo: sistema de "wishlist" compartilhada
- Sugestões automáticas: "João tem o que você precisa e precisa do que você tem"

### Regras Anti-Abuso de Trocas
- Máximo de 10 trocas ativas simultâneas por usuário
- Figurinha recém-recebida em troca fica bloqueada para nova troca por 24h
- Trocas Lendária ↔ Lendária requerem confirmação dupla com janela de 1h

---

## 5. Enciclopédia da Copa (Card do Jogador)

Ao clicar em qualquer figurinha de jogador, exibir:
```
┌─────────────────────────────────┐
│  [FOTO]   NOME DO JOGADOR       │
│  País: [Bandeira] Posição: [X]  │
│  Raridade: [ícone tier]         │
│─────────────────────────────────│
│  COPA 2022:                     │
│  ✓ Jogos: X  Gols: X  Assist: X │
│  Fase: [Grupos/Oitavas/Final]   │
│─────────────────────────────────│
│  COPA 2026:                     │
│  ✓ Jogos: X  Gols: X  Assist: X │
│─────────────────────────────────│
│  💬 CURIOSIDADE FÚRIA:          │
│  [Fato único sobre o jogador]   │
└─────────────────────────────────┘
```

---

## Regras Imutáveis desta Skill
- Nenhuma figurinha pode existir fora da hierarquia definida
- Raridades são imutáveis após criação
- O sistema de probabilidade adaptativa é obrigatório (nunca distribuição plana)
- Trocas somente entre figurinhas do mesmo tipo (jogador ↔ jogador, especial ↔ especial)
- Jamais exibir figurinhas de jogadores fora do escopo 2022/2026
