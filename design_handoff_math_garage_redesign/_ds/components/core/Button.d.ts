/**
 * Primary action button. Chunky pressed-shadow style fits the game/racing tone; use for CTAs, quiz nav, menu actions.
 * @startingPoint section="Core" subtitle="Primary CTA button with pressed-shadow feedback" viewport="700x160"
 */
export interface ButtonProps {
  children: React.ReactNode;
  /** Visual style. primary = main CTA, accent = energetic/coral highlight, ghost = neutral surface, reward = amber for star/trophy actions. */
  variant?: 'primary' | 'accent' | 'ghost' | 'reward';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
