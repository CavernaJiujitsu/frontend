// Presentation models only; the backend contract is not defined yet.
export type PreviewScenario = 'ready' | 'loading' | 'error' | 'empty' | 'pending' | 'unvalidated' | 'missing';
export type MovementPreview = {
  trailStageMovementId: string;
  practitionerMovementId: string | null;
  name: string;
  status: 'VALIDATED' | 'COMPLETED' | 'PENDING';
  evidence: { id: string; teacher: string; className: string; caveUnit: string; validatedAt: string }[];
};
export type StagePreview = {
  id: string;
  name: string;
  description: string;
  color: string;
  state: 'completed' | 'current' | 'future';
  percentage: number;
  progressLabel: string;
  movements: MovementPreview[];
};
export type ProfilePreview = {
  name: string | null;
  email: string | null;
  belt: string | null;
  stats: { label: string; value: string | null }[];
};
