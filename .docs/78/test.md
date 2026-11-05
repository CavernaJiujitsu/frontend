# Teste — Card #78: integrar a tela de login com a API de autenticação

Data: 2026-10-17/18 · Branch: `feat/78-integracao-login-api` · Backend local (porta 3000) + app web (porta 8081)

## Ambiente

| Item | Valor |
| --- | --- |
| Backend | `bun run start:local` (porta 3000, health 200) |
| Frontend | `bunx expo start --web --port 8081` (watch ativo; `CI=1` desliga o reload — não usar em testes) |
| `frontend/.env` | `EXPO_PUBLIC_API_URL=http://localhost:3000` (gitignored, não commitado) |
| Usuário de teste | `aluno.teste78@caverna.com` / `senha-forte-78` · practitioner `99882e18-bb22-4da3-8e2e-dd12ddebc78c` |
| Automação de UI | Chrome do sistema (`--headless=new`) via CDP + WebSocket nativo do Bun — **nenhuma dependência nova** no repo |

## 1. Checks do projeto

| Comando | Resultado |
| --- | --- |
| `bun run lint` | exit 0, sem avisos |
| `bunx tsc --noEmit` | exit 0, sem erros |
| `bunx expo-doctor` | 20/21 checks ok — a única falha é duplicata de `expo-constants` no `node_modules` (3 cópias da mesma versão 57.0.22), **pré-existente e não relacionada a este card** (nenhuma dependência mudou); sugestão: reinstalar deps quando conveniente |

## 2. Contrato da API (curl)

| Caso | Comando | Resultado |
| --- | --- | --- |
| Login 200 | `curl -X POST .../auth/login -d '{"email":"aluno.teste78@caverna.com","password":"senha-forte-78"}'` | `200` — envelope `{message, data:{accessToken, tokenType:"Bearer", expiresIn:7200, userId, practitionerId}, timestamp}` |
| Senha errada | idem com `password` errada | `401` — envelope legado `{"message":"E-mail ou senha inválidos", ...}` |
| Body inválido | `-d '{}'` | `400` |
| Normalização de e-mail | e-mail com espaços + maiúsculas | `200` (backend normaliza) |
| Home autenticada | `GET /api/v1/practitioners/<id>/home` com `Authorization: Bearer <token>` | `200` — practitioner "Aluno Teste 78" |
| CORS preflight | `OPTIONS` com `Origin: http://localhost:8081` | `204` + `Access-Control-Allow-Origin: http://localhost:8081` + `Access-Control-Expose-Headers: Retry-After` |
| Rate limit (5 falhas/15 min) | loop de logins com senha errada | na 6ª tentativa: `429` + `Retry-After: 60` (`X-RateLimit-Limit: 20`, `X-RateLimit-Remaining: 13`) |
| Bloqueio expira | mesmo login correto ~62s depois | `200` "Login realizado com sucesso" |

## 3. Matriz de UI (automação CDP no Chrome, app real)

Cenários e asserts automatizados contra a tela real rodando em web (sem mocks):

| # | Cenário | Asserts | Resultado |
| --- | --- | --- | --- |
| 1 | Validação local | campos vazios → "Informe seu e-mail." + "Informe sua senha."; e-mail "abc" → "E-mail inválido."; **0 POST /auth/login** | ✅ |
| 2 | Credenciais inválidas (401) | toast "Credenciais inválidas. Tente novamente."; exatamente 1 POST; status 401; permanece em `/onboarding/login`; botão volta a "Entrar" | ✅ |
| 3 | Sucesso (200) + duplo toque | vai para `/inicio`; **duplo toque gera exatamente 1 POST**; 200; home saúda "Olá, Aluno"; `GET /home` com header `Authorization: Bearer …`; sem card de erro | ✅ |
| 4 | Falha de rede + retry | offline: toast "Sem conexão. Verifique sua internet." e permanece no login; reconectado: retry navega para `/inicio` com novo POST 200 | ✅ |
| 5 | Bloqueio por tentativas (429) | toast "Muitas tentativas. Aguarde um pouco."; status 429 capturado; permanece no login | ✅ |
| 6 | Navegação "já tenho conta" | `/onboarding/start` "Já tenho conta" → login; `/onboarding/create-account` "Já tem conta? Entrar" → login; `/onboarding/login` "Criar conta" → `/onboarding/start` (pré-existente, sem regressão) | ✅ |

Totais: cenários 1–4 = **20/20 PASS** · cenário 5 = **4/4 PASS** · cenário 6 = **6/6 PASS**.

Evidência do duplo toque (cenário 3): `duplo toque → exatamente 1 POST /auth/login — {"novos":1}` (o segundo clique cai no botão desabilitado "Entrando..." ou a tela já navegou).

## 4. Bug encontrado e corrigido durante o teste

**Sintoma:** com credenciais válidas o submit não fazia nada — sem requisição, sem toast, sem navegação. Com e-mail inválido ou campos vazios os erros apareciam normalmente.

**Causa raiz (pré-existente do #77, exposta ao ligar o backend):** a regra do campo senha era
`rules={{ validate: (value) => value || "Informe sua senha." }}`. O react-hook-form interpreta **qualquer string retornada por `validate` como mensagem de erro**. Com a senha preenchida, `value` (a própria senha) virava o erro do campo: `errors.senha.message = "senha-forte-78"` — o formulário ficava inválido para sempre, `handleSubmit` chamava o `onInvalid` (inexistente) e o `handleLogin` nunca rodava. De quebra, o texto da senha era exibido como erro do campo em texto claro.

**Evidência (logs temporários via Metro):**
```
[dbg] validate senha "senha-forte-78"
[dbg] render LoginScreen isSubmitting= false errors= {"senha":{"type":"validate","message":"senha-forte-78", ...}}
```

**Correção (1 linha, em `src/app/onboarding/(login)/login.tsx`):**
```ts
validate: (value) => (value ? true : "Informe sua senha."),
```
Após a correção, os cenários 2–4 do item 3 passaram integralmente (antes: login válido impossível). A instrumentação de debug foi removida; o diff final é só essa linha.

## 5. Limitações e lacunas

- Teste exercitado **apenas na web** (Chrome via CDP). iOS/Android não foram abertos neste ciclo (o card roda o fluxo em web; nenhuma API nativa nova foi usada).
- Sessão em memória (Zustand): recarregar a página perde o login — risco aceito e registrado no plano.
- Sem guard de rotas privadas (`/inicio` acessível sem sessão) — fora de escopo, registrado no plano.
- Validação manual final fica com o solicitante (combinação da tarefa); servidores e `.env` continuam no lugar para isso.
- Rate limit: janela de 5 falhas ficou **limpa** ao final (bloqueio expirou e o contador reinicia após o bloqueio). Se testar muito com senha errada, o toast de "Muitas tentativas" pode aparecer — é o comportamento esperado.

## 6. Como reproduzir manualmente

```bash
# terminal 1 (backend)
cd ../backend && bun run start:local

# terminal 2 (frontend)
bunx expo start --web   # abrir http://localhost:8081/onboarding/login
# (frontend/.env precisa de EXPO_PUBLIC_API_URL=http://localhost:3000)
```

No navegador, em `/onboarding/login`:
1. Entrar vazio → erros de obrigatoriedade; e-mail "abc" → "E-mail inválido." (nenhuma requisição no Network).
2. `aluno.teste78@caverna.com` + senha errada → toast "Credenciais inválidas. Tente novamente."; permanece na tela; botão volta a "Entrar".
3. Senha correta `senha-forte-78` → "Entrando..." → `/inicio` com "Olá, Aluno"; no Network: 1 POST 200 e `GET …/home` com header `Authorization: Bearer …`.
4. Clicar "Entrar" duas vezes rápido → apenas 1 POST.
5. DevTools → Network → Offline → "Entrar" → toast "Sem conexão. Verifique sua internet."; religar → "Entrar" → `/inicio`.
6. Semanas de erro: 5 senhas erradas em 15 min → toast "Muitas tentativas. Aguarde um pouco." (bloqueio ~1 min).
7. Navegação: `start` "Já tenho conta" e `create-account` "Já tem conta? Entrar" levam para `/onboarding/login`.

## Conclusão do ciclo de teste

Fluxo do card validado ponta a ponta em web com backend real: validação, 401, sucesso até `/inicio`, duplo toque, rede/retry, 429 e navegações. O único defeito encontrado (validador de senha, pré-existente) foi corrigido e revalidado. Pendente: validação manual do solicitante e, depois, `$feature-review` + `pr-create`.
