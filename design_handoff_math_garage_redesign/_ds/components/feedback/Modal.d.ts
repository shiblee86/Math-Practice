/**
 * Full-screen overlay card for milestones, trophies, and achievement callouts.
 * @startingPoint section="Feedback" subtitle="Achievement/milestone overlay" viewport="700x300"
 */
export interface ModalProps {
  open: boolean;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onClose?: () => void;
}
