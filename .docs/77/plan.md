# Plano — Card #77: tela de login de aluno

## Contexto

O card Trello [#77 — FE Criar tela de login de aluno](https://trello.com/c/d5M26cZI/77-fe-criar-tela-de-login-de-aluno) pede a interface de login de aluno conforme a referência visual fornecida. A autenticação real pertence ao card acoplado #74 e não será integrada nesta demanda.

Hoje, `src/app/onboarding/(start)/start.tsx` apresenta a entrada do onboarding e ainda direciona a ação de login para um fluxo provisório. A tela de criação de conta já usa `FormField`, `DefaultButton`, os tokens de `@/constants/theme` e o roteamento por Expo Router.

## Objetivo

Criar uma tela mobile responsiva de login de aluno, acessível a partir da ação “Já tenho conta” da entrada do onboarding, com validação local, feedback explícito de autenticação pendente e retorno seguro ao fluxo de criação de conta.

## Requisitos funcionais

1. Disponibilizar uma rota de login fora das rotas privadas, acessível pela ação “Já tenho conta” em `/onboarding/start`.
2. Exibir, conforme a referência visual: ícone de localização, título “Bem-vindo de volta”, subtítulo, campos de e-mail e senha, alternância de visibilidade da senha, link “Esqueci minha senha”, botão “Entrar”, divisor “ou” e link “Criar conta”.
3. Validar no toque em “Entrar” que e-mail e senha são obrigatórios e que o e-mail possui formato válido; exibir as mensagens junto aos respectivos campos.
4. Com formulário válido, não chamar API nem alterar sessão: usar o componente de feedback existente para informar que a autenticação será conectada em tarefa separada.
5. “Esqueci minha senha” exibirá o mesmo feedback de indisponibilidade/pendência, sem navegar nem chamar API.
6. “Criar conta” retornará para `/onboarding/start`, de onde o usuário segue o fluxo existente de criação de conta.
7. Durante a interação de envio, impedir duplo toque e comunicar o estado visual no botão; a ação permanece local e breve, pois não haverá request assíncrona.

## Requisitos não funcionais

- Manter compatibilidade iOS, Android e Web com Expo SDK 57 e Expo Router.
- Usar `SafeAreaView`, `KeyboardAvoidingView` e rolagem para que campos e ações permaneçam utilizáveis com teclado e em telas pequenas.
- Usar somente tokens de `@/constants/theme`, sem cores avulsas.
- Reutilizar `FormField` e `DefaultButton`; a tela manterá estado, validação e navegação, sem mover regra de negócio aos componentes presentacionais.
- Garantir rótulos de acessibilidade para campos, botão, alternância de senha e links.
- Textos visíveis em PT-BR e comentários de código, se necessários, em inglês.

## Regras de negócio e referências internas

- Não há contrato de API consumido: o card veda chamadas ao backend nesta etapa. Portanto, os DTOs/controllers de autenticação não serão usados nem alterados.
- `FormField` é o componente compartilhado para rótulo, input, erro e ação à direita, conforme `docs/form-field/prd.md`.
- O componente de feedback global disponível é `ErrorToast`, acionado por `useErrorStore.getState().show(...)`; para esta tela ele comunicará uma limitação temporária do fluxo, sem simular sucesso de login.
- A navegação deve usar Expo Router. Como a tela ainda não terá sessão, ela permanecerá fora de `(private)`.
- A linguagem visual seguirá `ui-style`: fundo escuro, superfície primária em campos, destaque laranja em CTA, bordas e tipografia pelos tokens existentes.

## Contrato de API consumido

Nenhum. A integração com o endpoint de login e o tratamento do contrato de erro v1 são fora de escopo e serão tratados pela tarefa de backend/acoplada #74.

## Decisões de refinamento

| Tema | Decisão |
| --- | --- |
| Referência visual | A imagem enviada pelo solicitante é a fonte de composição da tela, adaptada responsivamente aos componentes e tokens existentes. |
| Recuperação de senha | “Esqueci minha senha” mostra feedback de funcionalidade pendente; não há rota, API ou reset nesta entrega. |
| Criar conta | Retorna para `/onboarding/start`, entrada do onboarding já existente. |
| Envio válido | Exibe feedback de autenticação pendente, sem request ao backend. |
| Envio inválido | Valida ao toque em “Entrar” e apresenta erros por campo. |
| Visibilidade da senha | Botão acessível no campo alterna entre máscara e texto visível. |

## Fora de escopo

- Integração com endpoint, token, sessão, armazenamento de credenciais ou área autenticada.
- Criação de conta, recuperação/redefinição de senha ou autenticação social.
- Alterações no backend, contrato de erro ou serviços de API.
- Mudanças não necessárias nas telas privadas e no design system compartilhado.

## Critérios de aceite

1. A ação “Já tenho conta” na tela inicial abre a tela de login, sem alertas ou redirecionamento provisório.
2. A tela reproduz a hierarquia da referência em largura mobile e mantém conteúdo acessível/rolável em alturas reduzidas e com teclado aberto.
3. E-mail vazio, senha vazia e e-mail inválido exibem mensagens de validação junto aos campos após tocar em “Entrar”.
4. A alternância de senha mostra e oculta o valor e possui rótulo acessível coerente com o estado.
5. Com e-mail e senha válidos, “Entrar” não gera nenhuma chamada de rede e exibe o feedback de autenticação pendente.
6. “Esqueci minha senha” não navega nem chama API e exibe o feedback de funcionalidade pendente.
7. “Criar conta” usa `router.replace` para retornar a `/onboarding/start`.
8. Não há cores hardcoded na tela; `FormField`, `DefaultButton` e os tokens compartilhados são reutilizados.
9. `bunx expo lint` e `bunx tsc --noEmit` terminam sem erros.

## Estratégia de teste

- Executar lint e verificação de tipos.
- Exercitar no app: abertura da tela pelo onboarding, preenchimento inválido, e-mail válido/senha preenchida, alternância de senha, feedback de login, feedback de recuperação e retorno para onboarding.
- Verificar no monitor de rede/logs que nenhuma chamada HTTP é disparada por “Entrar” ou “Esqueci minha senha”.
- Conferir visualmente a composição em viewport mobile e, quando disponível, em iOS/Android/Web.

## Riscos e pendências

- A imagem de referência não inclui especificações de dimensões/tipografia nem um arquivo Figma; os valores serão derivados dos tokens e padrões do projeto, priorizando fidelidade visual sem criar estilos isolados.
- O `ErrorToast` tem nomenclatura visual de erro, embora seja o componente de feedback global existente. A implementação usará uma mensagem neutra de funcionalidade pendente e não tratará isso como falha de API.
