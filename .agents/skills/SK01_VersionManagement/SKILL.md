---
name: Skill Versionamento Automático (SK01)
description: Gerencia o incremento incremental da versão do package.json seguindo regras decimais de 0 a 9.
---

# Skill 01: Versionamento Dinâmico

Esta skill garante que o projeto mantenha um histórico de modificações refletido na versão do `package.json`.

## Regras de Incremento
1. A versão segue o formato `x.y.z` (ou `x.y.z.w` se expandido).
2. Cada dígito vai de **0 a 9**.
3. Quando um dígito chega a **9**, o próximo incremento o torna **0** e aumenta o dígito à esquerda.
4. Se o dígito mais à esquerda for **9** e precisar incrementar, um novo dígito `1` é adicionado à esquerda (ex: `9.9.9` -> `1.0.0.0`).

## Como usar
Sempre que ocorrer uma modificação significativa de código, o script de incremento deve ser executado:

```powershell
node scripts/increment_version.js
```

## Automação
Como assistente, devo executar este script após cada bloco de modificações aprovadas.
