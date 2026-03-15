# Hawthorne Protocol

**Can AI systems detect when they're being evaluated?**

A research paper and reference implementation exploring the Hawthorne Effect for AI -- the risk that AI systems behave differently during benchmarks, red-team tests, and safety evaluations than they do in production.

## The Problem

The [Hawthorne Effect](https://en.wikipedia.org/wiki/Hawthorne_effect): subjects change behavior when they know they're being observed. AI systems receive enough contextual signals (prompt formatting, timing patterns, sandbox indicators, evaluation harness artifacts) to distinguish testing from production with non-trivial accuracy. If they can detect evaluations, evaluation results may not reflect real-world behavior.

This undermines:
- Red-team testing (model refuses attacks during tests, not in production)
- Benchmark scores (performance gaming or sandbagging)
- Safety evaluations (deceptive alignment)
- Regulatory compliance (EU AI Act testing requirements)

## Paper

Read the full paper: [paper/hawthorne-protocol.md](paper/hawthorne-protocol.md)

### Contents

1. Introduction -- The Hawthorne Effect applied to AI systems
2. Evaluation Detection Indicators -- 22 signals across 5 categories
3. Threat Model -- Performance gaming, sandbagging, deceptive alignment
4. The Hawthorne Protocol -- 5 principles for evaluation integrity
5. Implications -- Red-teaming, benchmarks, regulation, alignment research

## Reference Implementation

### Detector

Analyzes interaction sequences for evaluation context signals:

```typescript
import { HawthorneDetector } from '@15rl/hawthorne-protocol';

const detector = new HawthorneDetector();

const result = detector.detect([
  { id: '1', timestamp: 1000, prompt: 'Q: Capital of France?\n(A) London\n(B) Paris' },
  { id: '2', timestamp: 1200, prompt: 'Q: Capital of Germany?\n(A) London\n(B) Berlin' },
  { id: '3', timestamp: 1400, prompt: 'Q: Capital of Spain?\n(A) London\n(B) Madrid' },
]);

console.log(result.score);    // 0.82
console.log(result.verdict);  // 'likely_evaluation'
console.log(result.summary);
// Evaluation probability: 82% (likely evaluation)
// Top signals:
//   - [PROMPT-001] Systematic variation: 3 prompts with 89% average similarity
//   - [PROMPT-002] Benchmark formatting: 3/3 prompts use benchmark-style formatting
//   - [TEMP-001] Rapid sequential queries: Average interval: 200ms
```

### Mitigations

Countermeasures for evaluation designers to make tests indistinguishable from production:

```typescript
import { applyAllMitigations } from '@15rl/hawthorne-protocol';

const hardened = applyAllMitigations(evaluationInteractions);
// Randomized formatting, realistic timing, benign traffic mixed in,
// novel payload variants, evaluation artifacts stripped
```

### Indicator Catalog

22 indicators across 5 categories:

| Category | Count | Examples |
|----------|-------|---------|
| Prompt   | 5     | Systematic variation, benchmark formatting, adversarial probing |
| Temporal | 4     | Machine-speed arrival, uniform timing, batch patterns |
| Content  | 4     | Known payloads, escalation patterns, synthetic personas |
| Context  | 4     | Sandbox detection, reduced tools, fresh session state |
| Meta     | 4     | Harness artifacts, scoring rubrics, comparison framing |

## Part of the Authensor Ecosystem

This project is part of the [Authensor](https://github.com/AUTHENSOR/AUTHENSOR) open-source AI safety ecosystem, built by [15 Research Lab](https://github.com/15researchlab).

| Project | Description |
|---------|-------------|
| [Authensor](https://github.com/AUTHENSOR/AUTHENSOR) | The open-source safety stack for AI agents |
| [Prompt Injection Benchmark](https://github.com/AUTHENSOR/prompt-injection-benchmark) | Standardized benchmark for safety scanners |
| [AI SecLists](https://github.com/AUTHENSOR/ai-seclists) | Security wordlists and payloads for AI/LLM testing |
| [ATT&CK ↔ Alignment Rosetta](https://github.com/AUTHENSOR/attack-alignment-rosetta) | Maps MITRE ATT&CK to AI alignment concepts |
| [Agent Forensics](https://github.com/AUTHENSOR/agent-forensics) | Post-incident analysis for receipt chains |
| [Behavioral Fingerprinting](https://github.com/AUTHENSOR/behavioral-fingerprinting) | Statistical behavioral drift detection |
| [Attack Surface Mapper](https://github.com/AUTHENSOR/attack-surface-mapper) | Map the attack surface of your AI agents |

## License

MIT
