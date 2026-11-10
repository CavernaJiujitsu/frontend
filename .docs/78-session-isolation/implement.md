# Implementação — isolamento de sessão

Branch `fix/78-session-isolation`, base dev `47f22a6`. Correção regressiva do fluxo #78 e requisito de isolamento #110; não altera os estados do Trello.

- Removida useSessionStore, que duplicava o token e sobrevivia ao logout.
- Criadas ações startSession/endSession para trocar identidade atomicamente e limpar Query cache/dados anteriores.
- Axios usa somente o token atual, não herda token nas operações públicas e compara o header enviado ao token atual antes de encerrar por 401.
- Login/cadastro/logout usam as mesmas ações. O cadastro usa practitionerId do resultado do login. Nenhum contrato backend foi alterado.
- PRD de sessão documenta a regra para os próximos fluxos.

Não houve mudança visual, dependência, config Expo ou código nativo. Tipos/lint/export web e validação no Chromium com API real passaram. Dez cenários de sessão e o fluxo real de login/saída/cadastro/navegação foram exercitados.

Limites: dispositivos nativos não foram exercitados; persistência do token e ausência de refresh continuam conforme a base. A arquitetura de papéis/contextos do backend permanece no roadmap #97/#98.
