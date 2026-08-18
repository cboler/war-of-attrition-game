# Google Play Games Achievements Manifest

This is the release manifest for all 22 canonical local achievements. Internal IDs are permanent and remain the source of truth; Google Play Games achievement IDs are an external synchronization mapping.

Veteran and Centurion are the only incremental achievements. Campaigner is standard.

| Internal ID | Play name | Condition | Type | Play Games ID |
| --- | --- | --- | --- | --- |
| `war.first_casualty` | First Casualty | Witness the first public card fall to the Boneyard. | Standard | `CgkIz5juh94JEAIQDA` |
| `war.first_battle` | Baptism by Fire | Experience the first Battle. | Standard | `CgkIz5juh94JEAIQEQ` |
| `war.first_win` | First Victory | First resolved player victory. | Standard | `CgkIz5juh94JEAIQEg` |
| `war.first_defeat` | Hard Lesson | First resolved player defeat. | Standard | `CgkIz5juh94JEAIQEw` |
| `war.first_rescue` | Rescue Mission | Rescue any beaten player card with reinforcement. | Standard | `CgkIz5juh94JEAIQDQ` |
| `war.first_battle_win` | Hold the Field | Win the player's first Battle. | Standard | `CgkIz5juh94JEAIQCw` |
| `war.assassin` | Assassin | Defeat an Ace with a 2. | Standard | `CgkIz5juh94JEAIQAg` |
| `war.not_today` | Not Today | Successfully reinforce to save an original 2. | Standard | `CgkIz5juh94JEAIQBQ` |
| `war.battle_layer_3` | Down the Rabbit Hole | Reach Battle 3. The stable internal ID intentionally retains `layer`. | Standard | `CgkIz5juh94JEAIQBg` |
| `war.battle_layer_4` | How Deep Does This Go? | Reach Battle 4. The stable internal ID intentionally retains `layer`. | Standard | `CgkIz5juh94JEAIQCA` |
| `war.deep_battle_win` | Into the Breach | Win a Battle at depth 3 or greater. | Standard | `CgkIz5juh94JEAIQAA` |
| `war.royal_disaster` | Royal Disaster | Lose an Ace and a 2 in the same Battle. | Standard | `CgkIz5juh94JEAIQCQ` |
| `war.massacre` | Massacre | Defeat at least 10 opponent cards in one Battle. | Standard | `CgkIz5juh94JEAIQFA` |
| `war.no_reinforcements_win` | No Reinforcements Needed | Win without sending a reinforcement. | Standard | `CgkIz5juh94JEAIQFQ` |
| `war.five_battles_game` | War of Attrition | Resolve a game containing at least 5 distinct Battles. | Standard | `CgkIz5juh94JEAIQBw` |
| `war.pyrrhic_victory` | Pyrrhic Victory | Win with exactly 1 card remaining. | Standard | `CgkIz5juh94JEAIQBA` |
| `war.untouchable` | Untouchable | Win with at least 20 cards remaining. | Standard | `CgkIz5juh94JEAIQCg` |
| `war.comeback_15` | Never Tell Me the Odds | Win after trailing by at least 15 cards. | Standard | `CgkIz5juh94JEAIQDg` |
| `war.marathon` | Marathon | Resolve a game lasting at least 40 turns. | Standard | `CgkIz5juh94JEAIQDw` |
| `profile.campaigner` | Campaigner | Complete 10 resolved games. | Standard | `CgkIz5juh94JEAIQAQ` |
| `profile.veteran` | Veteran | Complete 25 resolved games. | Incremental, 25 steps | `CgkIz5juh94JEAIQEA` |
| `profile.centurion` | Centurion | Complete 100 resolved games. | Incremental, 100 steps | `CgkIz5juh94JEAIQAw` |

## Synchronization contract

- Local unlock state remains authoritative and works without Google Play Games.
- Standard achievements use `unlock` semantics.
- Veteran and Centurion synchronize the clamped absolute resolved-game count with `setSteps`; cumulative local counts are never sent as repeated increment deltas.
- The mapping in `src/app/core/models/play-achievements-map.ts` must match this table byte-for-byte.
