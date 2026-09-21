# IRONLINE

A real-time lane war game for Android. Research-first: every design decision traces
to published retention or behavioural data rather than intuition.

**Play it:** open [`index.html`](index.html) for the launcher, or go straight to
[`ironline/index.html`](ironline/index.html).

---

> Deploy units from a cycling hand. Manage a regenerating resource. Break their
> counters. Push a battle line into the enemy core.
> **10 units · 6 hard counters · 12 missions · deck building · an upgrade ladder.**

Sessions run 1–3 minutes. No servers, no accounts, no downloads.

## Contents

| Path | What it is |
|---|---|
| [`ironline/index.html`](ironline/index.html) | **The main game.** Self-contained, no dependencies, no asset files — open it in any browser or on any phone |
| [`IRONLINE-DESIGN.md`](IRONLINE-DESIGN.md) | Design doc: core loop, unit counter web, measured balance, roadmap, ethical boundaries |
| [`ironline/test-harness.js`](ironline/test-harness.js) | 18 automated tests, including a bot that plays real matches to measure balance |
| [`zenith/index.html`](zenith/index.html) | ZENITH — a one-button precision arcade game, also complete and playable |
| [`GAME-DESIGN.md`](GAME-DESIGN.md) | ZENITH design doc |
| [`RESEARCH-addictive-design.md`](RESEARCH-addictive-design.md) | The evidence base behind both games |
| [`prototype/index.html`](prototype/index.html) | RIFT — the original timing-loop proof, kept for reference |
| [`assets/icon.png`](assets/icon.png) | Launcher icon |
| `setup-remote.sh` | Re-attaches this workspace to GitHub (snapshots drop `.git/config`) |

## Run the tests

```bash
cd ironline && node test-harness.js
```

Stubs canvas, audio and DOM, then boots the game and **plays real battles with a bot**
that reads the enemy board and picks counters. It verifies crash-freedom, then
measures the difficulty curve, the decisive-ending rate, and the unit counter matrix.

## The counter web

```
  Drones ──beat──▶ Marksman     │  Bulwark ──beat──▶ Drones / Runner
  Grenadier ─beat─▶ Drones      │  Marksman ─beat──▶ Bulwark
  Mortar ───beat──▶ everything  │  Runner ───beat──▶ Mortar  (min range 104)
```

The Mortar's **minimum range** is the most important number in the game — it is what
stops artillery being strictly best, and what makes a 1-elixir Runner matter.

## Measured balance

A bot with a **level-1 roster** wins the first third of the campaign 80% of the time
and the final third 20% of the time. Endgame missions are where your upgrade
investment converts into wins — that is the intended design.

**72% of matches end before the timer** (a decisive core break, not a chip-damage
tiebreak).

Four bugs the harness caught that playing would not have found — most notably an
auto-built deck with **no anti-tank card**, which turned missions 4–7 into an
artificial wall. Details in [`IRONLINE-DESIGN.md`](IRONLINE-DESIGN.md) §5.

## Design summary

The six levers, ranked by evidence:

1. **First 60 seconds** — core fun before any tutorial. Players who reach the core
   loop in session 1 retain to D2 at 4× the rate of those who don't.
2. **Curiosity beats juice** — CHI '24 (n=1,699) found curiosity, not reward or
   feedback, is the dominant predictor of enjoyment.
3. **Variable reward** — unpredictable timing and size of payoff.
4. **Graded success** — three judgement tiers, so the perfect play isn't binary.
5. **Three nested loops** — core (seconds) / progression (match) / meta (days).
6. **Social connection in the first 72 hours** — one in-game friendship by Day 5 → 3× D30.

Benchmarks to beat: median mobile D1 is **22%**, D7 under **4%**, D30 under **1%**.
A realistic *good* target is **35/15/5**.

## Roadmap

- [x] **M1** 10 units, counter web, AI opponent, 12 missions, deck building, upgrade ladder, 18 tests
- [ ] **M2** Instrument: analytics events, then balance from data
- [ ] **M3** Meta depth: perpetual ladder, daily challenge, unit skins
- [ ] **M4** **Real opponents** — PvP needs a server, matchmaking and netcode. A separate project
- [ ] **M5** Android: Capacitor wrap → signed AAB, haptics, Play Store listing
- [ ] **M6** Monetisation **last**: cosmetics only. No card packs, ever

## Legal note

Paid randomised rewards are banned in Belgium and the Netherlands, restricted in
Brazil and Australia, and the proposed EU Digital Fairness Act would add odds
disclosure, spending caps and cooling-off periods. **No card packs or loot boxes
will be added to this game.**
