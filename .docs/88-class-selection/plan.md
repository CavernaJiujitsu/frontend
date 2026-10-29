# Card 88 — Tela de escolha e listagem de aulas

Status: aprovado pelo usuário em 22/10/2026: "aprovo pode fazer". Card: https://trello.com/c/7snpNnBm.

## Contexto e objetivo

O usuário autorizou escolher o próximo card, criar uma branch da main atualizada, desenvolver, testar e fazer commit. O merge do backend #87 foi confirmado no PR #10, commit 7688652. O frontend é outro repositório: sua main está em f52a9cc. A branch feat/88-class-selection foi criada dessa main, sem reaproveitar a branch anterior do backend.

O card pede tela conforme Figma, troca de dia, seleção/navegação e estados loading/erro/vazio. A main já possui calendário, cartões e inscrição em src/app/onboarding/(schedule)/schedule.tsx. Falta estado de erro recuperável: hoje falhas viram lista vazia e podem disparar popup de ausência de horários. Não há link Figma na descrição ou referência local identificada.

## Requisitos funcionais

1. Concluir a tela existente de onboarding, sem criar uma segunda tela concorrente.
2. Preservar calendário de mês/dia e atualização das aulas exibidas ao selecionar outro dia. Corrigir seleção arbitrária do dia 10 ao trocar mês: usar dia 1 para outro mês e hoje para mês atual.
3. Exibir estados mutuamente exclusivos de carregamento, falha com Tentar novamente, vazio do dia e lista carregada. Não mostrar ausência de horários durante carregamento ou após erro.
4. Identificador de caverna ausente/inválido deve mostrar orientação visível e ação Escolher outra caverna, funcional também na web.
5. Reusar inscrição existente: uma solicitação por vez, navegação a /inicio somente após sucesso, falha com retorno utilizável sem apagar a lista. Bloquear visualmente os outros cartões enquanto a inscrição está em andamento.
6. Não inventar ocupação: quando a API não fornece quantidade de inscritos, mostrar capacidade total como informação, sem afirmar 0 inscritos ou vagas disponíveis.
7. Preservar componentes/tokens existentes como referência visual até o usuário fornecer Figma. Não declarar fidelidade a um Figma não inspecionado.
8. Manter dados fictícios isolados em api/mocks, sem modo de teste ou fixtures expostos na aplicação publicada.

## Requisitos não funcionais

Usar ScreenLayout para safe area/inset, vocabulário caverna, mensagens em PT-BR, acessibilidade de carregamento/erro/botões e tokens existentes. Sem dependência nova e sem configurar framework de testes.

## Regras e contrato

docs/api-contract/prd.md: backend é fonte de verdade; manter caveUnitId nos requests. Fluxo de navegação conforme docs/bottom-menu/prd.md: inscrição bem-sucedida termina em /inicio. docs/schedule-no-availability-pending.md registra popup ainda pendente de produto; proposta: estado vazio inline, distinguindo falha e carregamento, sem bloqueio por popup.

Manter getCave, listClasses e enrollClass já existentes e seus nomes de parâmetro. Este card não substitui o trabalho de integração #89 nem muda autenticação, contrato do backend, paginação do serviço ou a política de expiração #96.

## Decisões propostas

| Tema | Proposta |
|---|---|
| Rota | Concluir /onboarding/schedule, usando entrada atual de nearby-gym. |
| Visual sem Figma fornecido | Reusar desenho atual e tokens; registrar limitação de comparação visual. |
| Caverna sem horários | Estado inline; não disparar popup durante request/erro. |
| Seleção | Manter inscrição já existente, uma por vez, e saída /inicio. |
| Ocupação desconhecida | Capacidade total; não inventar inscritos/vagas livres. |

## Fora de escopo

Nova área privada de aulas, mudanças no backend, busca paginada completa além do contrato atual do serviço, integração do filtro semanal #87 no frontend (refinamento do #89), refazer design sem referência, criar conta de produção, publicar ou fazer merge.

## Critérios de aceite

1. Dias diferentes exibem suas respectivas aulas e calendário mantém um dia válido ao trocar mês.
2. Loading não mostra vazio/erro indevido.
3. Falha mostra erro e permite repetir consulta.
4. Lista vazia mostra mensagem do dia; rota inválida oferece retorno.
5. Inscrição não permite envios concorrentes e só navega após sucesso; falha permanece na tela.
6. Sem dado de ocupação, cartão não afirma ocupação zero.
7. Lint e typecheck passam; fluxo web é exercitado com fixtures locais e cenários controlados.
8. Commit somente dos arquivos deste card, na branch nova, após verificações; sem push/merge nesta etapa.

## Estratégia de teste e pendências

Ler docs do Expo SDK 57 antes de alterar APIs. Executar lint/typecheck e exportação web. Exercitar no navegador loading, erro/retry, dia vazio/com aulas, rota inválida e seleção; usar dados de teste locais sem alterar produção. Validar endpoints reais quando a API estiver disponível. Registrar ausência de emulador e de Figma em test.md.

Plano e blueprint aprovados. Dependências instaladas a partir do lockfile. Resultados em test.md.
