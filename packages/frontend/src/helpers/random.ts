/**
 * Fisher–Yates shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arrayCopy = [...array];
  for (let i = array.length - 1; i >= 1; i -= 1) {
    const randomIndex = Math.floor(Math.random() * i);
    const temp = arrayCopy[i];
    arrayCopy[i] = arrayCopy[randomIndex];
    arrayCopy[randomIndex] = temp;
  }
  return arrayCopy;
}
