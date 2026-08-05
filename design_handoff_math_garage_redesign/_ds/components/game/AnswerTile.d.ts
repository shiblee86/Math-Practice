/**
 * Big tappable answer button used in quiz questions (numeric circle or wide option pill), with correct/wrong feedback state.
 * @startingPoint section="Game" subtitle="Quiz answer button with correct/wrong feedback" viewport="500x140"
 */
export interface AnswerTileProps {
  children: React.ReactNode;
  state?: 'default' | 'correct' | 'wrong';
  shape?: 'circle' | 'pill';
  disabled?: boolean;
  onClick?: () => void;
}
