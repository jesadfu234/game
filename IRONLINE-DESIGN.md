# IRONLINE — Design Document

**Platform:** Android (web → Capacitor) · **Genre:** real-time lane strategy · **Sessions:** 1–3 min

> A block of your units spawns at your core. They walk right. Their units walk left.
> Where the lines meet, a fight happens. Manage elixir, break their counters,
> and put something through the gap into their core.

---

## 1. What this is, and what it is not

You asked for something like Far Cry or Clash Royale. Let me be precise about the gap, because it matters for what you do next.

| | Far Cry 6 | Clash Royale | IRONLINE |
|---|---|---|---|
| Build cost | ~4 years, 400+ staff | years, live-ops team, backend | one file, no assets |
| Needs servers | no | **yes** — matchmaking, netcode, anti-cheat | **no** — single-player vs AI |
| Art | thousands of hand-made assets | hundreds of animated 3D models | fully procedural |
| Core loop | explore / shoot / upgrade | 1v1 real-time card battle | **1v1 real-time card battle vs AI** |

Far Cry is not a thing anyone can produce in a chat window. But Clash Royale's *addiction* does not come from its servers or its art — it comes from a specific machine, and **that machine is buildable**:

> A hand of cards, a regenerating resource, units that hard-counter each other, a battle line that swings back and forth, and a persistent roster you upgrade between matches.

That is IRONLINE. It is the real thing, at a scale one person can actually ship.

---

## 2. The core loop

```
   ┌─── elixir regenerates (1 per 2.7s, doubling in the last 65s) ───┐
   │                                                                 │
   ▼                                                                 │
 pick a card from a 4-card cycling hand ──▶ tap the field to deploy  │
   │                                                                 │
   ▼                                                                 │
 your units walk right, theirs walk left ──▶ they meet and fight      │
   │                                                                 │
   ▼                                                                 │
 someone's line breaks ──▶ units hit the core ──▶ core falls ────────┘
                                                    (or the timer runs out)
```

Each match is a **resource-allocation problem under time pressure**: you cannot play everything, so every deployment is a bet on what they will do next.

---

## 3. The unit roster and the counter web

Ten units. Every one has a job, and every one has an answer.

| Unit | Cost | HP | DPS | Range | Speed | Job |
|---|---|---|---|---|---|---|
| **Runner** | 1 | 115 | 26 | 26 | 108 | Cheapest body, fastest. Punishes artillery. |
| **Rifleman** | 2 | 215 | 28 | 118 | 52 | Reliable line infantry. |
| **Bulwark** | 3 | 640 | 26 | 26 | 34 | Absorbs everything. |
| **Drones** ×3 | 3 | 72 ea | 81 | 22 | 92 | Three bodies. Suffocates single-target shooters. |
| **Grenadier** | 3 | 195 | 29 | 80 | 48 | Arcing splash. Deletes swarms. |
| **Marksman** | 4 | 155 | 52 | 238 | 40 | Outranges everything. Fragile. |
| **Medic** | 3 | 175 | heal 36 | 96 | 56 | Sustains a push. Useless alone. |
| **Juggernaut** | 6 | 1300 | 70 | 32 | 26 | Endgame wall. Slow enough to kite. |
| **Mortar** | 5 | 245 | 56 splash | 340 / **min 104** | 19 | Huge range and splash — but a minimum range. |
| **Airstrike** | 4 | — | 180 splash | anywhere | — | No body. Called onto a cluster. |

### The counter web

```
        Drones ──────beat──────▶ Marksman        (3 bodies, single-target shooter)
           │
        Grenadier ────beat──────▶ Drones         (splash clears all three)
           │
        Bulwark ──────beat──────▶ Drones, Runner (too much HP to chew through)
           │
        Marksman ─────beat──────▶ Bulwark        (out-ranges it, never gets hit)
           │
        Mortar ───────beat──────▶ everything     (340 range, huge splash)
           │
        Runner ───────beat──────▶ Mortar         (min range 104 — get inside it)
```

**The Mortar's minimum range is the most important number in the game.** Without it, artillery would be strictly best and the game would collapse into "who plays Mortar first". With it, every artillery deployment creates a weak point you can punish with a 1-elixir Runner — which is what makes the cheap cards matter, and what makes the game a game rather than a stat check.

The counter matrix is enforced by an automated test (`test-harness.js`), so a future balance change cannot silently break it.

---

## 4. The three nested loops

| Loop | In IRONLINE | Timescale |
|---|---|---|
| **Core** | Deploy → fight → line breaks → core falls | 60–150 seconds |
| **Progression** | Win → gold + a new unit unlock → 12-mission campaign | One mission |
| **Meta** | Spend gold on unit levels (5 tiers, +13% HP/dmg each) · build your deck · lifetime stats | Days–weeks |

The meta loop matters because of a measured result: **games with only one loop die at Day 30.** The upgrade ladder is the reason mission 12 exists after you have beaten mission 1.

---

## 5. Measured balance (not guessed)

The harness plays real matches headlessly with a competent bot: it reads the enemy board, scores every card in hand by how well it answers the current threat, manages elixir, and commits harder when ahead on resources. Five runs per mission, all with a level-1 roster:

| Mission | Bot win rate | Core kills | Avg length |
|---|---|---|---|
| 1. First Contact | 5/5 | 3 | 123s |
| 2. The Line | 4/5 | 0 | 152s |
| 3. Swarm Doctrine | 5/5 | 2 | 132s |
| 4. Long Sight | 2/5 | 0 | 108s |
| 5. Siege Pattern | 1/5 | 0 | 113s |
| 6. Field Hospital | 1/5 | 0 | 113s |
| 7. The Anvil | 0/5 | 0 | 93s |
| 8. Black Sky | 5/5 | 5 | 84s |
| 9. Cold Equation | 1/5 | 0 | 81s |
| 10. Overwhelm | 3/5 | 0 | 146s |
| 11. The Gauntlet | 0/5 | 0 | 81s |
| 12. IRONLINE | 0/5 | 0 | 58s |

**First third 80% · final third 20%.** The campaign is beatable but genuinely resists — and the bot is running a **level-1 roster**, so the endgame is where your upgrade investment converts into wins. That is the intended design, and the numbers confirm it.

Globally: **72% of matches end before the timer** (a decisive core break rather than a chip-damage tiebreak), and the player breaks the core in 17% of them. In the losses, the AI breaks yours — which counts as decisive too.

### Four bugs the harness caught that I would not have found by playing

1. **Missions with small decks crashed the game.** Mission 1 has a 2-card enemy deck, but the hand holds 4. The queue drained, hand slots became `undefined`, and the AI threw on `U[undefined].cost`. Fixed by padding the cycle queue.
2. **The parallax background flew off screen.** It multiplied an unbounded scroll value, so after ~30 seconds of play every silhouette was kilometres away.
3. **`resize()` was never called at boot** — the entire layout was empty until the first window resize event.
4. **The auto-built deck had no anti-tank card.** It filled roles with "any ranged unit", never included a Marksman, and every shield/sniper/mech mission became an artificial wall — missions 4–7 were failing for a *deck construction* reason, not a difficulty reason. This one was invisible from the win-rate table alone; it only surfaced by reading the role-coverage code against the failing missions.

### One metric I got wrong

My first "is the game decisive?" test only counted **player** core kills, and reported 18% — which read as a stalemate problem. It wasn't. A match you *lose* by having your own core broken is just as decisive as one you win. Counting all matches that ended before the timer gave 72%. **The game was fine; the measurement was wrong.** Worth remembering the next time a dashboard tells you something is broken.

---

## 6. Visual design — procedural, zero assets

The whole game is geometry and gradients. No sprite sheets, no image files, no download weight.

- **Units are drawn from primitives with deliberately distinct silhouettes** so a battlefield stays readable at phone scale: the Marksman is tall and thin with a barrel three times its body width; the Juggernaut is a wide block with lit legs; the Drones are spinning diamonds; the Mortar is a wedge with a rotating tube. You should be able to identify any unit at a glance without reading a label.
- **Seven battlefield themes** (dawn, day, storm, dusk, night, ash, gold), each with a three-stop sky, three parallax silhouette layers, ground colour, fog tint, and its own weather — rain, snow, or drifting ash.
- **Damage state is conveyed by the base itself:** windows go dark in rows as HP drops, cracks appear below 66%, and smoke begins venting below 33%.
- **Every hit has feedback scaled to its weight**: melee sparks along the strike vector, muzzle flashes, arcing shells for the Mortar and Grenadier with visible trails, expanding blast gradients for the Airstrike, white damage numbers, green heal numbers.
- **Health bars are colour-coded by side and by urgency** — green → amber → red — so you read the state of a fight from the corner of your eye.
- **`prefers-reduced-motion` is respected** throughout: particle counts roughly halve, base smoke is disabled, weather is not spawned.

## 7. Audio — also zero assets

Everything is synthesised at runtime.

- **Unit classes have distinct voices**: light melee is a short filtered noise burst with a square-wave body; heavy melee adds a low saw; ranged shots are short noise at 2600Hz; artillery and airstrikes get a long 260Hz noise tail plus a sub-bass sweep.
- **Rate limiting** prevents 20 units fighting at once from producing a wall of noise — each sound class has a minimum re-trigger gap (45ms for shots, 90ms for heavies).
- **Victory and defeat are cached as musical figures**: victory is an ascending major pentatonic run, defeat is a descending one an octave down. Same five notes, opposite direction — you know the outcome before you read the word.
- A short feedback-delay reverb bus gives everything space without an impulse-response file.

## 8. What is deliberately NOT in this build

| Excluded | Reason |
|---|---|
| **Paid loot boxes / card packs** | Banned in Belgium and the Netherlands, restricted in Brazil and Australia, and the proposed EU Digital Fairness Act would impose spending caps and cooling-off periods. Highest regulatory risk, least design value |
| **Card upgrade timers** | The classic dark pattern of this exact genre. It monetises impatience, produces the documented "high engagement then total disengagement" collapse, and adds nothing to the strategy |
| **Zero-reset daily streaks** | Strict counters produce a predictable cycle: 2–3 weeks of engagement, one missed day, permanent quit |
| **Energy systems** | Pure artificial friction |
| **Real-money card levels** | Progression is earned with gold from winning, full stop |

**What is in:** a real skill ceiling, a real counter web, real deck-building agency, and progression that is bought with play.

## 9. Roadmap — what would make this a shippable product

| Milestone | Contents |
|---|---|
| **M1 — playable game** ✅ | 10 units, counter web, AI opponent, 12-mission campaign, deck building, upgrade ladder, procedural art and audio, 18 automated tests |
| **M2 — instrument** | Analytics: match length, win rate by mission, deck composition, retry latency. You cannot balance a live game without this |
| **M3 — meta depth** | Perpetual (non-resetting) ladder · daily challenge with a modifier · unit skins unlocked by mission stars |
| **M4 — real opponents** | **This is the big one.** PvP is what makes Clash Royale live for years. It needs a server, matchmaking, and netcode — genuinely a separate project |
| **M5 — Android** | Capacitor wrap → signed AAB · haptics on deploy and core damage (Android is far better at this than iOS) · Play Store listing |
| **M6 — monetisation, last** | Cosmetic-only IAP · opt-in rewarded ads after match 3 with frequency caps. No card packs, ever |

## 10. Ethical lines held

1. **No randomness in the reward path.** You get gold for winning, and gold buys upgrades. No packs, no odds, nothing hidden.
2. **No time-gating on fun.** You can play as many matches as you want, forever, for free.
3. **Accessibility respected** — reduced-motion is honoured, and every unit is distinguishable by silhouette, not colour alone.
4. **The honest test, applied before anything was built on top:** is the core fight interesting with no gold, no unlocks and no progression? If you removed the campaign tomorrow, would the match still be worth playing? That is why the counter web was designed and validated before the meta layer was added.
