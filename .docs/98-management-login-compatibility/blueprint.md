# Blueprint de compatibilidade

Reuso: auth.service espelha DTO de login; startSession é ponto único usado pelo login e cadastro; ambas as telas já capturam Error e exibem sua mensagem. QueryClient/AppStore e helpers de sessão existentes são preservados.

Tornar practitionerId opcional em LoginResponse, como no backend. startSession exige identificador não vazio antes de limpar cache ou trocar identidade; se ausente, lança StudentProfileRequiredError com orientação PT-BR sobre conta sem perfil de aluno e acesso pela gestão. Nenhuma tela nova, redirect arbitrário ou URL de gestão inferida. Contrato do aluno e app privado permanecem tipados com practitionerId real.

Na validação real foi observado que reportError transforma Error local em mensagem genérica. O login trata somente esse erro tipado e usa o toast existente com a orientação conhecida; demais falhas preservam o normalizador atual. O cadastro já exibe a mensagem por backendMessage. Não ampliar a exibição de mensagens arbitrárias do servidor.

Testar no Chromium contra API real com conta docente sem practitioner e aluno sintético; verificar permanência no login e entrada posterior do aluno. Complementar com verificação do helper/cache, lint, tsc e export web. Seguir com revisão e registro de evidências antes da publicação.
