# The Evidence Base for Compelling Mobile Game Design

**Compiled:** September 2026 · For: `jesadfu234/game` (Android)
**Scope:** what the measured data actually says about why players return, stay, and keep playing.

> **A note on framing before we start.** You asked for "extremely addictive." What follows is the real, published research on engagement — the same body of work used by every top-grossing studio. Section 10 covers where compelling design turns into exploitation, and why that line now carries concrete legal and platform risk. Read it as a design constraint, not a lecture: the most regulated mechanics are also the ones that get your app removed.

---

## 1. Executive Summary — The Six Levers That Actually Move Numbers

Ranked by evidence strength and impact per unit of effort:

| # | Lever | Primary metric | Evidence |
|---|---|---|---|
| 1 | **First 60 seconds** — core fun before any tutorial | D1 | Players reaching the core loop in session 1 retain to D2 at **4×** the rate of those who don't |
| 2 | **The streak** — consecutive-day counter with loss aversion | DAU, D7 | **+20–40% DAU**; 7-day streak is the strongest known predictor of long-term retention |
| 3 | **Three nested loops** — core / progression / meta | D30 | Single-loop games die at Day 30; no meta loop = no reason to exist past the content |
| 4 | **Variable reward** — unpredictable payoff timing and size | Session count | Variable-ratio is the strongest reinforcement schedule in behavioural psychology |
| 5 | **Social connection in first 72h** | D30 | One in-game friendship by Day 5 → **3× D30 retention** |
| 6 | **Time-to-first-reward** in every session | Session length | End sessions on unfinished business, not a completed arc |

**The brutal baseline you're designing against** (GameAnalytics 2025 — 11,600 games, 1.48bn MAU):

| Metric | Median (P50) | Top 25% | Top 1% |
|---|---|---|---|
| D1 | **22%** | 25–27% Android / 31–33% iOS | 45–50%+ |
| D7 | **<4%** | 7–8% | 25–28% |
| D30 | **0.68–0.79%** | — | 13–16% |

Three-quarters of games never get 3% of players to Day 28. A realistic *good* target is **D1/D7/D30 = 35/15/5**. Top-grossing match-3 runs 47/24/13.

---

## 2. The Core Science

### 2.1 Variable-ratio reinforcement

B.F. Skinner's central finding: behaviour reinforced on an **unpredictable** schedule persists far longer than behaviour reinforced consistently. A player who knows an action yields 10 coins does it when they need 10 coins. A player who *might* get something does it compulsively.

This is the schedule that makes slot machines work, and it is the single most powerful engagement mechanism available to a game designer.

### 2.2 Dopamine fires on *anticipation*, not receipt

The critical and widely-misunderstood detail: dopaminergic response peaks **before** the outcome is revealed — during the chest-opening animation, the spin, the card flip. The reward itself is comparatively flat.

**Design consequence:** the *ceremony* around a reward matters more than the reward. A 1.5-second tension beat before revealing an outcome produces more engagement than simply increasing the payout. Never resolve a variable reward instantly.

### 2.3 Reward *variability* as a prerequisite for compulsion

Zack et al. (*Addictive Behaviors*, 2023) — "Engineered highs" — argue that **reward variability itself**, combined with high delivery frequency, is what confers drug-like addictive potential on non-drug rewards. Their comparison table:

| Activity | Sources of variability |
|---|---|
| Gambling | Variable-ratio payout, variable payout size, bonus games, variable spin duration |
| Videogames | Difficulty-adjusted intermittent rewards, **concurrent schedules**, leaderboards, competing against similar-skill opponents, multiple prize variants |
| Social media | Infinite scroll, personalised feed, likes/follows |

The videogame insight is important: as skill rises, reward variability *would* fall — except that games raise difficulty in step, maintaining the uncertainty indefinitely. **Difficulty curves are retention infrastructure, not just challenge design.**

Their conclusion: *"both variability and frequency likely contribute to the addictive potential of a non-drug reinforcer."* Frequency matters — this is an argument for short, repeatable loops over long, sparse ones.

### 2.4 The compulsion loop is withdrawal-driven

The most useful design framing in the literature (GameAnalytics): compulsion is achieved by establishing a **baseline** of rewarding performance, then letting the player's efficiency **degrade**, then offering a clear path back to baseline.

The dip lowers reward frequency → negative mood → motivation to restore the reward schedule → if a solution is visible, strong engagement emerges; **if no solution is visible, frustration becomes churn.**

> **Design rule:** never let the player's efficiency drop without an obvious, reachable way to restore it. The loop needs a visible exit or it becomes a quit.

### 2.5 Flow

Csikszentmihalyi's flow state — the "zone" — requires challenge tracking skill closely. Too easy → boredom. Too hard → anxiety. Neither produces the dissociative absorption that characterises heavy play. This is why dynamic difficulty adjustment isn't optional in a casual game.

### 2.6 The Hook Model (Eyal)

**Trigger → Action → Variable Reward → Investment.** The last step is the one most games neglect: every session should end with a small investment (resources spent, a build queued, a level banked) that creates anticipation for the next return. Investment converts a player from a consumer into someone with something to lose.

---

## 3. Retention Benchmarks by Genre

From cross-platform 2025–2026 aggregate data:

| Genre | D1 | D7 | D30 |
|---|---|---|---|
| Match | 32.65% | 13.98% | 7.15% |
| Puzzle | 31.85% | 12.18% | 5.35% |
| Tabletop | 31.30% | — | 5.51% |
| RPG | 30.54% | 9.85% | 3.48% |
| Simulation | 30.10% | 8.71% | 2.96% |
| Action | 29.77% | — | 2.14% |
| **Hyper-casual** | **29.31%** | **5.90%** | **1.38%** |
| Casino (social) | 28.16% | 9.85% | 4.10% |
| Strategy | 25.39% | 8.06% | 3.12% |

**The D7→D30 slope is the most diagnostic number in this table.** Hyper-casual loses two-thirds of its D7 players by D30 (12% → 4% in some cuts). Match/puzzle loses well under half. Two games can share a D1 and diverge enormously by D30 — because one curve keeps falling and the other flattens.

**A flattening curve requires a meta layer.** There is no exception to this in the data.

---

## 4. Onboarding — Where Most Games Die

The first session is not onboarding. It is the product pitch.

| Rule | Evidence |
|---|---|
| Core gameplay within **60 seconds** | Industry standard; time-to-first-fun >90s loses a significant share of users before session 2 |
| First-run tutorial **≤2 steps**, skippable | Forcing basics on genre veterans is a churn trigger, not protection |
| No account creation, permissions, or settings before first play | Defer all of it |
| Every second of non-gameplay in the first 5 min costs **2–3%** of the cohort | A 15-second mandatory cutscene ≈ **5% of all new players** |
| First-session completion rate **<60%** = critical upstream problem | Fix this before touching any other retention lever |
| Top hyper-casual titles hit **D1 >50%** with tutorials under 30 seconds | Supersonic FTUE research |

**The 4× finding:** players who reach the core fun loop in their first session retain to D2 at **four times** the rate of those who don't. Day 2 retention is the strongest single predictor of long-term retention, and it is almost entirely determined in session one.

**Personalised onboarding** is the clearest current differentiator — routing users down different first-session paths by acquisition source and early behaviour is associated with lifts up to **52% in D30 retention**.

**Match your ad to your first session.** If the creative promised a mechanic, that mechanic must appear in the first 60 seconds. Divergence here defeats any FTUE work.

### First-week hook design, day by day

| Window | Goal | Mechanism |
|---|---|---|
| Day 0–1 | Deliver the promise | Speed to first reward; visible progress bar |
| Day 2 | Create the return habit | Unfinished business; modest escalating daily reward |
| Day 3 | **Break the novelty wall** | Genuinely new content (new zone/mode/mechanic) — not a reskin |
| Day 4–6 | Raise switching cost | Visible accumulated investment; first social connection |
| Day 7 | Reward the commitment | Meaningful exclusive reward, **communicated from day 1** so anticipation pulls through the mid-week valley |

The Day-3 wall is real: novelty is consumed and surface content is exhausted at roughly the 2–3 hour playtime mark. Content gating must land a genuine unlock there.

---

## 5. The Streak — Highest-Impact Single Mechanic

Behavioural economics: losses are felt roughly **2–2.5× more intensely** than equivalent gains. A streak weaponises this directly.

| Finding | Source |
|---|---|
| Well-implemented streaks drive **+20–40% DAU** | Cross-platform gamification data |
| Once a user passes **7 days**, they are **2.3× more likely** to engage daily | Duolingo internal |
| **Streak establishment at 7 days** predicts long-term retention *better than any 30-day metric* | Duolingo internal |
| Duolingo's streak wager → **+14%** day-14 retention | Duolingo internal |
| **Streak Freeze** reduced churn **21%** for at-risk users | Duolingo internal |
| Homescreen streak widget → **+60%** commitment | Duolingo internal |
| Users with 15–30 day streaks show **4×** the daily activity volume of 3–7 day users (1090 vs 265) | Trophy platform data |
| Streak **freeze** raises average streak length from **11.62 → 17.19 days** | Trophy platform data |
| **Social** streaks average **5.69 days** vs 4.25 solo (**+34%**) | Trophy platform data |
| Streaks + milestones together → **40–60% higher DAU** than either alone | Cross-platform |

### Streak design requirements (all three, or it backfires)

1. **Low-friction daily action** — achievable on the user's worst day.
2. **Freeze / repair mechanism** — a strict counter that resets to zero on one miss produces a predictable cycle: 2–3 weeks of high engagement → one missed day → total disengagement. The habit was built on streak pressure, and when the streak breaks the pressure is gone with it.
3. **Milestone rewards at 7 / 30 / 100 / 365** — highest value at the long end.

**Timing intelligence:** streak losses cluster hard by weekday — one large dataset puts **Friday at 25.35%** of all losses (Saturday 19.07%, Monday 7.07%, Sunday 4.83%); another puts **Wednesday** on top. Either way, uniform daily reminders waste the highest-risk window. Send the protective prompt the evening *before* the risk day, and the re-engagement message the day *after* a likely break.

**Design target:** the metric that matters is not 30-day retention. It is **7-day streak establishment rate**.

---

## 6. Session Architecture — Three Nested Loops

Games with only one loop die at Day 30. Design all three explicitly:

| Loop | Timescale | Function | Example |
|---|---|---|---|
| **Core** | 10–90 seconds | Intrinsically fun to repeat — enjoyable *regardless of rewards* | Match, tap, dodge, shoot |
| **Progression** | Days | Gives the core loop direction | Levels, upgrades, unlocks, skill tree |
| **Meta** | Weeks–months | The reason to exist once content is finished | Seasons, collections, ranking, social goals |

**The diagnostic test:** if you cannot immediately name your meta loop — what a player who has *finished* the progression is chasing — you have found your D30 problem. The fix is not more content. It is a reason to continue past the content.

**Single most important warning in this document:** if players perform the core action only to earn rewards, and not because the action itself is satisfying, **the core loop is broken** and no amount of meta progression will repair it. Test this by removing all rewards and observing whether anyone still plays for 60 seconds.

**Difficulty as retention:** progressive levelling drives **35% more time per session** than static structures. But the curve must keep the player near the edge of competence (§2.5) — and per §2.3, a rising difficulty curve is what sustains reward variability as skill grows.

---

## 7. Social — The Largest Under-Used Multiplier

| Finding | Magnitude |
|---|---|
| One in-game friendship by Day 5 → D30 retention | **3×** |
| Socially connected vs solo players | **30–40% better retention** |
| Perpetual leaderboards — winner's next-day return | **91.2%** |
| Repeating/resetting leaderboards — winner's next-day return | **11.3%** |

That last pair is a striking and under-appreciated result. A leaderboard that **resets** every week gives winners a reason to stop (they've won; the board is about to wipe). A **perpetual** board keeps the top player invested in defending position. If you add leaderboards, don't reset them on a schedule that lets the winner coast.

**Onboarding consequence:** the social moment is chronically under-designed. The best time to prompt a guild/friend connection is **between the first win and the end of the first session** — framed as an achievement ("other players want you on their team"), not a feature tour, and never at install.

---

## 8. Push Notifications

Scheduling determines whether notifications help or churn.

- **Match to user state, not to a broadcast schedule.** A streak reminder is valuable Thursday evening to someone on a 15-day streak, and actively harmful Sunday morning to someone who already broke it this week.
- **Respect the weekly risk curve** (§5) — protect before the risk window, re-engage after.
- **Time-zone correctness** — a 3am notification is a wasted slot at best, an uninstall at worst.
- **Segment** by lifecycle state; send different messages to a 2-day user and a 60-day user.
- **The 7–21 day dormant window** is the cheapest re-engagement channel available.
- **Return rewards work:** daily login rewards lift 30-day retention by **19%**.

---

## 9. Monetisation Without Killing Retention

The core tension: aggressive monetisation generates short-term revenue and long-term churn. Progress gated behind payment, offers at every turn, and excessive ad frequency all reliably damage retention.

**Placement guidance from practitioners:**
- **First ad after 2–3 sessions** — not in session one.
- **Rewarded ads optional, never forced.** A rewarded ad the player *chooses* to watch is a positive interaction with a clear exchange; an interstitial is a tax on playing.
- **Frequency caps** to prevent overkill.
- **Soft monetisation at decision points** from roughly day 14, once commitment exists.
- **Battle pass only after commitment** — introduce a small free one first.

**Cadence that works:** seasonal events from day 30+; content cadence and battle pass once a durable cohort exists.

**The sequencing matters more than the ranking:** fix D1 first (first-session speed), then D7 (daily engagement ladder and meta exposure by day 5), then D30 (depth, events, social). Optimising monetisation on a leaky retention curve just extracts more from a shrinking pool.

---

## 10. The Line — Ethics, Regulation, and Why It's a Practical Constraint

You should know where the boundary sits, because crossing it is now an existential business risk alongside the ethical one.

### What is regulated or banned

| Jurisdiction | Status |
|---|---|
| **Belgium, Netherlands** | Paid loot boxes **banned** — classified as illegal gambling |
| **Brazil** | Lei 15.211/25 — loot box sales to under-18s **prohibited from March 2026** |
| **Australia** | Paid loot boxes → minimum **M (15+)**, simulated gambling → **R18+** (since 22 Sep 2024) |
| **Poland** | Draft amendments requiring gambling licences for chance-based purchases |
| **EU** | Parliament committee (32–5) recommends the Digital Fairness Act **ban** loot boxes, in-app currency obfuscation, pay-to-progress and pay-to-win in games likely accessed by minors. Expected provisions: mandatory odds disclosure, **spending caps**, **cooling-off periods**, real-money price display |
| **UK** | Self-regulation under active scrutiny; regulators active on consumer-law grounds |
| **USA** | No federal ban; FTC enforcement — **Epic Games fined $20M**, prohibited from selling loot boxes to under-16s without parental consent, and barred from selling them *only* via virtual currency |

**Platform rules (both stores):** in-flow disclosure of odds for paid random items is already required. Google Play bars gambling ads targeting under-18s and bans simulated gambling in Designed-for-Families apps. Apple guideline 3.1.1 governs paid random items.

**Compliance is not universal — 20% of App Store and 48% of Google Play titles with loot boxes were found non-compliant** with Australian age-rating rules. Being early on compliance is a competitive advantage, not a cost.

### The mechanistic line

Academic work identifies a measurable threshold: the gacha study (MDPI *Information*, 2025) found that **beyond roughly 55 pulls per rare item**, systems shift measurably into gambling-like reinforcement dynamics — chance dominating agency.

### The honest design rule

The research distinguishes two things that are easy to conflate:

- **Compelling** — the player is absorbed because the loop is genuinely satisfying, feedback is immediate, mastery is visible, and there is always a next goal. The player would still play with no rewards at all.
- **Exploitative** — the player continues because stopping costs them something they already own (streak loss, sunk investment, FOMO scarcity) rather than because continuing is enjoyable.

The first is sustainable and is where the best games live. The second works, measurably, in the short term — and correlates with elevated churn, regulatory exposure, review-bombing, and the "high engagement then total disengagement" pattern the streak literature documents.

**The practical synthesis:** use every mechanic in this document with the *compulsion loop built on skill restoration rather than on manufactured loss.* Degrade the player's efficiency, yes — but let the path back be earned through play, not purchased, and never let the loss be unrecoverable.

**Ethical red lines worth holding regardless:** no scarcity pressure on children, no odds-hidden paid randomness, no unresolvable loss states, and always a visible "how do I get this back" answer.

---

## 11. Applied Blueprint — The Stack for Your Game

Concrete ordering for a casual Android title, highest ROI first:

### Phase 1 — Prove the loop (before any systems)
1. **One-button or one-swipe core mechanic.** Understandable in 3 seconds, satisfying to repeat.
2. **Core fun demonstrated within 60 seconds** of app open. No menus, no tutorial wall.
3. **Juice it hard.** Screenshake, particles, escalating audio pitch with combo, hit-stop frames, number popups. Immediate feedback is where "feel" lives — 67% of players report valuing immediate response. This is not polish; it is the product.
4. **Per-run variation.** Randomise target placement, spawn order, or modifier so no two runs are identical — this is §2.3's variability requirement injected at the core-loop level.

### Phase 2 — Give it a spine
5. **Three loops named explicitly** on one page: core (seconds), progression (days), meta (weeks).
6. **Difficulty curve that tracks skill** — dynamic adjustment keeping play near the competence edge.
7. **Weekly progression ladder with a Day-7 anchor** communicated from first launch.

### Phase 3 — Habit layer
8. **Streak counter, prominent on the home screen**, with a freeze/repair mechanism earnable through play.
9. **Escalating daily reward**, modest on day 2, real by day 7.
10. **Behaviourable notifications** on the risk curve, not a broadcast schedule.

### Phase 4 — Depth
11. **Perpetual (non-resetting) leaderboard** plus a social goal structure.
12. **First social prompt between first win and end of first session.**
13. **Seasonal cadence** from day 30+.

### Phase 5 — Monetisation last
14. Rewarded ads after session 2–3, always opt-in. Soft IAP at decision points from ~day 14. Battle pass only once a durable cohort exists.

### Measurement plan — instrument before you build the systems
| Event | Why |
|---|---|
| Time from app open → first interaction | The 60-second rule |
| Time → first reward | Coaching quality |
| Session 1 completion rate | Below 60% = stop and fix |
| Loops completed per session | Is the core loop self-sustaining? |
| Tutorial step drop-off | Locates the exact bottleneck |
| **Session 1 → Session 2 conversion** | The leading indicator of D1 |
| **7-day streak establishment rate** | The best known predictor of long-term retention |
| D1 / D7 / D30 by cohort | Comparison against §3 benchmarks |
| Churn by level | A spike at one level is a difficulty problem, not a retention problem |

---

## 12. Sources

**Benchmarks:** GameAnalytics 2026 Mobile & PC Benchmarks (11,600 games, 1.48bn MAU); Sensor Tower casual/midcore data (Dec 2025); Adjust Mobile App Trends 2026 (100k+ apps); AppsFlyer genre retention.

**Academic:** Zack et al., *Engineered highs: Reward variability and frequency as potential prerequisites of behavioural addiction*, Addictive Behaviors (2023); *Inherent Addiction Mechanisms in Video Games' Gacha*, MDPI Information 16(10):890 (2025) — η≈55 threshold; Kumar & Manohar, *Dopamine Loops and Player Retention*, J. Communication & Management 4 (2025); Skinner, operant conditioning; Csikszentmihalyi, flow theory; Schüll, *Addiction by Design* (2012).

**Practice:** Nir Eyal, *Hooked*; Duolingo internal engagement data; Trophy gamification benchmark platform data; Supersonic FTUE research; GameAnalytics compulsion loop framework.

**Regulation:** Google Play Developer Programme Policy; Apple App Store Review Guidelines 3.1.1; EU Parliament IMCO report on the Digital Fairness Act (2025); Brazil Lei 15.211/25; Australian Classification Board guidelines (Sept 2024); FTC v. Epic Games; *The Conversation*, loot box compliance study (2026).

**Caveat on numbers:** platform benchmark figures vary considerably by methodology and population (GameAnalytics median D1 of 22% vs. other reports of 27% arise from different game samples). Treat absolute values as directional, and your own cohort trends as the primary signal.
