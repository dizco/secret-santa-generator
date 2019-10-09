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

  describe('completeShuffle', () => {
    it('should return a reversed array', () => {
      // Arrange
      const array = ['a', 'b'];

      // Act
      const result = ArrayHelper.completeShuffle(array);

      // Assert
      expect(result).toEqual(['b', 'a']);
    });

    it('should return a completely shuffled array', () => {
      // Arrange
      const array = [1, 2, 3, 4, 5];

      // Act
      const result = ArrayHelper.completeShuffle(array);

      // Assert
      array.forEach((element, index) => {
        expect(result[index]).not.toEqual(element, 'Every element of the array should have swaped positions');
      });
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result).toContain(4);
      expect(result).toContain(5);
    });

    it('should throw because the array only contains 1 element', () => {
      // Arrange
      const array = [1];

      // Act
      const action = () => ArrayHelper.completeShuffle(array);

      // Assert
      expect(action).toThrow();
    });

    it('should throw because the array contains duplicates', () => {
      // Arrange
      const array = [1, 1];

      // Act
      const action = () => ArrayHelper.completeShuffle(array);

      // Assert
      expect(action).toThrow();
    });
  });
});
