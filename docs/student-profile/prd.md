# Perfil do aluno — card #82

Status: **interface demonstrativa implementada; integração bloqueada**.

## Escopo aprovado

O usuário pediu somente telas e documentação dos bloqueios, deixando APIs/contratos para depois. Não há integração parcial nem nova chamada de rede nesta entrega; #82 não está concluído como integração.

## Página /perfil

Cabeçalho fixo, avatar, nome, graduação e indicadores Horas/Aulas/Sequência seguindo o frame Figma 20:131 e o padrão visual local. Accordions de dados do perfil, certificados e configurações. Edição, certificados e configurações exibem disponibilidade futura; nenhuma ação simula salvamento.
Dados fictícios isolados em src/api/mocks/student-preview.ts; banner de demonstração visível. Cenários: exemplo completo, dados incompletos, vazio, loading e erro com retorno ao exemplo. Indicadores ausentes usam travessão e texto explicativo, nunca zero inventado. Nome/e-mail/graduação ausentes têm rótulos explícitos.

## Bloqueios

A origin/dev do backend consultada oferece GET /api/v1/practitioners/:id com usuário vinculado, mas não DTO/endpoint de estatísticas/graduação de perfil. GET básico não responde pelos indicadores. Login do frontend ainda demonstrativo, sem sessão autenticada no apiClient; practitionerId do onboarding não é prova de autenticação.

## Contrato a definir antes de integrar

| Necessidade       | Decisão pendente                                                       |
| ----------------- | ---------------------------------------------------------------------- |
| Identidade        | Derivação do aluno autenticado, autorização e isolamento do cache      |
| Dados pessoais    | Nome, e-mail, avatar opcional, campos ausentes e permissões de leitura |
| Graduação         | Faixa aprovada versus declaração pendente; ausência de faixa ativa     |
| Horas             | Unidade, arredondamento, período e quais presenças contam              |
| Aulas             | Presença confirmada versus inscrição; período e cancelamentos          |
| Sequência         | Significado, unidade, janela de tempo, fuso e regra de interrupção     |
| Indisponibilidade | Diferenciar zero real de indicador não calculável/null                 |
| Resposta          | DTO, rota, envelope, erros e comportamento de perfil inexistente       |

Os tipos de preview são modelos locais de apresentação, não proposta vinculante de contrato. Evitar adaptar o backend aos mocks: frontend deve mapear o contrato real após sua definição.

## Integração posterior


 envelope, erros e comportamento de perfil inexistente |

Os tipos de preview são modelos locais de apresentação, não proposta vinculante de contrato. Evitar adaptar o backend aos mocks: frontend deve mapear o contrato real após sua definição.

## Integração posterior

- [ ] Conferir controller/DTO, documentar contrato final e reutilizar getPractitioner se adequado.
- [ ] Habilitar consulta somente com sessão real, com cache por usuário e remoção na troca/logout.
- [ ] Retirar fixture e seletor de cenários sem fallback silencioso em falha.
- [ ] Cobrir carregamento inicial, erro/retry, ausência parcial, zero real e conta sem indicadores.
- [ ] Atualizar perfil após alterações e presença/aprovação quando houver suporte.
- [ ] Manter certificados e configurações fora até definição própria de APIs/regras.

Referência: <https://trello.com/c/09LfQajC>.
