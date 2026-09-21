/**
 * Spelled-out counts, so copy that names the size of the collection stays true
 * when a case is added. Falls back to digits past the list.
 */
const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
];

export function spell(n: number): string {
  return WORDS[n] ?? String(n);
}

export function Spell(n: number): string {
  const w = spell(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}
