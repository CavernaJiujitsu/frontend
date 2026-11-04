# PRD — Menu inferior (BottomNavbar) das rotas `(private)`

Status: **done**

## 1. Contexto

A área logada usa 4 rotas: Início, Trilha, Cavernas e Perfil. Antes, a navegação era
o `NativeTabs` (`expo-router/unstable-native-tabs`) com visual nativo e pouca
margem de customização. O produto pediu um menu inferior próprio, com bolinha
indicando a página ativa, e uma rota por item de menu.

## 2. Objetivos

- Um componente de menu inferior com bolinha na página ativa.
- Cada item do menu é uma rota real dentro de `(private)`.
- Após inscrever-se na aula com sucesso, o aluno cai no Início (com o menu visível).
- Layout de tela reutilizável (`ScreenLayout`) com slot `bottomNav`.

Não-objetivos: mudar o conteúdo das 4 telas, mudar o fluxo de onboarding, mexer no backend.

## 3. Rotas

| Item     | Rota        | Arquivo                                |
| -------- | ----------- | -------------------------------------- |
| Início   | `/inicio`   | `src/app/(private)/inicio/index.tsx`   |
| Trilha   | `/trilha`   | `src/app/(private)/trilha/index.tsx`   |
| Cavernas | `/cavernas` | `src/app/(private)/cavernas/index.tsx` |
| Perfil   | `/perfil`   | `src/app/(private)/perfil/index.tsx`   |

`(private)/index.tsx` é um `Redirect` para `/inicio` (compat com links antigos em `/(private)`).
`(private)/_layout.tsx` é um `Stack` sem header — o menu é renderizado por tela,
não pelo navigator.

## 4. Requisitos

### 4.1 `ScreenLayout` (`src/components/screen-layout/`)

- `SafeAreaView` com `edges={bottomNav ? ["top"] : ["top", "bottom"]}`: quando há
  navbar própria, ela cuida do inset inferior (via `useSafeAreaInsets`); senão a tela cuida.
- `StatusBar light-content` no fundo `BrandColors.background`.
- Props: `children`, `bottomNav?`, `contentStyle?`. Sem hex local (tokens apenas).

### 4.2 `BottomNavbar` (`src/components/bottom-navbar/`)

- Itens fixos na ordem: Início `/inicio`, Trilha `/trilha`, Cavernas `/cavernas`,
  Perfil `/perfil`.
- Ativo detectado por `usePathname() === href`; bolinha de 6px em
  `BrandColors.secondary` quando ativo (transparente quando inativo), label ativo em
  `Colors.light.text`, inativo em `Colors.light.textSecondary`.
- Troca de aba usa `router.replace(href)` (não empilha no histórico); toque na aba
  já ativa é ignorado.
- `Pressable` com `accessibilityRole="button"`, `accessibilityState={{ selected }}`,
  `hitSlop={10}`.
- `BOTTOM_NAVBAR_BASE_HEIGHT = 68` exportado para posicionar overlays (ex. `CheckinFab`).

### 4.3 Telas

- As 4 telas usam `<ScreenLayout bottomNav={<BottomNavbar />}>` em vez de
  `SafeAreaView` direto.
- `CheckinFab` continua no `(private)/_layout.tsx`, com `bottom = inset + 68 + 16`
  para flutuar acima do menu.

### 4.4 Redirect pós-inscrição

- `schedule.tsx` → `router.replace("/inicio")` após `enrollClass` com sucesso.

## 5. Regras para agentes

- Nova tela na área logada = nova subpasta em `(private)/<rota>/index.tsx` +
  entrada em `ITEMS` no `BottomNavbar` + linha na tabela de rotas deste PRD.
- Troca de aba: sempre `router.replace`, nunca `router.push`.
- Estilo do menu: só tokens de `@/constants/theme`; nenhum hex local.
- Comentários no código: sempre em inglês (textos de UI e mensagens de erro continuam em PT).

## 6. Critérios de aceite

- [x] As 4 abas navegam para as rotas da tabela, com bolinha ativa acompanhando.
- [x] Toque na aba ativa não faz nada (sem reload/empilhamento).
- [x] Inscrição com sucesso cai em `/inicio` com o menu visível.
- [x] `rg "NativeTabs" src/app/\(private\)` retorna zero.
- [x] `bunx tsc --noEmit` limpo.
- [x] `bunx expo lint` limpo.

## 7. Arquivos

- Criados: `components/screen-layout/*`, `components/bottom-navbar/*`,
  `app/(private)/{inicio,trilha,cavernas,perfil}/index.tsx`, `docs/bottom-menu/prd.md`.
- Alterados: `app/(private)/_layout.tsx`, `app/(private)/index.tsx` (redirect),
  `app/onboarding/(schedule)/schedule.tsx` (redirect pós-inscrição).
- Removidos: `app/(private)/{index,trilha,cavernas,perfil}.tsx` planos (movidos).

## Detalhe da trilha


A rota `/trilha/[stageId]` mantém a aba Trilha selecionada. Tocar Trilha no
menu retorna à raiz `/trilha` por replace; abrir o detalhe usa push. Ver
`docs/student-trail/prd.md` para o escopo demonstrativo e bloqueios de integração.
