// Teller dialogue dictionary. Each context has several variations —
// pickTellerLine picks one randomly each time it's called.
export type TellerContext =
  | 'idle'
  | 'addIncome'
  | 'editIncome'
  | 'deleteIncome'
  | 'emptyPeriod'
  | 'periodChanged'

const DIALOGUES: Record<TellerContext, string[]> = {
  idle: [
    'Welcome back! Anything to record today?',
    'Hello! Which month would you like to review?'
  ],
  addIncome: [
    'How much income for this month?',
    "Alright, let's log a new entry. Where does it come from?",
    'Ready — fill in the amount and source.'
  ],
  editIncome: [
    'What should this entry be changed to?',
    "Okay, let's update the record.",
    'Which part needs correcting?'
  ],
  deleteIncome: [
    'Sure you want to delete this entry?',
    'This record will be permanently removed.',
    'Got it, removing that entry.'
  ],
  emptyPeriod: [
    'No entries yet this month. Want to add one?',
    'This page is still empty.',
    'No income recorded for this period.'
  ],
  periodChanged: [
    "Here's your record for this period.",
    "Let's take a look at this page.",
    'Page turned — here are the entries.'
  ]
}

export function pickTellerLine(context: TellerContext): string {
  const options = DIALOGUES[context]
  return options[Math.floor(Math.random() * options.length)]
}
