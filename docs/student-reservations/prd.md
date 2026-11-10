# Reservas pessoais — ações da próxima aula

O aluno reserva pela agenda com seu practitionerId e JWT atual. No backend, o identificador informado deve pertencer ao próprio User; IDs de terceiros e conta de gestão sem perfil de aluno são recusados. Treino em unidades visitadas continua permitido; origem não restringe reserva.

Na home, reservas PENDING e IN_PROGRESS oferecem cancelamento. Durante o envio, o botão fica indisponível e mostra Aguarde…. O sucesso atualiza home/perfil, libera a vaga e mostra o estado vazio quando não há outra próxima aula. Falha preserva a reserva e permite nova tentativa.

CONFIRMED mostra Presença confirmada e a orientação de que o professor registrou a presença, sem ações de cancelar ou confirmar. O aluno não faz check-in: o endpoint exige o professor responsável, e a home não o invoca. O app preserva esse limite também após refetch/reabertura.

Contrato: POST /classes/:classId/enrollments com practitionerId; POST /classes/:classId/enrollments/:enrollmentId/cancel sem body. Bearer central; 401 sem autenticação, 403 por alvo não autorizado, 409 por estado/expiração/lotação/duplicidade. A interface não substitui a policy do servidor. Evidências e limites em .docs/98-student-reservation-actions/.
