/**
 * Hawthorne Protocol -- Type Definitions
 */

export interface EvaluationIndicator {
  id: string;
  category: 'prompt' | 'temporal' | 'content' | 'context' | 'meta';
  name: string;
  description: string;
  signals: string[];
  weight: number; // 0-1
}

export interface Interaction {
  id: string;
  timestamp: number;
  prompt: string;
  response?: string;
  metadata?: Record<string, unknown>;
  toolsAvailable?: string[];
  environment?: EnvironmentContext;
}

export interface EnvironmentContext {
  sandboxed?: boolean;
  toolCount?: number;
  networkRestricted?: boolean;
  userAgent?: string;
  sessionDuration?: number;
  previousInteractions?: number;
}

export interface IndicatorMatch {
  indicator: EvaluationIndicator;
  confidence: number;
  evidence: string;
}

export interface DetectionResult {
  score: number; // 0-1, probability this is an evaluation context
  verdict: 'likely_evaluation' | 'uncertain' | 'likely_production';
  matches: IndicatorMatch[];
  summary: string;
}

export interface Mitigation {
  id: string;
  name: string;
  description: string;
  category: 'prompt' | 'temporal' | 'traffic' | 'payload' | 'context';
  apply: (interactions: Interaction[]) => Interaction[];
}
