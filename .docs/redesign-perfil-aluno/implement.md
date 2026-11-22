# Implementação — perfil do aluno

## Entrega

- `src/app/(private)/perfil/index.tsx`: entrada da aba Perfil.
- `src/app/(private)/perfil/[section].tsx`: páginas internas de dados, certificados e configurações; caminho inválido retorna ao perfil.
- `src/features/profile/profile-screen.tsx`: preserva consultas e mutações que já existiam no perfil e separa a apresentação do resumo e das três páginas internas. Ações de atualização, endereço, senha, foto, saída e troca de modo não mudaram de contrato.
- `src/styles/private/profile.styles.ts`: composição móvel usando tokens do app; menu inferior e área segura continuam compartilhados.
- `src/app/(private)/perfil/endereco.tsx`, `src/features/profile/profile-address-screen.tsx` e `src/styles/private/profile-address.styles.ts`: tela de endereço conforme referência posterior, acessada pelas configurações; mapa ilustrativo, busca com ação no ícone ou teclado, opção de localização atual com permissão, cartões de resultado e botão de confirmação fixo. A seleção continua enviando endereço e coordenadas ao endpoint existente.
- `__tests__/app/perfil-test.tsx`: ajustado para navegar e acessar as páginas internas; inclui cobertura da página informativa de certificados.

## Decisões e desvio

O usuário esclareceu após aprovar o plano que queria **páginas novas no frontend**, não somente trocar os acordeões da tela inicial. Por isso as seções foram movidas para rotas internas. Depois, enviou uma referência própria para endereço: as configurações passaram a abrir uma tela dedicada. A rota `/perfil` e seus serviços permanecem. Não foram criados endpoints nem dependências; a localização atual utiliza o módulo `expo-location` já instalado.

O arquivo original do perfil já tinha modificações locais; a lógica de consulta, edição, seleção de endereço e recuperação de senha foi transferida sem reverter as alterações de outras partes do projeto.

## Validação e limites

Lint e typecheck executados. Resultado dos testes e eventuais limites de execução visual são registrados em `test.md`.
