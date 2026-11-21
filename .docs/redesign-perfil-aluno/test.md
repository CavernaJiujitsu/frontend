# Testes — páginas do perfil do aluno

## Ambiente

Expo SDK 57; validação estática em `frontend/`. Nenhuma dependência ou contrato de API alterado.

## Checks executados

| Check | Resultado |
| --- | --- |
| `bunx tsc --noEmit` | Passou. |
| `bun run lint` | Passou sem erros; permanece um aviso de `require()` em `src/components/__tests__/schedule-screen-test.tsx`, não relacionado a esta entrega. |
| `bun run test --runInBand --silent --forceExit __tests__/app/perfil-test.tsx` | 11 testes passaram; foi necessário `--forceExit` por handles assíncronos abertos após a suíte. |

## Matriz de casos

| Caso | Esperado | Evidência |
| --- | --- | --- |
| Perfil carregando / falha | Spinner; erro e retry; logout disponível | `__tests__/app/perfil-test.tsx` |
| Perfil principal | Identidade, indicadores, ausência de registro, links para páginas internas | `__tests__/app/perfil-test.tsx` |
| Dados | Nome, e-mail e idade editáveis; salvar com confirmação | `__tests__/app/perfil-test.tsx` |
| Certificados | Estado informativo sem atribuir arquivo global ao aluno | `__tests__/app/perfil-test.tsx` |
| Configurações → Endereço | Abre `/perfil/endereco`, resultado selecionado antes de confirmar, payload com coordenadas; ação de localização atual após permissão e recusa sem salvar | `__tests__/app/perfil-test.tsx` |
| Configurações: senha | E-mail confirmado; recuperação e saída da sessão | `__tests__/app/perfil-test.tsx` |

## Limites

Os testes da tela usam serviços simulados; não representam validação da API com credenciais reais. Conferência visual em dispositivo físico e integração HTTP real não foram realizadas neste ambiente. O processo Jest permaneceu aberto após reportar o sucesso; isso não foi interpretado como encerramento limpo da execução.
