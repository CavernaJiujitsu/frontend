# DEC-mobile-1 — Preview de PR do Expo web aponta para a mesma API da produção

## Status
Resposta: implementada

## Problema
O workflow `frontend/.github/workflows/azure-static-web-apps-agreeable-sea-050052e10.yml` disparava tanto em `push` (main) quanto em `pull_request`. O preview de PR do Azure Static Web Apps era implantado com a mesma `EXPO_PUBLIC_API_URL` da produção, fazendo com que o preview de PR criasse contas, inscrições e uploads reais na API de produção.

## Solução implementada (opção b: não publicar preview de PR)

O job de deploy do SWA foi restringido a `push` em `main`. Os PRs não geram mais preview implantado; a validação de PR fica por conta do `ci.yaml`, que já executa `lint`, `typecheck_and_tests` e `quality_assurance_job` (incluindo build do Expo web sem deploy).

### Alterações em `frontend/.github/workflows/azure-static-web-apps-agreeable-sea-050052e10.yml`

1. Removido o trigger `pull_request` do `on:`. O workflow dispara apenas em `push` no branch `main`.

   Antes:
   ```yaml
   on:
     push:
       branches:
         - main
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches:
         - main
   ```
   Depois:
   ```yaml
   on:
     push:
       branches:
         - main
   ```

2. A condição do `build_and_deploy_job` foi simplificada para rodar apenas em `push`.

   Antes: `if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')`
   Depois: `if: github.event_name == 'push'`

3. Removido o job separado `close_pull_request_job` (era específico de preview de PR, executava `action: close` do SWA ao fechar um PR).

### Para PRs

O `ci.yaml` (Quality assurance) já existe e é disparado em `pull_request` nos branches `dev` e `main`. Ele executa:
- `lint`
- `typecheck_and_tests`
- `quality_assurance_job` (valida variáveis de ambiente, build do Expo web e verifica `dist/index.html`)

Nenhum desses jobs implanta no SWA, então o preview de PR não aponta mais para a API de produção.

## Evidências

- `frontend/.github/workflows/azure-static-web-apps-agreeable-sea-050052e10.yml` confirmado: apenas `on: push` branch `main`; sem `pull_request`; sem `close_pull_request_job`.
- `frontend/.github/workflows/ci.yaml` inalterado: continua cobrindo PRs com `typecheck_and_tests` (e demais jobs de qualidade), sem deploy.

## Riscos residuais

1. `ci.yaml` define `EXPO_PUBLIC_API_URL` via `${{ vars.EXPO_PUBLIC_API_URL }}` no job `quality_assurance_job`. Se essa variável de variável do repositório apontar para a produção, o build do CI será validado contra a produção (somente leitura de build, sem gravação de dados via preview implantado). Recomenda-se revisar o valor de `vars.EXPO_PUBLIC_API_URL` ou usar uma URL de staging/homologação para builds de CI, se aplicável.
2. Como não há mais preview implantado de PR, mudanças visuais/funcionais do Expo web só poderiam ser verificadas localmente ou via build de CI sem deploy.
3. Nenhum outro workflow no `frontend/` foi inspecionado para ver se há outro gatilho de preview/apontamento para a API de produção.
