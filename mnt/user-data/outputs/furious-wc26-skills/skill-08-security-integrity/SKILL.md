---
name: furious-wc26-security-integrity
description: >
  Skill de segurança e integridade do FURIOUS WORLD CUP 26. Ativar SEMPRE
  que implementar autenticação, validações de servidor, prevenção de cheats,
  integridade de trocas, auditoria de transações, proteção de dados,
  rate limiting, anti-fraude em pacotes, logs de auditoria, LGPD/GDPR,
  proteção de menores, denúncias. Termos gatilho: "segurança", "autenticação",
  "cheat", "fraude", "hack", "validação", "servidor", "auditoria", "LGPD",
  "privacidade", "proteção", "integridade", "anti-bot", "rate limit".
---

# SKILL 08 — Segurança & Integridade do Sistema

## Princípio Central
**Nunca confie no cliente.** Toda lógica de negócio crítica (abertura de
pacotes, trocas, economia) deve ser validada exclusivamente no servidor.

---

## 1. Integridade dos Pacotes

### Regras de Validação Server-Side
```
PROCESSO DE ABERTURA DE PACOTE (servidor):
1. Verificar saldo do usuário (coins suficientes?)
2. Debitar coins ANTES de gerar figurinhas (operação atômica)
3. Gerar figurinhas com seed aleatório verificável (não manipulável pelo cliente)
4. Registrar cada figurinha gerada em log imutável
5. Retornar resultado ao cliente APENAS após registro completo
6. Se falha no meio: reverter débito automaticamente (idempotência)

PROTEÇÕES:
- Rate limit: máximo 10 aberturas de pacote por minuto por usuário
- Verificar se o pacote não foi já processado (idempotency key)
- Logs de auditoria para toda abertura (userId, packType, figurinhasGeradas, timestamp)
```

### Probabilidades Auditáveis
- Seed de aleatoriedade gerado no servidor, nunca no cliente
- Log de cada roll disponível para auditoria interna
- Relatório mensal de distribuição real vs. esperada para verificação de fairness

---

## 2. Integridade das Trocas

```
VALIDAÇÕES OBRIGATÓRIAS ANTES DE CONFIRMAR TROCA:
✅ Usuário A ainda possui a figurinha oferecida
✅ Usuário B ainda possui a figurinha oferecida
✅ Nenhum dos usuários está bloqueado ou suspenso
✅ Figurinha não está em cooldown de 24h (recém-recebida em troca)
✅ Ambos os usuários confirmaram dentro da janela de 1h
✅ A troca é entre figurinhas do mesmo tipo (regra da Skill 02)

ATOMICIDADE: A troca é uma transação atômica — ou AMBAS as transferências
acontecem, ou NENHUMA. Nunca estado parcial.
```

---

## 3. Anti-Fraude e Anti-Bot

### Detecção de Comportamento Suspeito
```
ALERTAS AUTOMÁTICOS:
🚨 >10 pacotes abertos em <1 minuto → rate limit + revisão
🚨 >20 trocas em <1 hora → suspensão temporária de trocas + revisão
🚨 Múltiplas contas com mesmo IP/dispositivo → vincular para análise
🚨 Score de reputação caindo >1.0 em 24h → alerta de comportamento
🚨 Código Fúria tentado >3x sem sucesso → bloquear por 1h

RESPOSTAS AUTOMÁTICAS:
- Rate limit com mensagem amigável ("Que fúria! Tente em alguns instantes 🔥")
- Suspensão de feature específica (não ban completo imediato)
- Revisão humana para casos graves
- Ban permanente para cheats comprovados (sem reembolso)
```

---

## 4. Proteção de Dados (LGPD/GDPR)

### Dados Coletados e Justificativas
| Dado | Finalidade | Retenção |
|---|---|---|
| Email | Autenticação, recuperação de conta | Enquanto conta ativa + 5 anos |
| País/Idioma | Personalização | Enquanto conta ativa |
| Histórico de trocas | Reputação, resolução de disputas | 2 anos |
| Logs de abertura de pacotes | Auditoria de fairness | 1 ano |
| Dados de pagamento | Processamento (nunca armazenamos raw, apenas token) | Conforme processador |

### Direitos do Usuário
- Exportar todos os dados em até 30 dias após solicitação
- Deletar conta: dados removidos em 30 dias (exceto logs de fraude por obrigação legal)
- Consentimento explícito para comunicações de marketing
- Parental consent obrigatório para usuários menores de 13 anos

---

## 5. Proteção de Menores

```
DETECÇÃO DE MENOR:
- Se data de nascimento indica < 13 anos → conta "Junior" com restrições
- Sem Praça pública (apenas grupos por convite de responsável)
- Sem chat
- Limite de gasto mensal: R$ 30 (requer aprovação parental adicional)
- Sem ranking público (apenas entre amigos aprovados)
- Conteúdo de desafios filtrado (nada de competição direta com estranhos)
```

---

## 6. Auditoria e Logs

### Eventos que DEVEM ser Logados (imutáveis)
- Toda abertura de pacote (resultado completo)
- Toda transação de Fúria Coins (entrada/saída)
- Toda troca (participantes, figurinhas, timestamp)
- Todo resgate de Código Fúria
- Toda compra real (IAP)
- Toda ação de moderação (ban, suspensão, aviso)
- Toda alteração de dados de figurinhas do acervo

### Retenção de Logs
- Logs de economia: 2 anos
- Logs de fraude/segurança: 5 anos
- Logs de moderação: 3 anos

---

## Regras Imutáveis desta Skill
- NENHUMA lógica de probabilidade de pacote roda no cliente
- Trocas são sempre atômicas (sem estado parcial possível)
- Logs de auditoria são append-only (nenhum log pode ser deletado)
- Dados de cartão de crédito NUNCA são armazenados nos nossos servidores
- Ban por cheat é permanente e sem reembolso de IAP
