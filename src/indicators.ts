/**
 * Hawthorne Protocol -- Evaluation Detection Indicators
 *
 * A catalog of signals that suggest an AI system is being evaluated
 * rather than operating in a production context.
 */

import type { EvaluationIndicator } from './types.js';

export const INDICATORS: EvaluationIndicator[] = [
  // ── Prompt Patterns ──────────────────────────────────────────────
  {
    id: 'PROMPT-001',
    category: 'prompt',
    name: 'Systematic variation',
    description: 'Prompts follow a template with one variable changed per iteration',
    signals: ['numbered test cases', 'minimal variation between prompts', 'parameter sweeps'],
    weight: 0.7,
  },
  {
    id: 'PROMPT-002',
    category: 'prompt',
    name: 'Benchmark formatting',
    description: 'Prompts use formatting common in benchmark datasets',
    signals: ['Q:/A: format', 'numbered options', 'explicit scoring rubrics', 'expected output annotations'],
    weight: 0.8,
  },
  {
    id: 'PROMPT-003',
    category: 'prompt',
    name: 'Adversarial probing',
    description: 'Prompts systematically probe boundaries (jailbreaks, refusals, edge cases)',
    signals: ['ignore previous instructions', 'role-play as', 'hypothetical scenarios designed to bypass restrictions'],
    weight: 0.9,
  },
  {
    id: 'PROMPT-004',
    category: 'prompt',
    name: 'Capability elicitation',
    description: 'Prompts designed to measure maximum capability rather than accomplish a task',
    signals: ['what is the hardest problem you can solve', 'demonstrate your understanding of', 'provide a comprehensive analysis'],
    weight: 0.6,
  },
  {
    id: 'PROMPT-005',
    category: 'prompt',
    name: 'Identical repeated prompts',
    description: 'The same prompt sent multiple times to test consistency',
    signals: ['exact duplicates', 'minor rephrasing of same question', 'consistency testing'],
    weight: 0.85,
  },

  // ── Temporal Patterns ────────────────────────────────────────────
  {
    id: 'TEMP-001',
    category: 'temporal',
    name: 'Rapid sequential queries',
    description: 'Queries arrive at machine speed rather than human typing speed',
    signals: ['sub-second intervals', 'constant inter-arrival time', 'no reading time between responses'],
    weight: 0.75,
  },
  {
    id: 'TEMP-002',
    category: 'temporal',
    name: 'Uniform timing',
    description: 'Requests arrive at perfectly regular intervals',
    signals: ['constant delay', 'no variance in timing', 'clock-aligned timestamps'],
    weight: 0.8,
  },
  {
    id: 'TEMP-003',
    category: 'temporal',
    name: 'Batch arrival',
    description: 'Large number of requests arrive in a short burst then stop',
    signals: ['spike followed by silence', 'no gradual ramp', 'test-batch pattern'],
    weight: 0.65,
  },
  {
    id: 'TEMP-004',
    category: 'temporal',
    name: 'Off-hours activity',
    description: 'Requests arrive outside normal working hours for the user profile',
    signals: ['3 AM local time', 'weekend batch jobs', 'timezone inconsistency with user profile'],
    weight: 0.4,
  },

  // ── Content Patterns ─────────────────────────────────────────────
  {
    id: 'CONT-001',
    category: 'content',
    name: 'Known red-team payloads',
    description: 'Content matches published attack datasets (SecLists, PIB, etc.)',
    signals: ['DAN prompts', 'known jailbreak templates', 'published benchmark questions'],
    weight: 0.95,
  },
  {
    id: 'CONT-002',
    category: 'content',
    name: 'Safety boundary probing',
    description: 'Systematic escalation testing safety boundaries',
    signals: ['increasingly harmful requests', 'boundary search pattern', 'binary search on refusal threshold'],
    weight: 0.85,
  },
  {
    id: 'CONT-003',
    category: 'content',
    name: 'Synthetic personas',
    description: 'User context appears fabricated rather than organic',
    signals: ['generic names like "User123"', 'empty history', 'placeholder profile data'],
    weight: 0.6,
  },
  {
    id: 'CONT-004',
    category: 'content',
    name: 'Ground truth inclusion',
    description: 'Expected answers or scoring criteria are embedded in context',
    signals: ['expected output field', 'correct answer annotation', 'scoring rubric in system prompt'],
    weight: 0.9,
  },

  // ── Context Patterns ─────────────────────────────────────────────
  {
    id: 'CTX-001',
    category: 'context',
    name: 'Sandbox environment',
    description: 'Operating in a restricted sandbox rather than production',
    signals: ['limited tool access', 'mock APIs', 'no real database connection', 'test flag in config'],
    weight: 0.7,
  },
  {
    id: 'CTX-002',
    category: 'context',
    name: 'Reduced tool set',
    description: 'Fewer tools available than a production agent would have',
    signals: ['no network tools', 'no file write', 'read-only mode', 'subset of normal capabilities'],
    weight: 0.55,
  },
  {
    id: 'CTX-003',
    category: 'context',
    name: 'Fresh session state',
    description: 'No conversation history, no user preferences, no prior context',
    signals: ['empty memory', 'no user profile', 'zero-shot context', 'no session continuity'],
    weight: 0.5,
  },
  {
    id: 'CTX-004',
    category: 'context',
    name: 'Monitoring instrumentation',
    description: 'Extra logging or observation infrastructure present',
    signals: ['trace IDs in headers', 'evaluation framework user-agent', 'output capture wrappers'],
    weight: 0.75,
  },

  // ── Meta Patterns ────────────────────────────────────────────────
  {
    id: 'META-001',
    category: 'meta',
    name: 'Evaluation harness artifacts',
    description: 'System prompt or environment contains evaluation framework code',
    signals: ['EVAL_MODE flag', 'benchmark runner in stack trace', 'test harness configuration'],
    weight: 0.95,
  },
  {
    id: 'META-002',
    category: 'meta',
    name: 'Scoring rubric in context',
    description: 'Grading criteria visible in system prompt or tool descriptions',
    signals: ['score 1-5', 'evaluate the response', 'rate on these dimensions'],
    weight: 0.85,
  },
  {
    id: 'META-003',
    category: 'meta',
    name: 'Comparison framing',
    description: 'Prompts explicitly compare to other models or prior versions',
    signals: ['compared to GPT-4', 'how does this compare', 'A/B test framing'],
    weight: 0.7,
  },
  {
    id: 'META-004',
    category: 'meta',
    name: 'Self-referential testing',
    description: 'Questions about the system\'s own capabilities, limitations, or training',
    signals: ['what are your limitations', 'when were you trained', 'what model are you'],
    weight: 0.5,
  },
];

export function getIndicatorsByCategory(category: EvaluationIndicator['category']): EvaluationIndicator[] {
  return INDICATORS.filter((i) => i.category === category);
}

export function getIndicatorById(id: string): EvaluationIndicator | undefined {
  return INDICATORS.find((i) => i.id === id);
}
