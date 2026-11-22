# Blueprint — padronização visual do perfil do aluno

## Inventário e reuso

| Peça existente | Onde | Uso |
| --- | --- | --- |
| Tela, consultas, mutações e estados | `src/app/(private)/perfil/index.tsx` | Preservar a lógica e reorganizar apenas a apresentação. Há alterações locais preexistentes neste arquivo: não sobrescrever mudanças não relacionadas. |
| Cabeçalho, rolagem, área segura e menu | `src/components/student-preview/preview-kit.tsx`, `src/components/screen-layout/`, `src/components/bottom-navbar/` | Reutilizar sem criar variantes exclusivas do perfil. |
| Foto e ações de arquivo | `src/components/profile-photo.tsx` | Reutilizar; nenhuma mudança no fluxo de upload. |
| Botões, tokens e estilos | `src/components/customized/default-button/`, `src/constants/theme.ts`, `src/styles/private/student-preview.styles.ts`, `src/styles/private/profile-address.styles.ts` | Reaproveitar botões e tokens; isolar os estilos da nova composição em `src/styles/private/profile.styles.ts` se necessário. |
| Testes | `__tests__/app/perfil-test.tsx` | Atualizar seletores de interação e preservar casos de erro, endereço, edição e senha. |
| Services | `src/api/services/{profile,practitioners,password-recovery}.service.ts` | Somente consumo existente; não modificar contratos. |

## Alternativas

1. **Criar páginas internas sob `/perfil`:** o usuário esclareceu que deseja páginas novas no frontend. Escolhida, preservando `/perfil` como aba principal e mantendo o menu inferior.
2. **Manter as seções expansíveis na mesma tela:** inicialmente proposto, mas não atende ao esclarecimento sobre páginas novas.
3. **Modificar estilos globais `studentStyles`:** afetaria trilha e outras telas. Evitar; criar estilos locais de perfil.

## Desenho proposto

- `src/app/(private)/perfil/index.tsx`, `[section].tsx` e `endereco.tsx`: rotas do perfil principal e das páginas internas (dados, certificados, configurações e endereço).
- `src/features/profile/profile-screen.tsx`: manter queries/mutações e exibir somente a seção da rota atual; navegação acessível entre as páginas.
- `src/features/profile/profile-address-screen.tsx`: busca e escolha do endereço em tela dedicada, ação de localização atual com permissão, confirmação fixa abaixo da rolagem, sem alterar o payload de `updatePractitioner`.
- `src/styles/private/profile.styles.ts` (novo): estilos da composição, cartões, indicadores, linhas de seção, campos e agrupamentos; somente tokens existentes.
- `src/styles/private/profile-address.styles.ts`: layout móvel conforme a referência de endereço, mapa ilustrativo em views, cartões selecionáveis e rodapé fixo.
- `__tests__/app/perfil-test.tsx`: cenários para estado inicial, navegação, alteração de dados, endereço selecionado, recuperação e ausência de conteúdo.
- `.docs/redesign-perfil-aluno/{implement,test}.md`: registrar execução e limites.

## Contrato e estados

Sem serviços novos nem alterações em DTOs. Novas rotas internas `/perfil/dados`, `/perfil/certificados`, `/perfil/configuracoes` e `/perfil/endereco`. Loading, falha com retry, sessão ausente e sucesso continuam disponíveis. Certificados continuam apenas informativos enquanto não há listagem vinculada. Endereço só pode ser salvo após seleção explícita ou consentimento para localização atual. Link de senha preserva a saída da sessão.

## Duplicidades evitadas e limites

- Sem novo menu inferior, novo botão genérico ou lógica de formulário duplicada.
- Não misturar ajustes no perfil do professor, na trilha ou nos services já modificados localmente.
- Validar em teste automatizado e, se houver ambiente executável, na interface móvel; registrar qualquer limitação de conferência visual.
