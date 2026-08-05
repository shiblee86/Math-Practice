/**
 * Square icon-plus-label button for quiz side controls (Home, Hint, Sound, Retry, Next).
 * @startingPoint section="Core" subtitle="Icon + label square button for quiz controls" viewport="500x120"
 */
export interface IconButtonProps {
  icon: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'accent' | 'neutral' | 'success';
  disabled?: boolean;
  onClick?: () => void;
}
