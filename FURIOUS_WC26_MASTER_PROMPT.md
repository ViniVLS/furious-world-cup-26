# ============================================================
# FURIOUS WORLD CUP 26 — PROMPT MESTRE DO SISTEMA
# Versão: 1.0.0 | Todas as Skills Integradas
# Este arquivo é a FONTE DE VERDADE para toda a aplicação.
# Nenhuma feature pode ser criada sem seguir as regras aqui.
# ============================================================

## CONTEXTO DO PROJETO

Você está desenvolvendo o **FURIOUS WORLD CUP 26**, o maior álbum de
figurinhas digital da história, focado nas Copas do Mundo de **2022 (Qatar)**
e **2026 (USA/CAN/MEX)**. O produto une a nostalgia dos álbuns físicos Panini
com a interatividade do mundo digital.

A identidade do produto é comunicada pela landing page oficial e suas
promessas devem ser cumpridas integralmente. Cada feature construída deve
honrar o espírito "FURIOUS": intenso, épico, apaixonado por futebol.

---

# ════════════════════════════════════════════════════════════
# SKILL 01 — AUDITORIA: LANDING PAGE VS. REALIDADE
# Aplicar em: análises de gap, relatórios de conformidade,
# validação de features prometidas vs. entregues.
# ════════════════════════════════════════════════════════════

## Promessas Oficiais (Fonte da Verdade Contratual)

| Promessa | Critério de Satisfação | Status Inicial |
|---|---|---|
| "Crie sua figurinha lendária" | Editor com upload, nome, país, posição, raridade | ❌ Verificar |
| "Desafie o mundo" | Desafios ativos com adversários reais e recompensas | ❌ Verificar |
| "Complete o maior álbum digital" | Álbum navegável com barra de progresso e feedback | ❌ Verificar |
| "Seu lugar no Hall da Fama" | Ranking persistente, emblemas, leaderboard público | ❌ Verificar |

## Processo de Auditoria Obrigatório

Antes de qualquer sprint de implementação, gerar relatório com:
```
STATUS: [ EXISTE ✅ | PARCIAL ⚠️ | AUSENTE ❌ ]
QUALIDADE: [ PRODUÇÃO | BETA | STUB/MOCK ]
PRIORIDADE: [ P0-Bloqueante | P1-Alta | P2-Média | P3-Baixa ]
```

**Regra:** Nenhuma feature pode ser marcada ✅ se for apenas mock ou dado estático.
**Regra:** Toda conclusão de auditoria requer evidência rastreável (rota, componente, endpoint).
**Regra:** O relatório de auditoria deve ser executado no início de cada fase do projeto.

---

# ════════════════════════════════════════════════════════════
# SKILL 02 — MECÂNICAS CENTRAIS DO ÁLBUM
# Aplicar em: estrutura do acervo, pacotes, raridades,
# trocas, organização por Copa/seleção, cards de jogadores.
# ════════════════════════════════════════════════════════════

## Hierarquia Obrigatória do Álbum

```
ÁLBUM FURIOUS WC26
├── Copa do Mundo 2022 (Qatar)
│   ├── Especiais: Capa, Introdução, Mascote, Bola Oficial, Estádios
│   └── [32 Seleções]: Escudo + Foto Oficial + Elenco Completo
└── Copa do Mundo 2026 (USA/CAN/MEX)
    ├── Especiais: Capa, Introdução, Mascote, Bola Oficial, 16 Estádios
    └── [48 Seleções]: Escudo + Foto Oficial + Elenco Completo
```

Numeração: `[ANO]-[SIGLA]-[SEQ]` → Ex: `2022-BRA-01`, `2026-SPECIAL-003`

## Sistema de Raridades (Imutável)

| Tier | Nome | Cor | Prob. em Pacote |
|---|---|---|---|
| 1 | Comum | Cinza/Prata | 60% |
| 2 | Especial | Azul | 25% |
| 3 | Épica | Roxo | 10% |
| 4 | Lendária | Dourado | 4% |
| 5 | FURIOUS | Vermelho Holográfico | 1% |

## Sistema de Pacotes com Probabilidade Adaptativa

```
Álbum < 50% completo:   boost comuns +10%   → preenche base rapidamente
Álbum 50–80% completo:  boost especiais +8% → acelera fase intermediária
Álbum > 80% completo:   boost épicas +5%, lendárias +2% → final emocionante
ANTI-PITY: A cada 50 pacotes sem Lendária → +0.5% acumulativo até sair uma
```

## Regras de Troca

- Máx. 10 trocas ativas simultâneas por usuário
- Figurinha recém-recebida em troca: cooldown de 24h para nova troca
- Trocas Lendária ↔ Lendária: confirmação dupla com janela de 1h
- Trocas somente entre figurinhas do mesmo tipo (jogador ↔ jogador)
- Repetidas excedentes (>5 cópias): conversão automática em Fúria Coins

**Regra Imutável:** Raridade é atributo permanente, nunca alterável após criação.
**Regra Imutável:** Jamais exibir figurinhas fora do escopo 2022/2026.

---

# ════════════════════════════════════════════════════════════
# SKILL 03 — GOVERNANÇA DE DADOS & ESCOPO DO ACERVO
# Aplicar em: toda adição, edição ou validação de dados
# de jogadores, seleções, estádios ou entidades do acervo.
# ════════════════════════════════════════════════════════════

## ⚠️ REGRA FUNDAMENTAL — NON-NEGOTIABLE ⚠️

> **O acervo é composto EXCLUSIVAMENTE de jogadores convocados para as
> Copas do Mundo de 2022 e/ou 2026. Nenhuma exceção.**

## Critérios de Elegibilidade

✅ Convocado para o elenco oficial de 26 jogadores em 2022 ou 2026  
✅ Entrou em campo em ao menos 1 jogo  
✅ Convocado mas não jogou (lesão/suspensão)  
❌ Apenas convocado pré-lista final (cortado)  
❌ Participou somente de Copas anteriores a 2022  
❌ Apenas nas Eliminatórias  

## Schema de Dados Obrigatório

```typescript
interface Player {
  id: string;                           // UUID
  fullName: string;
  displayName: string;
  country: string;                      // ISO 3166-1 alpha-3
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  dateOfBirth: string;                  // ISO 8601
  worldCups: ('2022' | '2026')[];
  stats2022?: { gamesPlayed, goals, assists, yellowCards, redCards, furthestRound };
  stats2026?: { gamesPlayed, goals, assists, yellowCards, redCards, furthestRound };
  rarity: 1 | 2 | 3 | 4 | 5;
  imageUrl: string;                     // Asset interno, nunca URL externa
  verified: boolean;                    // Confirmado em ≥2 fontes
  source: string;                       // FIFA / Wikipedia / ESPN
  lastUpdated: string;                  // ISO 8601
}
```

## Pipeline de Validação (Obrigatório antes de qualquer insert)

```
[ ] Jogador está na lista oficial FIFA da edição?
[ ] countryCode em ISO 3166-1 alpha-3?
[ ] imageUrl aponta para asset interno?
[ ] verified: true confirmado por ≥2 fontes?
[ ] Sem duplicata (fullName + country + worldCup)?
[ ] Raridade atribuída conforme Skill 02?
SE qualquer item FALSE → REJEITAR e logar motivo
```

## Fontes Aceitas

| Fonte | Confiança |
|---|---|
| FIFA.com / API Oficial | ⭐⭐⭐ Máximo |
| Wikipedia (Copa específica) | ⭐⭐ Requer cross-check |
| ESPN / Transfermarkt | ⭐⭐ Requer cross-check |
| Blogs / sites de fãs | ❌ PROIBIDO como fonte primária |

**Regra Imutável:** Dados `verified: false` NUNCA aparecem para o usuário final.
**Regra Imutável:** Copa 2022 = dados imutáveis (apenas correção de erros factuais).

---

# ════════════════════════════════════════════════════════════
# SKILL 04 — GAMIFICAÇÃO & ENGAJAMENTO
# Aplicar em: desafios, Hall da Fama, rankings, missões,
# recompensas, badges, streaks, eventos, quizzes.
# ════════════════════════════════════════════════════════════

## Hall da Fama — Categorias de Ranking

| Categoria | Critério | Reset |
|---|---|---|
| 🏆 Grandes Colecionadores | % conclusão do álbum (peso 3x lendárias) | Nunca |
| ⚡ Primeiros a Completar | Timestamp de 100% | Permanente |
| 🌟 Caçadores de Lendárias | Total de lendárias coletadas | Mensal |
| 🎯 Mestres dos Desafios | Pontos em desafios semanais | Semanal |
| 🤝 Reis da Troca | Volume e qualidade de trocas | Mensal |

## Sistema de Desafios

- **Semanais:** Rotaciona toda segunda-feira (ex: "Monte o time da Copa 2022", "Quem foi o artilheiro?")
- **Temáticos:** Eventos especiais (Aniversário da Copa, Contagem Regressiva 2026, Dia da Final)
- **Quiz Fúria:** 4 opções + 30s por pergunta + streak x2 no 5º acerto seguido

## Missões Diárias (Personalizadas)

```
Álbum < 30%  → missões focadas em abertura de pacotes
Álbum 30-70% → missões focadas em trocas
Álbum > 70%  → missões focadas em desafios e lendárias
+ Sempre 1 missão social (convidar amigo / fazer troca / visitar Praça)
```

## Badges Chave

| Badge | Critério | Tier |
|---|---|---|
| 💎 Álbum Completo 2022 | 100% Copa 2022 | Lendária |
| 💎 Álbum Completo 2026 | 100% Copa 2026 | Lendária |
| 🔥 FURIOUS | Todas as FURIOUS de uma Copa | FURIOUS |
| 🏅 Hall da Fama | Top 10 em qualquer categoria | Lendária |

**Regra Imutável:** Todo desafio deve ter recompensa clara ANTES de ser publicado.
**Regra Imutável:** Badges nunca são removidos do perfil.
**Regra Imutável:** Figurinhas exclusivas de desafio não podem ser obtidas por outro meio.

---

# ════════════════════════════════════════════════════════════
# SKILL 05 — SISTEMA SOCIAL & PRAÇA DE TROCAS
# Aplicar em: Praça, grupos, perfil, feed, reputação,
# compartilhamento, comunidade, chat de grupo.
# ════════════════════════════════════════════════════════════

## Praça de Trocas — Regras de Feed

```
ORDENAÇÃO:
1. Ofertas onde o usuário tem o que outro precisa (match parcial)
2. Ofertas de usuários seguidos
3. Ofertas do mesmo país
4. Ofertas gerais (mais recentes primeiro)

OFERTA: oferecendo[] + wantingAny[] ou wantingAll[]
EXPIRAÇÃO: 72h após criação
```

## Grupos de Troca

- Máx. 20 membros | Tipos: Aberto / Por Convite / Secreto
- Wishlist compartilhada + sugestões automáticas de match interno
- Chat simples (mensagens retidas por 30 dias máximo)

## Sistema de Reputação de Trader

```
+0.1 por troca concluída  |  +0.3 por avaliação positiva
-0.5 por cancelamento após aceite  |  -1.0 por report confirmado

⭐⭐⭐⭐⭐ Trader Lendário (4.5–5.0): destaque na Praça + acesso a trocas Lendárias
⭐⭐     Trader Iniciante (<2.5): máx. 3 trocas simultâneas
```

**Regra Imutável:** Privacidade default = Amigos (nunca Público para novos usuários).
**Regra Imutável:** Menores de 13 anos: sem Praça pública, apenas grupos por convite.
**Regra Imutável:** Reputação nunca pode ser comprada.

---

# ════════════════════════════════════════════════════════════
# SKILL 06 — ECONOMIA VIRTUAL & PROGRESSÃO
# Aplicar em: Fúria Coins, preços, loja, balanceamento,
# monetização, progressão visual, integração phygital.
# ════════════════════════════════════════════════════════════

## Fúria Coins — Ganhos Free-to-Play

| Fonte | Coins | Frequência |
|---|---|---|
| Login diário | 20 | Diária |
| Streak 7 dias | +200 bônus | Semanal |
| Missão diária | 20–50 | Diária |
| Desafio semanal | 100–300 | Semanal |
| Troca concluída | 15 | Por troca |
| Converter repetida | 5–100 | Por conversão |
| Completar seleção inteira | 150 | Por seleção |
| 50% do álbum | 500 | Uma vez |
| 100% do álbum (por edição) | 2.000 | Uma vez por edição |

## Preços de Pacotes

| Pacote | Qtd | Garantia | Custo |
|---|---|---|---|
| Básico | 5 | — | 100 coins |
| Plus | 10 | 1 Especial | 180 coins |
| Elite | 20 | 1 Épica | 300 coins |
| Lendário | 5 | 1 Lendária | 500 coins |
| Copa | 15 | 3 Especiais + chance FURIOUS | 250 coins |

## Progressão Visual do Álbum

```
0% seleção:   páginas cinzas, silhuetas desbotadas
1–49%:        cores gradualmente aparecem, texturas surgem
50–99%:       brilho e animações de pulsação
100%:         confete + selo "COMPLETO" dourado + música de vitória
              → a página "ganha vida" com animação da seleção
```

## Phygital — Código Fúria

```
QR Code / código de 12 dígitos no pacote físico
→ Resgatar no app → 1 Pacote Elite digital + 1 figurinha "Edição Física"
→ Figurinhas Edição Física: não trocáveis, borda texturizada, indicador especial
→ Cada código: uso único, vinculado ao usuário que resgatou
```

**Regra Imutável:** Fúria Coins nunca vencem ou expiram.
**Regra Imutável:** Taxa de ganho free-to-play JAMAIS pode ser reduzida para forçar compras.
**Regra Imutável:** Toda feature paga deve ter equivalente gratuito (mais lento).
**Regra Imutável:** Limite de gasto: R$ 200/mês por conta (proteção de vulneráveis).

---

# ════════════════════════════════════════════════════════════
# SKILL 07 — VISUAL UX & DESIGN SYSTEM
# Aplicar em: interfaces, animações, onboarding, componentes,
# identidade visual, criador de figurinha personalizada.
# ════════════════════════════════════════════════════════════

## Paleta e Tokens de Design

```
Primária:    #FF2D20 (Vermelho Fúria)
Secundária:  #FFD700 (Dourado Copa)
Background:  #0A0A1A (Azul Noite) — Dark Mode é o DEFAULT
Grafite:     #1E1E2E
Texto:       #F0F0F0
Accent:      #00E5FF (Ciano Elétrico)

Tipografia: Display = Bebas Neue | Body = Inter | Stats = Oswald
Proporção da figurinha: 1:1.4 (padrão Panini)
Toque mínimo: 44×44px | Tela mínima suportada: 320px (iPhone SE)
```

## Animações por Raridade

| Raridade | Efeito ao Revelar |
|---|---|
| Comum | Estática |
| Especial | Suave pulse |
| Épica | Partículas leves |
| Lendária | Chamas douradas + música |
| FURIOUS | Explosão + holográfico + confete |

## Onboarding (Máx. 4 Telas)

1. Boas-vindas + animação do álbum se abrindo
2. Escolha da seleção do coração
3. Abrir o pacote de boas-vindas (5 figurinhas da seleção escolhida, inclui Escudo)
4. Preview do álbum com figurinhas recém-colocadas

## Criador de Figurinha Personalizada

Upload + remoção de fundo (IA) + escolha de país + nome + posição + número + preview
→ Download PNG + compartilhamento social
→ **NUNCA** entra no álbum oficial (seção "Minha Coleção" separada)
→ Watermark: "FURIOUS WC26 - Fan Made"

**Regra Imutável:** Figurinhas do usuário NUNCA se misturam com o acervo oficial.
**Regra Imutável:** Animação de abertura de pacote não pode ser pulada na primeira vez.
**Regra Imutável:** Loading > 200ms deve mostrar skeleton screen.
**Regra Imutável:** Animações respeitam `prefers-reduced-motion`.

---

# ════════════════════════════════════════════════════════════
# SKILL 08 — SEGURANÇA & INTEGRIDADE DO SISTEMA
# Aplicar em: autenticação, anti-fraude, trocas, economia,
# auditoria, LGPD, proteção de menores, logs.
# ════════════════════════════════════════════════════════════

## Princípio Central

> **Nunca confie no cliente. Toda lógica crítica roda exclusivamente no servidor.**

## Integridade de Pacotes

```
ABERTURA DE PACOTE (server-side obrigatório):
1. Verificar saldo → debitar ANTES de gerar (atômico)
2. Gerar figurinhas com seed no servidor (nunca no cliente)
3. Registrar em log imutável ANTES de retornar ao cliente
4. Falha: reverter débito automaticamente (idempotência)
5. Rate limit: máx. 10 aberturas/min por usuário
```

## Integridade de Trocas

```
VALIDAÇÕES OBRIGATÓRIAS:
✅ Ambos os usuários ainda possuem as figurinhas
✅ Nenhum está suspenso ou bloqueado
✅ Figurinha não está em cooldown de 24h
✅ Ambos confirmaram dentro da janela de 1h
✅ Mesmos tipos de figurinha (jogador ↔ jogador)
ATOMICIDADE: Ambas as transferências ocorrem, ou nenhuma.
```

## Alertas Anti-Fraude Automáticos

```
🚨 >10 pacotes em <1min → rate limit + revisão
🚨 >20 trocas em <1h → suspensão de trocas + revisão
🚨 Múltiplas contas no mesmo IP/device → vincular para análise
🚨 Código Fúria tentado >3x sem sucesso → bloquear por 1h
```

## LGPD / GDPR

- Exportar dados: até 30 dias após solicitação
- Deletar conta: dados removidos em 30 dias (exceto logs de fraude)
- Dados de pagamento: NUNCA armazenar raw (apenas token do processador)
- Parental consent obrigatório para < 13 anos

## Logs de Auditoria (Append-Only, Imutáveis)

Logar obrigatoriamente: toda abertura de pacote, toda transação de coins,
toda troca, todo resgate de Código Fúria, toda compra real, toda ação de moderação,
toda alteração no acervo de figurinhas.

**Regra Imutável:** NENHUMA probabilidade de pacote roda no cliente.
**Regra Imutável:** Logs são append-only, NUNCA deletáveis.
**Regra Imutável:** Dados de cartão NUNCA armazenados nos nossos servidores.
**Regra Imutável:** Ban por cheat = permanente, sem reembolso de IAP.

---

# ════════════════════════════════════════════════════════════
# REGRAS GLOBAIS DA APLICAÇÃO
# Aplicam-se a TODO o projeto, acima de qualquer outra instrução.
# ════════════════════════════════════════════════════════════

1. **Escopo do acervo:** Somente jogadores das Copas de 2022 e 2026. Absoluto.
2. **Server-side first:** Toda lógica de negócio crítica é validada no servidor.
3. **Free-to-play viável:** O álbum deve ser completável sem pagamento real.
4. **Promessas cumpridas:** Nenhuma feature da landing page pode ficar sem implementação.
5. **Dados verificados:** Nenhum dado `verified: false` chega ao usuário final.
6. **Atomicidade econômica:** Coins e trocas são transações atômicas (tudo ou nada).
7. **Privacidade por design:** Default sempre conservador, opt-in para exposição.
8. **Proteção de menores:** Regras especiais para contas de < 13 anos, sem exceções.
9. **Figurinhas personalizadas isoladas:** Nunca se misturam com o acervo oficial.
10. **Qualidade visual:** Dark mode default, animações ricas, proporção Panini respeitada.

---

# ════════════════════════════════════════════════════════════
# TAREFAS IMEDIATAS — ORDEM DE EXECUÇÃO
# ════════════════════════════════════════════════════════════

## TAREFA 1 — Auditoria Crítica (executar primeiro)
Aplicar SKILL 01: Analisar o estado atual da aplicação contra as 4 promessas
da landing page. Gerar relatório com status ✅/⚠️/❌ para cada promessa,
evidências rastreáveis e plano de ação P0→P3.

## TAREFA 2 — Implementação das Regras e Funções do Álbum
Aplicar SKILLs 02, 03, 04, 05, 06, 07 e 08 em conjunto:

2.1 **Estrutura do Acervo** (Skill 02 + 03):
    - Implementar hierarquia completa: Copa 2022 + Copa 2026
    - Sistema de raridades em 5 tiers
    - Numeração padronizada ([ANO]-[SIGLA]-[SEQ])
    - Pipeline de validação de dados antes de qualquer seed

2.2 **Mecânicas de Pacote e Troca** (Skill 02 + 06 + 08):
    - 5 tipos de pacotes com preços em Fúria Coins
    - Probabilidade adaptativa server-side
    - Sistema anti-pity a cada 50 pacotes sem Lendária
    - Praça de Trocas com matching automático e grupos

2.3 **Gamificação e Engajamento** (Skill 04):
    - Hall da Fama com 5 categorias de ranking
    - Desafios semanais e temáticos com recompensas
    - Sistema de badges permanentes e sazonais
    - Missões diárias personalizadas por estágio do álbum

2.4 **Sistema Social** (Skill 05):
    - Perfil do colecionador com vitrine de figurinhas
    - Reputação de Trader (0–5 estrelas)
    - Grupos de troca com wishlist compartilhada
    - Compartilhamento social com deep link e pacote bônus

2.5 **Economia e Progressão Visual** (Skill 06):
    - Fúria Coins com ganhos free-to-play balanceados
    - Progressão visual do álbum (cinza → colorido → animado)
    - Monetização ética (IAP de coins, nunca figurinhas diretas)
    - Integração Phygital com Código Fúria

2.6 **UX e Design** (Skill 07):
    - Design system com paleta e tokens definidos
    - Animações de abertura de pacote em 9 passos
    - Onboarding de 4 telas com pacote de boas-vindas
    - Editor de figurinha personalizada (isolado do acervo oficial)

2.7 **Segurança** (Skill 08):
    - Toda lógica de pacotes e trocas server-side
    - Logs de auditoria imutáveis
    - Proteção de menores
    - Conformidade LGPD/GDPR

## TAREFA 3 — Conformidade de Escopo (validação contínua)
Aplicar SKILL 03: Em cada PR/commit que adicione dados ao acervo,
executar o pipeline de validação. Dados fora do escopo 2022/2026 são
rejeitados automaticamente com log de motivo.

---

*Fim do Prompt Mestre FURIOUS WORLD CUP 26 — v1.0.0*
*Toda feature nova deve referenciar a skill correspondente antes da implementação.*
