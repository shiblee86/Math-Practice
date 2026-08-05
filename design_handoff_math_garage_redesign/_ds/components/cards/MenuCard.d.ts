/**
 * Big tappable tile for top-level menu choices (Practice, Explore, etc). Compose with Badge for the call-to-action pill.
 * @startingPoint section="Cards" subtitle="Tappable menu tile with icon, title, badge" viewport="700x260"
 */
export interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  variant?: 'default' | 'accent' | 'reward';
  onClick?: () => void;
}
