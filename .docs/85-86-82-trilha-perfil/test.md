# Testes — 24/10/2026

## Ambiente e comandos
- `bun run lint`: passou, sem warnings do lint.
- `bunx tsc --noEmit`: passou após Expo regenerar tipos da nova rota. Primeira execução encontrou apenas rota ainda ausente no arquivo gerado em .expo.
- `git diff --check`: passou.
- `bunx expo export --platform web --output-dir /tmp/caverna-student-preview-export`: passou, 32 rotas, incluindo perfil, trilha e detalhe dinâmico.
- `bunx expo start --web --port 8082`: app executado localmente.
- `curl -I --max-time 20 http://localhost:8082/trilha`: HTTP 200.
- Nenhuma mudança de deps/config: expo-doctor não necessário.

## Fluxo real no Chrome conectado
Interações e leitura DOM/árvore de acessibilidade executadas pelo browser. Viewport 360×800 aplicado durante os testes e restaurado ao final.

| Caso | Resultado observado |
|---|---|
| Trilha normal | Faixas na ordem do fixture, atual azul, banner fictício e 30% |
| Abrir etapa atual | /trilha/blue?scenario=ready, conteúdo Faixa Azul |
| Movimentos | Validado com professor/aula/unidade/21-10-2026 19:00; legado explicitamente sem autoria; pendente separado |
| Voltar | Retorna à trilha |
| Avaliação pendente | Mensagem sem simular trilha ativa |
| Sem dados | Estado vazio explícito |
| Carregando | LoadingSpinner com nome acessível |
| Erro e retry | Mensagem e botão; retorna ao exemplo completo |
| Sem validações | 0%, detalhe com todos pendentes e sem evidência exibida |
| Perfil completo | Nome de demonstração, faixa, 48h/22/6 |
| Accordions | Abrem dados, certificados e configurações; mensagens de futura disponibilidade |
| Perfil incompleto | Nome/graduação indisponíveis e indicadores —, sem zeros inventados |
| Perfil vazio/loading/erro/retry | Todos observados; retry retorna aos dados de exemplo |
| ID desconhecido | /trilha/inexistente exibe Etapa não encontrada e retorno |
| Avatar | IMG local carregada (complete=true), geometria DOM 80×80 |

## Limitações
Capturas visuais retornaram timeout de Page.captureScreenshot, impedindo comparação pixel a pixel. Figma forneceu referência/screenshot de trilha e perfil, mas bloqueou leitura adicional do detalhe por limite Starter. Não declarar homologação visual completa. Android/iOS não exercitados. Integração/curl do backend não aplicável ao escopo refinado (somente telas); nenhum dado real consumido.

## Reprodução
`bun install`, `bunx expo start --web`; abrir /trilha, usar Explorar cenários e Ver etapa atual; abrir /perfil pelo menu, testar accordions e cenários. Cenários são simulações locais, não testes da API.
