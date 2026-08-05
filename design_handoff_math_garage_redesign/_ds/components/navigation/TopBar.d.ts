/**
 * App header bar: title, secondary actions (save/load), and the persistent star counter.
 * @startingPoint section="Navigation" subtitle="App header with title, actions, star counter" viewport="700x110"
 */
export interface TopBarProps {
  title: string;
  stars?: number;
  actions?: React.ReactNode;
}
