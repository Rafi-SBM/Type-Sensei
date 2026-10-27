import type { QuoteLength } from "@/types";

/**
 * Original prose used by quote mode. Grouped by length so the mode can offer a
 * short sprint or a longer endurance run. Every passage is punctuated normally,
 * which is the point of the mode: practising shift keys and commas in context.
 */
export const passages: Record<QuoteLength, readonly string[]> = {
  short: [
    "Speed is a by-product of accuracy. Chase the clean keystroke and the numbers follow on their own.",
    "The hands learn faster than the mind admits. Give them the same motion a hundred times and they stop asking for permission.",
    "Look at the word, not at the keyboard. Trust the map your fingers have already drawn.",
    "A single careful minute teaches more than an hour of frantic correction.",
    "Rhythm beats force. Even pressure, even timing, and the page fills itself.",
    "Errors are not failures. They are the only honest map of where the practice should go next.",
    "Begin slowly enough that every letter lands where you meant it to.",
    "The keyboard rewards patience in a way almost nothing else does.",
    "Consistency is the quiet skill. Anyone can be fast once by accident.",
    "Stop watching the timer. The work goes better when nobody is counting.",
  ],
  medium: [
    "Typing well is less about moving quickly than about moving predictably. A steady hand covers the same distance as a frantic one, but it arrives without the small corrections that eat away at every measurement. Pick a pace you can hold for a full minute, then hold it twice as long.",
    "There is a threshold in practice where conscious thought becomes a liability. Until you reach it, naming each letter helps. After it, naming anything at all slows the hands down. The trick is noticing which side of that line you are standing on today.",
    "Accuracy and speed are not opponents. They look like opponents for the first few weeks, while the fingers are still negotiating, and then one morning they turn out to have been the same project all along. The careful typist simply stops making the mistakes that used to require fixing.",
    "Good practice is boring in a specific way. It repeats the motion that is almost right until it is entirely right, and it resists the temptation to move on to something more interesting. The interesting part arrives later, for free, as a consequence.",
    "Every keyboard has a shape your hands eventually memorise, the way a musician memorises a fretboard. The letters stop being locations and become directions. You do not reach for the key so much as lean toward it.",
    "Measure the right thing. Words per minute tells you how a single attempt went. The spread between your best minute and your worst one tells you whether you have actually learned anything, and that number is far harder to fake.",
  ],
  long: [
    "The difference between a quick typist and a reliable one shows up in the gaps rather than the keystrokes. Both may reach the same peak speed for a line or two, but the reliable typist does not pause to repair a word, does not lose the thread halfway through a clause, and does not spend the second half of a sentence recovering from the first. Those small recoveries are invisible in the moment and ruthless in aggregate. Remove them and the speed you already had becomes the speed you actually keep.",
    "Learning to type is an unusually honest skill to practise, because the feedback arrives immediately and refuses to flatter you. There is no interpretation to argue with, no matter of taste, only the letter you meant and the letter you produced. Most skills let you believe you are improving for months before the evidence catches up. This one tells you within a tenth of a second, and it tells you again on the next keystroke, and the one after that, until the lesson has nowhere left to hide.",
    "Treat a practice session the way a runner treats a training run rather than a race. The goal is not to post a number worth remembering; the goal is to spend a few minutes moving correctly so that correct movement becomes the default. Races are for the days when you want to find out what the training produced. If every session is a race, you spend all of your attention on the scoreboard and none of it on the technique that would eventually change what the scoreboard says.",
    "Comfort matters more than most people expect. Wrists level, shoulders down, elbows loose, the screen at a height that does not ask your neck to hold a position it will resent in an hour. None of this makes you faster in the next sixty seconds, which is exactly why it gets skipped. It makes you faster across the next six months, by keeping the practice possible on the days when you do not feel like practising, and that is the only timescale on which real improvement happens.",
  ],
};
