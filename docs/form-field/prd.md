# PRD — Extrair `Field` para `FormField` compartilhado

Status: **done**

## 1. Contexto

A tela `src/app/onboarding/(create-account)/create-account.tsx` definia um `Field` local (label + `TextInput` + erro + `rightAction`) usado 3x (nome, e-mail, senha). Componente de formulário genérico preso à tela viola o padrão `ui-style`: inputs compartilhados vivem em `src/components/customized/` (como `DefaultButton` e `SearchInput`), são presentacionais (dumb) e usam tokens de `@/constants/theme`.

## 2. Problema

- Duplicação futura: login e outros formulários precisariam copiar o `Field`.
- Estilo acoplado: `fieldGroup, fieldLabel, inputWrap, input, fieldError` moravam em `src/styles/onboarding/create-account.styles.ts`.
- Hex hardcoded: `const danger = "#FF6B6B"` na tela, contra a regra "sem hex one-off".

## 3. Objetivos

- Criar `FormField` reutilizável em `@/components/customized/form-field/form-field`.
- Preservar o visual atual da tela de criar conta (sem regressão).
- Centralizar a cor de erro nos tokens do tema.
- Enxugar a tela para só regra de negócio (estado, validação, submit, `rightAction` Mostrar/Ocultar).

Não-objetivos: validação dentro do componente, máscaras, `width` com layout de página, mudar copy/acessibilidade da tela.

## 4. Requisitos

### 4.1 Componente `FormField`

Local: `src/components/customized/form-field/form-field.tsx`

Props:

| Prop                 | Tipo                                                | Default                | Regra                                                                     |
| -------------------- | --------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `label`              | `string`                                            | —                      | Obrigatório, exibido acima do input                                       |
| `value`              | `string`                                            | —                      | Estado pertence à tela                                                    |
| `onChangeText`       | `(text: string) => void`                            | —                      | Obrigatório                                                               |
| `placeholder`        | `string?`                                           | —                      | Opcional                                                                  |
| `error`              | `string?`                                           | —                      | Quando presente: borda de erro + texto abaixo                             |
| `secureTextEntry`    | `boolean?`                                          | —                      | Repassado ao `TextInput`                                                  |
| `keyboardType`       | `KeyboardTypeOptions?`                              | `"default"`            | Repassado                                                                 |
| `autoCapitalize`     | `"none" \| "sentences" \| "words" \| "characters"?` | `"sentences"`          | Repassado                                                                 |
| `rightAction`        | `React.ReactNode?`                                  | —                      | Slot à direita (ex. Mostrar/Ocultar senha)                                |
| `width`              | `number \| "full" \| "half"?`                       | `"full"`               | Convenção `SearchInput`: `full` = 100%, `half` = 50%, número clamp 10–100 |
| `editable`           | `boolean?`                                          | `true`                 | Repassado                                                                 |
| `testID`             | `string?`                                           | —                      | No wrapper                                                                |
| `accessibilityLabel` | `string?`                                           | `placeholder ?? label` | No `TextInput`                                                            |

Comportamento: dumb, sem estado interno; `placeholderTextColor = Colors.light.textSecondary`.

### 4.2 Estilos

Local: `src/components/customized/form-field/styles/form-field.styles.ts`

- `group, label, inputWrap, inputWrapError, input, error` movidos da tela, valores preservados (`minHeight 56`, `radius 8`, `borderWidth 1.5`).
- Tokens apenas: `Colors.light.*`, `BrandColors.border`, `BrandColors.danger`, `Spacing.*`. Nenhum hex local.

### 4.3 Tema

`src/constants/theme.ts`: adicionar `BrandColors.danger = "#FF6B6B"`.

### 4.4 Tela criar-conta

- `create-account.tsx`: importar `FormField`, trocar 3x `<Field>` por `<FormField>`, deletar `FieldProps` + `Field` local, remover imports `TextInput`/`Colors` não mais usados. `rightAction` (Pressable Mostrar/Ocultar) e `eyeToggle` permanecem na tela.
- `create-account.styles.ts`: remover `fieldGroup, fieldLabel, inputWrap, inputWrapError, input, fieldError` e `const danger`; `submitError` passa a usar `BrandColors.danger`.

## 5. Critérios de aceite

- [x] Nenhum `function Field` local restante em `create-account.tsx`.
- [x] Tela renderiza nome/e-mail/senha com mesmo visual (label 12/600, input 56px, erro abaixo).
- [x] Erro de validação troca `borderColor` para `danger` e exibe mensagem.
- [x] `grep "#FF6B6B"` retorna só `theme.ts`.
- [x] `npx expo lint` limpo.
- [x] `npx tsc --noEmit` limpo.

## 6. Arquivos

- Criados: `form-field.tsx`, `styles/form-field.styles.ts`.
- Alterados: `src/constants/theme.ts`, `src/app/onboarding/(create-account)/create-account.tsx`, `src/styles/onboarding/create-account.styles.ts`.
- Doc: este PRD.

## 7. Regras para agentes

- Comentários no código: sempre em inglês (textos de UI e mensagens de erro continuam em PT).
- Estilo: só tokens de `@/constants/theme`; nenhum hex local fora do tema.
