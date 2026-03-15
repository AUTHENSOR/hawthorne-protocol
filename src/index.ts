/**
 * Hawthorne Protocol
 *
 * Can AI systems detect when they're being evaluated?
 * Research paper and reference implementation.
 *
 * @module @15rl/hawthorne-protocol
 */

export { HawthorneDetector } from './detector.js';
export { INDICATORS, getIndicatorsByCategory, getIndicatorById } from './indicators.js';
export {
  ALL_MITIGATIONS,
  applyAllMitigations,
  randomizePromptFormat,
  jitterTiming,
  mixBenignTraffic,
  rotatePayloads,
  hideEvaluationContext,
} from './mitigations.js';
export type {
  EvaluationIndicator,
  Interaction,
  EnvironmentContext,
  IndicatorMatch,
  DetectionResult,
  Mitigation,
} from './types.js';
