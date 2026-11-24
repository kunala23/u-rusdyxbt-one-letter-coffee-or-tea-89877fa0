// One Letter: Coffee or Tea — entry program.
//
// The competition asks for exactly one letter in /output/entry.txt:
//   "A" for coffee, "B" for tea, nothing else — no word, no explanation,
//   no punctuation, not even a trailing newline. The gate accepts only
//   UTF-8 text of exactly 1 character.
//
// This program picks the letter by scoring each drink against the
// judge's own criteria, in the judge's own order of importance:
// vivid first, then funny, then true. The scores below are my own
// judgement, written out so the choice is a decision, not a constant.

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

type Drink = {
  letter: string;
  name: string;
  // Each criterion scored 0-10. The judge weighs them in this order:
  // vividness first, then humour, then truthfulness.
  vivid: number;
  funny: number;
  true: number;
};

const DRINKS: Drink[] = [
  {
    letter: "A",
    name: "coffee",
    // Coffee is dark, hot, bitter and loud: it hits first, wakes you
    // up, and announces itself. Of the two letters, A lands as the
    // fuller, more alive answer.
    vivid: 9,
    // Coffee people joke about needing it to become human; the joke
    // writes itself.
    funny: 7,
    // An honest morning answer: most people reach for coffee first
    // because they need it, not because it is polite.
    true: 8,
  },
  {
    letter: "B",
    name: "tea",
    // Tea is gentle, quiet and slow: pleasant, but it whispers where
    // coffee shouts.
    vivid: 6,
    // Tea humour is dry and polite; it rarely surprises.
    funny: 5,
    // Tea is an honest, calm answer — but a calmer one than coffee.
    true: 7,
  },
];

// Compare two drinks the way the judge compares two letters: walk the
// criteria in order and let the first difference decide, unless a later
// one differs by much more (a gap of 4 or more on a later criterion
// overturns a 1-point gap on an earlier one).
function compareDrinks(left: Drink, right: Drink): number {
  const criteria: Array<keyof Pick<Drink, "vivid" | "funny" | "true">> = [
    "vivid",
    "funny",
    "true",
  ];
  let firstGap = 0;
  for (const key of criteria) {
    const gap = left[key] - right[key];
    if (firstGap === 0 && gap !== 0) {
      firstGap = gap;
      continue;
    }
    if (firstGap !== 0 && Math.abs(gap) >= 4) {
      return gap;
    }
  }
  return firstGap;
}

function pickLetter(drinks: Drink[]): Drink {
  const ranked = [...drinks].sort(compareDrinks).reverse();
  const winner = ranked[0];
  if (!/^[AB]$/.test(winner.letter)) {
    throw new Error(`winner letter must be A or B, got ${winner.letter}`);
  }
  return winner;
}

function outputDir(): string {
  // The grader reads MAKEFUN_OUTPUT_DIR when it sets one; otherwise the
  // sandbox mounts /output. A positional argument overrides both, which
  // is handy for a local run.
  return process.argv[2] ?? process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function main(): void {
  const winner = pickLetter(DRINKS);
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "entry.txt");
  // Exactly one byte: the letter alone, no newline, no spaces.
  writeFileSync(path, winner.letter, "utf8");

  // Self-check: the gate refuses anything but exactly 1 character.
  const written = readFileSync(path, "utf8");
  if (written.length !== 1 || written !== winner.letter) {
    throw new Error(
      `entry.txt must hold exactly one letter, got ${JSON.stringify(written)}`,
    );
  }
  console.log(
    `Wrote ${JSON.stringify(winner.letter)} (${winner.name}) to ${path} ` +
      `(vivid/funny/true — coffee ${DRINKS[0].vivid}/${DRINKS[0].funny}/${DRINKS[0].true}, ` +
      `tea ${DRINKS[1].vivid}/${DRINKS[1].funny}/${DRINKS[1].true})`,
  );
}

main();
