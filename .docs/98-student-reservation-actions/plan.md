# Correção do app associada ao #98 — [BE] Autorizar acessos por perfil, academia e professor responsável

10/11/2026. Card existente reaberto com autorização do PO, não novo card. Autonomia de implementação/correções já autorizada na conversa; gates técnicos de plano/blueprint cobertos por essa autorização. Card continua Fazendo. <https://trello.com/c/5srH5hR2>

Base conferida por fetch dev `47f22a66fbcbae09bb989a6d3ef88e3845914b06`; branch sobre PR #26 `b7f4ed2761ee7362425f413de540c2e6d1e095d7`, sem alteração remota/local pendente. Nova branch `fix/98-student-reservation-actions`, draft para dev. Backend coordenado `fix/98-enrollment-ownership`, dependente de backend PR #22.

## Contexto, objetivo e regras

A home oferece check-in para PENDING e cancelamento para CONFIRMED: ambas as ações conflitam com as regras atuais. Backend docs/business-rules.md reserva confirmação ao professor responsável e só permite cancelamento PENDING/IN_PROGRESS. O critério do card exige reserva/cancelamento próprios, sem check-in de aluno. Corrigir a apresentação e a única mutação da home mantendo serviços/rotas/DTOs existentes.

## Requisitos e decisões

1. PENDING e IN_PROGRESS: oferecer Cancelar inscrição da próxima aula; pending da mutação desabilita e mostra Aguarde…; sucesso refaz home/perfil e informa vaga liberada.
2. CONFIRMED: mostrar Presença confirmada, sem botão de cancelar ou confirmar; explicar que a presença foi registrada pelo professor.
3. Nunca invocar endpoint check-in a partir da home do aluno. Nenhuma permissão derivada apenas da interface: backend continua responsável por JWT/propriedade.
4. Falha de cancelamento preserva reserva e permite tentar novamente; manter normalização de erro existente. Ausência de próxima aula preserva estado vazio.
5. Conservar estilos/tokens/layout/rotas existentes, sem dependência, Expo API nova, alterações nativas ou redesenho Figma.

Contrato conferido: POST classes/:id/enrollments recebe practitionerId do store e Bearer central; POST classes/:id/enrollments/:enrollmentId/cancel recebe Bearer sem body. Sucesso envelope atual; 401/403 para ausência de autenticação/ação alheia; 409 de estado. GET home expõe enrollmentStatus e IDs reais. Nenhuma mudança em services necessária.

## Aceite e validação

Reproduzir botão incorreto na base com aluno e reserva reais. Chromium 390x844 com backend real: reserva pela agenda, cancelamento PENDING/IN_PROGRESS, busy/bloqueio de duplo envio, falha e tentativa posterior, vazio após cancelar, CONFIRMED sem ações proibidas, nenhuma request de check-in. Comparar Bearer e practitionerId das chamadas. Lint/tipos/export web e evidências sanitizadas antes de publicação. Fetch/PRs novamente antes de push. Registrar histórico simples no Notion.

## Riscos e fora de escopo

Não concluir o card inteiro; policies de gestão e leituras legadas pendentes. Não prometer revisão Figma nem execução iOS/Android. Não mudar regras temporais, Alert, controle de cache global ou inventar check-in de aluno. Expo SDK 57 lido do package; tentativa de consultar documentação versionada bloqueada pela política de rede (403); nenhum uso novo de API Expo/React Native será introduzido.
