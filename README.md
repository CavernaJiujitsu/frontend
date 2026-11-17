# Caverna Jiu-Jitsu — app mobile

App Expo/React Native (Expo Router) do projeto acadêmico **Caverna Jiu-Jitsu**, o
"wellhub do jiu-jiteiro". Um único login atende alunos e professores:

- **Aluno** (`/inicio`, `/trilha`, `/cavernas`, `/perfil`): onboarding (conta →
  localização → caverna próxima → faixa/certificado → primeira aula), trilha
  técnica, busca de cavernas e reserva de aulas.
- **Professor** (`/professor/...`): painel, aulas (criar, editar, excluir),
  chamada (check-in, participação, inscrições) e validações de faixa
  (agendar, aprovar, rejeitar).
- Contas com os dois papéis escolhem o modo em `/escolher-perfil` e podem
  trocar pela tela de perfil.
- Recuperação de senha: o link do e-mail abre `/reset-password?token=...`.

## Requisitos

- [Bun](https://bun.sh) e a API do backend rodando (padrão `http://localhost:3000`).

## Como rodar

```bash
cp .env.example .env      # ajuste EXPO_PUBLIC_API_URL se necessário
bun install
bunx expo start           # pressione "w" para web, ou abra no Expo Go
```

Variáveis de ambiente:

| Variável | Descrição |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Origem da API Nest (sem `/api/v1`), ex.: `http://localhost:3000`. Em celular físico use o IP da máquina. |
| `EXPO_PUBLIC_ENABLE_VCONSOLE` | `true` só no build web de testes publicado. |

Verificações:

```bash
bunx tsc --noEmit
bunx expo lint
bunx expo export --platform web   # valida as rotas
```

## Contas de demonstração (seed do backend)

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Aluno | `aluno.demo@caverna.com` | `seed-dev` |
| Professor | `mestre.semente@caverna.com` | `seed-dev` |
| Professora | `professora.semente@caverna.com` | `seed-dev` |

Também é possível criar um aluno pelo fluxo "Criar conta".

## Estrutura

- `src/app/` — rotas (Expo Router): `onboarding/`, `(private)/` (aluno),
  `professor/` (professor), `escolher-perfil.tsx`, `reset-password.tsx`.
- `src/api/services/` — chamadas HTTP (axios) espelhando o contrato do backend.
- `src/store/` — estado global (zustand, sessão persistida em AsyncStorage).
- `src/components/`, `src/styles/`, `src/utils/` — UI e utilitários.
- `docs/` e `.docs/` — documentação e artefatos de cada demanda.
