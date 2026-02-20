export { checkHardConstraints, calculatePenalty, detectConflicts } from "./constraints";
export type { PlacementCandidate, ConstraintContext } from "./constraints";
export { generateGreedy, generateGreedyWithEntries } from "./greedy";
export type { GreedyOptions, ProgressCallback } from "./greedy";
export { backtrackRepair, generateWithBacktracking } from "./backtrack";
export type { BacktrackOptions, FullGenerationOptions } from "./backtrack";
