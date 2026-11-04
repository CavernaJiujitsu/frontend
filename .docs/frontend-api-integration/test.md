# Testes — integração completa do frontend com a API do aluno

## Ambiente

- Frontend Expo SDK 57, Bun.
- Backend usado como fonte de contrato no diretório irmão `backend`.
- Nenhum runner de testes automatizados está configurado no frontend.

## Checks executados

| Comando | Resultado |
|---|---|
| `bun run lint` | PASSOU |
| `bunx tsc --noEmit` | PASSOU |
| `git diff --check` | PASSOU |
| `bunx expo-doctor` | 19/21; dois alertas de dependências pré-existentes |
| `bunx expo start --web` | servidor já estava na 8081; `curl -I` retornou HTTP 200 |

## Matriz funcional

| Caso | Esperado | Resultado |
|---|---|---|
| Agenda por caverna | GET de classes reais por `caveUnitId`; sem seed local | Código validado por typecheck/lint |
| Matrícula | POST com `practitionerId` real | Código validado por contrato/compilação |
| Check-in | POST com `classId` e `enrollmentId` reais | Código validado por contrato/compilação |
| Cancelamento | POST de cancelamento com IDs reais | Código validado por contrato/compilação |
| Edição de perfil | PATCH com `name`, `email`, `age` | Código validado por contrato/compilação |
| Foto | PUT multipart com campo `file`, JPG/PNG até 5 MB | Código validado por contrato/compilação |
| Remoção de foto | DELETE `/profiles/me/photo` | Código validado por contrato/compilação |
| Certificado | Upload real no onboarding | Código validado por contrato/compilação |
| Sessão expirada | interceptor limpa token em 401 | Mantido e não regressivo |

## Limitações

- Não foi possível exercitar login e requests autenticados contra o banco local
  nesta rodada; não há credenciais/fixture de usuário fornecidas.
- O Expo Doctor apontou divergências de dependências que já existiam e não foram
  alteradas para evitar uma mudança de escopo.
- A listagem de certificados não foi exibida como “meus certificados” porque o
  backend não fornece vínculo com o praticante nessa rota.
