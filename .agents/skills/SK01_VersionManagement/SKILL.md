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

### Integração Frontend (Regra "v0.0.7+")
O versionamento não fica restrito ao `package.json`. A mesma versão do pacote deve ser replicada visualmente para os usuários seguindo o padrão `vX.X.X` nas seguintes frentes:
- **Console do Navegador:** Logo ao carregar o app (`main.ts`).
- **Landing Page (Rodapé):** Ao lado do texto "Desenvolvido com ❤️" (`footer.component.ts/html`).
- **Navegação (Barra inferior ou Cabeçalho Desktop):** Posicionado ao lado direito das abas, para estar visível em todas as telas logadas (`bottom-nav.component.ts/html`).

*O script `scripts/increment_version.js` encarrega-se de atualizar ambos os escopos (package.json e environments/version.ts) simultaneamente.*

## Como usar
Sempre que ocorrer uma modificação significativa de código, o script de incremento deve ser executado:

```powershell
node scripts/increment_version.js
```

## Automação
Como assistente, devo executar este script após cada bloco de modificações aprovadas.
