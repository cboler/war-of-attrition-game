# War of Attrition — Narrative Disclosure Matrix

Status: **Authoritative implementation-ready creative specification for Narrative Sprint 1.**

This document routes the settled private history in [`narrative-canon.md`](./narrative-canon.md) through a first-play sequence of twelve authored War encounters. It defines what the player may learn, when they may learn it, which beats must be reliable, and which current implementation seams Sprint 1 must extend. It does not alter the Mont-Rouge canon or the fair-play card game.

Companion documents:

- [`narrative-canon.md`](./narrative-canon.md) — objective private history and character knowledge boundaries.
- [`commander-voice-bible.md`](./commander-voice-bible.md) — voice, relationship language, and the curated dialogue bank.
- [`north-star.md`](./north-star.md) — tone, visual identity, and presentation guardrails.
- [`opponent-commanders.md`](./opponent-commanders.md) — permanent AI strategy IDs and current reaction architecture.
- [`alternate-rules-campaigns.md`](./alternate-rules-campaigns.md) — implemented mode mechanics and chapter availability contract.

> [!CAUTION]
> This is a private writer/developer document. Player-facing fragments may make the natural explanation inferable from Chapter III onward, but must never plainly state the exact mouse-and-hay causal chain.

## 1. Canonical First-Play Encounter Schedule

The three Wars in a Campaign deliberately use different opponents. The first completion of each chapter, and initially its replays, uses this schedule:

| Chapter | Mode | War I | War II | War III | Dramatic motion |
| --- | --- | --- | --- | --- | --- |
| I — The Accord | `standard` | Marcel de Brie | Matthias von Greyerz | Bastien de Herve | accusation → counter-accusation → incomprehensible truth |
| II — The Closing Passes | `limited_reserves` | Sir Edmund Gloucester | Lorenzo di Taleggio | Marcel de Brie | French accelerant → Swiss accelerant → consequence |
| III — The Blind Wheel | `fog_of_war` | Matthias von Greyerz | Marcel de Brie | Bastien de Herve | evidence → doubt → prophecy recontextualized |
| IV — The War of Attrition | `total_war` | Sir Edmund Gloucester | Lorenzo di Taleggio | Matthias von Greyerz | admission → admission → reckoning |

No placement changed during the disclosure audit. Each position has a distinct narrative job, the mirror structure remains legible, Bastien's second encounter reinterprets his first, and Matthias earns the final battlefield beat.

## 2. Reliability and Disclosure Conventions

Narrative records use these guarantees:

- **G — guaranteed:** a pre-War introduction, transition dispatch, War-resolution panel, Campaign-completion panel, or durable unlocked Field Manual entry. A player who completes the chapter receives it regardless of outcome.
- **O — optional:** a sparse table reaction, optional Chronicle detail, biography expansion, achievement description, cosmetic description, or source link. It may reward attention but cannot carry required plot alone.
- **G+O — reinforced:** stated on a guaranteed surface and echoed through optional reactions or lore.

Truthfulness classifications are:

- **DT:** directly true.
- **TI:** true but incomplete.
- **SMI:** sincere mistaken inference.
- **SSF:** self-serving framing.
- **CO:** conscious omission.
- **CL:** conscious lie. This classification is intentionally rare and is not used for any original Mont-Rouge accusation.
- **PM:** prophecy/metaphor; literally grounded in Bastien's truthful vision but not ordinary testimony.

Spoiler risk is **low**, **medium**, **high**, or **critical**. Critical material stays private even after Chapter IV.

## 3. Reveal Ledger

The ledger precedes the dialogue. Creative IDs remain stable even if final line wording changes.

### 3.1 Fact, timing, and ownership

| ID | Objective fact | Earliest permitted | Preferred encounter/surface | Latest understanding | Speaker or surface | Guarantee |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | French and Swiss Gruyère traditions possess an old connected rivalry over provenance and naming. | I | I.1 Marcel introduction; Field Manual foundation | I completion | Marcel + neutral lore | G+O |
| R02 | French tradition prizes characteristic openings; Swiss tradition is substantially blind/closed, while allowing a few small openings. | I | I.1 Marcel; I.2 Matthias correction | I completion | Both principals + sourced lore | G+O |
| R03 | Marcel and Matthias were long-standing professional rivals before Mont-Rouge. | I | I.1 familiarity leaking through insult | II completion | Marcel/Matthias | G+O |
| R04 | Their rivalry rested on genuine mutual respect and trust. | I as subtext; II explicit | II.3 Marcel resolution | III opening | Principals + biography | G+O |
| R05 | They sincerely negotiated the Mont-Rouge Accord to recognize both traditions. | I | I.1 Marcel introduction | I completion | Marcel, then Matthias | G |
| R06 | Ceremonial French and Swiss Witness Wheels were made for ratification. | I | I.1 Marcel guaranteed beat | I completion | Marcel + Field Manual | G+O |
| R07 | The Swiss Witness Wheel unexpectedly contained eyes/openings. | I | I.1 Marcel guaranteed beat | I completion | Marcel, Matthias, neutral record | G |
| R08 | Matthias suspended ratification because he could not explain the anomaly. | I | I.1 accusation, clarified I.2 | I completion | Marcel then Matthias | G |
| R09 | Marcel sincerely interpreted the suspension as personal and political betrayal. | I | I.1 resolution | I completion | Marcel | G |
| R10 | Edmund urged Marcel to act and call the Swiss hesitation a bluff. | II | II.1 Edmund introduction | II completion | Edmund | G |
| R11 | Marcel chose to proceed unilaterally under the negotiated framework. | I as accusation; II explicit | II.3 Marcel guaranteed beat | II completion | Matthias, Edmund, Marcel | G+O |
| R12 | Matthias sincerely interpreted Marcel's unilateral action as betrayal. | I | I.2 resolution | I completion | Matthias | G |
| R13 | Lorenzo urged Matthias to treat plausible French threats as imminent. | II | II.2 Lorenzo guaranteed beat | II completion | Lorenzo | G |
| R14 | Swiss authorities restricted or closed an Alpine pass. | II | II.2 transition/resolution | II completion | Lorenzo + dispatch | G+O |
| R15 | Disputed shipments were impounded. | II | II.2 transition | II completion | dispatch + Marcel | G |
| R16 | Winter stocks, routes, and resource anxiety made delay materially frightening. | II | Orders intro and all three encounters | II completion | neutral framing + all three | G+O |
| R17 | France sent escorts or acted to reopen or secure the route. | II | II.3 Marcel resolution | II completion | Marcel + dispatch | G |
| R18 | The first confrontation at the route produced genuine bloodshed. | II | Campaign completion | II completion | neutral dispatch | G |
| R19 | Reciprocal retaliation made each later act seem proof of earlier treachery. | II | II completion; IV cumulative callback | III completion | neutral dispatch, Edmund/Lorenzo | G+O |
| R20 | Mont-Rouge testimony and later accounts contradict one another. | III | III.1 Matthias introduction | III completion | Matthias + dossier/archive surfaces | G+O |
| R21 | No satisfactory sabotage mechanism or culprit was ever established. | III | III.1 Matthias resolution | IV.3 | Matthias | G |
| R22 | Mundane dairy/abbey inventories and maintenance records survived while political historians ignored them. | III | III.2 Marcel introduction | III completion | Marcel + Field Manual folio | G+O |
| R23 | Period records mention vermin in storage areas. | III | optional Field Manual folio after III.2 | Optional inference only | non-character record | O |
| R24 | Period records mention disturbed stores and replacement hay or straw. | III | optional Field Manual folio after III.2 | Optional inference only | non-character record | O |
| R25 | Eyes can arise naturally rather than through deliberate interference. | III | sourced lore after III.1 | III completion as possibility | neutral scientific lore | G+O |
| R26 | Microscopic structural nuclei can trap air and seed eye formation; hay particles can supply capillary structures. | III | source-linked Field Manual after III.3 | Optional player solution | sourced scientific lore + Bastien metaphor | O |
| R27 | Edmund deliberately pushed Marcel toward the action Marcel wanted to take. | II as minimization; IV admission | IV.1 resolution | IV.1 | Edmund | G |
| R28 | Lorenzo gave worst cases the emotional force of imminent probabilities. | II as rationalization; IV admission | IV.2 resolution | IV.2 | Lorenzo | G |
| R29 | Matthias eventually acknowledges that he never proved sabotage or Marcel's guilt. | IV | IV.3 War resolution | IV completion | Matthias | G |
| R30 | Marcel eventually acknowledges that he never proved Matthias's betrayal. | IV | IV Campaign completion | IV completion | Marcel fragment | G |
| R31 | Bastien foresaw the blind wheel opening eyes. | I | I.3 introduction | III.3 | Bastien | G+O |
| R32 | Bastien foresaw two honest men calling one another liar. | I | I.3 event line | III.3 | Bastien | G+O |
| R33 | Bastien foresaw something very small moving great armies. | I | I.3 resolution | III.3 | Bastien | G+O |
| R34 | Bastien foresaw a field entering or growing inside a wheel. | I | I.3 event line | III.3 | Bastien | G+O |
| R35 | Bastien foresaw a betrayal without a betrayer. | I obliquely; III clearly | I.3 resolution, III.3 callback | IV completion | Bastien | G+O |
| R36 | Bastien foresaw trapped breath/air and certainty becoming the first casualty. | I obliquely; III clearly | III.3 event/resolution lines | III completion | Bastien | G+O |
| R37 | Nobody committed the original betrayal; everyone bears responsibility for the war. | III as inference; IV as conclusion | IV.3 + Campaign completion | IV completion | player inference from Matthias/Marcel | G |

### 3.2 Inference, interpretation, and spoiler control

| ID | Intended player inference at first disclosure | Speaker interpretation or limitation | Spoiler risk | Later reinterpretation | Rabbit-hole association |
| --- | --- | --- | --- | --- | --- |
| R01 | This rivalry is absurd but institutionally serious. | Each principal treats provenance as inherited duty. | Low | Shared history makes their rupture personal. | S01, S02, S05 |
| R02 | The eyes are a meaningful standards breach. | Marcel calls eyes identity; Matthias calls blindness process. Neither claims literal impossibility. | Medium | A visible anomaly can be natural without being politically innocent in effect. | S03, S04 |
| R03 | These men know exactly how to irritate each other. | Familiarity is disguised as contempt. | Low | Old insults become evidence of lost intimacy. | S01, S02 |
| R04 | Marcel's anger and Matthias's rigidity come from disappointed trust. | Neither volunteers vulnerability. | Medium | Their accusations remain sincere rather than fabricated. | — |
| R05 | Peace once appeared plausible. | Both still defend their own part in drafting it. | Low | Their later actions destroyed something they truly made. | S02, S05 |
| R06 | The ceremony had formal evidentiary weight. | Witness Wheels are fictional ritual, inspired by specification culture. | Low | A symbolic test was treated as proof beyond what it could establish. | S03, S05 |
| R07 | Someone may have tampered with the Swiss wheel. | Nobody understands the anomaly when it appears. | High | The anomaly needs no culprit. | S03, S04, S09 |
| R08 | Suspension can look either prudent or faithless. | Matthias sees procedure; Marcel experiences abandonment. | Medium | Both descriptions can be sincere. | — |
| R09 | Matthias probably betrayed Marcel. | Marcel infers intent from timing and humiliation. | Low | His certainty exceeded his evidence. | — |
| R10 | Edmund was more than a spectator. | He initially calls pressure mere encouragement. | Low | In IV.1 he owns the appetite behind the advice. | S12 |
| R11 | Marcel did make a consequential choice. | He frames action as the only way to save the Accord. | Medium | “No choice” becomes self-serving, not a lie about the act itself. | — |
| R12 | Marcel may have exploited Matthias's crisis. | Matthias infers hostile intent from unilateral action. | Low | He later separates inference from proof. | — |
| R13 | Lorenzo mirrors Edmund through threat analysis. | He never invents a threat; he weights possibility toward urgency. | Low | In IV.2 he recognizes the feedback loop. | S07 |
| R14 | Control of a pass is control of life and leverage. | Lorenzo sees defense; Marcel sees strangulation. | Low | Reciprocal action supplies its own apparent justification. | S07, S08 |
| R15 | The dispute is hurting ordinary trade. | Each side describes impoundment differently. | Low | Logistics, not ceremony, produces the immediate crisis. | S07 |
| R16 | Limited Reserves is story as well as rule. | Scarcity narrows every character's imagination. | Low | “Cannot afford to wait” echoes both accelerants. | S02, S06 |
| R17 | French intervention is both reopening and escalation. | Marcel calls it protection, not invasion. | Low | The same act changes meaning by vantage point. | S07 |
| R18 | The story has crossed from comic grievance to tragedy. | No principal planned the clash. | Low | Intention does not cancel consequence. | S11, S13 |
| R19 | Every response appears retrospectively necessary. | Characters confuse consequence with prior proof. | Medium | Total War's cumulative differential embodies this logic. | S11, S13 |
| R20 | The archive cannot support one clean story. | Matthias finds contradiction intolerable but real. | Medium | Contradiction is not evidence of conspiracy. | — |
| R21 | Sabotage may be an inherited assumption. | Matthias does not yet declare Marcel innocent. | High | “Not established” prepares “I never proved it.” | S09, S10 |
| R22 | Boring records may matter more than heroic chronicles. | Marcel resents generations of selective attention. | High | Mundanity becomes the path to the truth. | S02, S09 |
| R23 | A small animal may have affected storage. | No character connects the record to the wheel. | Critical | Combined with R24/R26, curious players may solve the cause. | S09 |
| R24 | Plant material moved near the dairy. | The entry is inventory/maintenance, not a confession or smoking gun. | Critical | It gives “field in the wheel” a physical reading. | S09 |
| R25 | Natural causes are plausible. | Science supplies a class of mechanism, not this fictional event's proof. | High | It breaks the false culprit premise without granting omniscience. | S09, S10 |
| R26 | Air-bearing microstructures could explain eyes. | Optional context; do not annotate the fictional answer. | Critical | Bastien's breath/field imagery becomes exact. | S09, S10 |
| R27 | Edmund's loyalty helped create the crisis. | He still did not want war and told no fabricated fact. | Low | Early cheer becomes rueful accountability. | S12 |
| R28 | Lorenzo helped make his forecast come true. | His scenarios were plausible; his weighting was the fault. | Low | The quieter voice shows growth. | S07 |
| R29 | The Analyst's central certainty lacked proof. | This is an epistemic admission, not proof of the precise accident. | Low | It completes certainty → fracture → admission. | — |
| R30 | Marcel made the same failure from the other side. | He does not absolve every later action. | Low | The parallel answer reveals the original betrayal as empty. | — |
| R31 | Bastien is absurdly specific but unusable. | He sees symbolically and speaks sincerely. | Medium | The wheel quite literally opened eyes. | S03, S04 |
| R32 | Perhaps he means hypocrisy. | He means two honorable mistaken accusers. | Medium | Sincere accusations are the tragedy. | — |
| R33 | A joke about rats, spies, or low cards. | Privately, the mouse initiates the material chain. | Critical | Small cause, enormous consequence; never name it player-facing. | S09, S13 |
| R34 | Nonsensical pastoral imagery. | Privately, plant microstructure reaches the wheel. | Critical | Hay-capillary research makes it literal in hindsight. | S09 |
| R35 | A contradiction or empty mysticism. | Bastien knows no one betrayed the Accord. | High | Chapter III makes the riddle the best account available. | — |
| R36 | The prophet is mixing war and fermentation. | Breath is trapped air; certainty is the first abstract casualty. | High | Science and admissions complete both halves. | S09, S10 |
| R37 | The mystery was the wrong question. | Characters know only that their accusations outran proof; the player may infer more. | Low after III | The ending concerns responsibility, not culprit identification. | S11, S13 |

## 4. Twelve-War Authored Disclosure Matrix

The line IDs referenced below are defined in [`commander-voice-bible.md`](./commander-voice-bible.md). “Current hooks” are already emitted by `TableReactionService`; “new reliable hooks” are small Sprint 1 presentation seams, not a request for a general scripting engine.

### 4.1 Chapter I — Standard — “The Accord”

Chapter theme: **Accusation.** The rules are familiar so the player can absorb the premise. The guaranteed chapter conclusion is: “Something happened at Mont-Rouge. One of those men probably betrayed the other.”

#### I.1 — Marcel de Brie

- **Emotional state entering:** Marcel has polished a fresh wound into a public case. He is charming because he expects to be believed and angry because Matthias's opinion once mattered.
- **Must disclose:** R01, R02, R05, R06, R07, R08, and R09.
- **May disclose:** R03 through professional shorthand; R04 only as subtext.
- **Forbidden:** R10–R19 escalation detail; R20–R26 evidentiary/natural-cause material; any suggestion Marcel knowingly lies.
- **Relationship foregrounded:** Marcel ↔ Matthias. Every precise insult should imply an old debate, habit, or standard rather than generic nationalism.
- **Useful current hooks:** 2 defeats Ace (a small exception humiliates a great card), Jack-over-Ten narrow clash, successful/failed reinforcement, Ace/Two casualty, deep or large Battle loss.
- **New reliable hooks:** opponent introduction and War-resolution fragment.
- **Opening/framing beat:** Marcel defines provenance, the Accord, the Witness Wheels, and the opened Swiss wheel with theatrical certainty. Preferred lines: `C1W1-MAR-01` and `C1W1-MAR-02`.
- **Mid-War opportunities:** reserve language for strong cards; “one exception” language for the Two/Ace rule; tasting-note insults that reveal intimate knowledge of Matthias's habits.
- **War-resolution beat:** Matthias suspended the Accord at the exact moment Marcel expected him to stand beside it (`C1W1-MAR-16`). Outcome-specific reactions remain emotional color, not plot gates.
- **Intended player inference:** Matthias may have used the anomaly to abandon Marcel and the Accord.
- **Callbacks:** “I had his word” and variants of “no choice” return in II.3 and III.2.
- **Future reinterpretation:** II.3 proves unilateral action was a choice; III.2 exposes how much intent Marcel inferred; IV completion answers Matthias without proving the dairy accident.

#### I.2 — Matthias von Greyerz

- **Emotional state entering:** Matthias is controlled, humiliated, and determined to correct Marcel's account without admitting how personally Marcel's action injured him.
- **Must disclose:** R02, R07, R08, R11, and R12.
- **May disclose:** R03–R04 as clipped familiarity; the Swiss wheel's supervised process without asserting supernatural impossibility.
- **Forbidden:** strong emphasis on R21 absence of proof; natural cause; Edmund/Lorenzo's full roles; later bloodshed.
- **Relationship foregrounded:** Matthias ↔ Marcel. Matthias knows Marcel's maturation timings, rhetorical habits, and dislike of administrative delay.
- **Useful current hooks:** narrow clash and quantitative correction, Battle depth, candidate-pool/reinforcement reactions, Ace/Two losses.
- **New reliable hooks:** introduction and War-resolution fragment.
- **Opening/framing beat:** the wheel was Swiss-supervised, the result was unexplained, and suspension was responsible procedure (`C1W2-MAT-01`, `C1W2-MAT-02`).
- **Mid-War opportunities:** quantify absurdly exact margins; correct Marcel by fractions; make restraint sound rational while hurt leaks through.
- **War-resolution beat:** Marcel proceeded without him, making the suspension look like an opportunity seized (`C1W2-MAT-16`).
- **Intended player inference:** Marcel's apparently clean story omitted the unilateral act; perhaps he was the betrayer.
- **Callbacks:** “The record is exact” and “procedure is not betrayal” fracture in III.1; an old Bastien dismissal returns in IV.3.
- **Future reinterpretation:** III.1 reveals that supervision and correlation did not establish intent; IV.3 strips Matthias's language of false precision.

#### I.3 — Bastien de Herve

- **Emotional state entering:** Bastien is calm, apolitical, and unsurprised. The player and other commanders supply the judgment that he is mad.
- **Must disclose:** R31, R32, R33, R34, and an oblique form of R35.
- **May disclose:** an oblique first half of R36; comic unrelated prophecies.
- **Forbidden:** plain mention of mouse, hay, straw, vermin, capillaries, structural nuclei, sabotage absence, or a natural explanation.
- **Relationship foregrounded:** everyone ↔ Bastien through off-screen references; Edmund is delighted, Marcel irritated, Matthias dismissive, Lorenzo indifferent.
- **Useful current hooks:** Two defeats Ace (small thing fells great one), deep Battle (layers/caves), casualties (rind/decay), reinforcement (tomorrow arriving early).
- **New reliable hooks:** introduction, guaranteed prophecy at resolution, and Chapter-I completion dispatch.
- **Opening/framing beat:** “The blind wheel opened seven eyes. Four men closed eight.” (`C1W3-BAS-01`).
- **Mid-War opportunities:** coherent eye/field/breath/small-guest motifs; no random surrealism when a Mont-Rouge line is intended.
- **War-resolution beat:** “Two honest men will bury a traitor who was never born.” (`C1W3-BAS-16`).
- **Intended player inference:** Bastien is insane, but he knows oddly exact ceremonial details.
- **Callbacks:** nearly every major line returns in III.3 through variation rather than verbatim repetition; Edmund's amused invitation to prophecy returns as reluctance in IV.1.
- **Future reinterpretation:** Chapter III records and eye science make his imagery painfully literal while Bastien himself remains unchanged.

### 4.2 Chapter II — Limited Reserves — “The Closing Passes”

Chapter theme: **Motive, scarcity, and escalation.** Repeated vocabulary should include stock, winter, routes, passes, supply, preservation, and what cannot be spent twice. The guaranteed chapter conclusion is: “Everyone had a reason for what they did. Someone still must have started it.”

#### II.1 — Sir Edmund Gloucester

- **Emotional state entering:** Edmund is still pleased with the decisiveness of his advice. He treats the consequence as regrettable but the decision as defensible.
- **Must disclose:** R10, R11, and R16.
- **May disclose:** R04 through his knowledge of Marcel's trust; early amusement at R31–R35; a glimpse of R14 as the cost of delay.
- **Forbidden:** shame, R27 full admission, a claim that Edmund planned war, or any natural-cause material.
- **Relationship foregrounded:** Marcel ↔ Edmund. Edmund knows which wounded-pride phrase turns Marcel from argument to action.
- **Useful current hooks:** successful and failed reinforcement are ideal; supported tie/Battle appetite; desperation; concession; 2/Ace long shot.
- **New reliable hooks:** introduction and resolution confession-without-remorse.
- **Opening/framing beat:** Edmund called the suspension a bluff and advised Marcel to move while the Accord could still be saved (`C2W1-EDM-01`, `C2W1-EDM-02`).
- **Mid-War opportunities:** “uncertainty is where one acts”; Limited Reserves as a dwindling purse of chances; ask what Bastien's cheese says for amusement.
- **War-resolution beat:** Edmund admits he put the word “bluff” in the room, but still calls it sound advice (`C2W1-EDM-16`).
- **Intended player inference:** Edmund materially accelerated the French action without deceiving Marcel.
- **Callbacks:** “Go on, then. What does the cheese say?” rhymes with IV.1 “Don't ask him.” His contempt for Lorenzo's alarmism returns as self-recognition.
- **Future reinterpretation:** IV.1 reveals that Edmund did more than neutrally support Marcel; he made action emotionally attractive.

#### II.2 — Lorenzo di Taleggio

- **Emotional state entering:** Lorenzo sees consequences before evidence and considers that foresight a civic duty. His performance is maximal because he believes the pass is already a closing fist.
- **Must disclose:** R13, R14, R15, and R16.
- **May disclose:** R12, R17 as feared possibility, and the mirror with R10.
- **Forbidden:** R28 admission; invented French evidence; certainty that France planned conquest; natural cause.
- **Relationship foregrounded:** Matthias ↔ Lorenzo, with Edmund as an unseen mirror. Lorenzo knows which plausible scenario Matthias cannot responsibly ignore once quantified.
- **Useful current hooks:** desperation thresholds, failed rescue, concession as choosing ground, large Battle loss, narrow clash inflated into future catastrophe.
- **New reliable hooks:** introduction, route dispatch, and War-resolution beat.
- **Opening/framing beat:** “Today one sealed wagon; tomorrow the pass learns a French name.” (`C2W2-LOR-01`).
- **Mid-War opportunities:** every small loss becomes Act I of encirclement; he condemns Edmund for converting uncertainty into permission.
- **War-resolution beat:** he recommended restriction before French control became irreversible, while insisting he only listed consequences (`C2W2-LOR-16`).
- **Intended player inference:** Lorenzo and Edmund perform the same acceleration in opposite rhetorical styles.
- **Callbacks:** “possible is already late” returns more quietly in IV.2; Edmund's “bluff” and Lorenzo's “siege” become paired frames.
- **Future reinterpretation:** IV.2 separates plausible scenario from the urgency Lorenzo added and shows that loyalty can manufacture its feared outcome.

#### II.3 — Marcel de Brie

- **Emotional state entering:** Marcel is defending a past decision while living inside its material consequences. His certainty remains, but “no choice” now requires effort.
- **Must disclose:** R04, R11, R14, R15, R17, and R18 through guaranteed resolution/completion surfaces.
- **May disclose:** R16 and R19; Edmund's role without transferring responsibility to him.
- **Forbidden:** evidentiary doubt, mundane dairy clues, natural cause, or confession of original guilt.
- **Relationship foregrounded:** Marcel ↔ Matthias and Marcel ↔ Edmund. Marcel owns the decision even while rationalizing it.
- **Useful current hooks:** Limited Reserves exhaustion, concession, rescue of valuable stock, failed spend, large Battle casualties.
- **New reliable hooks:** return introduction, result beat, and Chapter-II completion dispatch.
- **Opening/framing beat:** “I signed because an Accord left to starve is merely expensive paper.” (`C2W3-MAR-01`).
- **Mid-War opportunities:** reserves become cellar stock; Matthias's patience becomes delay; Edmund is acknowledged as persuasive, not controlling.
- **War-resolution beat:** Marcel ordered escorts to reopen the route; the completion dispatch states that the first confrontation drew blood (`C2W3-MAR-16`, `TR-C2-04`).
- **Intended player inference:** Marcel had understandable reasons and still made a choice that escalated the crisis.
- **Callbacks:** I.1 “no choice” is now visibly self-serving; old professional respect becomes explicit enough to deepen the hurt.
- **Future reinterpretation:** III.2 makes Marcel confront the gap between act and intent; IV completion answers Matthias's admission.

### 4.3 Chapter III — Fog of War — “The Blind Wheel”

Chapter theme: **Doubt, evidence, and incomplete knowledge.** The chapter must respect the mechanical seal: active Chronicle and Hall records remain operationally truthful but redacted. Durable lore can unlock at War end, when the seal lifts. The guaranteed conclusion is: “There may never have been a betrayal.”

#### III.1 — Matthias von Greyerz

- **Emotional state entering:** Matthias expects a review to vindicate him. Instead, his preferred tool—precision—begins cutting against his preferred conclusion.
- **Must disclose:** R20, R21, and R25 as a possibility rather than a case-specific solution.
- **May disclose:** R02 correction, R07, and the first explicit crack in R12.
- **Forbidden:** “Marcel was innocent,” the exact natural chain, R23–R24 before the appropriate post-War folio, or R29 final admission.
- **Relationship foregrounded:** Matthias ↔ Marcel; Matthias ↔ Bastien through his resistance to evidence outside his framework.
- **Useful current hooks:** Fog hides past counts, giving precision comedy an anxious edge; Battle depth; public current card comparisons; failed reinforcement as model failure.
- **New reliable hooks:** introduction, War-end archive fragment, and post-War source unlock.
- **Opening/framing beat:** three copies of the same deposition disagree, including two copies signed by the same steward (`C3W1-MAT-01`).
- **Mid-War opportunities:** “the record does not establish” rather than “the record disproves”; corrections become self-corrections.
- **War-resolution beat:** “The record does not establish what I have said it establishes.” (`C3W1-MAT-16`).
- **Intended player inference:** sabotage was an assumption stabilized by repetition, not a demonstrated finding.
- **Callbacks:** I.2 “the record is exact” returns as “the record is not obedient.” Matthias's dismissal of Bastien begins to look like a category error.
- **Future reinterpretation:** IV.3 removes the last hedge: Matthias never proved it.

#### III.2 — Marcel de Brie

- **Emotional state entering:** Marcel arrives ready to expose Swiss omissions and discovers that the most damaging omissions belong to the grand historical narrative itself.
- **Must disclose:** R20, R22, and the gap behind R30 without delivering the final admission.
- **May disclose:** R23 and R24 only through optional, boring records; R25 as a general possibility.
- **Forbidden:** joining R23 + R24 + R26 into a declared causal chain; naming a mouse as cause; absolving every later act; final R30 wording.
- **Relationship foregrounded:** Marcel ↔ Matthias. Marcel recognizes that he converted procedural timing into a claim about Matthias's intent.
- **Useful current hooks:** Fog-sealed casualties as metaphor for missing records; valuable-stock rescue; concession; large loss; narrow margin.
- **New reliable hooks:** introduction, optional Field Manual folio, and War-resolution beat.
- **Opening/framing beat:** political histories quote every insult and omit invoices for straw, cellar repairs, and vermin traps (`C3W2-MAR-01`).
- **Mid-War opportunities:** Marcel initially mocks boring records, then protects them like a rare vintage; his insults remain vivid but lose certainty.
- **War-resolution beat:** “I possessed his timing, his silence, and my own humiliation. I called the bundle intent.” (`C3W2-MAR-16`).
- **Intended player inference:** Marcel never had proof Matthias intended to abandon him; mundane fragments point outside the betrayal story.
- **Callbacks:** I.1 “I had his word” becomes evidence of why Marcel leapt to a personal conclusion; II.3 “no choice” loses its last literal defense.
- **Future reinterpretation:** the IV completion fragment does not reveal new evidence; it admits the old evidence never proved betrayal.

#### III.3 — Bastien de Herve

- **Emotional state entering:** Bastien is unchanged. Everyone else has finally moved close enough to understand him.
- **Must disclose:** R31–R36 in recontextualized form and support the inference in R37.
- **May disclose:** R25–R26 through an optional source link or Field Manual note; comic unrelated omens remain permitted.
- **Forbidden:** “a mouse knocked hay into the vat,” any exact causal exposition, partisan vindication, or a tidy detective solution.
- **Relationship foregrounded:** everyone ↔ Bastien, especially Matthias's reluctant request and Edmund's diminishing amusement.
- **Useful current hooks:** small-card upset, deep Battle, breath/air, Fog lifting at War end, casualty and reserve-depth metaphors.
- **New reliable hooks:** opening callback, post-War science folio, and Chapter-III completion dispatch.
- **Opening/framing beat:** “You have opened the archive. Shall we open the wheel again?” (`C3W3-BAS-01`).
- **Mid-War opportunities:** answer early prophecies with physical language—capillary without the technical word, breath caught in a stem, a meadow ground too small to see.
- **War-resolution beat:** “The traitor remains absent. At last, you have begun to notice him.” (`C3W3-BAS-16`).
- **Intended player inference:** a tiny, natural, plant-linked event likely made the eyes; the supposed betrayer may never have existed.
- **Callbacks:** direct ledger `P01`–`P08`; Matthias asks to hear the blind-wheel prophecy again in a guaranteed transition.
- **Future reinterpretation:** Chapter IV confirms the absence of proof and assigns responsibility for escalation without confirming the precise accident to the characters.

### 4.4 Chapter IV — Total War — “The War of Attrition”

Chapter theme: **Culpability without villainy.** Total War's signed cumulative differential provides the governing metaphor: no single card is the whole verdict, but every card changes it. The guaranteed conclusion is: “They destroyed each other over a betrayal committed by nobody.”

#### IV.1 — Sir Edmund Gloucester

- **Emotional state entering:** Edmund's wit remains, but catastrophe is no longer a sporting abstraction. He knows what he said and why Marcel wanted to hear it.
- **Must disclose:** R27 and the personal version of R19.
- **May disclose:** R10, R16, and Bastien callbacks; no new dairy facts are required.
- **Forbidden:** claiming he caused everything, intended war, fabricated evidence, or controlled Marcel.
- **Relationship foregrounded:** Marcel ↔ Edmund; Edmund ↔ Lorenzo as mirrors; Edmund ↔ Bastien as a guilt barometer.
- **Useful current hooks:** gamble/reinforcement, cumulative differential, failed rescue, deep Battle, desperate draw, concession.
- **New reliable hooks:** introduction and admission at War resolution.
- **Opening/framing beat:** “I called it a bluff because waiting bored me and action looked brave. Marcel supplied the rest.” (`C4W1-EDM-01`).
- **Mid-War opportunities:** jokes shorten after costly outcomes; he recognizes in Lorenzo the same manipulation of uncertainty.
- **War-resolution beat:** Edmund helped Marcel hear exactly the advice he wanted and cannot hide behind good intentions (`C4W1-EDM-16`).
- **Intended player inference:** intention and loyalty do not erase responsibility for foreseeable escalation.
- **Callbacks:** the early prophecy invitation becomes “Don't ask him”; “splendid odds” becomes a phrase Edmund can no longer enjoy.
- **Future reinterpretation:** no later twist reverses this admission; it is accountability without villain reveal.

#### IV.2 — Lorenzo di Taleggio

- **Emotional state entering:** Lorenzo has run out of theatrical distance. His sentences are shorter because he recognizes the future he warned against as one he helped produce.
- **Must disclose:** R28 and the mirrored version of R19.
- **May disclose:** R13–R17 in summary; a brief acknowledgment that Edmund's method was not unique.
- **Forbidden:** claiming the threats were imaginary, accepting sole blame, or inventing sabotage.
- **Relationship foregrounded:** Matthias ↔ Lorenzo and Edmund ↔ Lorenzo.
- **Useful current hooks:** low-deck desperation, Total War differential, failed rescue, concession, major casualty.
- **New reliable hooks:** restrained introduction and admission at resolution.
- **Opening/framing beat:** “I named every door France might close. Then I spoke as if I heard the key turn.” (`C4W2-LOR-01`).
- **Mid-War opportunities:** the absence of `Madonna mia` in serious lines is intentional; he identifies mirror behavior without becoming interchangeable with Edmund.
- **War-resolution beat:** “I made possibility urgent. Urgency made it real.” (`C4W2-LOR-16`).
- **Intended player inference:** loyalty filtered uncertainty into threat until preemption generated confirmation.
- **Callbacks:** II.2's opera of tomorrow returns as plain past tense; his condemnation of Edmund folds inward.
- **Future reinterpretation:** no mastermind emerges. His culpability is precisely the weighting he chose.

#### IV.3 — Matthias von Greyerz

- **Emotional state entering:** Matthias has exhausted the language of tolerances and models. He is still responsible for his actions, but no longer willing to call suspicion proof.
- **Must disclose:** R29 and enable R30/R37 on Campaign completion.
- **May disclose:** R20–R21, a final Bastien callback, and the distinction between unexplained and sabotaged.
- **Forbidden:** exact mouse/hay knowledge, full reconciliation, a lecture on the moral, or a claim that later violence did not matter.
- **Relationship foregrounded:** Matthias ↔ Marcel as the emotional center; Matthias ↔ Bastien as belated epistemic humility.
- **Useful current hooks:** Total War cumulative differential, precise lines that simplify as the War deepens, Battle/casualty, failed model/reinforcement.
- **New reliable hooks:** introduction, final War-resolution admission, Campaign-completion reply from Marcel.
- **Opening/framing beat:** Matthias separates what happened, what he believed, and what the record can support (`C4W3-MAT-01`).
- **Mid-War opportunities:** fewer numbers and corrections; one request to hear Bastien's old prophecy again; silence after large loss.
- **War-resolution beat:** preferred final line: **“I never proved it.”** (`C4W3-MAT-16`). Do not expand it.
- **Campaign-completion answer:** preferred Marcel fragment: **“Non. Neither did I.”** (`TR-C4-04`). End the narrative beat there.
- **Intended player inference:** neither principal proved the other's betrayal; the original culprit is an empty space, while the choices and casualties remain real.
- **Callbacks:** almost every principal/prophecy thread resolves without an explanatory monologue.
- **Future reinterpretation:** none required. Replays enrich the early sincerity, hurt, and self-serving frames rather than uncovering another twist.

## 5. Per-Character Cross-Chapter Tracks

| Commander | Appearance 1 | Appearance 2 | Appearance 3 / completion echo | Continuity device | What must not reset |
| --- | --- | --- | --- | --- | --- |
| Marcel | I.1: betrayed statesman certain of Matthias's intent | II.3: owner and defender of the unilateral choice | III.2: recognizes how circumstance became intent; answers Matthias after IV.3 | “My word / his word,” stock worth preserving, and progressively weaker “no choice” language | His genuine hurt, responsibility for his choice, affection for Edmund, and professional knowledge of Matthias |
| Matthias | I.2: procedural rationalist certain Marcel exploited the suspension | III.1: the archive stops supporting his confidence | IV.3: plain admission that he never proved it | Exact counts and corrections gradually disappear; dismissal of Bastien becomes a request | His intelligence, honor, humiliation, and accountability for acting on suspicion |
| Edmund | II.1: cheerful accelerant who treats uncertainty as the point of action | IV.1: rueful accountability without self-dramatization | — | Prophecy invitation becomes prophecy refusal; “splendid odds” becomes sour | His dry wit, love of action, loyalty to Marcel, and lack of war-making intent |
| Lorenzo | II.2: operatic preemption, every possibility tomorrow's siege | IV.2: sober admission that urgency helped create the threat | — | Tomorrow-future rhetoric collapses into short past-tense sentences | His strategic acuity, loyalty to Matthias, and the real plausibility of some risks |
| Bastien | I.3: apparently mad but exact prophet | III.3: same prophet, now legible | IV callbacks occur through other characters; he does not explain | Stable motif vocabulary with repeated images at a different angle | His apolitical sincerity, truthfulness about Mont-Rouge, and lack of gameplay omniscience |

Return appearances must assume elapsed time and accumulated player knowledge. Do not reuse an earlier introduction as evergreen replay copy when it would erase that development.

## 6. Guaranteed Framing and Transition Matrix

These dispatches are one or two sentences by design. They are guaranteed on first chapter completion and skippable/condensed on replay. A “speaker” may be an attributed written fragment; it does not require two animated characters on screen.

| ID | Placement | Surface | Player-facing copy | Reveal/callback | Function |
| --- | --- | --- | --- | --- | --- |
| TR-C1-01 | Chapter I Orders | Campaign Orders intro | **THE ACCORD.** Two traditions brought two Witness Wheels to Mont-Rouge. The French wheel opened its eyes. The Swiss wheel was never meant to. | R01, R02, R06 | Premise in two beats; avoids naming a culprit. |
| TR-C1-02 | I.1 → I.2 | sealed Swiss correction | **From Matthias von Greyerz:** “Marcel has omitted 11 minutes, one unsigned folio, and the fact that I asked him to wait.” | R08, R12 | Makes Matthias credible before his battle; voice is instantly distinct. |
| TR-C1-03 | I.2 → I.3 | Belgian field note | **Unrequested advisory, rind-stained:** “Both accounts are honest. This is not the comfort you think it is.” | R32, R35 | Introduces Bastien without resolving either account. |
| TR-C1-04 | Chapter I completion | Campaign resolution | Mont-Rouge remains unresolved. Each negotiator names the other's next act as the first betrayal. Bastien has submitted a drawing of a field inside a wheel. | R09, R12, R34 | Locks the intended Chapter-I conclusion. |
| TR-C2-01 | Chapter II Orders | Campaign Orders intro | **THE CLOSING PASSES.** Five reserves. Three Wars. Winter does not return what command spends. | R16 | Couples the rule to scarcity without tutorial clutter. |
| TR-C2-02 | II.1 → II.2 | intercepted Italian dispatch | **Lorenzo:** “The Englishman calls uncertainty a wager. A charming word for making another nation pay the stake.” | CB08 | Establishes the mirror before Lorenzo explains himself. |
| TR-C2-03 | II.2 → II.3 | French route ledger | One pass restricted. Seven wagons held. Marcel has ordered escorts for the next convoy and insists this is preservation, not escalation. | R14, R15, R17 | Moves from advisers to material consequence. |
| TR-C2-04 | Chapter II completion | Campaign resolution | The convoy met the cordon before dawn. By noon, both sides possessed blood enough to call every earlier fear a fact. | R18, R19 | Guaranteed first blood; no battle choreography or culprit. |
| TR-C3-01 | Chapter III Orders | Campaign Orders intro | **THE BLIND WHEEL.** The Boneyard will be sealed while each War is active. Mont-Rouge's record has been sealed by certainty for much longer. | R20 | Aligns Fog presentation with the epistemic chapter. |
| TR-C3-02 | III.1 → III.2 | archive transfer | Matthias has released the rejected folios: cellar invoices, straw tallies, vermin notices, and three mutually incompatible witness statements. Marcel has asked why nobody read them. | R20, R22–R24 | Makes clues available without connecting them. |
| TR-C3-03 | III.2 → III.3 | Swiss request | **Matthias:** “Ask the Belgian to repeat the one about the blind wheel. Precisely as he said it.” | CB05, R31 | The Analyst admits an excluded source may matter. |
| TR-C3-04 | Chapter III completion | Campaign resolution | No saboteur appears in the surviving record. The absence is not proof of innocence. It is, however, where the old certainty used to stand. | R21, R37 | Permits the intended inference without omniscience. |
| TR-C4-01 | Chapter IV Orders | Campaign Orders intro | **THE WAR OF ATTRITION.** No War stands alone. Every margin enters the final account; so did every choice that brought the armies here. | R19 | Total War differential becomes the chapter grammar. |
| TR-C4-02 | IV.1 → IV.2 | English memorandum | **Edmund:** “I accused Lorenzo of turning a possibility into a pistol. Bit awkward, discovering my own fingerprints on the other one.” | R27, CB08 | Confesses the mirror without making the men identical. |
| TR-C4-03 | IV.2 → IV.3 | unadorned Italian dispatch | **Lorenzo:** “I told Matthias what might happen. I did not tell him how much I wanted him to act.” | R28 | Lorenzo's missing theatrics carry the development. |
| TR-C4-04 | Chapter IV completion | Campaign resolution | **Matthias:** “I never proved it.”<br>**Marcel:** “Non. Neither did I.” | R29, R30, R37 | Final guaranteed exchange. End here; no Bastien or moral annotation follows. |

## 7. Non-Opponent Narrative Surfaces

The transition matrix carries the critical between-War story. Other surfaces stay sparse and optional.

| Surface | Sprint 1 content | Reliability and size | Content boundary |
| --- | --- | --- | --- |
| Campaign Orders | Chapter title, one compact premise, mode rule, unlock/completion/replay state, and the three authored opponents in War order | G; roughly 35–55 words plus mechanics | Do not present one “Campaign commander.” Locked chapters show premise, not later reveals. |
| War I → II and II → III | `TR-C*-02` and `TR-C*-03` attributed dispatches | G first play; one or two sentences | No multi-character staged scene required. |
| Campaign completion | `TR-C*-04`; unlock notice after the narrative beat | G; two sentences maximum | Completion, not victory, delivers and unlocks. Keep token/cosmetic reward copy visually separate. |
| Chronicle | Truthful combat entries plus occasional `lore_fragment` or equivalent compact contextual record | O; at most one story fragment per meaningful event cluster | Fog redaction remains authoritative. Required plot is duplicated on guaranteed surfaces. No persistent transcript requirement. |
| Field Manual | Five biographies; Mont-Rouge dossier; Accord/Witness Wheel glossary; chapter-unlocked source folios | G for unlocked durable lore; optional reading | A lore section may be a small addition to the current tab architecture; do not overwrite Rules, Chronicle, or Hall truth. |
| Biographies | Public role and personality initially; relationship/omission paragraphs unlock by chapter | G when chapter unlocks; 70–120 words per expansion | Never state private mouse/hay causality. Bastien is not narrator and is not a sixth identity. |
| Hall of Valor | Sparse flavor on citations or decorated-card detail, e.g. “The smallest rank has altered larger histories.” | O; one short caption | Never rewrite service statistics or imply lore changes a card's power. Commander attribution must use the actual War opponent. |
| Achievements | Reuse existing low-cost surfaces selectively: `Down the Rabbit Hole` can gain a Chapter-III lore note; `Never Tell Me the Odds` can echo Edmund; `War of Attrition` can echo Chapter IV | O; one unlocked lore sentence separate from mechanical description | Existing achievement criteria remain unchanged; no story gating. |
| Card backs/cosmetics | Rename or add future descriptions such as **Witness Blind**, **Sealed Pass**, **Rind-Seer's Folio**, and **Final Ledger** only as presentation copy | O | Unlocks may reward play but never carry required narrative or gate chapters. Avoid overwriting current generic items solely for lore. |
| War resolution | Outcome-specific commander reaction plus the encounter's guaranteed narrative beat | G+O; one reaction and one short beat | Narrative beat cannot depend on win/loss/tie. Current `GameOverSummary` has room but no narrative slot yet. |
| Profile/Campaign history | Show current War opponent and all three recorded opponents for completed Campaigns | G factual UI | Do not summarize a completed Campaign as though one commander fought all three Wars. |

### 7.1 Durable Field Manual folios

| Folio ID | Unlock | Title | Compact contents | Source affordance |
| --- | --- | --- | --- | --- |
| FM01 | I.1 complete | The Two Gruyère Traditions | Connected histories; characteristic French openings; Swiss small openings possible but not required | S01–S05 |
| FM02 | I complete | The Mont-Rouge Accord | Negotiators, purpose, fictional Witness Wheel ritual, unresolved anomaly | S01–S05 as context, not evidence of a real Accord |
| FM03 | II.1 complete | Cheese for Winter | Large wheels as stored summer milk; affineurs, stock, and communal production | S02, S06 |
| FM04 | II.2 complete | The Pass Ledger | Alpine routes, tolls, warehouses, salt, cheese, and strategic control | S07, S08 |
| FM05 | II complete | When Food Becomes Public Order | Nottingham's cheese riot and the material stakes behind absurd food conflict | S11 |
| FM06 | III.1 complete | Openings Without Intrigue | Natural eye formation needs gas, suitable texture, and nuclei; no fictional-case conclusion | S09, S10 |
| FM07 | III.2 complete | Rejected Folios | Fictional vermin notice, disturbed-store tally, replacement straw invoice, and cellar maintenance note | No link on each clue; one neutral archive heading |
| FM08 | III complete | Air in Small Places | Capillary microstructures can retain air and initialize eyes; link outward without annotating Mont-Rouge | S09 |
| FM09 | IV.1 complete | The Gloucester Descent | Cheese rolling as Edmund color: action, slope, and consequences | S12 |
| FM10 | IV.2 complete | Possibility and the Pass | How trade corridors make forecast, leverage, and security inseparable | S07, S08 |
| FM11 | IV complete | The Incident That Did Not Become a War | Pig War standoff as a de-escalation contrast; tiny causes do not force a tragic outcome | S13 |
| FM12 | I.3 complete | Tyromancy | Historical cheese divination as real-world vocabulary behind Bastien's fictional practice | S14 |

## 8. Progressive Commander Dossiers

The opponent identity block at the top table seat is a primary narrative affordance. Sprint 1 should make the whole identity block a keyboard-accessible, mobile-sized target that opens the current opponent's dossier in the Field Manual. A restrained focus/hover label such as **View Dossier** is sufficient; no persistent new chrome is required. This mirrors the existing casualty-to-Field-Manual pattern.

Dossiers are evolving historical records, not omniscient biographies. They add better historiography: sources, conflicting descriptions, revised confidence, and mundane records. They do not expose a commander's hidden motives before those motives become part of the record.

### 8.1 Presentation contract

- Show only sections with unlocked content. Do not render six empty boxes.
- Useful section names are **Overview**, **Background**, **Known Associations**, **Mont-Rouge Record**, **Campaign Notes**, and **References**.
- An early record may be annotated or supplemented later rather than silently rewritten. When history changes confidence rather than fact, preserve the old statement and add the new evidentiary note.
- A commander may use unexplained professional vocabulary in speech. The dossier or a source footnote can define `affineur`, appellation, transhumance, or eye nuclei.
- Do not add RPG attributes, friendship/morality meters, equipment, skill trees, or combat statistics. “Strategic temperament” is a plain-language description of the existing fair-play AI, not a stat sheet.
- Dossier entries use stable creative IDs but this document deliberately does not choose a TypeScript schema.

Record relationship values below mean:

- **new:** first record in that section;
- **supplement:** add a separate record without changing an earlier claim;
- **annotate:** retain the earlier quotation/record and add source context around it;
- **replace:** use only for an earlier neutral summary proven materially inaccurate. No planned entry currently needs replacement.

### 8.2 Marcel de Brie dossier progression

| ID | Unlock | Section | Player-facing record | Evidence / reveals | Source | Relationship | Private writer note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DOS-MAR-01 | First encounter, I.1 | Overview | **French master affineur and appointed negotiator.** Reputation: exacting cellar steward, formidable reserve planner, and defender of French provenance. | DT; R01–R03 | S02 (`affineur`) | new | Public craft and AI temperament only; no grievance yet. |
| DOS-MAR-02 | I.1 complete | Mont-Rouge Record | Co-authored the Mont-Rouge Accord with Matthias von Greyerz. French accounts state that von Greyerz suspended ratification after the Swiss Witness Wheel opened unexpectedly. De Brie characterized the suspension as a withdrawal of good faith. | DT + attributed SMI; R05–R09 | S01–S05 for context | new | Attribution matters: the dossier records Marcel's claim without endorsing intent. |
| DOS-MAR-03 | II.3 complete | Campaign Notes | De Brie proceeded under the negotiated framework without Swiss assent. French escorts later moved to reopen or secure a restricted route. De Brie maintains that delay would have killed the Accord; the record establishes that he chose to act. | DT + SSF note; R11, R14–R17 | S07–S08 | supplement | “Chose” quietly corrects “no choice” without accusing him of conscious deceit. |
| DOS-MAR-04 | III.2 complete | Mont-Rouge Record | **Evidentiary note:** surviving material establishes the suspension, the unilateral action, and de Brie's humiliation. It does not establish that von Greyerz intended to abandon either man or Accord. Rejected dairy folios are catalogued separately. | DT; R20, R22, R30 | FM07 | annotate DOS-MAR-02 | Better historiography, not a new biography paragraph. |
| DOS-MAR-05 | IV complete | Archived Statement | Asked whether von Greyerz had ever proved sabotage, de Brie answered: “Non. Neither did I.” | DT; R30, R37 | — | supplement | Do not add reconciliation or the natural mechanism. |

### 8.3 Matthias von Greyerz dossier progression

| ID | Unlock | Section | Player-facing record | Evidence / reveals | Source | Relationship | Private writer note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DOS-MAT-01 | First encounter, I.2 | Overview | **Swiss master cheesemaker and standards analyst.** Reputation: procedural precision, severe tolerances, and unusual willingness to publish an unfavorable measurement. | DT; R01–R04 | S01, S04 | new | Suggests honor before presenting his accusation. |
| DOS-MAT-02 | I.2 complete | Mont-Rouge Record | Supervised the Swiss Witness Wheel. When openings appeared at ratification, requested suspension pending inquiry. Swiss accounts describe the request as procedure; French accounts describe it as withdrawal. | DT + conflicting interpretations; R07–R09, R12 | S03–S04 | new | Neither account receives narrator endorsement. |
| DOS-MAT-03 | III.1 complete | Mont-Rouge Record | **Inquiry status amended:** testimony conflicts, chain-of-custody records are incomplete, and no surviving inquiry demonstrates a method of sabotage. Von Greyerz has withdrawn several earlier claims from the category “established.” | DT; R20–R21, R25 | S09–S10 | annotate DOS-MAT-02 | Does not say Marcel is innocent or name a natural cause. |
| DOS-MAT-04 | III.3 complete | Known Associations | Earlier files dismiss Bastien de Herve as inadmissible. A later archive request from von Greyerz asks for one pre-ratification prophecy “precisely as recorded.” | DT; R31, CB04 | S14 for tyromancy | supplement | Shows epistemic change through recordkeeping, not internal monologue. |
| DOS-MAT-05 | IV.3 complete | Archived Statement | “I never proved it.” | DT; R29, R37 | — | supplement | Keep it alone. A thesis would weaken it. |

### 8.4 Sir Edmund Gloucester dossier progression

| ID | Unlock | Section | Player-facing record | Evidence / reveals | Source | Relationship | Private writer note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DOS-EDM-01 | First encounter, II.1 | Overview | **English artisan-adventurer and irregular campaign adviser.** Public reputation: dry humor, excellent nerve, and a troubling belief that uncertain odds improve with momentum. | DT; strategy context | S12 | new | Cooper's Hill is flavor, not a claim that this fictional person attended a real event. |
| DOS-EDM-02 | II.1 complete | Known Associations | Long-standing confidant of Marcel de Brie. Present correspondence records Gloucester using the word “bluff” for the Swiss suspension and recommending immediate French action. Gloucester describes this as support. | DT + CO; R10–R11 | — | new | “Support” is his minimized frame, not dossier fact. |
| DOS-EDM-03 | III.2 complete | Mont-Rouge Record | **Archival note:** multiple drafts intensify from “delay” to “bluff” to “call it.” The progression supports deliberate goading more strongly than Gloucester's later summaries do. | DT evidence note; R27 | — | annotate DOS-EDM-02 | This is the Fog evidence-stage update despite no Edmund battle in Chapter III. |
| DOS-EDM-04 | IV.1 complete | Archived Statement | Gloucester acknowledged that action appealed to him, that he helped de Brie hear the advice de Brie wanted, and that not intending war did not erase the consequence. | DT; R27 | S12 optional character context | supplement | Accountability without mastermind framing. |

### 8.5 Lorenzo di Taleggio dossier progression

| ID | Unlock | Section | Player-facing record | Evidence / reveals | Source | Relationship | Private writer note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DOS-LOR-01 | First encounter, II.2 | Overview | **Italian Alpine merchant-prince and cheesemaker.** Adviser on passes, markets, and strategic exposure. Reputation: notices tomorrow's threat early—sometimes before tomorrow has agreed to it. | DT; strategy context | S07–S08 | new | The joke carries his useful acuity and anxious weighting. |
| DOS-LOR-02 | II.2 complete | Known Associations | Adviser to Matthias von Greyerz during the route crisis. His memoranda list plausible effects of unilateral French recognition: lost leverage, redirected trade, and eventual control of disputed passes. | DT/TI; R13–R16 | S07–S08 | new | The scenarios are real possibilities; the urgency is not yet adjudicated. |
| DOS-LOR-03 | III.2 complete | Mont-Rouge Record | **Comparative note:** successive memoranda preserve the same possibilities while shortening their projected timelines. No new French evidence accompanies the increased urgency. | DT evidence note; R13, R28 | — | annotate DOS-LOR-02 | Shows probability laundering without calling any scenario a lie. |
| DOS-LOR-04 | IV.2 complete | Archived Statement | “I named what might happen. Then I spoke as if I heard the key turn.” Taleggio accepted that his urgency helped produce the conditions he feared. | DT; R28 | S07 | supplement | Quiet phrasing is itself arc evidence. |

### 8.6 Bastien de Herve dossier progression

| ID | Unlock | Section | Player-facing record | Evidence / reveals | Source | Relationship | Private writer note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DOS-BAS-01 | First encounter, I.3 | Overview | **Occupation:** Tyromancer. **Affiliation:** none reliably established. **Military office:** none. **Reliability:** poor. **Predictive record:** disturbingly good. | Public record; no core reveal | S14–S16 | new | The contradictory reliability fields are the joke and function. |
| DOS-BAS-02 | I.3 complete | Archived Statement | “The blind wheel opened seven eyes. Four men closed eight.” **Recorded:** before ratification. **Contemporary meaning:** unknown. | PM; R31 | — | new | The wording never changes in later states. |
| DOS-BAS-03 | II complete | Archived Statement | Original statement preserved. **Period annotation:** several observers took “eyes” to mean rival inspection standards. Gloucester requested “another one, preferably with cavalry.” | PM + attributed interpretation; R31, CB06 | S03–S04 | annotate DOS-BAS-02 | Adds historical reception, not an answer. |
| DOS-BAS-04 | III.3 complete | Archived Statement | Original statement preserved. **Archive annotation:** the statement predates the Witness Wheel anomaly. “Four men” is consistent with the two negotiators and their principal advisers; no consensus exists regarding the arithmetic. | PM + evidence note; R27–R28, R31 | — | annotate DOS-BAS-02 | Powerful recontextualization used once. Do not annotate every prophecy this heavily. |
| DOS-BAS-05 | III.3 complete | Background | Herve-born rind-seer with no verified partisan service. His Mont-Rouge statements are obscure but internally consistent; no known statement assigns original guilt to France or Switzerland. | DT about record; R35–R37 | S15–S16 | supplement | Supports apolitical status without promoting Bastien to narrator. |
| DOS-BAS-06 | IV complete | Campaign Notes | Requests for a final prediction are absent from the surviving correspondence. | DT within fictional archive; CB06 | — | supplement | A quiet endgame joke. Bastien does not explain anything. |

### 8.7 Delivery-channel map for major beats

| Narrative job | Spoken dialogue | Progressive dossier | Field Manual/archive | Transition/Orders | External rabbit hole |
| --- | --- | --- | --- | --- | --- |
| Define the two traditions | Marcel/Matthias speak craft-first, not glossary-first | Overview establishes profession and side | FM01 explains openings and `affineur` | TR-C1-01 frames the wheels | S01–S05 |
| Establish competing betrayal accounts | Principals state sincere interpretations | DOS-MAR-02 / DOS-MAT-02 attribute each account | FM02 holds neutral chronology | TR-C1-02/04 guarantee conflict | None required |
| Explain adviser roles | Edmund/Lorenzo defend their counsel | DOS-EDM-02 / DOS-LOR-02 preserve correspondence | FM04 explains pass stakes | TR-C2-02/03 mirror them | S07–S08, S12 |
| Establish first blood and retaliation | Marcel reacts to consequence; quips remain nonessential | Campaign notes add attributed actions | FM05 supplies real material-stakes context | TR-C2-04 guarantees the turn | S11 |
| Fracture the sabotage case | Matthias speaks the evidentiary gap; Marcel speaks inferred intent | DOS-MAT-03 / DOS-MAR-04 amend confidence | FM06–FM08 hold science and mundane folios | TR-C3-02/04 guarantee accessible inference | S09–S10 |
| Recontextualize Bastien | Bastien varies imagery; Matthias asks to hear it | DOS-BAS-02 remains while annotations evolve | FM12 explains only the real practice | TR-C3-03 foregrounds the request | S14–S16 |
| Admit accelerant responsibility | Edmund and Lorenzo own their weighting | DOS-EDM-04 / DOS-LOR-04 preserve statements | FM09/FM10 add character context | TR-C4-02/03 bridge the symmetry | S07, S12 |
| Resolve original-betrayal question | Matthias gives the short admission | DOS-MAT-05 and DOS-MAR-05 archive both | No explanatory folio follows immediately | TR-C4-04 guarantees both lines | S13 is an optional de-escalation contrast |

## 9. Bastien Prophecy Ledger

The private meaning column is writer-only. Never expose it as a punchline annotation.

| ID | Player-facing wording | First appearance | Literal private meaning / canonical event | Why listeners misunderstand | Later recontextualization | Still amusing? |
| --- | --- | --- | --- | --- | --- | --- |
| P01 | “The blind wheel opened seven eyes. Four men closed eight.” | I.3 introduction | The Swiss wheel develops openings; Marcel, Matthias, Edmund, and Lorenzo each close themselves to uncertainty. “Seven” is poetic specificity, not a required canonical count. | It sounds like bad arithmetic and occult criticism. | III.3: records open while the principals' certainty closes; Matthias asks to hear it again. | Yes—the arithmetic remains a Bastien joke while the image becomes sad. |
| P02 | “A meadow entered the cellar grain by grain. No cow followed.” | I.3 large Battle | Plant microstructure from disturbed dry fodder enters the cheesemaking environment. | Heard as pastoral nonsense or a supply warning. | III.2 rejected straw/hay records + III.3 air-in-stem imagery. | Yes, because “no cow followed” is both silly and exculpatory. |
| P03 | “Two honest men will bury a traitor who was never born.” | I.3 War resolution | Marcel and Matthias sincerely accuse an original betrayer who does not exist. | Listeners assume paradox, insult, or a future child. | III completion finds no saboteur; IV admissions empty the original accusation. | Less comic, intentionally; the phrasing still has deadpan absurdity. |
| P04 | “The smallest guest takes no chair, yet orders every army from the table.” | I.3 special clash | The mouse initiates the trivial physical chain; the Two/Ace rule supplies a safe surface reading. | Heard as a card joke, spy warning, or dinner etiquette. | III.3 “guest” becomes microscopic cause; IV shows armies moved by accumulated choices. | Yes—the table/card double meaning improves. |
| P05 | “Breath sleeps in the stem. Warmth teaches it to shout.” | I.3 deep Battle, reinforced III.3 | Air trapped in capillary plant structures supplies eye nuclei; gas during ripening expands the eyes. | Sounds like weather divination or drunken botany. | FM06/FM08 and III.3 make the physical mechanism inferable. | Yes; it is nearly an accurate science mnemonic. |
| P06 | “One friend says wait. One friend says now. The curd hears only drums.” | I.3 optional reaction | Lorenzo urges preemption; Edmund urges action; neither intends the war that follows. | Heard as generic counsel about indecision. | II reveals the two friends; IV reveals their accountability. | Yes, especially after the mirrored admissions. |
| P07 | “The first casualty will have no suit, no rank, and no grave.” | I.3 tie/deep Battle | Certainty dies before the first bloodshed; the line also withholds the card-game answer the listener expects. | Heard as evasive battlefield prophecy. | III.1 evidentiary fracture and IV.3 admission identify the casualty. | Yes—the anti-card answer remains clean. |
| P08 | “When the sealed bones speak, they will disagree about who buried them.” | I.3 optional; callback in III | Contradictory records and Fog-sealed casualty history complicate retrospective claims. | Heard as necromancy, which irritates Bastien because it is clearly tyromancy. | III Fog presentation and archive contradictions make it literal in two registers. | Yes; Bastien may correct “necromancy” exactly once. |
| P09 | “There is no knife in the wheel. Men will sharpen one from the absence.” | III.3 introduction variant | No sabotage evidence exists; the absence itself becomes suspicious through motivated inference. | By III it is alarming, not incomprehensible. | IV admissions complete the distinction between absence and proof. | Dryly, but the primary effect is dread. |

Prophecies unrelated to Mont-Rouge may remain mundane or useless—weather in a cellar, a cracked crock, a missing spoon—but must be clearly separated from ledgered canon lines so Bastien never becomes a troll by accident.

## 10. Cross-Chapter Callback Ledger

| ID | Early wording / event | Original interpretation | Later wording / event | Revised interpretation | Characters |
| --- | --- | --- | --- | --- | --- |
| CB01 | “I had his word.” (I.1) | Matthias broke a clean promise. | “His word was why I mistook delay for intent.” (III.2 meaning) | Trust, not evidence, powered Marcel's certainty. | Marcel ↔ Matthias |
| CB02 | “I had no choice but to keep the Accord alive.” (I.1/II.3) | Unilateral action was forced. | “A cellar offers choices, monsieur. Some merely spoil while one is choosing.” (III.2) | “No choice” was self-serving fear of loss. | Marcel |
| CB03 | “The record is exact.” (I.2) | Precision guarantees Matthias's conclusion. | “The record is exact in three incompatible directions.” (III.1) | Exact fragments do not create a complete causal story. | Matthias |
| CB04 | Matthias calls Bastien “inadmissible.” (I.2) | Tyromancy is comic noise. | “Repeat the blind-wheel statement. Precisely.” (III transition) | Matthias learns that his framework excluded a consistently accurate witness. | Matthias ↔ Bastien |
| CB05 | P01/P02/P04/P05 in I.3 | Random pastoral insanity. | III.2 records + III.3 variations + FM08 | The symbolic system was coherent and literal enough to solve. | Bastien + player |
| CB06 | “Go on, then. What does the cheese say?” (II.1) | Edmund enjoys danger and prophecy as sport. | “Don't ask him. We have heard enough from things we laughed at.” (IV.1) | Humor has become a guilt barometer. | Edmund ↔ Bastien |
| CB07 | “Splendid odds.” (II.1) | Uncertainty makes action fun. | “The odds were not splendid. I was.” (IV.1) | Edmund owns vanity and appetite without inventing malice. | Edmund |
| CB08 | Edmund calls Lorenzo an alarmist; Lorenzo calls Edmund reckless. (II transitions) | Opposite flaws. | Each recognizes his own method in the other (IV.1/IV.2). | They are mirror accelerants: permission versus urgency. | Edmund ↔ Lorenzo |
| CB09 | “If we wait for the trap to close, we have agreed to be caught.” (II.2) | Preemption is prudence. | “I heard a hinge and announced a prison.” (IV.2) | Lorenzo converted possibility into felt certainty. | Lorenzo |
| CB10 | Marcel mocks Matthias's eleven-minute correction (I.1); Matthias corrects Marcel's cellar temperature (I.2). | Comic pedantry between enemies. | Both references recur more gently in III.1/III.2. | They remember one another's craft because they once respected it. | Marcel ↔ Matthias |
| CB11 | P03 “traitor who was never born” (I.3) | Empty paradox. | TR-C3-04 and final two-line exchange | The original betrayer is not undiscovered; the role itself is empty. | Bastien, Marcel, Matthias |
| CB12 | Limited Reserves says each reserve can be spent once. | Mechanical scarcity. | Total War says every spent card remains in the final account. | Chapter mechanics model escalation first as constraint, then accumulation. | All / neutral framing |
| CB13 | Marcel and Matthias each call the other's action “the first betrayal.” | One chronology should win. | IV.3 distinguishes action, belief, and proof. | The incompatible moral chronologies share one evidentiary failure. | Marcel ↔ Matthias |
| CB14 | Bastien says certainty will be the first casualty. | Cute non-card answer. | Matthias stops quantifying and says “I never proved it.” | The Analyst's lost certainty is the prophecy's emotional fulfillment. | Bastien ↔ Matthias |

## 11. Rabbit-Hole and Source Map

Sources were rechecked on **2026-08-25**. The Mont-Rouge Accord, Witness Wheels, commanders, and causal accident remain fiction. Scientific sources describe mechanisms in Swiss-type cheese; they do not document a historical Mont-Rouge event or prove that every Gruyère wheel behaves identically.

| ID | Player-facing anchor | Verified source | Earliest safe chapter | Why it is interesting | Story / character / joke function | Spoiler risk |
| --- | --- | --- | --- | --- | --- | --- |
| S01 | “A tradition recorded since 1115” | [Interprofession du Gruyère — The history](https://www.gruyere.com/en/le-gruyere-aop/the-history) | I | Producer history describes medieval production, sale into France and Italy, geographic spread, and protection efforts. | Gives Marcel and Matthias genuinely connected inheritances rather than unrelated national brands. | Low |
| S02 | “The affineur and the cheese kept for winter” | [Gruyère de France — Notre histoire](https://www.gruyere-france.fr/notre-histoire/) | I | French producer history covers cross-border craft, `fromage de garde`, village cooperation, affineurs, and the 2004 joint declaration. | Lets Marcel speak naturally while the dossier supplies definitions; supports Limited Reserves stock language. | Low |
| S03 | “Openings from pea to cherry” | [INAO — Gruyère IGP](https://inao.gouv.fr/produit/gruyere-4500) | I | The French regulator states that openings are required and describes their characteristic size. | Makes the eye dispute technically real enough to sustain the joke and ceremony. | Medium |
| S04 | “A few small openings are possible, not required” | [Interprofession du Gruyère — Characteristics](https://www.gruyere.com/en/le-gruyere-aop/characteristics) | I | The Swiss producer specification avoids the false simplification that authentic Swiss Gruyère must contain literally no opening. | Gives Matthias a precise correction and protects factual accuracy. | Medium |
| S05 | “PDO, PGI, and why names become law” | [European Commission — Geographical indications for food and drink](https://agriculture.ec.europa.eu/farming/geographical-indications-and-quality-schemes/geographical-indications-food-and-drink_en) | I | Official overview distinguishes PDO and PGI links to region and production. | Supports the Accord's straight-faced bureaucratic gravity. | Low |
| S06 | “The Alpine pasture season” | [UNESCO Intangible Cultural Heritage — Alpine pasture season](https://ich.unesco.org/en/RL/alpine-pasture-season-01966) | II | Describes seasonal herding, on-site cheesemaking, shared skills, cooperatives, and community ties. | Makes summer milk, winter stock, and transhumance matter materially. | Low |
| S07 | “The pass as warehouse, tollgate, and weapon” | [Swiss National Museum — The geopolitician from Brig](https://blog.nationalmuseum.ch/en/2023/09/the-geopolitician-from-brig/) | II | Institutional history describes the Simplon route, warehouses, tolls, troop movement, and trade in cheese, grain, salt, and arms. | Grounds Lorenzo's plausible fears and the pass economy without validating his urgency. | Low |
| S08 | “Salt and cheese over three passes” | [SWI swissinfo — Old Alpine trading route revived](https://www.swissinfo.ch/eng/archive-banking-fintech/old-alpine-trading-route-revived/995202) | II | Recounts the historical Sbrinz route, pack animals, tolls, risks, and exchange of cheese/salt for wine, spices, and textiles. | Supplies route-ledger texture and jokes about customs forms surviving mountains. | Low |
| S09 | “Air sleeping in a capillary” | [Agroscope repository — *Nuclei carrying entrapped air are the most likely starting points for eye formation*](https://ira.agroscope.ch/en-us/Cms/Publikation?einzelpublikationId=67615&parentUrl=%2Fen-us%2FCms%2FProjekt%2FIndex%2F4892) | III after III.3 | The 2026 open research record explains capillary structures, entrapped microscopic air, CO₂ diffusion, and experimental support for eye nuclei; it discusses hay-particle inspiration. | The strongest optional route by which a curious player can solve the physical class of cause. Never annotate Mont-Rouge beside it. | Critical |
| S10 | “Four things an eye needs” | [Agroscope — *What factors affect eye development in Swiss cheese?*](https://ira.agroscope.ch/en-US/Page/Einzelpublikation/Download?einzelpublikationId=17389) | III after III.1 | Accessible institutional explainer names gas, gas pressure/solubility, nuclei, and suitable texture/rind. | Gives FM06 a safe natural-mechanism overview before the more dangerous hay-capillary paper. | High |
| S11 | “The mayor felled by a cheese” | [University of Nottingham — Cheesed Off! Nottingham Food Riots](https://www.nottingham.ac.uk/home/featureevents/2023/cheesed-off-nottingham-food-riots-c.1750-1800.aspx) | II after completion | University historians connect the 1766 cheese riot to food prices and common eighteenth-century food protest. | A real event sounds like the game's joke while proving that absurd food disputes can express serious scarcity. | Low |
| S12 | “A wheel down a 45-degree hill” | [Gloucestershire Archives — Cheese-rolling](https://www.gloucestershire.gov.uk/archives/learning-for-all/online-exhibitions/here-we-are-now-entertain-us/) | II | County archives describe Cooper's Hill, the heavy Double Gloucester wheel, steep course, speed, and earliest written evidence. | Character texture for Edmund's appetite for decisive hazardous motion; not a plot cause. | Low |
| S13 | “The war whose only casualty was a pig” | [U.S. National Park Service — The Pig War](https://home.nps.gov/sajh/learn/historyculture/the-pig-war.htm) | IV after completion | Official park history traces a trivial incident, mutual deployment, restraint, joint occupation, and arbitration without human bloodshed. | A counter-history: a tiny cause can escalate, but people can still choose not to complete the tragedy. | Low after ending |
| S14 | “Divination by cheese” | [Diderot and d'Alembert's *Encyclopédie* — “Tiromancie” transcription](https://fr.wikisource.org/wiki/L%E2%80%99Encyclop%C3%A9die/1re_%C3%A9dition/TIROMANCIE) | I after I.3 | An approachable transcription of the historical encyclopedia entry defines a form of divination using cheese. | Confirms Bastien's profession has a real lexical ancestor without authenticating his gameplay prophecy. | Low |
| S15 | “Herve: a small square of great character” | [VISITWallonia — Cheeses of Wallonia](https://visitwallonia.com/en-gb/3/i-love/food-and-drink/specialities/cheese) | I after I.3 | Regional tourism material describes Herve cheese, raw cow's milk, humid caves, long local tradition, and serving customs. | Gives Bastien Belgian rind/cellar vocabulary beyond accent and prophecy. | Low |
| S16 | “Fromage de Herve PDO” | [EUR-Lex — Regulation (EC) No 1263/96](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A31996R1263) | I after I.3 | The official EU record lists Fromage de Herve as a protected designation of origin. | Another absurdly serious appellation footnote for Bastien's dossier. | Low |
| S17 | “Salt preserves cheese; passes move armies” | [Swiss National Museum — Neutrality as a business model](https://blog.nationalmuseum.ch/en/2023/09/neutrality-as-a-business-model/) | II | Institutional history links Alpine passes, troops, trade leverage, and salt indispensable to preserving cheese and meat. | Supports Marcel's preservation language and Lorenzo's strategic-pass language from the same real context. | Low |

Source placement favors dossier **References**, unlocked Field Manual folios, and optional Chronicle detail. Mandatory dialogue should never contain a raw URL or explain why a joke is funny.

## 12. Truthfulness Audit

| Speaker/surface | Representative claim | Classification | What is true | What is incomplete, framed, or omitted | Safe disclosure point |
| --- | --- | --- | --- | --- | --- |
| Marcel | “Matthias abandoned the Accord.” | SMI | Matthias suspended ratification. | Intent and permanent abandonment are Marcel's inference. | I |
| Marcel | “I had no choice.” | SSF | Delay threatened the Accord and his reputation. | Marcel had alternatives and knowingly chose unilateral action. | I–II, challenged III |
| Marcel | “Edmund advised me; I decided.” | TI | Both clauses are true. | Early versions minimize how precisely Edmund worked on his pride. | II |
| Marcel | “The records prove his intent.” | **Forbidden formulation** | The records prove acts and timing. | They do not prove intent. Never let him state this as objective fact outside clearly heated self-presentation. | — |
| Matthias | “Suspension was procedure.” | SSF/TI | Investigation was responsible and the anomaly unexplained. | Humiliation and suspicion affected his choice and later certainty. | I |
| Matthias | “Marcel exploited the anomaly.” | SMI | Marcel proceeded during the suspension. | Exploitation and foreknowledge are inferred. | I |
| Matthias | “No mechanism is established.” | DT | No sabotage mechanism or culprit was proven. | This does not by itself prove the exact natural cause. | III |
| Edmund | “I supported Marcel.” | TI/CO | He did support his friend. | He deliberately escalated the language and enjoyed prompting action. | II; corrected IV |
| Edmund | “I did not want war.” | DT/TI | He did not intend war. | Intention does not erase the consequence or foreseeable risk. | IV |
| Lorenzo | “I listed possibilities.” | TI/CO | His threatened outcomes were genuinely plausible. | He compressed timelines and gave worst cases emotional priority. | II; corrected IV |
| Lorenzo | “We were already encircled.” | SMI/SSF | French unilateral action threatened leverage. | Literal encirclement was not established. | II |
| Bastien | P01–P09 | PM | Each major Mont-Rouge prophecy corresponds to canon. | Symbolic language prevents ordinary evidentiary use; he does not expose the exact chain. | I and III per ledger |
| Bastien | Unrelated forecast | PM or comic uncertainty | May be sincere and mundane. | Never use a consciously false Mont-Rouge forecast for a joke. | Any safe context |
| Dossier | “French accounts characterize…” | DT attribution | The dossier truthfully records a source's claim. | Attribution must not be flattened into narrator endorsement. | Per unlock |
| Field Manual science | “Capillary nuclei can seed eyes.” | DT real-world context | Supported for Swiss-type cheese mechanisms. | It does not prove the fictional event or every Gruyère anomaly. | III |
| Completion exchange | “I never proved it.” / “Neither did I.” | DT about their evidence | Neither principal proved the original accusation. | Neither knows the exact private accident with omniscient certainty. | IV |

No curated core fragment requires a conscious lie. Edmund and Lorenzo consciously minimize their influence; they do not invent the original evidence. Bastien never knowingly lies about Mont-Rouge.

## 13. Spoiler Firewall

### Chapter I

- Permit R01–R09 and R31–R35 only in their early forms.
- Do not mention vermin, hay/straw movement, trapped air, structural nuclei, or natural eye formation.
- Do not foreground the absence of sabotage evidence. Matthias may say “unexplained,” not “unsupported.”
- Dossiers contain public roles, attributed accusations, and neutral acts only.

### Chapter II

- Permit R10–R19 and adviser minimizations.
- Scarcity, impoundment, pass restriction, escorts, bloodshed, and retaliation are safe.
- The story must still appear to have an instigator. Do not link any mundane record to the wheel.
- Edmund and Lorenzo dossier entries record counsel and possibilities, not late accountability.

### Chapter III

- Permit R20–R26 and recontextualized R31–R36.
- Natural formation may be described as a class of mechanism; the fictional causal chain remains unstated.
- R23 and R24 live in boring archival fragments. R26 lives in optional science. Never place all three in one explanatory sentence.
- Dossier annotations may lower confidence in sabotage but must not claim Marcel/Matthias know the precise cause.

### Chapter IV

- Permit R27–R30 and the final inference R37.
- Characters may admit their weighting, choices, and lack of proof.
- Do not give them sudden omniscience, reconciliation, or a new villain.
- Do not follow `TR-C4-04` with Bastien, a mouse, a moral, a source popup, a reward joke, or an explanation. UI rewards/unlock notices appear after a respectful beat.

## 14. Sprint 1 Implementation Handoff

This section records architecture implications only. No runtime code is changed by this creative pass.

### 14.1 Verified current mismatch

- `ActiveCampaign` owns one required `commanderId`.
- `CampaignProgressionService.currentCommander` derives only from `currentCampaign.commanderId`.
- `GameControllerService.opponentCommander`, table seat presentation, AI evaluation, reaction selection, telemetry start context, and profile callout all consume that campaign-level identity.
- `CampaignWarRecord` stores War ID, outcome, margin, deck color, and completion time—but no commander identity.
- `CampaignHistoryEntry` stores one optional `commanderId`, so completed Campaign history cannot truthfully name all three opponents.
- `CampaignProgressionService` rotates commanders only after War III through `selectNextCommander`; it does not schedule a commander per War.
- Hall of Valor citation attribution currently reads `currentCampaign.commanderId`.
- `campaign_resolved` telemetry currently emits the single history-level commander.

### 14.2 Minimal target concept

The canonical scheduler need be no more general than:

```text
chapter/mode + warIndex → commanderId
```

Required consequences:

1. Resolve the active opponent from the authored schedule for first-play narrative and initial replay behavior.
2. Preserve `commanderId` on every `CampaignWarRecord`.
3. Derive current commander from the current War encounter, not a single Campaign owner.
4. Represent completed Campaign history as three recorded War opponents; retire or reinterpret the single history commander field through migration.
5. Attribute commander-specific career/Hall statistics and telemetry to the actual War opponent.
6. Update table seat, opponent profile, Campaign Orders, Profile/Campaign history, War resolution, and dialogue condition input to the active War opponent.
7. Keep in-progress legacy Campaigns stable. If an old Campaign has one commander and one or more completed Wars, preserve recorded/active identity sensibly during migration; do not reroll on reload.
8. Continue legacy access grandfathering and completion-not-victory chapter unlocks from `narrative-canon.md`.

Randomized replay scheduling is explicitly deferred to the pre-production polish pass after the player has completed the canonical four-chapter campaign at least once. Sprint 1 does not require a replay selector or procedural scheduler.

### 14.3 Dialogue and transition seams

Current `TableReactionService` supports sparse reactions for:

- 2-defeats-Ace special clash;
- Jack-over-Ten narrow clash;
- successful and failed reinforcement;
- notable Battle loss selected from Ace, Two, Ace+Two, deep Battle, large loss, and general pools.

The commander model already declares `concession` and `desperateRescue` pools, but the reaction service does not currently emit them. The curated bank also requires small new hooks for:

- chapter + War + commander conditioned selection;
- opponent introduction;
- War result and guaranteed War-resolution narrative beat;
- War I→II and War II→III dispatch;
- Campaign completion beat independent of outcome;
- optional narrative Chronicle/Field Manual unlock;
- replay-safe versus first-play-only selection.

A filtered line record or keyed overlay is sufficient. Do not build a quest graph, dialogue tree, relationship system, persistent transcript, or general scripting engine.

### 14.4 Progressive dossier seam

- Make the entire opponent name/title block at the top table seat a reasonable touch target and keyboard control.
- Activation opens or deep-links to that commander's currently unlocked dossier inside the Field Manual.
- Preserve focus return and Escape behavior consistent with the existing drawer.
- The dossier resolver needs commander + chapter completion/encounter state and a small ordered set of creative entries. It does not need a character-sheet framework.
- Entry metadata conceptually carries creative ID, commander, unlock, section, text, evidence classification, reveal IDs, optional source, relationship to an older entry, and private writer note.
- Dossier unlocked state should derive from durable chapter/encounter progress where possible; do not create dozens of independent booleans.
- `aria-label` should name the target and action, for example “View dossier for Marcel de Brie.” Preserve phone-scale touch sizing and visible focus.

### 14.5 Existing presentation constraints

- Campaign Orders is currently a forced pre-War-I modal and lists modes in Standard, Limited, Total, Fog order. Sprint 1 must reorder to narrative order and add locked/completed/replay states plus the authored three-opponent preview.
- `StoryBookService` is an in-memory tactical Chronicle. Narrative fragments may complement, not corrupt, its truthful combat entries.
- `StoryBookDrawerComponent` currently exposes Chronicle, Hall of Valor, Rules of Engagement, and contextual Card Reference. A dossier/lore destination should extend or deep-link within this architecture without displacing those functions.
- Active Fog seals historical card identities and Hall records but not the current face-up clash. New narrative records must respect the same presentation boundary.
- `GameOverSummaryComponent` provides War resolution and Total War differential but no commander reaction/narrative slot or distinct Campaign-completion interstitial.
- Achievements and card backs have description surfaces, but required plot cannot be gated behind their criteria or token economy.

## 15. Creative Validation Results

### Canon pass

- All R01–R37 map to the immutable chronology in `narrative-canon.md`.
- No saboteur, mastermind, forged wheel, switched cheese, partisan Bastien, guilty principal, or sixth commander was introduced.
- Exact mouse/hay causality appears only in private writer meanings and source-risk annotations.

### Twelve-War authored-sequence pass

- The sequence reads Marcel → Matthias → Bastien → Edmund → Lorenzo → Marcel → Matthias → Marcel → Bastien → Edmund → Lorenzo → Matthias.
- Every return advances time, knowledge, or accountability.
- Edmund/Lorenzo are symmetrical in function but distinct in rhythm and moral vocabulary.
- Bastien's second encounter transforms the first without changing him.
- Marcel's third appearance is doubt rather than accusation; Matthias's third earns the final admission.
- Guaranteed intros, transitions, resolutions, dossiers, and completion beats preserve comprehension if every reactive quip is missed.

### Spoiler and truthfulness pass

- Chapter firewalls above were checked against every reveal, transition, dossier entry, prophecy, and callback.
- Accusations remain sincere mistaken inference. Self-serving language is labeled as framing, not converted into conscious lies.
- Real-world eye science is framed as mechanism context, never proof of the fictional event.

### Replay/rereading pass

- Chapter-I Marcel remains sincere after the ending; familiarity and trust make his anger sadder rather than dishonest.
- Chapter-I Matthias's precision conceals emotion without falsifying his procedural account.
- Bastien's major nonsense remains canonically exact.
- Chapter-II adviser defenses foreshadow their later accountability without making either secretly omniscient.
- First-play lines carrying ordered reveals are marked unsafe for randomized replay in the companion bank; personality reactions remain reusable.

### Dossier spoiler pass

- Each dossier state contains only public or evidentially justified information at its unlock point.
- Dossiers attribute disputed interpretations and never endorse them as narrator truth.
- Fog annotations improve confidence calibration rather than label material as a “clue.”
- Links unlock only at their safe chapter, and Bastien's one evolving prophecy annotation changes context without changing the prophecy.
- Dossiers absorb definitions and source notes so commander dialogue can remain natural.

### Accessibility/readability pass

- Guaranteed fragments are one or two short sentences.
- Accent flavor is not required to understand any fact.
- Dossier table fields are creative metadata; player presentation should use short paragraphs, meaningful headings, and ordinary screen-reader order.
