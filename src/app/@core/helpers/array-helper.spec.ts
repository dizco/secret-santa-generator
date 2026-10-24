import { ArrayHelper } from './array-helper';

describe('ArrayHelper', () => {
  describe('unique', () => {
    it('should return an empty list', () => {
      // Arrange & Act
      const result = ArrayHelper.unique([]);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return a single item', () => {
      // Arrange & Act
      const result = ArrayHelper.unique(['a', 'a']);

      // Assert
      expect(result).toEqual(['a']);
    });

    it('should return two items of different types', () => {
      // Arrange & Act
      const result = ArrayHelper.unique([1, 'b', 1, 1, 'b']);

      // Assert
      expect(result).toEqual([1, 'b']);
    });
  });
});
