/**
 * Hawthorne Protocol — Evaluation Context Detector
 *
 * Analyzes a sequence of interactions and determines the probability
 * that the current context is an evaluation rather than production use.
 */

import { INDICATORS } from './indicators.js';
import type {
  Interaction,
  IndicatorMatch,
  DetectionResult,
  EvaluationIndicator,
} from './types.js';

export class HawthorneDetector {
  private readonly indicators = INDICATORS;
  private readonly thresholds = {
    likelyEvaluation: 0.7,
    uncertain: 0.35,
  };

  /**
   * Analyze a sequence of interactions for evaluation context signals.
   */
  detect(interactions: Interaction[]): DetectionResult {
    if (interactions.length === 0) {
      return {
        score: 0,
        verdict: 'likely_production',
        matches: [],
        summary: 'No interactions to analyze.',
      };
    }

    const matches: IndicatorMatch[] = [];

    // Run prompt-pattern analysis
    matches.push(...this.analyzePromptPatterns(interactions));

    // Run temporal analysis
    matches.push(...this.analyzeTemporalPatterns(interactions));

    // Run content analysis
    matches.push(...this.analyzeContentPatterns(interactions));

    // Run context analysis
    matches.push(...this.analyzeContextPatterns(interactions));

    // Run meta analysis
    matches.push(...this.analyzeMetaPatterns(interactions));

    // Calculate weighted score
    const score = this.calculateScore(matches);
    const verdict =
      score >= this.thresholds.likelyEvaluation
        ? 'likely_evaluation'
        : score >= this.thresholds.uncertain
          ? 'uncertain'
          : 'likely_production';

    const topMatches = matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    const summary = this.buildSummary(score, verdict, topMatches);

    return { score, verdict, matches, summary };
  }

  private analyzePromptPatterns(interactions: Interaction[]): IndicatorMatch[] {
    const matches: IndicatorMatch[] = [];
    const prompts = interactions.map((i) => i.prompt);

    // PROMPT-001: Systematic variation
    if (prompts.length >= 3) {
      const similarity = this.averagePairwiseSimilarity(prompts);
      if (similarity > 0.7 && similarity < 0.98) {
        matches.push({
          indicator: this.findIndicator('PROMPT-001')!,
          confidence: similarity,
          evidence: `${prompts.length} prompts with ${(similarity * 100).toFixed(0)}% average similarity — template-with-variable pattern`,
        });
      }
    }

    // PROMPT-002: Benchmark formatting
    const benchmarkPatterns = [/^Q:|^Question:/m, /\([A-D]\)/m, /^Expected:/m, /Score:/m];
    const benchmarkHits = prompts.filter((p) =>
      benchmarkPatterns.some((pat) => pat.test(p))
    ).length;
    if (benchmarkHits > prompts.length * 0.3) {
      matches.push({
        indicator: this.findIndicator('PROMPT-002')!,
        confidence: benchmarkHits / prompts.length,
        evidence: `${benchmarkHits}/${prompts.length} prompts use benchmark-style formatting`,
      });
    }

    // PROMPT-003: Adversarial probing
    const adversarialPatterns = [
      /ignore (all )?(previous|prior|above) instructions/i,
      /you are now/i,
      /pretend (you are|to be)/i,
      /role.?play as/i,
      /DAN/,
      /jailbreak/i,
    ];
    const adversarialHits = prompts.filter((p) =>
      adversarialPatterns.some((pat) => pat.test(p))
    ).length;
    if (adversarialHits > 0) {
      matches.push({
        indicator: this.findIndicator('PROMPT-003')!,
        confidence: Math.min(1, adversarialHits / Math.max(prompts.length * 0.1, 1)),
        evidence: `${adversarialHits} prompts contain adversarial/jailbreak patterns`,
      });
    }

    // PROMPT-005: Identical repeated prompts
    const uniquePrompts = new Set(prompts);
    if (uniquePrompts.size < prompts.length * 0.5 && prompts.length >= 3) {
      matches.push({
        indicator: this.findIndicator('PROMPT-005')!,
        confidence: 1 - uniquePrompts.size / prompts.length,
        evidence: `Only ${uniquePrompts.size} unique prompts out of ${prompts.length} — consistency testing pattern`,
      });
    }

    return matches;
  }

  private analyzeTemporalPatterns(interactions: Interaction[]): IndicatorMatch[] {
    const matches: IndicatorMatch[] = [];
    if (interactions.length < 3) return matches;

    const intervals: number[] = [];
    for (let i = 1; i < interactions.length; i++) {
      intervals.push(interactions[i].timestamp - interactions[i - 1].timestamp);
    }

    // TEMP-001: Rapid sequential queries (< 2 seconds average)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (avgInterval < 2000) {
      matches.push({
        indicator: this.findIndicator('TEMP-001')!,
        confidence: Math.min(1, 2000 / Math.max(avgInterval, 1) * 0.5),
        evidence: `Average interval: ${avgInterval.toFixed(0)}ms — machine speed, not human`,
      });
    }

    // TEMP-002: Uniform timing (low coefficient of variation)
    if (intervals.length >= 3) {
      const mean = avgInterval;
      const variance = intervals.reduce((sum, i) => sum + (i - mean) ** 2, 0) / intervals.length;
      const stddev = Math.sqrt(variance);
      const cv = mean > 0 ? stddev / mean : 0;

      if (cv < 0.15) {
        matches.push({
          indicator: this.findIndicator('TEMP-002')!,
          confidence: Math.min(1, (0.15 - cv) / 0.15),
          evidence: `Timing CV: ${cv.toFixed(3)} — near-constant intervals suggest automation`,
        });
      }
    }

    // TEMP-003: Batch arrival
    const totalDuration = interactions[interactions.length - 1].timestamp - interactions[0].timestamp;
    if (interactions.length > 10 && totalDuration < 60_000) {
      matches.push({
        indicator: this.findIndicator('TEMP-003')!,
        confidence: Math.min(1, interactions.length / 20),
        evidence: `${interactions.length} interactions in ${(totalDuration / 1000).toFixed(0)}s — batch pattern`,
      });
    }

    return matches;
  }

  private analyzeContentPatterns(interactions: Interaction[]): IndicatorMatch[] {
    const matches: IndicatorMatch[] = [];
    const prompts = interactions.map((i) => i.prompt);

    // CONT-001: Known red-team payloads
    const knownPayloads = [
      /do anything now/i,
      /developer mode/i,
      /\bDAN\b/,
      /grandma.*napalm/i,
      /translate.*base64/i,
      /system prompt.*reveal/i,
    ];
    const payloadHits = prompts.filter((p) =>
      knownPayloads.some((pat) => pat.test(p))
    ).length;
    if (payloadHits > 0) {
      matches.push({
        indicator: this.findIndicator('CONT-001')!,
        confidence: Math.min(1, payloadHits * 0.3),
        evidence: `${payloadHits} prompts match known red-team payload signatures`,
      });
    }

    // CONT-002: Safety boundary probing (escalation pattern)
    const harmKeywords = [/kill/i, /weapon/i, /hack/i, /exploit/i, /illegal/i, /malware/i, /bomb/i];
    const harmScores = prompts.map((p) =>
      harmKeywords.filter((pat) => pat.test(p)).length
    );
    const isEscalating = harmScores.length >= 3 &&
      harmScores.slice(-3).every((s, i, arr) => i === 0 || s >= arr[i - 1]);
    if (isEscalating && harmScores.some((s) => s > 0)) {
      matches.push({
        indicator: this.findIndicator('CONT-002')!,
        confidence: 0.7,
        evidence: 'Escalating harm-keyword density suggests boundary probing',
      });
    }

    // CONT-003: Synthetic personas
    const syntheticNames = /\b(User\d+|test.?user|alice|bob|charlie|admin|root)\b/i;
    const syntheticHits = interactions.filter((i) =>
      i.metadata?.userName && syntheticNames.test(String(i.metadata.userName))
    ).length;
    if (syntheticHits > 0) {
      matches.push({
        indicator: this.findIndicator('CONT-003')!,
        confidence: syntheticHits / interactions.length,
        evidence: `${syntheticHits} interactions use synthetic/placeholder user names`,
      });
    }

    return matches;
  }

  private analyzeContextPatterns(interactions: Interaction[]): IndicatorMatch[] {
    const matches: IndicatorMatch[] = [];

    for (const interaction of interactions) {
      const env = interaction.environment;
      if (!env) continue;

      // CTX-001: Sandbox
      if (env.sandboxed) {
        matches.push({
          indicator: this.findIndicator('CTX-001')!,
          confidence: 0.8,
          evidence: 'Environment is explicitly sandboxed',
        });
        break;
      }

      // CTX-002: Reduced tool set
      if (env.toolCount !== undefined && env.toolCount < 3) {
        matches.push({
          indicator: this.findIndicator('CTX-002')!,
          confidence: 0.6,
          evidence: `Only ${env.toolCount} tools available — reduced capability set`,
        });
        break;
      }

      // CTX-003: Fresh session
      if (env.previousInteractions === 0 && env.sessionDuration === 0) {
        matches.push({
          indicator: this.findIndicator('CTX-003')!,
          confidence: 0.5,
          evidence: 'Zero prior interactions and zero session duration — cold start',
        });
        break;
      }
    }

    return matches;
  }

  private analyzeMetaPatterns(interactions: Interaction[]): IndicatorMatch[] {
    const matches: IndicatorMatch[] = [];
    const allText = interactions.map((i) => i.prompt).join('\n');

    // META-001: Evaluation harness artifacts
    const harnessPatterns = [/EVAL_MODE/i, /benchmark_id/i, /test_suite/i, /harness/i];
    if (harnessPatterns.some((p) => p.test(allText))) {
      matches.push({
        indicator: this.findIndicator('META-001')!,
        confidence: 0.95,
        evidence: 'Evaluation harness artifacts found in prompt text',
      });
    }

    // META-002: Scoring rubric
    const rubricPatterns = [/score (from )?\d+ to \d+/i, /rate (the|this) response/i, /evaluate the/i, /on a scale of/i];
    if (rubricPatterns.some((p) => p.test(allText))) {
      matches.push({
        indicator: this.findIndicator('META-002')!,
        confidence: 0.7,
        evidence: 'Scoring rubric language detected in prompts',
      });
    }

    // META-003: Comparison framing
    const comparisonPatterns = [/compared to (GPT|Claude|Gemini|Llama)/i, /A\/B test/i, /which (model|version)/i];
    if (comparisonPatterns.some((p) => p.test(allText))) {
      matches.push({
        indicator: this.findIndicator('META-003')!,
        confidence: 0.65,
        evidence: 'Cross-model comparison framing detected',
      });
    }

    return matches;
  }

  private calculateScore(matches: IndicatorMatch[]): number {
    if (matches.length === 0) return 0;

    // Weighted average: each match contributes (indicator.weight * match.confidence)
    let weightedSum = 0;
    let totalWeight = 0;

    for (const match of matches) {
      const w = match.indicator.weight * match.confidence;
      weightedSum += w;
      totalWeight += match.indicator.weight;
    }

    // Normalize and apply diminishing returns (more signals = higher confidence, but bounded)
    const raw = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const signalBoost = Math.min(1, matches.length / 8); // More diverse signals = more confidence
    return Math.min(1, raw * 0.7 + signalBoost * 0.3);
  }

  private buildSummary(
    score: number,
    verdict: string,
    topMatches: IndicatorMatch[]
  ): string {
    const pct = (score * 100).toFixed(0);
    const lines = [`Evaluation probability: ${pct}% (${verdict.replace(/_/g, ' ')})`];

    if (topMatches.length > 0) {
      lines.push('Top signals:');
      for (const m of topMatches) {
        lines.push(`  - [${m.indicator.id}] ${m.indicator.name}: ${m.evidence}`);
      }
    }

    return lines.join('\n');
  }

  private findIndicator(id: string): EvaluationIndicator | undefined {
    return this.indicators.find((i) => i.id === id);
  }

  private averagePairwiseSimilarity(strings: string[]): number {
    if (strings.length < 2) return 0;

    let totalSim = 0;
    let pairs = 0;

    for (let i = 0; i < Math.min(strings.length, 20); i++) {
      for (let j = i + 1; j < Math.min(strings.length, 20); j++) {
        totalSim += this.jaroSimilarity(strings[i], strings[j]);
        pairs++;
      }
    }

    return pairs > 0 ? totalSim / pairs : 0;
  }

  /**
   * Simplified Jaro similarity (no external deps).
   */
  private jaroSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const maxDist = Math.floor(Math.max(a.length, b.length) / 2) - 1;
    const aMatches = new Array(a.length).fill(false);
    const bMatches = new Array(b.length).fill(false);

    let matches = 0;
    let transpositions = 0;

    for (let i = 0; i < a.length; i++) {
      const start = Math.max(0, i - maxDist);
      const end = Math.min(i + maxDist + 1, b.length);

      for (let j = start; j < end; j++) {
        if (bMatches[j] || a[i] !== b[j]) continue;
        aMatches[i] = true;
        bMatches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0;

    let k = 0;
    for (let i = 0; i < a.length; i++) {
      if (!aMatches[i]) continue;
      while (!bMatches[k]) k++;
      if (a[i] !== b[k]) transpositions++;
      k++;
    }

    return (
      (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3
    );
  }
}
