import { DrawSolver, Restricted, UnsolvableDrawError } from './draw-solver';

type Item = Restricted<{ a: number }>;

function buildItems(count: number): Item[] {
  return Array.from({ length: count }, (_, a) => ({ a }));
}

function expectValidDraw(items: Item[], result: Item[]): void {
  expect(result.length).toEqual(items.length);
  expect(new Set(result).size).toEqual(items.length, 'Everybody should be picked exactly once');
  items.forEach((item, i) => {
    expect(result[i]).not.toBe(item, 'Nobody should pick themselves');
    expect(item.restrictions ?? []).not.toContain(result[i], 'Nobody should pick someone in their restrictions');
  });
}

function catchUnsolvable(items: Item[]): UnsolvableDrawError<Item> {
  try {
    DrawSolver.solve(items);
  } catch (error) {
    return error;
  }
  throw new Error('Expected the draw to be unsolvable');
}

describe('DrawSolver', () => {
  describe('solve', () => {
    it('should return a reversed array', () => {
      // Arrange
      const items = buildItems(2);

      // Act
      const result = DrawSolver.solve(items);

      // Assert
      expect(result).toEqual([items[1], items[0]]);
    });

    it('should return a complete draw', () => {
      // Arrange
      const items = buildItems(5);

      // Act
      const result = DrawSolver.solve(items);

      // Assert
      expectValidDraw(items, result);
    });

    it('should respect restrictions', () => {
      // Arrange
      const items = buildItems(5);
      items[0].restrictions = [items[1], items[2], items[3]]; // will have to pick a4
      items[1].restrictions = [items[0], items[2]]; // will have to pick a3
      items[2].restrictions = [items[0]]; // will have to pick a1
      items[3].restrictions = [items[0]]; // will have to pick a2
      // a4 will have to pick a0

      // Act
      const result = DrawSolver.solve(items);

      // Assert
      expect(result).toEqual([items[4], items[3], items[1], items[2], items[0]]);
    });

    it('should respect mutual restrictions between couples', () => {
      // Arrange
      const items = buildItems(6);
      for (let i = 0; i < items.length; i += 2) {
        items[i].restrictions = [items[i + 1]];
        items[i + 1].restrictions = [items[i]];
      }

      for (let run = 0; run < 100; run++) {
        // Act
        const result = DrawSolver.solve(items);

        // Assert
        expectValidDraw(items, result);
      }
    });

    it('should solve heavily restricted draws that random attempts would almost never find', () => {
      // Arrange: everyone can only pick the next person, 1 valid draw out of 12! permutations
      const items = buildItems(12);
      items.forEach((item, i) => {
        item.restrictions = items.filter((_, j) => j !== (i + 1) % items.length);
      });

      for (let run = 0; run < 10; run++) {
        // Act
        const result = DrawSolver.solve(items);

        // Assert
        expect(result).toEqual(items.map((_, i) => items[(i + 1) % items.length]));
      }
    });

    it('should be able to produce every valid draw', () => {
      // Arrange: 4 items without restrictions have 9 valid draws
      const items = buildItems(4);
      const seen = new Set<string>();

      // Act
      for (let run = 0; run < 1000; run++) {
        seen.add(DrawSolver.solve(items).map(item => item.a).join(','));
      }

      // Assert
      expect(seen.size).toEqual(9);
    });

    it('should be able to produce every valid draw when falling back from random attempts', () => {
      // Arrange: 0 and 1 can only pick each other, 2..9 sit in a ring and can only pick a neighbour.
      // Valid draws: the ring clockwise, counter-clockwise, or either way of pairing adjacent neighbours
      const items = buildItems(10);
      items[0].restrictions = items.filter((_, j) => j !== 1);
      items[1].restrictions = items.filter((_, j) => j !== 0);
      const ring = (i: number) => 2 + ((i - 2 + 8) % 8);
      for (let i = 2; i < 10; i++) {
        items[i].restrictions = items.filter((_, j) => j !== ring(i + 1) && j !== ring(i - 1));
      }
      const seen = new Set<string>();

      // Act
      for (let run = 0; run < 200; run++) {
        const result = DrawSolver.solve(items);
        expectValidDraw(items, result);
        seen.add(result.map(item => item.a).join(','));
      }

      // Assert
      expect(seen.size).toEqual(4);
    });

    it('should throw when someone has nobody to pick', () => {
      // Arrange
      const items = buildItems(5);
      items[0].restrictions = [items[1], items[2], items[3], items[4]];

      // Act
      const error = catchUnsolvable(items);

      // Assert
      expect(error).toEqual(jasmine.any(UnsolvableDrawError));
      expect(error.group).toEqual({ side: 'pickers', members: [items[0]], candidates: [] });
    });

    it('should throw when nobody can pick someone', () => {
      // Arrange
      const items = buildItems(4);
      items[0].restrictions = [items[3]];
      items[1].restrictions = [items[3]];
      items[2].restrictions = [items[3]];

      // Act
      const error = catchUnsolvable(items);

      // Assert
      expect(error.group).toEqual({ side: 'picked', members: [items[3]], candidates: [] });
    });

    it('should throw when a group can only pick among fewer people than its size', () => {
      // Arrange: 0, 1 and 2 exclude each other, so they all compete for 3 and 4
      const items = buildItems(5);
      items[0].restrictions = [items[1], items[2]];
      items[1].restrictions = [items[0], items[2]];
      items[2].restrictions = [items[0], items[1]];

      // Act
      const error = catchUnsolvable(items);

      // Assert
      expect(error.group.side).toEqual('pickers');
      expect(error.group.members).toEqual([items[0], items[1], items[2]]);
      expect(error.group.candidates).toEqual([items[3], items[4]]);
    });

    it('should throw when two people each restrict the only other participant', () => {
      // Arrange
      const items = buildItems(2);
      items[0].restrictions = [items[1]];

      // Act
      const error = catchUnsolvable(items);

      // Assert
      expect(error.group.members.length).toEqual(1);
      expect(error.group.candidates).toEqual([]);
    });

    it('should throw because the array only contains 1 element', () => {
      // Arrange
      const items = buildItems(1);

      // Act
      const action = () => DrawSolver.solve(items);

      // Assert
      expect(action).toThrow();
    });

    it('should throw because the array contains duplicates', () => {
      // Arrange
      const item = { a: 0 };
      const items = [item, item];

      // Act
      const action = () => DrawSolver.solve(items);

      // Assert
      expect(action).toThrow();
    });
  });

  describe('findUnsolvableGroup', () => {
    it('should return null when the draw is solvable', () => {
      // Arrange
      const items = buildItems(4);
      items[0].restrictions = [items[1]];
      items[1].restrictions = [items[0]];

      // Act
      const result = DrawSolver.findUnsolvableGroup(items);

      // Assert
      expect(result).toBeNull();
    });

    it('should return the group making the draw impossible', () => {
      // Arrange
      const items = buildItems(4);
      items[0].restrictions = [items[1], items[2]];
      items[1].restrictions = [items[0], items[2]];

      // Act
      const result = DrawSolver.findUnsolvableGroup(items);

      // Assert: 0 and 1 both need 3
      expect(result).toEqual({ side: 'pickers', members: [items[0], items[1]], candidates: [items[3]] });
    });

    it('should not mutate the participants', () => {
      // Arrange
      const items = buildItems(3);
      items[0].restrictions = [items[1], items[2]];
      const restrictions = [...items[0].restrictions];

      // Act
      DrawSolver.findUnsolvableGroup(items);

      // Assert
      expect(items[0].restrictions).toEqual(restrictions);
      expect(items[1].restrictions).toBeUndefined();
      expect(items[2].restrictions).toBeUndefined();
    });
  });
});
