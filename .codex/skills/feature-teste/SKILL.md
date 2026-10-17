---
name: feature-teste
description: Testa de fato o que foi implementado no app — roda os checks do projeto (lint, typecheck, expo-doctor), exercita o fluxo real (app em web/dev) e valida a integração com a API via curl, mostrando comandos e resultados ao usuário, gravando tudo em `.docs/<slug>/test.md`. Use quando o usuário disser 'testar', 'rodar os testes', 'test the feature' ou 'validar'; é a terceira etapa do fluxo do trello-ticket. NÃO use para revisar código (feature-review) nem abrir PR (pr-create).
metadata:
  short-description: Checks do projeto + fluxo real + curl
---

# Feature Teste (checks + fluxo real + integração)

Estado atual do repo: **não há runner de testes configurado** (o Cypress está nas dependências, mas sem config/specs). Confirme antes de assumir; não instale nem configure framework de teste sem combinar com o usuário. Se o projeto ganhar um runner, atualize esta skill e os specs passam a ser item obrigatório. Enquanto isso, o teste de fato é: checks do projeto + exercitar o fluxo + validar a API que a tela consome.

Leia `.docs/<slug>/` (plan, blueprint, implement) e monte a matriz de casos: happy path, bordas (lista vazia, offline, campos no limite), erros (validação de formulário, 400/404/409 do backend), estados (loading/empty/error) e regressões do que foi tocado.

## 1. Checks do projeto (obrigatórios)

A partir de `frontend/`:

```bash
bun run lint        # expo lint
bunx tsc --noEmit   # typecheck
bunx expo-doctor    # quando deps/app config mudarem
```

## 2. Validação funcional (obrigatória)

1. Suba o app: `bunx expo start` (device/simulador) ou `bunx expo start --web` (web). Feature com biblioteca nativa exige development build; se não der para rodar, registre a lacuna — não finja que testou.
2. Exercite cada caso da matriz no app e mostre ao usuário o que foi feito e o que apareceu (tela, logs, estado). Se ele não estiver acompanhando, descreva passo a passo o que foi executado e observado.
3. **Integração real com o backend**: se a tela consome API, suba o backend local (`docker compose up -d` em `../backend`, API em `http://localhost:3000`) e valide os endpoints com `curl -s` — mesmos nomes que o `src/api/services/` usa (rota, query e body exatos). Mostre comando + resposta (status + trecho do JSON) e confira o contrato de erro. Se a tela usa mock, teste com e sem quando fizer sentido.
4. Se algo falhar: registre a evidência, proponha a correção e aplique só depois do ok do usuário (ou se ele pedir para corrigir). Nunca esconda, pule ou "comente" um caso quebrado.

## 3. Registro

Grave `.docs/<slug>/test.md`: ambiente (como o app e o backend subiram), comandos + resultados, tabela da matriz de casos (caso → esperado → obtido), evidências do curl, como reproduzir e limpeza opcional. Encerre com o que passou, o que falhou e o que ficou fora de cobertura (com justificativa — ex.: sem emulador disponível).
