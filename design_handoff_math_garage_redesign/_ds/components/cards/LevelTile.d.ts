/**
 * Grid tile representing one level: icon, label, earned stars, or locked state.
 * @startingPoint section="Cards" subtitle="Level-select grid tile with stars/locked state" viewport="500x160"
 */
export interface LevelTileProps {
  icon: React.ReactNode;
  label: string;
  stars?: number;
  locked?: boolean;
  variant?: 'primary' | 'accent';
  onClick?: () => void;
}
