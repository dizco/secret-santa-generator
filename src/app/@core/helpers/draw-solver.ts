import { ArrayHelper } from './array-helper';

export type Restricted<T extends {}> = T & {
  restrictions?: T[];
};

/**
 * Smallest group of items explaining why no draw can satisfy the restrictions.
 *
 * - `pickers`: every member can only pick among `candidates`, and there are fewer candidates than members
 * - `picked`: every member can only be picked by `candidates`, and there are fewer candidates than members
 */
export interface UnsolvableGroup<T> {
  side: 'pickers' | 'picked';
  members: T[];
  candidates: T[];
}

export class UnsolvableDrawError<T> extends Error {
  constructor(public readonly group: UnsolvableGroup<T>) {
    super('No draw can satisfy the restrictions');
    this.name = 'UnsolvableDrawError';
  }
}

/**
 * Assigns to every item another item to pick, such that nobody picks themselves, nobody picks
 * someone in their restrictions and everybody is picked exactly once.
 *
 * This is a perfect matching problem in a bipartite graph (pickers on one side, picked on the other),
 * so feasibility is decided exactly with augmenting paths instead of relying on random attempts.
 */
export class DrawSolver {
  private static readonly RANDOM_ATTEMPTS = 100;

  /**
   * @returns picks such that `items[i]` picks `result[i]`
   * @throws UnsolvableDrawError when the restrictions make the draw impossible
   */
  public static solve<T>(items: Restricted<T>[]): Restricted<T>[] {
    if (items.length <= 1) {
      throw new Error('Array must contain at least 2 elements');
    }

    if (ArrayHelper.unique(items).length !== items.length) {
      throw new Error('Array must contain unique elements');
    }

    const allowed = DrawSolver.buildAllowedMatrix(items);

    const group = DrawSolver.findUnsolvableGroupInMatrix(items, allowed);
    if (group) {
      throw new UnsolvableDrawError(group);
    }

    const picks = DrawSolver.tryRandomPermutations(allowed) ?? DrawSolver.buildRandomMatching(allowed);
    return picks.map(i => items[i]);
  }

  /**
   * @returns null when a draw is possible, otherwise the smallest group of items that makes it impossible
   */
  public static findUnsolvableGroup<T>(items: Restricted<T>[]): UnsolvableGroup<T> | null {
    return DrawSolver.findUnsolvableGroupInMatrix(items, DrawSolver.buildAllowedMatrix(items));
  }

  private static findUnsolvableGroupInMatrix<T>(items: T[], allowed: boolean[][]): UnsolvableGroup<T> | null {
    const pickersWitness = DrawSolver.findHallViolation(allowed);
    if (!pickersWitness) {
      return null;
    }

    const transposed = allowed.map((row, i) => row.map((_, j) => allowed[j][i]));

    // A perfect matching failing from one side always fails from the other, pick the clearest explanation
    const pickedWitness = DrawSolver.findHallViolation(transposed);
    const usePicked = pickedWitness && pickedWitness.members.length < pickersWitness.members.length;
    const witness = usePicked ? pickedWitness : pickersWitness;
    return {
      side: usePicked ? 'picked' : 'pickers',
      members: witness.members.map(i => items[i]),
      candidates: witness.candidates.map(i => items[i]),
    };
  }

  /**
   * Uniformly random permutations are tried first, since they give every valid draw the same odds.
   * Heavily restricted draws rarely produce a valid permutation by chance, hence the fallback.
   */
  private static tryRandomPermutations(allowed: boolean[][]): number[] | null {
    const indices = allowed.map((_, i) => i);
    for (let attempt = 0; attempt < DrawSolver.RANDOM_ATTEMPTS; attempt++) {
      ArrayHelper.shuffleInPlace(indices);
      if (indices.every((picked, picker) => allowed[picker][picked])) {
        return [...indices];
      }
    }
    return null;
  }

  /**
   * Assigns pickers one at a time in random order, each to a random candidate,
   * only keeping a candidate if the remaining pickers can still be matched.
   */
  private static buildRandomMatching(allowed: boolean[][]): number[] {
    const n = allowed.length;
    const picks: number[] = new Array(n).fill(-1);
    const taken: boolean[] = new Array(n).fill(false);

    const pickers = allowed.map((_, i) => i);
    ArrayHelper.shuffleInPlace(pickers);

    for (const picker of pickers) {
      const candidates = allowed[picker].map((_, i) => i).filter(i => allowed[picker][i] && !taken[i]);
      ArrayHelper.shuffleInPlace(candidates);

      const candidate = candidates.find(c => {
        picks[picker] = c;
        taken[c] = true;
        const isFeasible = DrawSolver.maximumMatching(allowed, picks, taken).unmatched.length === 0;
        picks[picker] = -1;
        taken[c] = false;
        return isFeasible;
      });

      // Cannot happen once the draw is known to be solvable, since the previous step kept a feasible state
      if (candidate === undefined) {
        throw new Error('Could not complete the draw');
      }
      picks[picker] = candidate;
      taken[candidate] = true;
    }

    return picks;
  }

  /**
   * By Hall's theorem, a perfect matching is impossible exactly when some group of pickers
   * can only pick among fewer people than the group's size. Such a group is found by following
   * alternating paths from a picker left unmatched by a maximum matching.
   */
  private static findHallViolation(allowed: boolean[][]): { members: number[], candidates: number[] } | null {
    const n = allowed.length;
    const { matchOfPicked, unmatched } = DrawSolver.maximumMatching(allowed, new Array(n).fill(-1), new Array(n).fill(false));
    if (unmatched.length === 0) {
      return null;
    }

    const visitedPickers = new Set<number>([unmatched[0]]);
    const visitedPicked = new Set<number>();
    const queue = [unmatched[0]];
    while (queue.length > 0) {
      const picker = queue.shift();
      for (let picked = 0; picked < n; picked++) {
        if (allowed[picker][picked] && !visitedPicked.has(picked)) {
          visitedPicked.add(picked);
          const next = matchOfPicked[picked];
          if (next !== -1 && !visitedPickers.has(next)) {
            visitedPickers.add(next);
            queue.push(next);
          }
        }
      }
    }

    return {
      members: Array.from(visitedPickers).sort((a, b) => a - b),
      candidates: Array.from(visitedPicked).sort((a, b) => a - b),
    };
  }

  /**
   * Kuhn's augmenting path algorithm, on the pickers and picked not already assigned.
   */
  private static maximumMatching(allowed: boolean[][], fixedPicks: number[], fixedTaken: boolean[])
    : { matchOfPicked: number[], unmatched: number[] } {
    const n = allowed.length;
    const matchOfPicked: number[] = new Array(n).fill(-1);
    const unmatched: number[] = [];

    const tryAugment = (picker: number, visited: boolean[]): boolean => {
      for (let picked = 0; picked < n; picked++) {
        if (!allowed[picker][picked] || fixedTaken[picked] || visited[picked]) {
          continue;
        }
        visited[picked] = true;
        if (matchOfPicked[picked] === -1 || tryAugment(matchOfPicked[picked], visited)) {
          matchOfPicked[picked] = picker;
          return true;
        }
      }
      return false;
    };

    for (let picker = 0; picker < n; picker++) {
      if (fixedPicks[picker] === -1 && !tryAugment(picker, new Array(n).fill(false))) {
        unmatched.push(picker);
      }
    }

    return { matchOfPicked, unmatched };
  }

  private static buildAllowedMatrix<T>(items: Restricted<T>[]): boolean[][] {
    return items.map((picker, i) => items.map((picked, j) => i !== j && !picker.restrictions?.includes(picked)));
  }
}
