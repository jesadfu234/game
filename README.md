# ZENITH

An Android precision-arcade game. Research-first: every design decision traces to
published retention or behavioural data rather than intuition.

**Play it:** open [`index.html`](index.html) for the launcher, or go straight to
[`zenith/index.html`](zenith/index.html).

---

> A block sweeps above your tower. Tap to drop it. What hangs over the edge is
> sliced off. Land it dead centre and the tower widens back.
> **Every block you land is a note. Every biome is a new key.**

One input. No tutorial. Runs last 11–48 seconds.

## Contents

| Path | What it is |
|---|---|
| [`zenith/index.html`](zenith/index.html) | **The game.** Self-contained, no dependencies, no assets — open it in any browser or on any phone |
| [`GAME-DESIGN.md`](GAME-DESIGN.md) | The design document: mechanic spec, measured difficulty curve, audio and juice design, roadmap, ethical boundaries |
| [`RESEARCH-addictive-design.md`](RESEARCH-addictive-design.md) | The evidence base: retention benchmarks, behavioural science, the mechanic stack, the legal landscape |
| [`zenith/test-harness.js`](zenith/test-harness.js) | Headless test suite — 16 tests including a human-timing-model balance simulation |
| [`prototype/index.html`](prototype/index.html) | RIFT — the first core-loop proof, a bare timing bar |
| [`assets/icon.png`](assets/icon.png) | Launcher icon |
| `setup-remote.sh` | Re-attaches this workspace to GitHub (snapshots drop `.git/config`) |

## Run the tests

```bash
cd zenith && node test-harness.js
```

Stubs canvas, audio and DOM, then drives the game headlessly: crash tests, long
sessions, extreme viewports, frame stalls, and a five-tier skill simulation that
verifies the difficulty curve is monotonic and that no skill tier hits a dead end.

## Measured balance

Tuned against a bot with **human timing error** (Gaussian, in milliseconds, redrawn
per stack) — so error grows as the tower accelerates. 7 runs per tier:

| Player | Precision | Median | Run length |
|---|---|---|---|
| Expert | 25 ms | 75 | 45 s |
| Good | 45 ms | 44 | 34 s |
| Average | 70 ms | 30 | 26 s |
| Casual | 110 ms | 19 | 18 s |
| Beginner | 180 ms | 10 | 11 s |

Monotonic, no cliffs, and every tier ends — no infinite run.

## Design summary

The six levers, ranked by evidence:

1. **First 60 seconds** — core fun before any tutorial. Players who reach the core
   loop in session 1 retain to D2 at 4× the rate of those who don't.
2. **Curiosity beats juice** — CHI '24 (n=1,699) found curiosity, not reward or
   feedback, is the dominant predictor of enjoyment. Hence biomes.
3. **Variable reward** — unpredictable timing and size of payoff.
4. **Graded success** — three judgement tiers, so the perfect window isn't a binary cliff.
5. **Three nested loops** — core (seconds) / progression (run) / meta (days).
6. **Social connection in the first 72 hours** — one in-game friendship by Day 5 → 3× D30.

Benchmarks to beat: median mobile D1 is **22%**, D7 under **4%**, D30 under **1%**.
A realistic *good* target is **35/15/5**.

## The compulsion loop, built on skill

The literature: establish a baseline → degrade the player's efficiency → show a clear
path back. Without a path back, frustration becomes churn.

ZENITH implements that shape with one deliberate inversion — **the way to restore your
tool is three consecutive perfect placements, not a payment.** Same psychological
structure; the recovery is gated by skill instead of money.

## Roadmap

- [x] **M1** Core loop, difficulty ramp, juice, procedural score, biomes, persistence, mobile hardening
- [ ] **M2** Instrument: analytics events, soft-launch measurement
- [ ] **M3** Meta loop: perpetual leaderboard, daily challenge, block-skin collection
- [ ] **M4** Habit layer: streak **with freeze/repair**, behaviourable notifications, social hook
- [ ] **M5** Android: Capacitor wrap → signed AAB, haptics, Play Store listing
- [ ] **M6** Monetisation **last**: opt-in rewarded ads, cosmetic IAP only

Ship order is deliberate — monetising a leaky retention curve just extracts more
from a shrinking pool.

## Legal note

Paid randomised rewards are banned in Belgium and the Netherlands, restricted in
Brazil and Australia, and the proposed EU Digital Fairness Act would add odds
disclosure, spending caps and cooling-off periods. See §10 of the research doc.
**No loot boxes will be added to this game.**
