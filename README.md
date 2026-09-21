# game

Android game project. Research-first: the design is derived from published retention and
behavioural data rather than intuition.

## Contents

| Path | What it is |
|---|---|
| [`RESEARCH-addictive-design.md`](RESEARCH-addictive-design.md) | The evidence base — retention benchmarks, the psychology, the mechanic stack, the legal landscape, and an applied blueprint |
| [`prototype/index.html`](prototype/index.html) | Playable core-loop prototype. Self-contained, no dependencies — open it in any browser or on any phone |
| `setup-remote.sh` | Re-attaches this workspace to GitHub (snapshots drop `.git/config`, so this is needed each session) |

## Start here

Open `prototype/index.html`. It demonstrates the core loop, the difficulty ramp, near-miss
feedback, combo escalation, and the juice layer described in §11 of the research doc.

## Design summary

The six levers, ranked by evidence:

1. **First 60 seconds** — core fun before any tutorial. Players who reach the core loop in
   session 1 retain to D2 at 4× the rate of those who don't.
2. **The streak** — +20–40% DAU. 7-day streak establishment is the strongest known predictor
   of long-term retention.
3. **Three nested loops** — core (seconds) / progression (days) / meta (weeks). Single-loop
   games die at Day 30.
4. **Variable reward** — unpredictable timing and size of payoff.
5. **Social connection in the first 72 hours** — one in-game friendship by Day 5 → 3× D30.
6. **Time-to-first-reward every session** — end sessions on unfinished business.

Benchmark to beat: median mobile D1 is **22%**, D7 under **4%**, D30 under **1%**.
A realistic *good* target is D1/D7/D30 = **35/15/5**.

## Next steps

- [ ] Lock the core mechanic and prove it is fun with all rewards removed
- [ ] Name all three loops explicitly in a design doc
- [ ] Instrument the FTUE funnel (time-to-first-interaction, session 1 completion)
- [ ] Define the Day-7 anchor reward and communicate it from first launch
- [ ] Wrap for Android (Capacitor recommended — reuses this exact codebase)

## Legal note

Paid randomised rewards are regulated in Belgium, the Netherlands, Brazil and Australia, and
the proposed EU Digital Fairness Act would add odds disclosure, spending caps and cooling-off
periods. See §10 of the research doc before designing any gacha or loot box mechanic.
