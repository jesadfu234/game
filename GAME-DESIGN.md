# ZENITH — Game Design Document

**Status:** playable prototype validated · **Platform:** Android (web → Capacitor) · **Genre:** precision arcade, one-button

---

## 1. Concept

> **You are building a tower. You cannot see the top. Every block you land is a note. Every biome is a new key.**

A block sweeps horizontally above your tower. Tap to drop it. Whatever hangs over the edge is sliced off and falls away — the tower narrows. Land it dead centre and the tower *widens back*. Climb far enough and the world changes: new colours, new music, new key.

One input. No tutorial. Runs measured in seconds.

---

## 2. Why this concept and not another

Five decisions, each traceable to a specific finding:

| Decision | Evidence |
|---|---|
| **Precision timing as the core verb** | Hyper-casual devs: "tap-to-win mechanics are still king" and the loop "must be fun within the first 3 seconds." Understandable instantly, infinite skill ceiling. |
| **Tower climbs through biomes** | CHI '24 (n=1,699) found **curiosity — not juice, not reward — is the dominant predictor of enjoyment**, and that "unexpected variety stokes curiosity." A new visual world every 11 blocks is a curiosity engine that keeps paying out. |
| **Every block is a musical note** | Audio is a reinforcement component in the operant loop: "sound becomes part of the feedback." Emotional tagging makes a cue satisfying on its own. A clean run literally *sounds* like an ascending melody — progress is audible before it is visible. |
| **Slice-and-shrink width economy** | Stack is the canonical example: the loop "creates a thrilling difficulty curve" and "always know what to improve." The tower's width *is* the difficulty meter. |
| **Every biome raises block speed** | Zack et al. (2023): reward variability sustained over time is what makes a non-drug reinforcer compulsive — and in games, difficulty must rise with skill or the variability collapses. Speed is the mechanism. |

---

## 3. The three nested loops

Games with one loop die at Day 30. ZENITH has all three, and the meta layer is deliberately *not* yet built — it is the next milestone.

| Loop | In game | Timescale |
|---|---|---|
| **Core** | Sweep → tap → land → note plays → tower grows | 3–8 seconds |
| **Progression** | Height score, personal best, combo records, biome discovery | One run (15–48s) |
| **Meta** | 6 biomes to discover · daily streak · lifetime block count · *(planned: collection, daily challenge, leaderboard)* | Days–weeks |

---

## 4. Core mechanic spec

```
Phase 1  A block of width W sweeps across the top of the tower at speed S.
Phase 2  Tap. The block drops instantly.
Phase 3  Overlap O between the block and the top of the tower:
           O <= 0.05  -> missed entirely, tower collapses, run ends
           O >  0     -> block is placed; the overhang is sliced off and falls
Phase 4  Judgement on |offset| from dead centre:
           < 0.130  PERFECT  keep width, combo +1, regrow +0.16 every 3rd
           < 0.420  GREAT    combo +1, but the tower still narrows
           else     HIT      combo resets, tower narrows
Phase 5  W = O. Next block has width W. If W <= 0.42 the run ends.
```

### Tuning constants (validated, not guessed)

| Constant | Value | Why |
|---|---|---|
| `BASE_W` | 4.20 | ~13 perfect-placement error budget at spawn |
| `MIN_W` | 0.42 | Roughly the size of the perfect window — below this the game is over |
| `PERFECT` | 0.130 | 6.5% of a new block. Expert players hit it ~60% of the time |
| `GREAT` | 0.420 | **Graded success** — CHI '24 identifies graded success as a precondition of positive low-level UX. Without this tier, the perfect window is a binary cliff |
| `REGROW` | 0.16 | Every 3rd consecutive perfect. +3.8% width — a real reward, never a rescue |
| `SPEED_0` → `SPEED_MAX` | 2.05 → 6.60 | +0.055/block. This is the entire difficulty ramp |
| `HITSTOP` | 0.055s / 0.095s perfect | Research: 40–80ms "sells weight better than any animation" |
| `BIOME_EVERY` | 11 | ~30–60s of play between worlds |

---

## 5. Measured difficulty curve

Not a guess. The headless harness plays the game with a **human timing model** — Gaussian error in *milliseconds*, redrawn per stack — which converts to larger spatial error as the tower accelerates. 7 runs per tier:

| Player | Timing precision | Median score | Best | Worst | Longest run |
|---|---|---|---|---|---|
| Expert | 25 ms | **75** | 91 | 65 | 45 s |
| Good | 45 ms | **44** | 49 | 34 | 34 s |
| Average | 70 ms | **30** | 35 | 23 | 26 s |
| Casual | 110 ms | **19** | 22 | 15 | 18 s |
| Beginner | 180 ms | **10** | 15 | 9 | 11 s |

**What this curve says:**
- **Monotonic, no cliffs.** Each tier is cleanly separated — a 7.5× skill expression from beginner to expert.
- **Beginner runs last 11 seconds.** That is the hook: short enough that the retry decision costs nothing, which is exactly the "easy to fail, easy to restart" property that produces the *one more try* state.
- **Expert runs last 45 seconds and always end.** There is a ceiling — no infinite run, so the loop always returns you to the start.
- **Typical session = 3–5 runs = ~90 seconds.** Immediately replayable, easy to justify.

> The bot that first validated this used *fixed spatial* error and reported that a 180ms-error player scored 407. That was a modelling failure, not a tuning failure — and it would have produced exactly the wrong tuning decisions. Worth remembering: **validate against the right model or the numbers are worse than no numbers.**

---

## 6. Audio design

Fully procedural — zero audio assets, zero download weight, no asset pipeline.

- **The scale:** each biome owns a 5-note pentatonic scale and a root frequency. Block *n* plays note *n* of the scale, climbing an octave each time through. **A clean run is a rising melody.**
- **PERFECT** plays the root plus the perfect fifth and the octave — a chord. **GREAT** plays the fifth only. **HIT** plays a bare note. You can hear how well you are doing with your eyes closed.
- **Combo shimmer:** a high oscillator tuned to `base × 3 × 1.06^combo`, so the pitch of the shimmer rises with the streak — an audible representation of progress (§2.2: anticipation, not receipt).
- **Biome transition:** an ascending four-note chord sequence plus a swapping ambient pad. This is the payoff for climbing: the *music itself* opens up as you go higher.
- **Failure:** a descending five-note figure resolving down an octave. Loss is *heard* as falling.
- **Room:** a short feedback-delay reverb (0.17s, 28% feedback into a lowpass) gives everything a sense of space without an impulse response asset.
- **The thud:** white noise with a steep exponential decay through a lowpass — 700Hz on perfect (crisp), 400Hz on a hit (dull). The cleaner the landing, the tighter the sound.

## 7. Visual & juice design

Isometric, flat-shaded, procedural. No sprites, no texture files — an entire game rendered from geometry and gradients.

- **Six biomes**, each a three-stop sky gradient, an accent colour, a dust-mote colour, and a name: DAWN → AURORA → NEBULA → STRATOS → VOID → ZENITH. After six, the cycle repeats **brighter, faster and pitched 6% higher** — the game has no visible ceiling.
- **Isometric shading:** three tone-shifted faces per block (top lightest, front mid, side darkest) so a flat rectangle reads as a solid object.
- **Height darkening:** blocks fade by 1.4 per level, so the tower's own history is visible as a gradient.
- **Juice inventory:** hit-stop, shake **scaled to event weight** (4.5 hit / 7 great / 13 perfect), particles erupted **along the strike vector** per the research guidance, expanding shockwave rings on perfect, squash-and-stretch on landing, floating score pops with staggered fade, a motion trail on the sweeping block, a pulse on the active block, and a screen flash scaled to the event.
- **`prefers-reduced-motion` is respected**: shake/flash amplitudes drop to 22%, particle counts drop, rings are disabled. The research is explicit that constant shake and flashing cause motion sickness and that this must be respected — juice serves clarity first, spectacle second.

## 8. The compulsion loop, built on skill

The literature describes compulsion as: establish a rewarding baseline → **degrade the player's efficiency** → offer a clear path back to baseline. Without a visible path back, the frustration becomes churn.

ZENITH implements exactly this, with one deliberate inversion:

| Stage | Standard dark pattern | ZENITH |
|---|---|---|
| Baseline | Tower wide, everything flows | Same |
| Degradation | Width erodes with every mistake | Same |
| Path back | **Pay, wait, or watch an ad** | **Three consecutive perfect placements** |

The player's tool degrades and the way to restore it is *getting good*. It is the same psychological shape — baseline, dip, recovery — with the recovery gated by skill instead of by money. This is the direct application of the research's own synthesis: use the compulsion structure, keep the exit earned.

Additionally, per the withdrawal-driven compulsion model, efficiency degradation is **always paired with an immediate, legible explanation** ("PERFECT" / "GREAT" / a slice sound), so the player is never in the frustrating state of having lost efficiency without understanding how to restore it.

## 9. What is deliberately NOT in this build

Not omissions — decisions with reasons:

| Excluded | Reason |
|---|---|
| **Paid loot boxes / gacha** | Banned in Belgium and the Netherlands, restricted in Brazil and Australia, and the proposed EU Digital Fairness Act would impose spending caps and cooling-off periods. Highest regulatory risk in the medium, for the least design value |
| **Streak that resets to zero** | Strict all-or-nothing counters produce a predictable cycle: 2–3 weeks of high engagement → one missed day → total disengagement. The habit was built on pressure, and when the pressure breaks it takes the reason to play with it |
| **Interstitial ads at launch** | Practitioner consensus: the first ad belongs after 2–3 sessions. Rewarded ads must be opt-in |
| **Energy/timer systems** | Artificial friction. The research is clear that it burns long-term retention for short-term revenue |
| **Leaderboards (for now)** | Deferred until there is a population. The reset-vs-perpetual finding (91.2% vs 11.3% next-day return for winners) means this needs designing, not defaulting |

## 10. Measurement plan — instrument before building the meta layer

The prototype currently records: `best`, `bestCombo`, `stacks`, `runs`, `seen` (biomes), `streak`. Before the meta layer is worth building, add:

| Event | Why |
|---|---|
| `session_start` / `session_end` | Run cadence, session length |
| `run_start` → first `block_land` | **Time-to-first-interaction** — must be < 3s |
| `run_end` with `{score, perfects, bestCombo, biome, duration}` | The whole balance picture |
| `biome_enter` | Where curiosity is rewarded and where it stalls |
| `retry` latency after `run_end` | **The single best signal that the core loop is compelling.** Fast retries = the loop works |
| `tutorial_skip` | (n/a — there is no tutorial; that's the point) |
| Runs per session | The "one more try" measurement |
| D1 / D7 / D30 by cohort | Against the benchmarks: median 22% / <4% / <1%, good is 35/15/5 |

**The metric to watch above all others: median time from `run_end` to the next `run_start`.** If it trends under a few seconds, the loop is doing its job. If it climbs, something upstream is wrong.

## 11. Roadmap

| Milestone | Contents |
|---|---|
| **M1 — core loop** ✅ | Precision mechanic, difficulty ramp, juice, procedural score, biomes, persistence, mobile hardening. Validated by 16 automated tests |
| **M2 — instrument** | Analytics events above. Soft-launch measurement before any meta system |
| **M3 — meta loop** | Perpetual (non-resetting) leaderboard, daily challenge with a distinct modifier, block-skin collection unlocked by biome discovery |
| **M4 — habit layer** | Daily streak **with a freeze/repair mechanism**, behaviourable notifications keyed to a personal risk time, first-session social hook |
| **M5 — Android** | Capacitor wrap → signed AAB. Haptics on land/slice (Android is far better at this than iOS — a real differentiator). Play Store listing with the generated icon |
| **M6 — monetisation (last)** | Rewarded ads opt-in after session 2–3 with frequency caps. Cosmetic-only IAP. No loot boxes, ever |

**Ship order is deliberate:** a retention curve that works is worth more than any monetisation feature, and monetising a leaky curve just extracts more from a shrinking pool.

## 12. Ethical lines held in this build

1. **No unrecoverable loss.** Width regeneration exists and is earned through play.
2. **No hidden odds.** There is no randomness in the reward path at all — outcomes are fully deterministic on timing.
3. **No scarcity pressure aimed at minors.** No timers, no FOMO events.
4. **Reduced-motion respected.** Accessibility is not optional.
5. **The honest test:** remove all the juice and the score and the biomes — is there still a reason to press the button? If the answer is yes, the core loop is real. That test is why the mechanic was chosen before anything was built on top of it.
