# Review — compatibilidade do #98 — [BE] Autorizar acessos por perfil, academia e professor responsável

Leitura final do incremento contra 1ab3d29 (PR #25), depois dos checks. O diff total para dev contém dependências anteriores; suas revisões permanecem nos respectivos artefatos.

| ID | Severidade | Categoria | Achado / onde | Recomendação |
| --- | --- | --- | --- | --- |
| R1 | 🔵 informativo | Integração | Login compartilhado passa a omitir practitionerId em conta sem aluno | Integrar este ajuste com o backend; não criar perfil implícito |
| R2 | 🟡 médio, pré-existente | Sessão | Persistência do token mantém estratégia anterior, sem refresh/revogação nova | Evoluir armazenamento em incremento próprio; fonte central de sessão mantida |
| R3 | 🔵 informativo | Validação | Testado em Chromium; vConsole de desenvolvimento aparece no screenshot | Validar iOS/Android com a equipe antes da release |

Conformidades: contrato backend conferido no DTO/controller; validação antes de mutar store/cache; erro local tipado e mensagem conhecida, sem expor erros arbitrários; nenhum segredo/log de token ou mudança de env; UI e toast existentes reutilizados; comentários em inglês e mensagens PT-BR; nenhuma URL/HTML remoto novo, montagem insegura ou dependência. Nenhum achado novo bloqueador para revisão do incremento.

Plano e entrega alinhados, com reprodução real do erro genérico e evidências sanitizadas. Draft para dev dependente do #25 e coordenado com backend. O card inteiro continua Fazendo; sem merge/release automático.
