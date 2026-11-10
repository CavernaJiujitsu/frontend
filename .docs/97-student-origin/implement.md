# Implementação mobile #97

Entrega do plano: caverna → escolha explícita de unidade → confirmação persistida → faixa. Perfil mostra caverna/unidade consultadas no backend, inclusive depois de sair e entrar novamente.

| Área | Mudança |
| --- | --- |
| Onboarding | NearbyGym abre `origin-unit`; nova tela com busca, paginação real, seleção acessível e confirmação |
| API | GET/PUT de origem com contrato canônico; `listUnitsPage` expõe envelope e AbortSignal, mantendo wrapper compatível `listUnits` |
| Perfil | Query por practitionerId; loading, erro/retry, origem ou ausência explícita; visitas independentes |
| Visual | ScreenLayout, componentes/tokens existentes e estilos separados; paginação em duas linhas para viewport mobile |
| Fluxo | Lock contra envio duplicado; erro preserva seleção; resposta tardia após sair/trocar conta/caverna não redireciona |
| Padrões | PRD da origem e exigência de fetch/comparação GitHub antes de cada incremento/publicação |

SDK Expo 57 consultado antes das APIs tocadas. Sem dependência, runner, `.env`, lockfile ou configuração nativa nova. O harness de navegador foi instalado fora do repositório para validar a aplicação real.

## Ajustes observados na validação

O backend desempata unidades por nome/ID quando timestamps coincidem; a tela não corta a lista silenciosamente na primeira página. Na UI, os botões de paginação ocupam uma linha própria para caber em 390 px. Nome da caverna e origem vêm do servidor, nunca do título do deep link. PUT com resultado null por exclusão de unidade é falha recuperável e não permite avançar.

## Base e integração

Fetch repetido em 10/11/2026 (UTC): dev `47f22a66fbcbae09bb989a6d3ef88e3845914b06`, dependência PR #24 `8aea60f32fbfd368dd0fc2ce2357aadb5e42deb6`; sem commits remotos pendentes. Branch `feat/97-student-origin` empilha a correção de sessão #24. Backend #97 depende do backend #20. Integrar contrato no backend antes do app e atualizar/revalidar as bases quando os PRs forem integrados.

Trello foi lido pelo export fornecido, não alterado. O modelo de gestão de #97 fica no backend; login/contextos/policies de gestão ainda são #98. Transferência de origem não faz parte deste fluxo. Não há alegação de fidelidade Figma nem de execução em iOS/Android.
