import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Poker hand matrix data
export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export const HANDS: string[][] = [];
for (let i = 0; i < RANKS.length; i++) {
  const row: string[] = [];
  for (let j = 0; j < RANKS.length; j++) {
    const rank1 = RANKS[i];
    const rank2 = RANKS[j];

    if (i === j) {
      row.push(`${rank1}${rank1}`);
    } else if (i < j) {
      row.push(`${rank1}${rank2}s`);
    } else {
      row.push(`${rank2}${rank1}o`);
    }
  }
  HANDS.push(row);
}

export const allHands = HANDS.flat();

export const handToPositionMap = new Map<string, { row: number; col: number }>();
HANDS.forEach((row, rowIndex) => {
  row.forEach((hand, colIndex) => {
    handToPositionMap.set(hand, { row: rowIndex, col: colIndex });
  });
});

// Helper to get the number of combinations for a given hand type
export const getCombinations = (hand: string): number => {
  if (hand.length === 2 && hand[0] === hand[1]) { // Pair, e.g., 'AA'
    return 6;
  }
  if (hand.endsWith('s')) { // Suited, e.g., 'AKs'
    return 4;
  }
  if (hand.endsWith('o')) { // Offsuit, e.g., 'AKo'
    return 12;
  }
  return 0; // Should not happen for valid poker hands
};

export const allPossibleHands = allHands.flatMap(hand => {
  const combos = getCombinations(hand);
  return Array(combos).fill(hand);
});

// Calculate total possible combinations (1326)
export const TOTAL_POKER_COMBINATIONS = allHands.reduce((sum, hand) => sum + getCombinations(hand), 0);

export const getNeighbors = (row: number, col: number): string[] => {
  const neighbors: string[] = [];
  const moves = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1],  // right
  ];

  for (const [dr, dc] of moves) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < 13 && newCol >= 0 && newCol < 13) {
      neighbors.push(HANDS[newRow][newCol]);
    }
  }
  return neighbors;
};

export const generateBorderPlusOneHands = (rangeHands: Record<string, string>): string[] => {
  if (!rangeHands || Object.keys(rangeHands).length === 0) {
    return [];
  }

  const borderHands = new Set<string>();

  // 1. Find the border hands: hands in the range that have a neighbor outside the range.
  for (const hand in rangeHands) {
    const pos = handToPositionMap.get(hand);
    if (!pos) continue;

    const neighbors = getNeighbors(pos.row, pos.col);
    for (const neighbor of neighbors) {
      if (!rangeHands.hasOwnProperty(neighbor)) {
        borderHands.add(hand);
        break;
      }
    }
  }

  // 2. Find hands adjacent to the border (+1 layer).
  const borderPlusOneHands = new Set<string>();
  for (const borderHand of borderHands) {
    const pos = handToPositionMap.get(borderHand);
    if (!pos) continue;
    
    // Add the border hand itself
    borderPlusOneHands.add(borderHand);

    // Add all its neighbors
    const neighbors = getNeighbors(pos.row, pos.col);
    for (const neighbor of neighbors) {
      borderPlusOneHands.add(neighbor);
    }
  }

  return Array.from(borderPlusOneHands);
};
