# Blueprint — Card #77: tela de login de aluno

## Inventário e reuso

| Peça | Localização atual | Uso nesta entrega |
| --- | --- | --- |
| Navegação pública | `src/app/onboarding/(start)/start.tsx` | Trocar o redirecionamento/alerta provisório de “Já tenho conta” pela rota de login. |
| Rotas | `src/app/onboarding/(*)/*.tsx`, Expo Router | Criar rota pública `src/app/onboarding/(login)/login.tsx`, exposta como `/onboarding/login`. |
| Campos de formulário | `src/components/customized/form-field/form-field.tsx` | Reusar para e-mail e senha, incluindo erro, teclado de e-mail, `autoCapitalize="none"` e slot de ação à direita. |
| CTA compartilhado | `src/components/customized/default-button.tsx` | Reusar para “Entrar”, preservando altura, borda, estado pressionado e estado desabilitado. |
| Feedback global | `src/store/useErrorStore.ts` + `src/components/customized/error-toast/error-toast.tsx` | Acionar `show` com mensagem neutra para login e recuperação pendentes; nenhum alerta nativo novo. |
| Tokens | `src/constants/theme.ts` | Usar `BrandColors`, `Colors` e `Spacing` para todos os estilos. |
| Layout do onboarding | `globalStyles.screen`, `SafeAreaView`, `KeyboardAvoidingView`, `ScrollView` em `create-account.tsx` | Reaplicar a mesma estrutura para safe areas, teclado e rolagem, sem duplicar o inset global. |
| Imagem de localização | `assets/images/locale-icon.png`, exportada por `@/assets/images` | Reusar no topo como o ícone laranja do layout de referência. |
| Padrão de senha | `create-account.tsx` | Reusar a interação local de mostrar/ocultar, com rótulo acessível. A apresentação será um ícone/texto adequado à referência, sem dependência nova. |
| Estilos de onboarding | `src/styles/onboarding/*.styles.ts` | Criar `login.styles.ts` isolado para composição, evitando contaminar os estilos de criar conta. |
| Serviços/API | `src/api/services/`, `src/api/endpoints/routes.ts` | Não usar nem alterar: a tarefa não faz chamadas de rede. |
| Mocks | `src/api/mocks/` | Não criar mock: a tela não renderiza dados remotos nem simula payload de autenticação. |

## Alternativas avaliadas

| Decisão | Alternativas | Escolha e justificativa |
| --- | --- | --- |
| Local da rota | `src/app/login.tsx`; rota agrupada dentro de onboarding | `src/app/onboarding/(login)/login.tsx`: mantém o login público junto ao ponto de entrada que o invoca e preserva a URL sem o grupo. |
| Campos | Criar inputs locais; estender `FormField`; reusar `FormField` | Reusar `FormField` sem alterar sua API. Ele já cobre todos os requisitos de input e evita regressão na criação de conta. |
| Feedback pendente | `Alert`; componente novo; `ErrorToast` existente | Usar `useErrorStore`: atende ao componente de feedback existente solicitado no card e mantém uma experiência consistente. |
| Ícone de senha | Adicionar biblioteca de ícones; usar texto; usar símbolo Unicode | Usar controle local sem dependência. O desenho final aproveitará o slot `rightAction`; não se justifica biblioteca para um único ícone. |
| Estado de envio | Chamar API; omitir estado; estado local curto | Estado local curto: desabilita o CTA e mostra “Entrando...” antes de abrir o feedback. Sem request, token ou sessão. |
| Validação | React Hook Form/Zod; função local | `react-hook-form`: decisão posterior solicitada pelo usuário para centralizar valores, validação, erros e submissão da tela em vez de manter múltiplos estados locais. Não é necessário adicionar Zod enquanto não houver schema compartilhado ou contrato de API. |

## Desenho final

### Arquivos a criar

| Arquivo | Papel |
| --- | --- |
| `src/app/onboarding/(login)/login.tsx` | Tela e regra local: estado dos campos, validação, visibilidade de senha, feedback e navegação. |
| `src/styles/onboarding/login.styles.ts` | Estilos da composição responsiva de login, usando somente tokens do tema. |

### Arquivos a alterar

| Arquivo | Alteração |
| --- | --- |
| `src/app/onboarding/(start)/start.tsx` | `handleSignIn` removerá o `Alert` e navegará para `/onboarding/login`. |

### Rota e navegação

```text
/onboarding/start
  ├─ “Criar conta” → /onboarding/welcome (fluxo existente)
  └─ “Já tenho conta” → /onboarding/login
       └─ “Criar conta” → replace(/onboarding/start)
```

### Componentes e composição

1. `SafeAreaView` usa `globalStyles.screen`.
2. `KeyboardAvoidingView` e `ScrollView` mantêm o formulário acessível quando o teclado abre.
3. Cabeçalho centralizado usa `localeIcon`, título e subtítulo da referência.
4. Dois `FormField`s representam e-mail e senha. O campo de senha recebe `rightAction` em `Pressable` para mostrar/ocultar a senha.
5. O link “Esqueci minha senha” é um `Pressable` com mensagem de pendência no feedback global.
6. `DefaultButton` “Entrar” usa `BrandColors.secondary`; o rótulo alterna para “Entrando...” enquanto a ação local está em curso.
7. Um divisor visual “ou” e o `Pressable` “Criar conta” concluem a composição.

### Estados

| Estado | Comportamento visual/funcional |
| --- | --- |
| Inicial | Campos vazios, senha mascarada, CTA ativo e sem mensagens de erro. |
| Inválido | Após tocar em “Entrar”, cada regra inválida mostra erro no próprio `FormField` e borda de perigo. |
| Envio local | Com dados válidos, CTA fica indisponível por uma transição local curta e exibe “Entrando...”, evitando toque duplicado. |
| Pendente | Feedback global informa que a autenticação será conectada em tarefa separada; campos permanecem preenchidos. |
| Recuperação pendente | Feedback global informa que a recuperação de senha será disponibilizada em breve. |

### Validação

- E-mail: obrigatório e compatível com o padrão local `^[^\s@]+@[^\s@]+\.[^\s@]+$` já usado em criar conta.
- Senha: obrigatória. Não será aplicada política de comprimento/complexidade porque o card só exige obrigatoriedade e não há contrato de login nesta etapa.
- `react-hook-form` executa a validação no envio e revalida ao editar campos que já apresentaram erro.

### Contrato de API

Não existe nesta implementação. Não serão importados serviços, hooks, endpoints, tipos de request, nem feitas chamadas HTTP. A conexão ao backend #74 é uma evolução futura.

## Duplicidades evitadas

- Não haverá novo componente de input, botão, toast, tema, serviço de login, hook de request ou mock de autenticação.
- A validação não será extraída enquanto exclusiva desta tela e pequena; seu padrão será mantido coerente com `create-account.tsx`.
- O roteiro de login não altera a tela privada nem introduz estado global de sessão prematuro.

## Riscos e limites

- A referência é uma imagem, sem medidas do Figma; os tamanhos e espaçamentos serão aproximados pelos tokens existentes, preservando responsividade e acessibilidade.
- `ErrorToast` foi originalmente nomeado para erros; será usado apenas como feedback temporário e com texto neutro, conforme decisão aprovada.
- A duração do estado “Entrando...” será exclusivamente visual. Não representará autenticação real nem poderá ser interpretada como login concluído.
