/**
 * Bottom tab bar for the app's three main sections (Home / Practice / Explore).
 * @startingPoint section="Navigation" subtitle="Bottom tab bar for main sections" viewport="700x100"
 */
export interface QuickNavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}
export interface QuickNavProps {
  items: QuickNavItem[];
  active?: string;
  onSelect?: (id: string) => void;
}
