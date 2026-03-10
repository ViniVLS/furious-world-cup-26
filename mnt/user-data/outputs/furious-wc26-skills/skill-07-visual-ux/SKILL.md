---
name: furious-wc26-visual-ux
description: >
  Skill de UX visual e design system do FURIOUS WORLD CUP 26. Ativar SEMPRE
  que implementar ou modificar interfaces, animações, onboarding, telas,
  componentes visuais, identidade visual, microinterações, acessibilidade,
  dark mode, responsividade, estados de loading, feedback visual, animações
  de pacote, criador de figurinha personalizada. Termos gatilho: "tela",
  "interface", "design", "animação", "visual", "UI", "UX", "componente",
  "layout", "onboarding", "acessibilidade", "figurinha personalizada",
  "editor", "criador".
---

# SKILL 07 — Visual UX & Design System

## Identidade Visual Base

```
PALETA DE CORES FURIOUS:
Primária:    #FF2D20 (Vermelho Fúria)
Secundária:  #FFD700 (Dourado Copa)
Escura:      #0A0A1A (Azul Noite)
Neutra:      #1E1E2E (Grafite)
Texto:       #F0F0F0 (Branco Suave)
Accent:      #00E5FF (Ciano Elétrico)

GRADIENTES:
Hero:        linear-gradient(135deg, #FF2D20, #FFD700)
Card Raro:   linear-gradient(135deg, #6B21A8, #A855F7)
Card Lendário: linear-gradient(135deg, #B45309, #FDE68A, #B45309)
Card FURIOUS: linear-gradient(135deg, #FF2D20, #FF6B00, #FFD700) + holographic overlay

TIPOGRAFIA:
Display:   "Bebas Neue" ou similar (impacto, Copa)
Body:      "Inter" ou similar (legibilidade)
Números:   "Oswald" (destaque em stats)
```

---

## 1. Componentes Visuais das Figurinhas

### Anatomia da Figurinha
```
┌─────────────────────┐
│  [NÚMERO]  [BANDEIRA]│  ← Header (cor por raridade)
│                     │
│    [FOTO DO         │
│     JOGADOR]        │  ← Área principal (60% do card)
│                     │
│ ─────────────────── │
│  NOME DO JOGADOR    │  ← Nome em Bebas Neue, maiúsculo
│  POSIÇÃO | PAÍS     │  ← Subtítulo
│  ★★★☆☆ [RARIDADE]  │  ← Indicador de tier
└─────────────────────┘

TAMANHOS:
- Feed/Álbum: 120×168px (proporção Panini 1:1.4)
- Vitrine do perfil: 80×112px
- Card expandido: 240×336px
- Card detalhado: fullscreen modal
```

### Animações por Raridade
| Raridade | Animação da Figurinha | Efeito de Borda |
|---|---|---|
| Comum | Estática | Borda simples |
| Especial | Suave pulse ao toque | Borda brilhante |
| Épica | Partículas leves ao hover | Borda animada |
| Lendária | Chamas douradas ao revelar | Borda dourada pulsante |
| FURIOUS | Explosão + holográfico | Borda holográfica em loop |

---

## 2. Animação de Abertura de Pacotes

### Fluxo Visual Obrigatório
```
SEQUÊNCIA DE ABERTURA:
1. Tela escurece (overlay 80%)
2. Pacote aparece centralizado com tremor leve
3. Usuário "rasga" o pacote (swipe up ou tap)
4. Animação de "rasgar" (efeito papel)
5. Figurinhas saem em cascata (uma por uma)
6. Cada figurinha: flip 3D para revelar frente
7. Figurinha Especial+: pausa dramática + efeito de luz
8. Figurinha Lendária: tela pisca + música especial + confete
9. Tela de resumo: "X novas, Y repetidas" com ação de guardar tudo
```

---

## 3. Criador de Figurinha Personalizada

### Editor de Figurinha (Promessa da Landing Page)
```
FUNCIONALIDADES OBRIGATÓRIAS:
✅ Upload de foto (câmera ou galeria)
✅ Remoção automática de background (IA)
✅ Escolha de seleção/país (qualquer bandeira do mundo)
✅ Nome do jogador (editável)
✅ Posição (GK/DEF/MID/FWD)
✅ Número da figurinha (aleatório ou manual)
✅ Tier de raridade visual (estético apenas, não entra no álbum oficial)
✅ Preview em tempo real
✅ Download em alta resolução (PNG)
✅ Compartilhamento direto para redes sociais

LIMITAÇÕES CLARAS:
❌ Figurinhas criadas NÃO entram no álbum oficial (seção separada: "Minha Coleção")
❌ Não podem ser trocadas no sistema oficial
❌ Watermark sutil "FURIOUS WC26 - Fan Made"
```

---

## 4. Onboarding

### Fluxo de Primeiro Acesso (máx 4 telas)
```
Tela 1: "Bem-vindo ao maior álbum digital da história"
        → Animação do álbum se abrindo
        → CTA: "Começar"

Tela 2: "Escolha sua seleção do coração"
        → Grid de bandeiras, filtrável por continente
        → Seleção destacada com animação

Tela 3: "Seu primeiro pacote é nosso!"
        → Animação de presentear o pacote
        → Usuário abre o pacote de boas-vindas (5 figurinhas da seleção escolhida)

Tela 4: "Seu álbum te espera"
        → Preview do álbum com as figurinhas recém-obtidas colocadas
        → CTA: "Ir para meu álbum"
```

### Pacote de Boas-Vindas
- 5 figurinhas garantidas da seleção escolhida pelo usuário
- Sempre inclui o Escudo da seleção + 4 jogadores Comuns
- Objetivo: criar conexão imediata com o produto

---

## 5. Acessibilidade

### Requisitos Mínimos
- Contraste mínimo WCAG AA (4.5:1 para texto normal)
- Todos os ícones têm label de acessibilidade
- Animações respeitam `prefers-reduced-motion`
- Modo alto contraste disponível nas configurações
- Textos alternativos em todas as imagens de figurinhas
- Tamanho mínimo de tap: 44×44px

---

## Regras Imutáveis desta Skill
- Figurinhas criadas pelo usuário NUNCA se misturam com o acervo oficial
- A animação de abertura de pacotes não pode ser pulada na primeira vez
- Dark mode é o modo default (contexto de colecionador noturno)
- Toda tela deve funcionar em telas de 320px de largura (iPhone SE)
- Tempo máximo de loading antes de mostrar skeleton screen: 200ms
