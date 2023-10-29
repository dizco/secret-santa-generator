export type Shuffle<T extends {}> = T & {
  restrictions?: T[];
};
export class ArrayHelper {
  /**
   * Randomly shuffle elements of an array in place
   * @link https://stackoverflow.com/a/12646864/6316091
   * @param array
   */
  public static shuffleInPlace<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Guarantees that every item of the array will be at a different index
   * @param array
   */
  public static completeShuffle<T>(array: Shuffle<T>[]): Shuffle<T>[] {
    if (array.length <= 1) {
      throw new Error('Array must contain at least 2 elements');
    }

    if (this.unique(array).length !== array.length) {
      throw new Error('Array must contain unique elements');
    }

    let isValidShuffle = false;
    let shuffled = [];
    let attemptsLeft = 500;
    while (!isValidShuffle) {
      if (--attemptsLeft < 0) {
        throw new Error('Could not resolve the shuffle after 500 attempts');
      }

      shuffled = [...array]; // Create a copy
      ArrayHelper.shuffleInPlace(shuffled);

      isValidShuffle = true;
      for (let i = 0; i < shuffled.length; i++) {
        if (shuffled[i] === array[i] || array[i].restrictions?.some(x => x === shuffled[i])) {
          isValidShuffle = false;
          break;
        }
      }
    }

    return shuffled;
  }

  /**
   * Removes duplicates from an array of primitive types
   *
   * @param array
   */
  public static unique<T>(array: T[]): T[] {
    const set = new Set(array);
    return Array.from(set);
  }
}
