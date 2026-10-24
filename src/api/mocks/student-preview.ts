import { BeltColors } from '@/constants/theme';
import type { ProfilePreview, StagePreview } from '@/types/student-preview';

// Illustrative curriculum only. IDs identify catalogue slots, not technique names.
export const trailPreview: StagePreview[] = [
  { id: 'white', name: 'Faixa Branca', description: 'Fundamentos e primeiros passos.', color: BeltColors.white, state: 'completed', percentage: 100, progressLabel: 'Etapa concluída no exemplo', movements: [] },
  { id: 'yellow', name: 'Faixa Amarela', description: 'Técnicas básicas e maior controle.', color: BeltColors.yellow, state: 'completed', percentage: 100, progressLabel: 'Etapa concluída no exemplo', movements: [] },
  { id: 'orange', name: 'Faixa Laranja', description: 'Combinações e resistência.', color: BeltColors.orange, state: 'completed', percentage: 100, progressLabel: 'Etapa concluída no exemplo', movements: [] },
  { id: 'green', name: 'Faixa Verde', description: 'Estratégia e consistência.', color: BeltColors.green, state: 'completed', percentage: 100, progressLabel: 'Etapa concluída no exemplo', movements: [] },
  { id: 'blue', name: 'Faixa Azul', description: 'Técnicas avançadas e aplicação em situações reais.', color: BeltColors.blue, state: 'current', percentage: 30, progressLabel: '3 / 10 checkpoints · exemplo', movements: [
    { trailStageMovementId: 'blue-guard-1', practitionerMovementId: 'progress-1', name: 'Passagem de guarda', status: 'VALIDATED', evidence: [{ id: 'evidence-1', teacher: 'Rafael Souza (exemplo)', className: 'Treino técnico · exemplo', caveUnit: 'Caverna BJJ — Matriz (exemplo)', validatedAt: '2026-10-21T22:00:00Z' }] },
    { trailStageMovementId: 'blue-escape-2', practitionerMovementId: 'progress-2', name: 'Saída de montada', status: 'COMPLETED', evidence: [] },
    { trailStageMovementId: 'blue-guard-3', practitionerMovementId: null, name: 'Passagem de guarda', status: 'PENDING', evidence: [] },
  ] },
  { id: 'purple', name: 'Faixa Roxa', description: 'Domínio técnico e mental.', color: BeltColors.purple, state: 'future', percentage: 0, progressLabel: 'Etapa futura', movements: [] },
  { id: 'brown', name: 'Faixa Marrom', description: 'Liderança, ensino e performance.', color: BeltColors.brown, state: 'future', percentage: 0, progressLabel: 'Etapa futura', movements: [] },
  { id: 'black', name: 'Faixa Preta', description: 'Excelência, exemplo e legado.', color: BeltColors.black, state: 'future', percentage: 0, progressLabel: 'Etapa futura', movements: [] },
];

export const profilePreview: ProfilePreview = {
  name: 'Aluno de demonstração', email: 'aluno@example.com', belt: 'Faixa Azul',
  stats: [{ label: 'Horas', value: '48h' }, { label: 'Aulas', value: '22' }, { label: 'Sequência', value: '6' }],
};
