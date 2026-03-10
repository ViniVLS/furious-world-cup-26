---
name: furious-wc26-audit
description: >
  Skill de auditoria crítica do FURIOUS WORLD CUP 26. Use SEMPRE que precisar
  analisar gaps entre o que a landing page promete e o que o app entrega,
  gerar relatórios de conformidade de funcionalidades, mapear o que está
  ausente vs. implementado, ou validar se novas features cumprem as promessas
  anunciadas. Ativa para termos como: "analise o app", "o que está faltando",
  "verifique se existe", "gap analysis", "relatório de funcionalidades",
  "auditoria", "landing page promete".
---

# SKILL 01 — Auditoria: Landing Page vs. Funcionalidades Reais

## Objetivo
Garantir que o FURIOUS WORLD CUP 26 cumpra **todas** as promessas feitas
na landing page. Nenhuma feature pode ser anunciada sem estar implementada.

---

## Promessas Oficiais da Landing Page (Fonte da Verdade)

| Promessa | Frase Exata | Critério de Satisfação |
|---|---|---|
| Criação de Figurinha | "Crie sua figurinha lendária" | Editor funcional com upload de foto, nome, país, posição, raridade |
| Competição Global | "Desafie o mundo" | Sistema de desafios ativos com placar, adversários reais e recompensas |
| Álbum Completo | "Complete o maior álbum digital da história" | Álbum navegável, barra de progresso, feedback visual ao completar páginas |
| Reconhecimento | "Seu lugar no Hall da Fama" | Ranking global persistente, emblemas de conquista, leaderboard público |

---

## Processo de Auditoria

### Passo 1 — Inventário de Telas e Rotas
Mapear todas as telas existentes no app:
- Liste cada rota/tela com sua função declarada
- Identifique qual promessa da landing page cada tela cobre (ou deveria cobrir)
- Marque telas "órfãs" (existem mas não cobrem nenhuma promessa) e promessas "fantasmas" (anunciadas mas sem tela)

### Passo 2 — Checklist de Conformidade
Para cada promessa, avaliar em 3 dimensões:

```
STATUS: [ EXISTE | PARCIAL | AUSENTE ]
QUALIDADE: [ PRODUÇÃO | BETA | STUB/MOCK ]
BLOQUEANTE: [ SIM | NÃO ]
```

### Passo 3 — Relatório de Gaps
Gerar relatório estruturado com:
1. **Verde ✅** — Funcionalidade entregue em nível produção
2. **Amarelo ⚠️** — Funcionalidade parcialmente implementada (listar o que falta)
3. **Vermelho ❌** — Funcionalidade completamente ausente (prioridade crítica)

### Passo 4 — Plano de Ação Priorizado
Ordenar os gaps por:
- **P0 (Bloqueante):** Promessas totalmente ausentes que prejudicam a credibilidade do produto
- **P1 (Alta):** Funcionalidades parciais com impacto direto no engajamento
- **P2 (Média):** Melhorias de qualidade em features já existentes
- **P3 (Baixa):** Polimentos e otimizações secundárias

---

## Output Esperado

```markdown
## RELATÓRIO DE AUDITORIA — FURIOUS WORLD CUP 26
**Data:** [data]
**Versão analisada:** [versão]

### RESUMO EXECUTIVO
- Total de promessas: 4
- Cumpridas integralmente: X
- Parcialmente cumpridas: X
- Completamente ausentes: X
- Score de conformidade: X/10

### DETALHAMENTO POR PROMESSA
[Para cada promessa: status, evidência, gap, ação recomendada]

### PLANO DE AÇÃO
[P0, P1, P2, P3 com estimativas de esforço]
```

---

## Regras Imutáveis desta Skill
- Nunca marcar uma feature como ✅ se ela for apenas um mock ou dados estáticos
- Se a feature existir mas for inacessível por bug, marcar como ⚠️ (não ✅)
- O relatório deve ser objetivo, sem linguagem evasiva
- Toda conclusão deve ter evidência rastreável (rota, componente, endpoint)
