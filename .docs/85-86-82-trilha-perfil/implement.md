# Implementação

Branch: feat/85-86-82-trilha-perfil. Base: origin/dev. Escopo refinado pelo usuário: apenas telas, sem integração.

- /trilha: sequência de faixas do fixture, estado atual destacado, progresso e abertura do detalhe.
- /trilha/[stageId]: resolução por ID, retorno, item desconhecido, movimentos repetidos com identidade própria, VALIDATED/COMPLETED/PENDING e evidência ilustrativa.
- /perfil: dados demonstrativos isolados, avatar local do Figma, indicadores, accordions e cenários incompletos.
- Componentes compartilhados: StudentPage, PreviewControls, PreviewFeedback e Progress; estilos/tokens locais.
- Menu reconhece subrota da trilha; link do início usa replace por ser troca de aba.
- PRDs de perfil/trilha registram bloqueios e checklist para API, contratos, autenticação, agregação e cache.

Nenhuma dependência adicionada, API inventada, dado persistido ou arquivo de backend alterado. Tipos são modelos de apresentação e não DTOs acordados. Certificados/configurações/edição continuam futuros. Mantido o menu padrão do projeto em vez de recriar o componente do Figma.

Desvios visuais deliberados: banner/seletor de demonstração, cabeçalhos padrão e texto quebrável, sem cadeado de desbloqueio futuro e sem alegação de currículo homologado. Detalhe usa padrão local por indisponibilidade da consulta Figma (quota Starter). Revisão pixel a pixel não concluída devido a timeout das capturas do navegador.
