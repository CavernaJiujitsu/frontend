# Plano — padronização visual do perfil do aluno

## Contexto

Demanda direta do usuário, com quatro capturas de referência para as áreas da tela de Perfil. A implementação atual está concentrada em `src/app/(private)/perfil/index.tsx`, utiliza `StudentPage`, `ScreenLayout` e `BottomNavbar` e já oferece edição de dados, busca e escolha de endereço e solicitação de recuperação de senha.

## Objetivo

Reorganizar a apresentação do perfil e de suas seções para seguir as referências visuais, mantendo a identidade do aplicativo e o menu inferior consistente com as outras abas.

## Requisitos funcionais

1. Preservar o resumo com foto, nome, faixa e indicadores de treino, inclusive estados indisponíveis.
2. Apresentar dados pessoais, certificados e configurações de forma clara e navegável em telas pequenas; campos e ações aparecem no contexto apropriado.
3. Manter edição de nome, e-mail e idade; busca, seleção e persistência de endereço; confirmação por e-mail e saída da sessão ao solicitar troca de senha.
4. Manter a informação honesta sobre certificados: não apresentar documentos como pertencentes ao aluno sem vínculo fornecido pela API.
5. Preservar loading, erro com nova tentativa, sessão ausente, sucesso e conteúdo vazio.

## Requisitos não funcionais e regras

- Usar tokens de `src/constants/theme.ts`, componentes compartilhados e linguagem visual de `.agents/skills/ui-style/SKILL.md`; não criar uma versão exclusiva do menu inferior.
- Respeitar área segura, rolagem, teclado, alvos de toque e acessibilidade em iOS, Android e web.
- Não alterar regras de negócio nem serviços HTTP; backend permanece fonte da verdade conforme `docs/api-contract/prd.md`, e o tratamento de erros segue `docs/backend-error-contract.md`.
- Preservar as quatro rotas do menu definidas em `docs/bottom-menu/prd.md`.

## Contrato de API consumido

Sem endpoints novos: reutilizar `getMyProfile`, `getMyTrainingHours`, `getPractitioner`, `updatePractitioner`, `searchAddresses` e `requestPasswordRecovery` exatamente como já utilizados. Se a implementação exigir mudança nos services, conferir previamente controllers e DTOs correspondentes no backend.

## Decisões de refinamento

| Tema | Proposta para aprovação |
| --- | --- |
| Escopo | Ajustar a tela de Perfil do aluno e os estados/seções mostrados nas quatro imagens, não outras abas. |
| Navegação | Após esclarecimento do usuário, manter `/perfil` como aba e criar páginas internas para dados, certificados e configurações. |
| Operações | Reorganizar a UI, sem alterar o comportamento de persistência, endereço ou recuperação de senha. |
| Ajuste posterior da referência de endereço | O usuário enviou uma referência específica: tela de endereço dedicada com mapa ilustrativo, campo de busca, opção de localização atual, resultados selecionáveis e confirmação fixa no rodapé. `/perfil/configuracoes` abre `/perfil/endereco`. |

## Fora de escopo

Novos endpoints, listagem personalizada de certificados sem contrato, mudança no perfil do professor, redesenho global das demais abas e alterações no backend.

## Critérios de aceite

1. O perfil carregado mostra identidade, graduação e indicadores sem truncamento ou sobreposição em largura de celular.
2. Cada página interna pode ser aberta a partir do perfil e voltar a ele; suas ações existentes continuam disponíveis e funcionais.
3. Busca de endereço não permite salvar antes de selecionar resultado; ao salvar, envia o endereço e as coordenadas selecionadas. A localização atual, quando autorizada, também pode ser escolhida e confirmada.
4. Alteração de dados produz a confirmação existente; solicitação de troca de senha encerra a sessão e encaminha à confirmação existente.
5. Estados de carregamento, erro, ausência de registro e sessão inválida continuam acessíveis.
6. Menu inferior e áreas seguras seguem o padrão das demais abas; lint e typecheck passam.

## Estratégia de teste

Atualizar os testes da tela em `__tests__/app/perfil-test.tsx` para os novos pontos de interação, executar testes de perfil, lint e typecheck, e conferir a composição visual em viewport móvel quando houver ambiente de execução. Registrar resultados e limites em `.docs/redesign-perfil-aluno/test.md`.

## Riscos e pendências

- As referências precisam ser confirmadas quanto ao escopo: este plano assume que as quatro imagens dizem respeito ao Perfil do aluno e às seções exibidas nele.
- A validação visual em dispositivo físico depende de ambiente/dispositivo disponível; testes automatizados não substituem essa conferência.
