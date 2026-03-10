---
name: furious-wc26-social-trading
description: >
  Skill do sistema social e de trocas do FURIOUS WORLD CUP 26. Ativar SEMPRE
  que implementar ou modificar: Praça de Trocas, grupos de amigos, feed social,
  perfil de colecionador, sistema de seguidores, convites, compartilhamento,
  chat de troca, reputação de trader, clube de colecionadores. Termos gatilho:
  "praça", "amigos", "grupo", "troca", "social", "feed", "perfil", "convite",
  "compartilhar", "comunidade", "reputação", "clube".
---

# SKILL 05 — Sistema Social & Praça de Trocas

## Filosofia Social
A coleção solitária tem um teto. A **coleção social** é infinita em
engajamento. Toda feature social deve reduzir a fricção de completar o álbum
e aumentar a sensação de pertencimento a uma comunidade de fãs da Copa.

---

## 1. Perfil do Colecionador

```
┌──────────────────────────────────────┐
│  [AVATAR]  NomeDeUsuário             │
│  🏳️ País | 🎴 N figurinhas coletadas │
│  📊 Álbum: 67% completo              │
│  🏆 Badges: [🎴][🌍][👑]             │
│──────────────────────────────────────│
│  VITRINE (5 figurinhas favoritas)    │
│  [fig1] [fig2] [fig3] [fig4] [fig5] │
│──────────────────────────────────────│
│  ESTATÍSTICAS                        │
│  Trocas: 34 | Desafios ganhos: 12   │
│  Rank global: #1.247                 │
│──────────────────────────────────────│
│  [Seguir] [Ver Álbum] [Propor Troca] │
└──────────────────────────────────────┘
```

### Campos Obrigatórios do Perfil
- Username único (3-20 chars, alfanumérico + _)
- País de origem (afeta sugestões de seleções)
- Vitrine de figurinhas favoritas (editável)
- Configuração de privacidade: Público / Amigos / Privado

---

## 2. Praça de Trocas

### Feed da Praça
```
ORDENAÇÃO DO FEED:
1. Ofertas onde o usuário tem o que outra pessoa precisa (match parcial)
2. Ofertas de usuários que o usuário segue
3. Ofertas de usuários do mesmo país
4. Ofertas gerais (mais recentes primeiro)
```

### Estrutura de uma Oferta
```typescript
interface TradeOffer {
  id: string;
  offeredBy: UserId;
  offering: StickerId[];      // O que tem (máx 3 por oferta)
  wantingAny: StickerId[];    // Aceita qualquer uma dessas
  wantingAll?: StickerId[];   // Precisa de TODAS (troca em bloco)
  expiresAt: string;          // 72h após criação
  status: 'OPEN' | 'NEGOTIATING' | 'COMPLETED' | 'EXPIRED';
  views: number;
  interestedCount: number;
}
```

### Filtros da Praça
- Por Copa (2022 / 2026)
- Por Seleção
- Por Raridade
- Por "Tenho o que ele quer" (match)
- Por amigos apenas

---

## 3. Grupos de Troca

### Estrutura do Grupo
```
GRUPO DE TROCA:
- Nome do grupo (ex: "Fanaticos do Brasil 2026")
- Até 20 membros
- Tipos: Aberto / Por Convite / Secreto
- Feed interno de ofertas (só visível para membros)
- Wishlist coletiva: lista pública dos membros mostrando o que precisam
- Sistema de "tenho o que você precisa": notificação automática dentro do grupo
```

### Funcionalidades do Grupo
1. **Lista de desejos compartilhada**: cada membro marca o que precisa
2. **Sugestão automática de trocas**: "Você tem o #2022-BRA-07 que Pedro precisa, e Pedro tem o #2022-ARG-03 que você precisa!"
3. **Chat do grupo** (simples, sem moderação complexa inicial)
4. **Histórico de trocas do grupo**

---

## 4. Sistema de Reputação de Trader

Cada usuário tem uma **Reputação de Trader** baseada em:
```
SCORE DE REPUTAÇÃO (0–5 estrelas):
+ 0.1 por troca completada com sucesso
+ 0.3 por avaliação positiva recebida
- 0.5 por troca cancelada após aceita
- 1.0 por report confirmado de má conduta

DISPLAY:
⭐⭐⭐⭐⭐ Trader Lendário (4.5–5.0)
⭐⭐⭐⭐  Trader Confiável (3.5–4.4)
⭐⭐⭐   Trader Ativo (2.5–3.4)
⭐⭐    Trader Iniciante (<2.5)
```

### Benefícios por Reputação
- Trader Lendário: destaque especial na Praça, acesso a trocas de Lendárias
- Trader Confiável: sem cooldown de 24h após trocas
- Trader Iniciante: máximo de 3 trocas simultâneas (vs. 10 dos demais)

---

## 5. Compartilhamento Social (Externo)

### Momentos de Compartilhamento
```
GATILHOS PARA COMPARTILHAMENTO:
🎉 Abrir pacote com figurinha Lendária ou FURIOUS
🏆 Completar seção de uma seleção
💯 Atingir 100% de conclusão do álbum
🥇 Entrar no Hall da Fama
🤝 Completar 50ª troca
```

### Formato de Compartilhamento
- Card visual automático gerado com a figurinha/conquista
- Texto pré-preenchido customizável
- Deep link para o app (convidado que baixar ganha 1 pacote bônus)
- Plataformas: WhatsApp, Instagram Stories, Twitter/X

---

## Regras Imutáveis desta Skill
- Privacidade default: Amigos (nunca Público por default para novos usuários)
- Menores de 13 anos: sem Praça pública, apenas grupos por convite
- Reputação nunca pode ser comprada ou artificialmente inflada
- Denúncias de comportamento inadequado são processadas em até 48h
- Chat de grupos não armazena mensagens por mais de 30 dias
