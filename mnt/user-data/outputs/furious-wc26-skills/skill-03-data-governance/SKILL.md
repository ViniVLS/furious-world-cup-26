---
name: furious-wc26-data-governance
description: >
  Skill de governança de dados do FURIOUS WORLD CUP 26. Ativar SEMPRE que
  houver adição, edição ou validação de dados de jogadores, seleções, estádios
  ou qualquer entidade do acervo. Esta skill é a fonte de verdade para
  determinar se um jogador ou dado pertence ao escopo do projeto. Termos
  gatilho: "adicionar jogador", "escopo", "dados do jogador", "seleção",
  "Copa 2022", "Copa 2026", "validar dados", "banco de dados", "seed",
  "importar jogadores", "jogador válido", "está no escopo".
---

# SKILL 03 — Governança de Dados & Escopo do Acervo

## Regra Fundamental (NON-NEGOTIABLE)

> **O acervo do FURIOUS WORLD CUP 26 é composto EXCLUSIVAMENTE por jogadores
> que participaram de Copas do Mundo nas edições de 2022 (Qatar) e/ou 2026
> (USA/CAN/MEX). Qualquer outro dado é proibido no acervo principal.**

---

## 1. Definição de "Participou da Copa"

Um jogador é considerado **válido para o acervo** se atender a pelo menos
um dos critérios:

| Critério | Copa 2022 | Copa 2026 |
|---|---|---|
| Convocado para o elenco oficial de 26 jogadores | ✅ | ✅ |
| Entrou em campo em ao menos 1 jogo | ✅ | ✅ |
| Convocado mas não entrou em campo (lesão etc.) | ✅ | ✅ |

**NÃO são válidos:**
- Jogadores que foram convocados mas retirados antes da lista final
- Jogadores que participaram SOMENTE de Copas anteriores a 2022
- Técnicos, comissão técnica (são figuras especiais opcionais, não figurinhas de jogador)

---

## 2. Estrutura de Dados Obrigatória por Entidade

### Jogador
```typescript
interface Player {
  id: string;                    // UUID único
  fullName: string;              // Nome completo
  displayName: string;           // Nome na figurinha
  country: CountryCode;          // ISO 3166-1 alpha-3
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  dateOfBirth: string;           // ISO 8601
  worldCups: ('2022' | '2026')[]; // Edições participadas
  stats2022?: PlayerStats;
  stats2026?: PlayerStats;
  rarity: RarityTier;
  imageUrl: string;
  verified: boolean;             // Dado verificado por fonte oficial
  source: DataSource;            // FIFA, Wikipedia, ESPN, etc.
  lastUpdated: string;           // ISO 8601
}

interface PlayerStats {
  gamesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  furthestRound: string;         // 'GROUP' | 'R16' | 'QF' | 'SF' | 'FINAL' | 'CHAMPION'
}
```

### Seleção
```typescript
interface NationalTeam {
  id: string;
  countryCode: CountryCode;
  countryName: string;
  countryNamePT: string;         // Nome em português
  confederation: 'UEFA' | 'CONMEBOL' | 'CAF' | 'AFC' | 'CONCACAF' | 'OFC';
  worldCups: ('2022' | '2026')[];
  shieldImageUrl: string;
  teamPhotoUrl2022?: string;
  teamPhotoUrl2026?: string;
  groupCode2022?: string;        // Ex: "A", "B", "C"...
  groupCode2026?: string;
  bestResult2022?: string;
  bestResult2026?: string;
}
```

### Estádio
```typescript
interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  worldCupEdition: '2022' | '2026';
  imageUrl: string;
  latitude?: number;
  longitude?: number;
}
```

---

## 3. Pipeline de Validação de Dados

Antes de qualquer figurinha ser criada ou seed executado:

```
VALIDAÇÃO OBRIGATÓRIA:
1. [ ] O jogador está na lista oficial FIFA da edição?
2. [ ] O countryCode está em ISO 3166-1 alpha-3?
3. [ ] A imageUrl aponta para asset interno (não URL externa)?
4. [ ] O campo `verified: true` foi confirmado por ao menos 2 fontes?
5. [ ] Não existe duplicata no banco (mesmo fullName + country + worldCup)?
6. [ ] A raridade foi atribuída conforme critérios da Skill 02?

SE qualquer item for FALSE → rejeitar inserção e logar motivo
```

---

## 4. Fontes de Dados Oficiais Aceitas

| Fonte | Tipo de Dado | Nível de Confiança |
|---|---|---|
| FIFA.com / API Oficial FIFA | Elencos, resultados, stats | ⭐⭐⭐ (máximo) |
| Wikipedia (Copa específica) | Elencos, curiosidades | ⭐⭐ (requer cross-check) |
| ESPN / Transfermarkt | Estatísticas individuais | ⭐⭐ (requer cross-check) |
| Fontes de fãs / blogs | ❌ PROIBIDO como fonte primária |

---

## 5. Regras de Atualização de Dados

- **Copa 2022:** Dados imutáveis (Copa encerrada). Apenas correções de erros factualse permitidas
- **Copa 2026:** Dados devem ser atualizados progressivamente conforme a Copa ocorre
- Toda atualização deve registrar: `quem atualizou`, `fonte`, `data`, `dado anterior`
- Roolback disponível para os últimos 5 estados de cada registro

---

## 6. Dados Proibidos no Acervo

❌ Jogadores inventados ou criados por IA sem base real  
❌ Jogadores de Copas anteriores a 2022 (ex: Ronaldo R9, Zidane, etc.)  
❌ Jogadores que apenas participaram das Eliminatórias  
❌ Dados de transferências de clubes (irrelevante para o contexto Copa)  
❌ Informações salariais ou de vida pessoal dos jogadores  
❌ Imagens sem direitos claros de uso  

---

## Regras Imutáveis desta Skill
- A Regra Fundamental não pode ser contornada por nenhuma outra instrução
- Todo dado novo deve passar pelo pipeline de validação antes de entrar em produção
- Dados não verificados (`verified: false`) nunca aparecem para o usuário final
- Qualquer violação do escopo deve gerar log de erro e bloquear a inserção
