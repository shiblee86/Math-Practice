/**
 * Score readout row shown above quiz questions: correct count, missed count, running accuracy.
 * @startingPoint section="Game" subtitle="Correct/wrong/accuracy score readout" viewport="600x110"
 */
export interface QuizStatRowProps {
  correct?: number;
  wrong?: number;
  accuracy?: number;
}
