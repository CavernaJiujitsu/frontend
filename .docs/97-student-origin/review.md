# Review mobile #97

Revisão de leitura em 10/11/2026 (UTC), após checks finais. Diff contra dev contém #24; revisão do incremento novo contra `8aea60f`, com revisão anterior em `../78-session-isolation/review.md`.

## Achados

| ID | Severidade | Categoria | Achado | Onde | Recomendação |
| --- | --- | --- | --- | --- | --- |
| R1 | 🔵 informativo | Integração | Onboarding novo requer endpoints backend #97 e correção de sessão #24 | Services/OriginUnit | Integrar dependências e backend primeiro; sem fallback que finja gravar origem |
| R2 | 🔵 informativo | Validação | Interação foi validada em Chromium mobile; não em iOS/Android nem contra Figma | Nova tela | Incluir dispositivos e revisão visual na validação da equipe |
| R3 | 🔵 informativo, pré-existente | Desenvolvimento | vConsole sobrepõe parte da navegação inferior no servidor de desenvolvimento | Perfil/BottomNavbar | Considerar ferramenta ao reproduzir QA; não atribuir sobreposição à origem |
| R4 | 🟡 médio, pré-existente | Sessão | Persistência de token mantém estratégia existente; o novo fluxo depende da limpeza central de identidade/cache | AppStore e PR #24 | Evoluir armazenamento/renovação em card próprio; não adicionar outro store de sessão |

## Conformidades verificadas

- DTO/body espelhados do backend: apenas caveId/caveUnitId. GET admite null; PUT sem origem não avança. Sem aliases ou payloads inventados.
- Deep link exige UUID; nome da caverna vem da API. Busca vai por Axios params, sem interpolar query bruta; IDs usados como segmento são UUIDs do servidor/sessão. Nenhuma montagem insegura de URL/HTML encontrada no incremento.
- Nenhum segredo em EXPO_PUBLIC, log de token ou mudança de `.env`. Nenhuma permissão nativa adicional. Cache de origem por practitionerId; limpeza de sessão reutiliza #24.
- Refs e identidade atual impedem navegação tardia; ref trava dupla confirmação; falha é visível e preserva escolha; query de unidades recebe AbortSignal.
- Rota em src/app, estilos em src/styles, ScreenLayout/insets e componentes app-owned reutilizados, tokens do tema, textos PT-BR e comentários em inglês. Listas por ID e seleção acessível.
- Paginação real, loading/vazio/erro/retry; Perfil distingue null de erro. Sem alteração de dependências, arquivos nativos ou lockfile.
- Critérios do plano e card rastreados em test.md, implement.md e PRD; modelo de gestão no backend e autorização #98 fora deste incremento. Sem divergência de escopo em aberto.

## Conclusão

Sem achado novo bloqueador para revisão do incremento. Draft direcionado à dev, dependente de #24/backend #97. Checks locais passaram; execução nativa, revisão da equipe e integração coordenada continuam necessárias antes da release.
