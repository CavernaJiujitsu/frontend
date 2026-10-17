---
name: feature-review
description: Revisa o que foi implementado na branch e devolve os achados em tabela, cobrindo segurança no app (segredos, tokens, deep links), injeção/montagem de URL e HTML, desvios do padrão do projeto, duplicidades e falhas de tipos/validação de formulário; grava `.docs/<slug>/review.md`. Use quando o usuário pedir 'review', 'revisar', 'faz o review dessa branch', 'antes do PR' ou 'security review', ou quando o fluxo do pr-create exigir. NÃO corrija código nesta skill (é read-only) e não abra PR.
metadata:
  short-description: Review com tabela de achados
---

# Feature Review (achados em tabela)

Escopo: o diff da branch atual contra a base (`git diff <base>...HEAD` — normalmente `dev` ou `main`) e a leitura integral do código novo (não só o diff). Se o usuário apontar um diff/caminho específico, siga o apontado. Só leitura: não corrija nada nesta skill.

## Checklist (verifique no código, não presuma)

- **Segurança / possíveis ataques**: segredo/chave em `EXPO_PUBLIC_*` (vira público no bundle — só config não sensível); token/sessão em storage inseguro (hoje não há auth real — registre o impacto quando existir); logs com dados sensíveis; deep links (`expo-linking`) com params validados; `expo-web-browser`/WebView com URL vinda de input remoto; permissões (ex.: localização) pedidas só quando necessárias; `.env` está rastreado no repo — sinalize qualquer mudança nele.
- **Injeção / montagem de URL e HTML**: URL/query montada com input do usuário (busca, params de rota/deep link) — precisa de encoding, sem template string cega; nada de HTML/script remoto injetado (web: `dangerouslySetInnerHTML`; nativo: WebView com HTML/`injectedJavaScript` remoto sem sanitizar).
- **Padrão da aplicação**: rotas em `src/app/` (código que não é rota fica fora); estilos espelhados em `src/styles/<grupo>/`; componentes app-owned de `src/components/customized/` reutilizados (botão novo em vez do `DefaultButton` = achado); tokens de tema (hex solto = achado); `ScreenLayout`/insets; troca de aba com `router.replace`; comentários em inglês e strings em PT-BR; vocabulário "caverna"; imports `@/`; dependência instalada via `expo install` na versão do SDK; `ios/`/`android/` intocados; contrato do backend espelhado exato (confira `src/api/services/` contra o DTO do backend); PRD de `docs/<área>/prd.md` atualizado quando o padrão mudou.
- **Duplicidades**: componentes/lógica/estilos repetidos; mock duplicando o service real; helpers de `src/utils/` reimplementados; tipos copiados em vez de reusados.
- **Tipos, schemas e formulários** (equivalente a "falhas de DTO"): types de `src/types/` e `src/api/types/` batendo com o backend; zod/react-hook-form validando cada campo (mensagens úteis); o backend tem `whitelist`/`forbidNonWhitelisted` — o front não pode enviar campo a mais; enums vindos do backend intactos; estados de erro/loading tratados; `key` estável em listas; defaults corretos em opcionais.
- Os itens acima são o mínimo — siga também qualquer área que o usuário indicar.

## Saída

Grave `.docs/<slug>/review.md`:

1. **Tabela de achados**: ID, severidade (🔴 alto / 🟡 médio / 🔵 informativo), categoria, achado, onde (arquivo/tela), recomendação. Registre achados pré-existentes como tal (não "invente" que são da branch).
2. **Conformidades verificadas**: o que passou no checklist (inclusive o "nenhuma montagem insegura de URL/HTML encontrada", quando for o caso).
3. **Conclusão**: bloqueia merge ou não; o que corrigir antes e o que pode ir para incremento.

Não corrija nada — se o usuário quiser correções, trate como nova tarefa.
