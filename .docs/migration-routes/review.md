# Review — migração das rotas mobile

## Escopo e evidências

Revisão atualizada dos arquivos alterados e novos da branch `feat/migration-routes` contra `dev` (base `47f22a6`), dos artefatos em `.docs/migration-routes/` e dos controllers/DTOs correspondentes em `../backend`.

Checks executados nesta revisão:

- `bunx tsc --noEmit` — passou.
- `bun run lint` — passou.
- `git diff --check` — passou.

## Achados

| ID | Severidade | Categoria | Achado | Onde | Recomendação |
| --- | --- | --- | --- | --- | --- |
| — | — | — | Nenhum achado bloqueante nesta revisão. | — | — |

### Achado anterior resolvido

| ID | Status | Resolução | Evidência |
| --- | --- | --- | --- |
| MR-01 | Resolvido | `ProfilePhoto` consulta `GET /profiles/me` somente para obter a URL renderizável da foto — o backend resolve a chave conforme o storage configurado — e mantém essa URL no cache próprio `['profile-photo']`. Upload e remoção substituem o valor desse cache, sem depender de um refetch da rota read-only. | `src/api/services/profile.service.ts`, `src/components/profile-photo.tsx`, `src/app/(private)/perfil/index.tsx`; contrato em `../backend/src/modules/profiles/profiles.controller.ts` e `profiles.service.ts`. |

## Conformidades verificadas

- Login usa exclusivamente `POST /api/v1/mobile/auth/login`, com corpo `{ email, password }`, e preserva token, IDs e papéis retornados.
- Recuperação mantém a mensagem genérica no cliente e o serviço de reset envia somente `{ token, password }` para a rota canônica.
- Perfil, home e trilha usam as rotas `profile-readonly`; as chamadas e query keys migradas não incluem `practitionerId` na URL. A exceção documentada é a leitura pontual de URL da foto em `/profiles/me`.
- Home serializa apenas os parâmetros permitidos e só envia latitude/longitude em conjunto.
- Foram conferidos paths, verbos e corpos dos serviços novos de horários, participação, aprovação, graduações, certificados e workouts com os respectivos controllers/DTOs do backend.
- A listagem de certificados usa `/graduations/certificates`; o endpoint legado continua apenas para upload, que está fora desta migração.
- Sessões antigas são mescladas com os novos campos de identidade; logout e resposta 401 limpam o token de uso.
- Não foram encontradas alterações em `.env`, novas dependências, segredos expostos, montagem insegura de URLs com input do usuário, `WebView`/HTML injetado ou deep links novos no escopo.
- A trilha trata `belt` e `trail` anuláveis, compatível com a inconsistência de resposta do backend registrada nos artefatos.

## Conclusão

**Não bloqueia merge.** A migração está alinhada ao plano e aos contratos conferidos. Permanecem como limites conhecidos, já registrados em `implement.md`, a UX de professor ainda não planejada, a inconsistência de `belt`/`trail` no backend e a ausência de DTO público para workouts.
