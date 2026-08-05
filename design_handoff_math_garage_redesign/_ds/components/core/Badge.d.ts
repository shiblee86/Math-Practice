/**
 * Small pill label for status/type tags — level category, streak count, "PLAY" call-outs.
 * @startingPoint section="Core" subtitle="Status pill for tags, streaks, categories" viewport="600x100"
 */
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'accent' | 'reward' | 'success';
  icon?: React.ReactNode;
}
