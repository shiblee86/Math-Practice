/**
 * Rounded progress track used for quiz progress and level-completion charts.
 * @startingPoint section="Core" subtitle="Progress track for quiz/level completion" viewport="600x80"
 */
export interface ProgressBarProps {
  value?: number;
  max?: number;
  variant?: 'primary' | 'reward' | 'success';
  height?: number;
}
