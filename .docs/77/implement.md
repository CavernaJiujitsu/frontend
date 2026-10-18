# Implementação — Card #77: tela de login de aluno

## O que foi implementado

### Rota e entrada

- Criada a rota pública `src/app/onboarding/(login)/login.tsx`, disponível em `/onboarding/login`.
- A ação “Já tenho conta” em `src/app/onboarding/(start)/start.tsx` deixou de exibir o `Alert` e de navegar para o onboarding provisório; agora abre a tela de login.
- O link “Criar conta” na nova tela usa `router.replace("/onboarding/start")`, conforme a decisão aprovada.

### Tela de login

- Cabeçalho com o asset compartilhado `localeIcon`, título e subtítulo previstos na referência.
- Campos reutilizando `FormField` para e-mail e senha.
- `react-hook-form` centraliza valores, validação, erros e o estado de submissão; os dois campos são conectados por `Controller`. E-mail usa teclado apropriado, sem capitalização e validação de obrigatoriedade/formato; senha valida obrigatoriedade.
- Ação à direita do campo de senha alterna a visibilidade da senha e possui rótulo de acessibilidade coerente com o estado.
- “Esqueci minha senha” mostra feedback global de funcionalidade pendente.
- “Entrar” apresenta erros no próprio campo quando inválido; quando válido, exibe brevemente o estado “Entrando...” e então o feedback de autenticação pendente, sem acessar API.
- Divisor “ou” e CTA “Criar conta” seguem a composição da referência.

### Estilos e acessibilidade

- Criado `src/styles/onboarding/login.styles.ts` com layout responsivo, compatível com teclado e telas baixas via `SafeAreaView`, `KeyboardAvoidingView` e `ScrollView`.
- Foram usados somente `BrandColors`, `Colors` e `Spacing`; não há cores avulsas na tela.
- Foram adicionados papéis e rótulos de acessibilidade aos controles interativos e aos campos.

## Arquivos alterados

| Arquivo | Alteração |
| --- | --- |
| `src/app/onboarding/(login)/login.tsx` | Novo screen público de login e sua lógica local. |
| `src/styles/onboarding/login.styles.ts` | Estilos da tela de login. |
| `src/app/onboarding/(start)/start.tsx` | Ação de login direcionada para a nova rota. |

## Decisões e desvios

- A referência trazia um ícone de olho, mas o projeto não possui um asset/component de ícones adequado. Foi implementado um SVG local e simples dentro do slot `rightAction` de `FormField`, evitando nova dependência para um único ícone e preservando a composição visual.
- Para tornar o estado de submissão observável apesar de não existir request, o botão permanece em “Entrando...” por 350 ms antes de abrir o feedback global. Esse atraso é exclusivamente visual e não representa autenticação.
- O Expo Router mantém os tipos de rota gerados em `.expo/types/router.d.ts`. Foi necessário iniciar brevemente o Metro offline para incluir a nova rota nos tipos antes do typecheck.
- Após a implementação inicial, a tela foi refatorada a pedido do usuário para usar `react-hook-form`; restou `useState` apenas para a preferência visual de mostrar/ocultar senha.

## Validação executada

| Comando | Resultado |
| --- | --- |
| `bun run lint` | Aprovado. |
| `bunx tsc --noEmit` | Aprovado. |

## Pendências

- Não há pendência de implementação no escopo do card.
- Integração com o backend, sessão e recuperação real de senha permanecem fora de escopo, para tarefas futuras.
