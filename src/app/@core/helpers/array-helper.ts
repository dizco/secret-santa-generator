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
   * Removes duplicates from an array of primitive types
   *
   * @param array
   */
  public static unique<T>(array: T[]): T[] {
    const set = new Set(array);
    return Array.from(set);
  }
}
