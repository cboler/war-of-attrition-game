# War of Attrition — Commander Voice Bible & Curated Dialogue Bank

Status: **Authoritative creative writing package for Narrative Sprint 1.**

This document defines the five canonical voices and supplies preferred, implementation-ready dialogue for the twelve authored first-play encounters in [`narrative-disclosure-matrix.md`](./narrative-disclosure-matrix.md). It specifies creative records, not their final TypeScript schema.

The permanent mappings are:

| Strategy ID | Canonical commander |
| --- | --- |
| `quartermaster` | Marcel de Brie |
| `gambler` | Sir Edmund Gloucester |
| `analyst` | Matthias von Greyerz |
| `attritionist` | Bastien de Herve |
| `cornered-general` | Lorenzo di Taleggio |

Bastien is both the Belgian commander and the Tyromancer. Nobody receives a gameplay power, hidden-card access, or an exception to the physical rules.

## 1. Global Voice Rules

The desired register is silly, selectively caricatured, compact, and immediately readable. The interface remains dignified; the people supply the absurdity.

### 1.1 Accent and accessibility

- Personality, syntax, rhythm, professional vocabulary, and metaphor carry identity before nationality does.
- Use at most one or two phonetic signals in a short line. Do not transform every `th`, drop every consonant, or imitate broken English.
- Regional interjections are punctuation, not the entire voice.
- A screen reader must produce intelligible content. Specialized terms belong in a progressive dossier or optional source link when context alone is insufficient.
- Never encode a required reveal only in a pun, homophone, phonetic spelling, or untranslated phrase.
- Dialogue should generally fit in one or two phone-scale lines. Guaranteed narrative beats may be two short sentences.

### 1.2 Humor and dramatic control

- Prefer jokes that characterize, reveal craft, and carry lore simultaneously.
- Rotate among tasting notes, production language, specifications, logistics, prophecy, bureaucratic absurdity, real history, and plain understatement. Do not make every joke a cheese-name pun.
- Silence is valid. A large casualty can land harder without a quip, especially late in Chapter IV.
- Characters do not explain their own joke or profession for the player's benefit. Dossiers do that work.
- Nobody consciously jokes about the private mouse/hay mechanism.

### 1.3 Knowledge discipline

- Marcel and Matthias sincerely accuse one another. They may overstate inference but do not knowingly fabricate the original grievance.
- Edmund and Lorenzo minimize their influence until Chapter IV; neither planned war or forged evidence.
- Bastien tells the truth about Mont-Rouge through metaphor. His apparent unreliability is interpretation failure, not trolling.
- Required plot lives in `G` records. Sparse table lines may reinforce but never become the only delivery channel.

## 2. Creative Record Conventions

Every bank row conceptually carries:

- stable creative ID;
- chapter and War index (encoded in the ID and section);
- commander or narrative surface;
- trigger and reliability;
- preferred line;
- reveal/callback IDs;
- intended player inference;
- private writer meaning;
- truthfulness class;
- replay safety;
- optional source association.

Trigger labels:

- **G intro / G context / G resolution:** new guaranteed Sprint 1 surfaces.
- **special clash, narrow clash, rescue, failed rescue, Battle loss:** existing reaction concepts. Current narrow-clash code is specifically Jack over Ten.
- **concession / desperate rescue:** existing commander pools that need an emitting service seam.
- **result:** a new War-result reaction selected independently of victory-gated narrative.
- **contextual:** chapter-aware optional line chosen only where its reveal is already safe.

Line role:

- **CS:** chapter-specific; preserve authored order and disclosure firewall.
- **EV:** evergreen personality line safe wherever that commander's identity and ordinary mechanic are available.

Replay safety:

- **First:** first-play or canonical ordered replay only.
- **Post-C#**: safe once the named chapter is complete, including a later randomized replay system.
- **Any:** order-independent evergreen line.

Truthfulness abbreviations match the disclosure matrix: **DT**, **TI**, **SMI**, **SSF**, **CO**, and **PM**.

## 3. Commander Voice Bible

### 3.1 Marcel de Brie — `quartermaster`

**Core voice:** French master affineur, aristocratic culinary pride, conservative logistics, and wounded honor. He talks as though every decision will be judged after eighteen months on spruce.

**Sentence shape:** Declarative judgments; elegant parallel clauses; occasional direct address (`monsieur`); a flourish followed by a precise cellar image. When genuinely hurt, the flourish drops first.

**Mental vocabulary:** vintage, maturation, cellar, provenance, reserve, stock, rind, lineage, patience, stewardship, spoilage, tasting notes, things too valuable to squander.

**Humor engine:** An insult is a professional evaluation: under-aged courage, over-salted reasoning, a finish of panic, bureaucratic rind with no paste beneath it.

**Selective flavor:** `monsieur`, `non`, `mais`, and occasional readable `zis`/`zat`. Never transform every `th`. Authentic vocabulary such as `affineur`, `morge`, `cahier des charges`, and `affinage` can appear when context carries the immediate meaning and the dossier carries the definition.

**AI embodiment:** High-value cards are mature stock. Reinforcement is requisitioning something irreplaceable. Concession can be stewardship, not cowardice.

**Emotional movement:** Pomposity → a half-beat of silence → direct hurt. Across chapters: certainty → justification → doubt.

**Relationship tells:** He knows Matthias's preferred temperatures, corrections, pauses, and signatures. He calls Edmund reckless with fondness. He treats Lorenzo as a forecast in search of a storm. Bastien receives irritation because the nonsense lands too near the cellar.

**Never:** generic seduction, constant `hon hon`, exhaustive phonetics, cowardice, ignorance of craft, or a knowingly false sabotage accusation.

### 3.2 Matthias von Greyerz — `analyst`

**Core voice:** Swiss precisionist whose formal logic is both sincere method and emotional armor.

**Sentence shape:** Numbered corrections, measured clauses, terms such as “establish,” “variance,” and “documented.” Early lines may contain exact figures that are comically unnecessary. Late lines become shorter and less quantified.

**Mental vocabulary:** measurement, count, tolerance, specification, process, probability, documented fact, variance, chain of custody, sample, interval, category.

**Humor engine:** Applies laboratory exactness to etiquette, insults, and catastrophes. His driest joke is often a correction nobody requested.

**Selective flavor:** `ja`, `nein`, `ach`; clipped cadence. Do not reduce him to a generic German stereotype or scatter umlauts through English.

**AI embodiment:** Public candidate pools and visible casualty data are models, not clairvoyance. Fog of War frustrates presentation without giving him hidden knowledge.

**Emotional movement:** More precision when threatened; self-correction when the evidence turns; almost no precision at the final admission. Across chapters: certainty → evidentiary fracture → admission.

**Relationship tells:** He corrects Marcel because he remembers Marcel's process. Lorenzo is trusted for seeing threats, then reassessed for weighting them. Edmund is “a sample size of one with the confidence of a census.” Bastien is first inadmissible, later requested verbatim.

**Never:** robotic lack of feeling, magical calculation, fake omniscience, a conscious falsehood about Marcel, or a technical lecture in the final scene.

### 3.3 Sir Edmund Gloucester — `gambler`

**Core voice:** English artisan-adventurer, dry absurdist, and cheerful advocate for inadvisable decisive action.

**Sentence shape:** Short setup, understated catastrophe, upbeat tag. `Right, then.`, `Splendid.`, `Rather.`, and `Bit awkward, that.` are useful but should not lead every line.

**Mental vocabulary:** odds, bluff, hand, table, pot, slope, wager, shot, sporting, momentum, nerve, a decent story told afterward.

**Humor engine:** Treats danger as recreation and disaster as a social inconvenience. His late humor turns on himself rather than disappearing.

**Accent:** Vocabulary and understatement do the work. No phonetic British spelling is needed.

**AI embodiment:** A marginal reinforcement is an invitation. A supported tie is interesting. Reserve depletion is not automatically a deterrent.

**Emotional movement:** Early jokes invite escalation; late jokes expose his own rationalization. Across chapters: cheerful accelerant → rueful accountability.

**Relationship tells:** He knows how to make Marcel's pride move. He calls Matthias cautious with admiration he will not admit. Lorenzo is a mirror he initially mistakes for an opposite. He asks Bastien for prophecies until he no longer wants the answer.

**Never:** copied sketch-comedy cadence, buffoonish incompetence, cruelty, a hidden master plan, or the claim that Marcel lacked agency.

### 3.4 Lorenzo di Taleggio — `cornered-general`

**Core voice:** Italian Alpine merchant-prince, cheesemaker, strategically anxious adviser, and operatic forecaster.

**Sentence shape:** A small fact, a larger tomorrow, a catastrophic day after. Rhetorical questions and escalating triplets are common in Chapter II. Chapter IV deliberately shortens them.

**Mental vocabulary:** leverage, pass, encirclement, prestige, market, tomorrow, concession, consequence, hinge, key, route, flank, closing room.

**Humor engine:** Every minor development is Act I of geopolitical catastrophe. The joke remains credible because some consequences genuinely are plausible.

**Selective flavor:** `Madonna mia`, `amico`, `bene`, plus culinary or musical language where natural. Do not add an Italian word to every sentence.

**AI embodiment:** Calm at healthy deck depth; dramatically aggressive when cornered. His mechanics make his worldview visible without changing any rule.

**Emotional movement:** Theatrical control → louder desperation → quiet accountability. The disappearance of operatic language is a late storytelling device.

**Relationship tells:** He gives Matthias possibilities Matthias cannot unhear. Edmund is denounced as reckless while performing a mirror method. Marcel's reach becomes an expanding map. Bastien begins beneath notice and ends beyond comfortable dismissal.

**Never:** a fraudulent intelligence source, cowardly panic, generic shouting, sole blame, or melodrama in the final admission.

### 3.5 Bastien de Herve — `attritionist`

**Core voice:** Belgian tyromancer, apolitical rind-seer, sincere prophet, and long-horizon strategist. Imagery distinguishes him more than accent.

**Sentence shape:** Concrete noun + impossible relation + calm consequence. Most important prophecies use one coherent physical image, not a pile of random objects.

**Mental vocabulary:** rind, curd, whey, eye, mold, cave, cellar, field, grass, milk, beast, breath, air, crack, aging, decay, weather, brine, stem.

**Humor engine:** Speaks impossible tactical imagery as obvious fact; occasionally corrects someone on the technical limits of tyromancy. A mundane omen may receive the gravity of apocalypse.

**Selective flavor:** Very occasional `ze` is permitted, but imagery must carry the voice. Avoid forcing a French-coded accent onto every Belgian line.

**AI embodiment:** Preserves deck depth because he behaves as though the War's ending is already visible. This is characterization only; he never predicts a hidden card.

**Emotional movement:** Bastien barely changes. The player's interpretation changes from madman to maddeningly precise witness.

**Relationship tells:** Marcel's irritation, Matthias's evidentiary rejection, Edmund's amusement, and Lorenzo's dismissal all become external measures of his accuracy. He takes no side.

**Never:** random trolling, partisan accusation, explicit mouse/hay exposition, a final moral, omniscient narration, or a sixth commander identity.

## 4. Relationship Voice Guide

| Pair | Recurring language | Comic engine | Emotional payload | Late change |
| --- | --- | --- | --- | --- |
| Marcel ↔ Matthias | cellar temperature, exact timing, signatures, old tastings, “your eleven minutes,” “your half-degree” | Each remembers professional details too petty for strangers | Their insults preserve respect and the pain of perceived betrayal | Corrections become gentler; neither uses intimacy to force reconciliation |
| Marcel ↔ Edmund | stock versus wager, patience versus motion, “you make recklessness sound catered” | Edmund turns injured pride into a sporting decision | Marcel owns the choice; Edmund owns how he made it attractive | Edmund stops hiding behind support; Marcel does not outsource blame |
| Matthias ↔ Lorenzo | probability versus possibility, thresholds, doors and passes | Lorenzo supplies the one scenario Matthias cannot discard | Trust makes warning persuasive | Lorenzo admits he compressed the timeline; Matthias must still own action |
| Edmund ↔ Lorenzo | bluff versus siege, wager versus forecast, cards versus map | Each accurately diagnoses the other's escalation while missing his own | Mirror accountability without identical motives | They recognize the symmetry in separate, restrained statements |
| Everyone ↔ Bastien | “What does the cheese say?”, inadmissible evidence, annoying coincidence | Dismissal becomes a running measurement of truth | Listening failure, not prophetic failure, is the tragedy | By IV nobody wants another prediction; Bastien does not gloat |

## 5. Curated Twelve-Encounter Dialogue Bank

Every row is preferred copy, not a menu of drafts. Alternate variants may be added during implementation only if they pass the same reveal, truthfulness, voice, and replay classifications.

### 5.1 Chapter I — The Accord — War I — Marcel de Brie

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C1W1-MAR-01 | G intro · CS | “At Mont-Rouge, monsieur, we placed two ancient traditions at one table. Only one of them arrived with the dignity to remain seated.” | R01, R05 → Marcel is authoritative and aggrieved. | The negotiation was sincere; the insult frames Switzerland. TI/SMI. | First; S01–S02 |
| C1W1-MAR-02 | G context · CS | “The French Witness Wheel opened as promised. The Swiss wheel opened eyes it was never asked to possess. Matthias then closed the Accord.” | R02, R06–R09 → anomaly then suspension reads as betrayal. | Acts are true; “closed” assigns intent. SMI. | First; S03–S04 |
| C1W1-MAR-03 | special clash · CS | “A card without pedigree fells an Ace. Barbaric. Lawful. I dislike it twice.” | Small exception humiliates greatness; echoes the anomalous eye without explaining it. | Gameplay truth only. DT. | Post-C1; S03 |
| C1W1-MAR-04 | narrow clash · EV | “One rank: the difference between serviceable and served with apologies.” | Voice/AI only. | Tasting-note insult. DT about the clash. | Any |
| C1W1-MAR-05 | rescue · EV | “There. Proper stock returns to the cellar.” | Marcel protects value. | Mechanical metaphor only. DT. | Any; S02 |
| C1W1-MAR-06 | failed rescue · EV | “Two vintages spent to preserve neither. An undisciplined finish.” | Loss feels like wasted maturation. | Mechanical metaphor. DT. | Any |
| C1W1-MAR-07 | Battle Ace lost · CS | “An Ace matured for this command and discarded in an instant. Mont-Rouge had more ceremony.” | Ceremony comparison; no new fact. | His grief routes through craft. TI. | Post-C1 |
| C1W1-MAR-08 | Battle Two lost · EV | “Do not mock the little rank. Its absence leaves a very large hole.” | Two's strategic value. “Hole” is safe card humor here. | Gameplay knowledge only. DT. | Any |
| C1W1-MAR-09 | deep Battle · EV | “Layer upon layer. Even a rind knows when thickness has become stubbornness.” | Marcel disapproves costly deadlock. | AI temperament. DT. | Any |
| C1W1-MAR-10 | large Battle loss · CS | “A whole shelf gone. Matthias would count the crumbs and call the loss precise.” | R03 → Marcel knows Matthias's habits. | Familiar insult indicates history. TI. | Post-C1 |
| C1W1-MAR-11 | concession · EV | “Non. That card is young stock. We do not spend a cellar to rescue a curd.” | Conservative choice is stewardship. | AI temperament. DT. | Any |
| C1W1-MAR-12 | desperate rescue · EV | “Open the last shelf. Preservation without survival is merely inventory.” | Low deck changes his calculus. | AI temperament. DT. | Any |
| C1W1-MAR-13 | contextual callback · CS | “He would object that the wheel was six minutes too warm. He always mistakes a correction for a personality.” | R03–R04, CB10 → intimate professional familiarity. | Marcel remembers Matthias exactly because he respected him. TI. | Post-C1 |
| C1W1-MAR-14 | contextual · CS | “I had his word. Whatever else the Swiss preserve, they did not preserve that.” | R04, CB01 → personal trust beneath nationalism. | Sincere belief, not objective breach of promise. SMI. | First |
| C1W1-MAR-15 | result · EV | “The cards have rendered a verdict. Naturally, history will appeal.” | Keeps any War outcome noncanonical. | Gameplay result joke only. DT. | Any |
| C1W1-MAR-16 | G resolution · CS | “When the wheel opened, Matthias asked me to wait. That was the hour I had expected him to stand beside me.” | R08–R09, R04 → his anger comes from trust. | Exact emotional truth; betrayal remains inference. TI/SMI. | First |

### 5.2 Chapter I — The Accord — War II — Matthias von Greyerz

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C1W2-MAT-01 | G intro · CS | “Correction one: the Swiss wheel never left Swiss custody. Correction two: this made the result more alarming, not less.” | R07–R08 → supervision did not produce an explanation. | Direct knowledge; not proof against Marcel. DT/TI. | First; S04 |
| C1W2-MAT-02 | G context · CS | “I suspended ratification pending inquiry. Marcel proceeded before the ink on my request had dried.” | R08, R11–R12 → Marcel's account omitted unilateral action. | Acts are true; hostile intent is unstated. DT. | First |
| C1W2-MAT-03 | special clash · CS | “The exception is documented. My irritation does not amend it.” | Rules can surprise without being invalid; subtle thematic seed. | Gameplay truth only. DT. | Post-C1 |
| C1W2-MAT-04 | narrow clash · EV | “One rank. A small interval remains an interval.” | Analyst fingerprint. | Exact public comparison. DT. | Any |
| C1W2-MAT-05 | rescue · EV | “The candidate resolved above threshold. Acceptable.” | AI weighting visible. | Public-information calculation. DT. | Any |
| C1W2-MAT-06 | failed rescue · EV | “Result outside expectation. Not outside possibility.” | Distinguishes probability from certainty. | Gameplay data. DT. | Any |
| C1W2-MAT-07 | Battle Ace lost · CS | “Ace removed. Fourteen points of public certainty become one casualty.” | Precision as emotional armor. | Gameplay fact; “certainty” is metaphor. DT. | Post-C1 |
| C1W2-MAT-08 | Battle Two lost · EV | “Specialist removed. Update every Ace accordingly.” | Two changes visible risk. | Legal public inference only. DT. | Any |
| C1W2-MAT-09 | deep Battle · EV | “Third layer. Rare is not the same word as impossible.” | Analyst treats recursion soberly. | DT. | Any |
| C1W2-MAT-10 | large Battle loss · CS | “Nine cards. Marcel will call that a cellar; it remains nine cards.” | R03, CB10 → familiar correction. | He knows Marcel's metaphor habits. DT/TI. | Post-C1 |
| C1W2-MAT-11 | concession · EV | “Negative expectation. Pride is not a reserve card.” | Rational concession. | AI temperament. DT. | Any |
| C1W2-MAT-12 | desperate rescue · EV | “Critical threshold. The model changes because the position changed.” | Low-deck decision remains fair-play. | DT. | Any |
| C1W2-MAT-13 | contextual callback · CS | “Marcel rests a wheel at eleven degrees and an argument at boiling. I have measured both.” | R03–R04 → long professional familiarity. | Affection concealed by precision. TI. | Post-C1; S02 |
| C1W2-MAT-14 | contextual · CS | “Procedure is not betrayal. Proceeding without your counterpart is closer to the definition.” | R08, R11–R12 → credible counter-accusation. | First clause true; second is sincere framing. DT/SMI. | First |
| C1W2-MAT-15 | result · EV | “One War is a sample, not a conclusion. Record it anyway.” | Outcome remains gameplay, not plot authority. | DT. | Any |
| C1W2-MAT-16 | G resolution · CS | “Marcel used the framework we wrote together while I was asking why its witness had become impossible. Tell me which act looks like abandonment.” | R05, R07–R08, R11–R12 → Marcel may be the betrayer. | “Impossible” is emotional shorthand for unexplained; accusation sincere. SMI/SSF. | First |

### 5.3 Chapter I — The Accord — War III — Bastien de Herve

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C1W3-BAS-01 | G intro · CS | “The blind wheel opened seven eyes. Four men closed eight.” | P01, R31 → absurd but uncannily specific. | Wheel eyes + four principals/advisers closing to uncertainty. PM. | First |
| C1W3-BAS-02 | G context · CS | “Both accounts are honest. This is why neither can be trusted alone.” | R32, R35 → the conflict may not divide cleanly into liar/truth-teller. | Both principals sincerely misinfer. PM/DT. | First |
| C1W3-BAS-03 | special clash · CS | “The smallest soldier bows to no crown. Today the table remembers.” | P04/R33 at safe card level. | Gameplay Two/Ace plus tiny-cause motif; no causal clue. PM. | Post-C1 |
| C1W3-BAS-04 | narrow clash · EV | “A single step separates supper from hunger. Ask the winter.” | Attrition perspective. | General scarcity metaphor, no Mont-Rouge fact. PM. | Any |
| C1W3-BAS-05 | rescue · EV | “Tomorrow arrived early and brought another card.” | Reinforcement as time displacement. | Gameplay metaphor. PM. | Any |
| C1W3-BAS-06 | failed rescue · EV | “The curd accepted the offering. The line did not.” | Failed reinforcement. | Gameplay metaphor. PM. | Any |
| C1W3-BAS-07 | Battle Ace lost · CS | “A great head falls. Somewhere, a very small guest remains uninvited.” | P04/R33; sounds like spy/feast prophecy. | Privately echoes mouse without identifying kind, place, or mechanism. PM. | First canonical; Post-C3 random |
| C1W3-BAS-08 | Battle Two lost · EV | “The humble card has finished its enormous appointment.” | Two's unique role. | Gameplay metaphor. PM. | Any |
| C1W3-BAS-09 | deep Battle · CS | “Cave beneath cave. At the bottom, breath is waiting for warmth.” | P05/R36, but not enough to solve in I. | Trapped air/ripening imagery. PM; Chapter-I use only as rare optional line. | First canonical; Post-C3 random; S10 |
| C1W3-BAS-10 | large Battle loss · CS | “A meadow entered the cellar grain by grain. No cow followed. Armies did.” | P02/R34 → ludicrous field image. | Private plant-material chain, still opaque without III records. PM. | First canonical; Post-C3 random; S09 |
| C1W3-BAS-11 | concession · EV | “Let the card go. The War is longer than its shadow.” | Attritionist depth. | AI temperament. PM. | Any |
| C1W3-BAS-12 | desperate rescue · EV | “The last rind is also a door. Open it.” | Low reserve commitment. | AI temperament. PM. | Any |
| C1W3-BAS-13 | contextual callback · CS | “The precise man calls me inadmissible. The fragrant man calls me unbearable. Both spell my name correctly.” | Everyone ↔ Bastien; Matthias/Marcel distinct dismissals. | Comic relationship truth. DT/TI. | Post-C1 |
| C1W3-BAS-14 | contextual · CS | “One friend says wait. One friend says now. The curd hears only drums.” | P06 → hints at advisers without roles. | Lorenzo/Edmund accelerants. PM. | First |
| C1W3-BAS-15 | result · EV | “Victory, defeat—two names written on the rind before it is cut.” | Bastien sees long horizon; outcome noncanonical. | Gameplay metaphor only. PM. | Any |
| C1W3-BAS-16 | G resolution · CS | “Two honest men will bury a traitor who was never born.” | P03, R32/R35 → event without culprit, currently paradoxical. | Exact thematic truth in prophecy. PM. | First |

### 5.4 Chapter II — The Closing Passes — War I — Sir Edmund Gloucester

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C2W1-EDM-01 | G intro · CS | “Matthias asked for time. Time, in diplomacy, is what one requests when hoping the other fellow misplaces his nerve.” | R10 → Edmund viewed suspension as a bluff. | Sincere theory, not proven Swiss strategy. SMI. | First |
| C2W1-EDM-02 | G context · CS | “I advised Marcel to proceed. An Accord starving in a drawer is only stationery with excellent breeding.” | R10–R11, R16 → Edmund was an active adviser. | He did advise action; “only” minimizes risk. TI/CO. | First |
| C2W1-EDM-03 | special clash · EV | “A Two against an Ace? Splendid. The rules have developed a sense of occasion.” | Gambler loves the long shot. | Gameplay truth. DT. | Any |
| C2W1-EDM-04 | narrow clash · EV | “One rank short. Practically a recommendation.” | Marginal risk is invitation. | AI temperament. DT. | Any |
| C2W1-EDM-05 | rescue · CS | “There we are. A reserve is merely courage kept in a smaller bottle.” | Limited Reserves and gambler identity. | Gameplay metaphor. DT. | Post-C2 |
| C2W1-EDM-06 | failed rescue · EV | “Bit awkward, that. Still, hesitation would have told a worse story.” | He rationalizes failed action. | Gameplay framing. SSF. | Any |
| C2W1-EDM-07 | Battle Ace lost · EV | “The grand card took the short route to posterity.” | Understatement during catastrophe. | Gameplay metaphor. DT. | Any |
| C2W1-EDM-08 | Battle Two lost · EV | “There goes the quiet little answer to a very loud Ace.” | Respects specialist card. | Gameplay truth. DT. | Any |
| C2W1-EDM-09 | deep Battle · CS | “Another layer? Right, then. One cannot stop halfway down a hill with dignity.” | Cooper's Hill flavor; escalation logic. | Character analogy, not historical claim. SSF. | Post-C2; S12 |
| C2W1-EDM-10 | large Battle loss · CS | “That was most of the winter in one enthusiastic afternoon.” | R16 → reserves/stockpiles matter. | Gameplay loss; scarcity metaphor. DT. | Post-C2 |
| C2W1-EDM-11 | concession · EV | “Not this hand. Even appetite benefits from cutlery.” | Gambler can still concede. | AI temperament. DT. | Any |
| C2W1-EDM-12 | desperate rescue · EV | “Last card in the purse. Best not spend it timidly.” | Low-deck commitment. | AI temperament. DT. | Any |
| C2W1-EDM-13 | contextual callback · CS | “Go on, then. What does the cheese say? Something with cavalry, if possible.” | CB06/P06 → early Bastien amusement. | Edmund treats prophecy as entertainment. DT. | First; S14 |
| C2W1-EDM-14 | contextual · CS | “Lorenzo sees one shutter close and orders a census of siege ladders. Exhausting chap.” | CB08 → Edmund accurately spots Lorenzo's escalation. | Mirror blindness: he does not see his own method. TI/SSF. | Post-C2 |
| C2W1-EDM-15 | result · EV | “Well played. If the result were certain beforehand, we should have called it accounting.” | Outcome-independent gambler response. | DT. | Any |
| C2W1-EDM-16 | G resolution · CS | “Yes, I put the word ‘bluff’ in the room. A useful word. Got Marcel moving, didn't it?” | R10/R27 seed → deliberate goading, not remorse yet. | Direct admission plus minimization. TI/CO. | First |

### 5.5 Chapter II — The Closing Passes — War II — Lorenzo di Taleggio

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C2W2-LOR-01 | G intro · CS | “Today one sealed wagon. Tomorrow the pass. The day after? Madonna mia, Marcel names the mountain after himself.” | R13–R15 → small restriction framed as future sovereignty. | Impoundment is real; forecast is plausible but inflated. DT/SSF. | First; S07–S08 |
| C2W2-LOR-02 | G context · CS | “I told Matthias what France could gain if we waited. A warning is not a lie because the fire has not reached your room.” | R13/R16 → Lorenzo gave worst cases urgency. | Scenarios were plausible; intensity is omitted. TI/CO. | First |
| C2W2-LOR-03 | special clash · EV | “The smallest unit enters through the grandest defense. You see? There is always a pass.” | Two/Ace mapped to route thinking. | Gameplay truth. DT. | Any |
| C2W2-LOR-04 | narrow clash · CS | “One rank today. Tomorrow two. By Friday your King applies for French citizenship.” | Operatic escalation. | Gameplay joke; no new lore. SSF. | Post-C2 |
| C2W2-LOR-05 | rescue · EV | “Bene. Reinforce the hinge before it becomes a gate.” | Defensive commitment. | AI temperament. DT. | Any |
| C2W2-LOR-06 | failed rescue · EV | “We strengthened the door and lost the house. This is suboptimal.” | Catastrophe plus dry technical tag. | Gameplay fact. DT. | Any |
| C2W2-LOR-07 | Battle Ace lost · CS | “The center falls. Inform every pass before rumor arrives wearing a French hat.” | Route anxiety and Marcel suspicion. | Gameplay + sincere threat framing. SMI/SSF. | Post-C2 |
| C2W2-LOR-08 | Battle Two lost · EV | “Our smallest scout is gone. Every Ace just grew taller.” | Public specialist-card impact. | Legal public inference. DT. | Any |
| C2W2-LOR-09 | deep Battle · EV | “Another act! The orchestra has ammunition and no conductor.” | Operatic Battle humor. | Gameplay metaphor. DT. | Any |
| C2W2-LOR-10 | large Battle loss · CS | “Ten cards. That is not a loss; it is a trade delegation that never comes home.” | R15–R16 → materializes shipment anxiety. | Gameplay metaphor. DT. | Post-C2 |
| C2W2-LOR-11 | concession · EV | “We yield the square to hold the road. Strategy is geography with better tailoring.” | Chooses ground. | AI temperament. DT. | Any |
| C2W2-LOR-12 | desperate rescue · EV | “No road behind us. Then every card advances!” | Cornered surge. | AI temperament. DT. | Any |
| C2W2-LOR-13 | contextual callback · CS | “Edmund calls a threat a wager, as if changing the noun makes the casualty sporting.” | CB08 → he diagnoses Edmund's permission framing. | Mirror blindness: his own noun is “certainty.” TI/SSF. | Post-C2 |
| C2W2-LOR-14 | contextual · CS | “Matthias calculates danger. I merely ensure he does not calculate it too late.” | Matthias ↔ Lorenzo trust mechanism. | “Merely” minimizes pressure. TI/CO. | First |
| C2W2-LOR-15 | result · EV | “A result is a border drawn by cards. We will inspect it for weaknesses.” | Outcome-independent strategic voice. | Gameplay metaphor. DT. | Any |
| C2W2-LOR-16 | G resolution · CS | “I recommended restriction before French control became a fact. I listed consequences. Matthias supplied the decision.” | R13–R15 → Lorenzo advised preemption while preserving Matthias's agency. | True but minimizes how he weighted scenarios. TI/CO. | First |

### 5.6 Chapter II — The Closing Passes — War III — Marcel de Brie

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C2W3-MAR-01 | G intro · CS | “I signed because an Accord left to starve is merely expensive paper. Yes, monsieur. I signed without Matthias.” | R11/R16 → Marcel owns the unilateral choice but frames it as preservation. | Direct act plus self-serving necessity. DT/SSF. | First |
| C2W3-MAR-02 | G context · CS | “Then came the restricted pass, the seized wheels, and winter inventory conducted by bayonet. Diplomacy had acquired a rind.” | R14–R16 → scarcity is now material. | True sequence in compressed rhetoric. TI. | First; S07–S08 |
| C2W3-MAR-03 | special clash · EV | “The humblest card preserves one excellent exception. I respect a narrow specification.” | Quartermaster accepts the rule. | Gameplay truth. DT. | Any |
| C2W3-MAR-04 | narrow clash · EV | “One rank saved is one rank not replaced. Stewardship begins in small margins.” | Resource economy. | AI temperament. DT. | Any |
| C2W3-MAR-05 | rescue · CS | “One reserve spent. Count the remaining shelves before you applaud.” | Limited Reserves + profession. | Gameplay fact without a dynamic-count dependency. DT. | Post-C2; S02 |
| C2W3-MAR-06 | failed rescue · CS | “A reserve consumed, two cards spoiled, and winter unimpressed.” | Scarcity consequence. | Gameplay truth. DT. | Post-C2 |
| C2W3-MAR-07 | Battle Ace lost · EV | “There are losses one records in ink and losses that stain through the ledger.” | Strong stock casualty. | Gameplay metaphor. DT. | Any |
| C2W3-MAR-08 | Battle Two lost · EV | “Small does not mean expendable. Only fools and kings confuse the terms.” | Specialist-card value and aristocratic jab. | Gameplay truth. DT. | Any |
| C2W3-MAR-09 | deep Battle · CS | “We have spent tomorrow's shelf on today's deadlock.” | R16 → Limited Reserves across Wars. | Gameplay metaphor. DT. | Post-C2 |
| C2W3-MAR-10 | large Battle loss · CS | “That was not a clash. That was a cellar becoming an empty room.” | Scarcity/material consequence. | Gameplay metaphor. DT. | Post-C2 |
| C2W3-MAR-11 | concession · EV | “Let it pass. A commander who preserves nothing commands an inventory of ghosts.” | Conservative AI. | DT. | Any |
| C2W3-MAR-12 | desperate rescue · CS | “Spend it. There is no virtue in presenting winter with a sealed reserve and no army.” | Low reserve/deck decision. | DT. | Post-C2 |
| C2W3-MAR-13 | contextual callback · CS | “Edmund advised action. I enjoyed the advice. The signature, however, is mine.” | R10–R11 → no transfer of agency. | Directly true and important guardrail. DT. | First |
| C2W3-MAR-14 | contextual · CS | “Matthias once waited fourteen months for a rind to settle. I could not give an Accord fourteen more minutes.” | R03–R04, CB10 → familiarity and fear of loss. | Timing is rhetorical; contrast reveals trust/history. TI/SSF. | Post-C2 |
| C2W3-MAR-15 | result · EV | “The ledger closes on this War. The stores, regrettably, do not refill with the ink.” | Outcome-independent Limited Reserves resonance. | Gameplay truth. DT. | Post-C2 |
| C2W3-MAR-16 | G resolution · CS | “I ordered escorts to reopen the route. Protection, not invasion. But when they met the cordon, the distinction did not stop the first blade.” | R17–R18 → Marcel's defensible act still produces escalation. | Act and bloodshed true; “protection” is sincere framing. TI/SSF. | First |

### 5.7 Chapter III — The Blind Wheel — War I — Matthias von Greyerz

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C3W1-MAT-01 | G intro · CS | “Three copies of the steward's deposition disagree. Two carry his signature. One misspells his name.” | R20 → even basic records conflict. | Fictional archive fact; contradiction is not conspiracy. DT. | First |
| C3W1-MAT-02 | G context · CS | “I began this review to isolate sabotage. Instead, I have isolated the word ‘sabotage’ from every demonstrated mechanism.” | R21/R25 → accepted history lacks a proven mechanism. | Does not establish Marcel's innocence or exact natural cause. DT/TI. | First; S09–S10 |
| C3W1-MAT-03 | special clash · CS | “An exception occurred in full view. Note how little intention the fact contains.” | Thematic link between event and intent. | Gameplay event is natural rule operation; he is revising epistemology. DT. | Post-C3 |
| C3W1-MAT-04 | narrow clash · EV | “One rank. Fog does not alter the visible interval.” | Current clash stays public under Fog. | Mechanically accurate. DT. | Any |
| C3W1-MAT-05 | rescue · EV | “The visible candidate was sufficient. I will not invent data for the rest.” | Fair-play boundary under Fog. | AI uses legal public information only. DT. | Any |
| C3W1-MAT-06 | failed rescue · CS | “The model failed. No—correction. The outcome differed from the model.” | Self-correction begins emotional change. | Probability is not certainty. DT. | Post-C3 |
| C3W1-MAT-07 | Battle Ace lost · CS | “Ace lost. The sealed record will not make it less lost.” | Fog seals history, not truth. | Mechanically accurate. DT. | Post-C3 |
| C3W1-MAT-08 | Battle Two lost · EV | “The specialist is gone. What remains unknown is not therefore favorable.” | Uncertainty isn't evidence. | Legal public inference only. DT. | Any |
| C3W1-MAT-09 | deep Battle · CS | “At depth three, certainty decreases faster than the card count.” | Fog/deep Battle resonance. | Metaphor, not a formula. TI. | Post-C3 |
| C3W1-MAT-10 | large Battle loss · CS | “The seal conceals identities. It does not conceal the size of the absence.” | Fog presentation truth. | Public casualty magnitude can remain operationally visible. DT. | Post-C3 |
| C3W1-MAT-11 | concession · EV | “Insufficient public basis. We concede without manufacturing one.” | Evidence ethics mapped to AI. | DT. | Any |
| C3W1-MAT-12 | desperate rescue · EV | “The threshold is visible. Commitment is justified by position, not prophecy.” | Low-deck fair play and Bastien resistance. | DT plus self-protective jab. SSF. | Post-C1 |
| C3W1-MAT-13 | contextual callback · CS | “I said the record was exact. It is. It is exact in three incompatible directions.” | CB03/R20 → precision cannot complete the story. | Direct archive assessment. DT. | First |
| C3W1-MAT-14 | contextual · CS | “Bastien's statements remain inadmissible. They have also become inconveniently prior.” | CB04/R31 → his framework is cracking. | Prophecies predate events; “inadmissible” protects pride. DT/SSF. | First |
| C3W1-MAT-15 | result · EV | “Record the War. Do not ask it to prove more than it contains.” | Outcome-independent epistemic principle. | DT. | Any |
| C3W1-MAT-16 | G resolution · CS | “The record does not establish what I have spent years saying it establishes.” | R21/R29 seed → his certainty exceeded evidence. | Restrained, directly true; stops short of absolution. DT. | First |

### 5.8 Chapter III — The Blind Wheel — War II — Marcel de Brie

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C3W2-MAR-01 | G intro · CS | “The grand histories preserve every insult. The cellar ledger preserves straw, traps, repairs, and one unpaid broom. Guess which nobody read.” | R22–R24 → mundane records may matter. | Lists clues without linking them to the wheel. DT within fiction. | First |
| C3W2-MAR-02 | G context · CS | “I possessed Matthias's timing, his silence, and my humiliation. I called the bundle intent.” | R30 seed/CB01 → Marcel inferred motive. | Direct self-assessment; not final admission. DT. | First |
| C3W2-MAR-03 | special clash · CS | “A small rule overturns a grand expectation. Mais—expectation was never evidence.” | Natural thematic reframe. | Gameplay truth and emerging humility. DT. | Post-C3 |
| C3W2-MAR-04 | narrow clash · EV | “One rank still matters when the rest of the ledger is sealed.” | Fog + quartermaster margin. | Mechanically accurate. DT. | Any |
| C3W2-MAR-05 | rescue · EV | “Preserve what is visible. Do not pretend to inventory the fog.” | Fair-play restraint. | AI boundary. DT. | Any |
| C3W2-MAR-06 | failed rescue · CS | “We spent two certainties and received one excellent correction.” | Failed reinforcement as epistemic lesson. | Gameplay metaphor. DT. | Post-C3 |
| C3W2-MAR-07 | Battle Ace lost · CS | “Seal the name if you must. The empty place in the cellar remains exact.” | Fog hides identity but consequence persists. | Mechanically truthful. DT. | Post-C3 |
| C3W2-MAR-08 | Battle Two lost · EV | “The modest card leaves. Every surviving Ace becomes less modest.” | Public specialist-card impact. | Legal public inference. DT. | Any |
| C3W2-MAR-09 | deep Battle · CS | “We descend through records the way we descend through Battles: blind, committed, and carrying too much.” | Fog/archive resonance. | Gameplay + history metaphor. TI. | Post-C3 |
| C3W2-MAR-10 | large Battle loss · CS | “So much gone at once, and still the archive will argue about the order.” | R20/R19 → later accounts reshape causality. | No new fact; emotional truth. TI. | Post-C3 |
| C3W2-MAR-11 | concession · EV | “No. Uncertainty is not permission to squander stock.” | Conservative AI under Fog. | DT. | Any |
| C3W2-MAR-12 | desperate rescue · EV | “Open the reserve. Doubt is useful; extinction is less so.” | Low deck without abandoning uncertainty. | DT. | Any |
| C3W2-MAR-13 | contextual callback · CS | “Matthias would have catalogued the broom. I mocked him for such things. This is becoming tiresome.” | CB10 → affection/respect and mundane record relevance. | He recognizes Matthias's habit may have value. TI. | First |
| C3W2-MAR-14 | contextual · CS | “A vermin notice is not a confession. A straw invoice is not a culprit. They are merely records we preferred not to notice.” | R23–R24 → clues remain unconnected and non-accusatory. | Critical firewall line: explicitly resists calling them proof. DT. | Post-C3; no direct link in-line |
| C3W2-MAR-15 | result · EV | “The fog lifts from this War. I wish history were equally obedient.” | Outcome-independent Fog close. | Mechanically true at War end; history metaphor. TI. | Post-C3 |
| C3W2-MAR-16 | G resolution · CS | “I never proved what Matthias intended. I proved what he did, then matured the rest in anger.” | R30 seed/CB02 → facts became intent through hurt. | Directly true, still before final mutual admission. DT. | First |

### 5.9 Chapter III — The Blind Wheel — War III — Bastien de Herve

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C3W3-BAS-01 | G intro · CS | “You have opened the archive. Shall we open the wheel again?” | R31–R36/CB05 → old prophecy is ready for rereading. | He knows the record now makes the imagery legible. PM. | First |
| C3W3-BAS-02 | G context · CS | “There is no knife in the wheel. Men sharpened one from the absence.” | P09/R21/R35 → lack of culprit became conspiracy evidence. | No sabotage; figurative knife is suspicion. PM. | First |
| C3W3-BAS-03 | special clash · CS | “The smallest guest takes no chair, yet the general obeys.” | P04/R33 → tiny-cause motif now dangerous. | Private mouse chain plus Two/Ace surface reading; no explicit animal. PM. | Post-C3 |
| C3W3-BAS-04 | narrow clash · EV | “One step. Large enough for an army, too small for certainty.” | Fog/attrition imagery. | Gameplay metaphor. PM. | Any |
| C3W3-BAS-05 | rescue · EV | “The second card was already waiting in the whey.” | Prophetic reinforcement. | Gameplay metaphor only; no hidden-card claim because spoken after reveal. PM. | Any |
| C3W3-BAS-06 | failed rescue · EV | “The rind promised an arrival. It did not promise success.” | Prophecy avoids gameplay omniscience. | Spoken after public outcome. PM. | Any |
| C3W3-BAS-07 | Battle Ace lost · CS | “Great heads fall loudly. Tiny causes prefer cellars.” | R33 → scale contrast. | Private natural accident remains unnamed. PM. | Post-C3 |
| C3W3-BAS-08 | Battle Two lost · EV | “The little appointment is complete. Close the enormous book.” | Two's role + archive motif. | Gameplay metaphor. PM. | Any |
| C3W3-BAS-09 | deep Battle · CS | “Cave beneath cave; stem within stem; breath inside both. Now you are listening.” | P05/R26 → capillary air clue. | Strong inference permitted in III, exact chain unstated. PM. | Post-C3; S09–S10 |
| C3W3-BAS-10 | large Battle loss · CS | “A field ground smaller than sight can still feed a war.” | P02/R26/R33 → microscopic plant structure and consequence. | Strong Chapter-III inference. PM. | Post-C3; S09 |
| C3W3-BAS-11 | concession · EV | “Let the visible card go. The invisible future is expensive.” | Attritionist depth, no hidden info. | General metaphor. PM. | Any |
| C3W3-BAS-12 | desperate rescue · EV | “The line is rind-thin. Press here.” | Low-deck commitment. | AI temperament. PM. | Any |
| C3W3-BAS-13 | contextual callback · CS | “The precise man has requested my exact nonsense. We are both making progress.” | CB04/R31 → Matthias asks to rehear prophecy. | Bastien recognizes changed reception, does not gloat. DT/TI. | First |
| C3W3-BAS-14 | contextual · CS | “The first casualty had no suit, no rank, no grave. You have found its empty uniform.” | P07/R36 → certainty was lost. | Metaphorical truth. PM. | First |
| C3W3-BAS-15 | result · EV | “The seal opens. The bones speak. As warned, they disagree.” | P08/CB05 → Fog lift recontextualizes early line. | Records contradict; bones are cards/archive. PM. | Post-C3 |
| C3W3-BAS-16 | G resolution · CS | “The traitor remains absent. At last, you have begun to notice him.” | R35/R37 → betrayal may have no author. | Exact thematic truth, still no precise causal exposition. PM. | First |

### 5.10 Chapter IV — The War of Attrition — War I — Sir Edmund Gloucester

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C4W1-EDM-01 | G intro · CS | “I called it a bluff because waiting bored me and action looked brave. Marcel supplied the signature. I supplied the applause.” | R27 → Edmund owns appetite and pressure while preserving Marcel's agency. | Direct admission; still not sole cause. DT. | First |
| C4W1-EDM-02 | G context · CS | “I did not want a war. Rather thought that sentence would improve with repetition. It has not.” | R27/R19 → intention does not erase consequence. | He truly did not intend war. DT/TI. | First |
| C4W1-EDM-03 | special clash · EV | “The small card wins. I should be delighted. Give me a moment.” | Old long-shot pleasure is subdued. | Gameplay reaction plus guilt texture. DT. | Post-C4 |
| C4W1-EDM-04 | narrow clash · EV | “One rank. Enough to alter the total, which is how these things begin.” | Total War accumulation. | Gameplay/chapter metaphor. DT. | Post-C4 |
| C4W1-EDM-05 | rescue · EV | “A sound wager. I no longer confuse sound with harmless.” | Reframes gamble without rejecting play. | Gameplay + self-accountability. DT. | Post-C4 |
| C4W1-EDM-06 | failed rescue · EV | “There it is: the second cost arriving behind the first.” | Consequences accumulate. | Gameplay metaphor. DT. | Any |
| C4W1-EDM-07 | Battle Ace lost · CS | “The grand piece is gone. No joke improves the differential.” | Humor restraint in Total War. | Gameplay truth. DT. | Post-C4 |
| C4W1-EDM-08 | Battle Two lost · EV | “We spent the little answer before the large question arrived.” | Specialist loss. | Public strategic consequence. DT. | Any |
| C4W1-EDM-09 | deep Battle · CS | “Another layer. Momentum is a splendid servant and an appalling chaperone.” | His action doctrine judged by himself. | Gameplay metaphor + R27 echo. TI. | Post-C4 |
| C4W1-EDM-10 | large Battle loss · CS | “That started as one card. Most disasters prefer a modest introduction.” | R19 → accumulation from small choices. | Gameplay/history parallel. TI. | Post-C4 |
| C4W1-EDM-11 | concession · EV | “Not every refusal is cowardice. Took me rather a lot of armies to learn that.” | Reassesses hesitation. | Personal reflection. DT/TI. | Post-C4 |
| C4W1-EDM-12 | desperate rescue · EV | “Last chance. We act—but this time let us name the cost first.” | Decisiveness with accountability. | AI temperament matured. DT. | Post-C4 |
| C4W1-EDM-13 | contextual callback · CS | “Don't ask him. We have heard enough from things we laughed at.” | CB06 → Edmund no longer wants Bastien's prediction. | Guilt barometer; not hostility to Bastien. DT/TI. | First |
| C4W1-EDM-14 | contextual · CS | “I accused Lorenzo of turning possibility into a pistol. Mine was called a wager. Same powder.” | CB08/R27–R28 → mirror recognized. | Methods symmetric; rhetoric distinct. DT/TI. | First |
| C4W1-EDM-15 | result · EV | “Add it to the total. That is the wretchedly honest thing about totals.” | Total War outcome-independent. | Mechanically true. DT. | Post-C4 |
| C4W1-EDM-16 | G resolution · CS | “Marcel wanted one honorable reason to move. I handed him three amusing ones and made stillness feel like shame.” | R27 → precise accountability for emotional goading. | Did not command Marcel or intend war. DT. | First |

### 5.11 Chapter IV — The War of Attrition — War II — Lorenzo di Taleggio

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C4W2-LOR-01 | G intro · CS | “I named every door France might close. Then I spoke as if I heard the key turn.” | R28 → possibility became urgency. | Direct, restrained admission. DT. | First |
| C4W2-LOR-02 | G context · CS | “The threats were plausible. My certainty was not.” | R13/R28 → his facts were not fabricated. | Key guardrail in six words. DT. | First |
| C4W2-LOR-03 | special clash · EV | “The smallest card found the open flank. No opera. Just consequence.” | Reduced theatrics + mechanics. | Gameplay truth. DT. | Post-C4 |
| C4W2-LOR-04 | narrow clash · EV | “One rank. It enters the total.” | Total War accumulation; intentionally plain. | DT. | Post-C4 |
| C4W2-LOR-05 | rescue · EV | “The line holds. Record the price.” | Controlled strategic voice. | Gameplay truth. DT. | Any |
| C4W2-LOR-06 | failed rescue · EV | “We doubled the risk and called it defense.” | His historical pattern maps to failed rescue. | Gameplay self-critique. TI. | Post-C4 |
| C4W2-LOR-07 | Battle Ace lost · CS | “The center is gone. We continue.” | Quiet replaces opera. | Gameplay truth. DT. | Post-C4 |
| C4W2-LOR-08 | Battle Two lost · EV | “The scout is gone. Adjust.” | Extreme brevity marks development. | Public information only. DT. | Post-C4 |
| C4W2-LOR-09 | deep Battle · CS | “We keep adding layers because the last layer now needs defending.” | R19 → recursive justification. | Gameplay/history parallel. TI. | Post-C4 |
| C4W2-LOR-10 | large Battle loss · CS | “This is the future I warned against. Warning did not keep my hands clean.” | R28 → foresight does not absolve participation. | Direct accountability. DT. | Post-C4 |
| C4W2-LOR-11 | concession · EV | “Yield the card. Refusing every concession is how one becomes surrounded.” | Reversal of Chapter-II doctrine. | Matured strategy line, still legal play. DT. | Post-C4 |
| C4W2-LOR-12 | desperate rescue · EV | “No room remains. Act, and do not call necessity innocence.” | Cornered surge without excuse. | AI temperament + accountability. DT. | Post-C4 |
| C4W2-LOR-13 | contextual callback · CS | “I heard a hinge and announced a prison.” | CB09/R28 → admits timeline inflation. | Metaphor for probability laundering. DT/TI. | First |
| C4W2-LOR-14 | contextual · CS | “Edmund made danger sound delightful. I made it sound late. We both made it louder.” | CB08 → mirror in distinct vocabulary. | Direct assessment; neither sole cause. DT. | First |
| C4W2-LOR-15 | result · EV | “The margin remains after the speech ends.” | Total War truth, intentionally restrained. | DT. | Post-C4 |
| C4W2-LOR-16 | G resolution · CS | “I made possibility urgent. Urgency made it real.” | R28/R19 → loyalty helped create feared outcome. | Concise accountability without false sole causation. DT/TI. | First |

### 5.12 Chapter IV — The War of Attrition — War III — Matthias von Greyerz

| ID | Trigger / role | Preferred line | Reveal/callback and player inference | Private meaning / truth | Replay / source |
| --- | --- | --- | --- | --- | --- |
| C4W3-MAT-01 | G intro · CS | “The wheel had eyes. I was afraid. Marcel acted. I called the sequence proof.” | R07–R12/R29 → act, emotion, and inference separated. | Directly true; simplified syntax signals collapse of armor. DT. | First |
| C4W3-MAT-02 | G context · CS | “Unexplained is not the same as sabotaged. I knew the distinction. I did not live by it.” | R21/R29 → epistemic failure was not ignorance of logic. | Direct accountability. DT. | First |
| C4W3-MAT-03 | special clash · CS | “The exception was always in the rules.” | Anomaly need not mean fraud. | Gameplay truth; thematic resonance. DT. | Post-C4 |
| C4W3-MAT-04 | narrow clash · EV | “One rank. It counts.” | Late brevity and Total War. | DT. | Any |
| C4W3-MAT-05 | rescue · EV | “The card returns. The cost remains.” | Accumulation. | Gameplay truth. DT. | Any |
| C4W3-MAT-06 | failed rescue · EV | “I expected better. Expectation is not evidence.” | Core lesson in gameplay form. | DT. | Post-C3 |
| C4W3-MAT-07 | Battle Ace lost · CS | “Ace lost.” | Silence/shortness carries change. | Exact public fact. DT. | Post-C4 |
| C4W3-MAT-08 | Battle Two lost · EV | “Two lost. The exception is gone.” | Public state, no flourish. | DT. | Any |
| C4W3-MAT-09 | deep Battle · CS | “Each layer made the last one feel necessary.” | R19 → recursive escalation. | Gameplay/history parallel. TI. | Post-C4 |
| C4W3-MAT-10 | large Battle loss · CS | “A large loss is not proof that the first choice was right.” | Consequence does not retroactively justify cause. | Direct thematic principle. DT. | Post-C4 |
| C4W3-MAT-11 | concession · EV | “We stop here.” | Late restraint. | Legal AI choice. DT. | Post-C4 |
| C4W3-MAT-12 | desperate rescue · EV | “The position requires action. Nothing more.” | Separates necessity now from moral innocence. | DT. | Post-C4 |
| C4W3-MAT-13 | contextual callback · CS | “Repeat the Belgian's statement about the blind wheel. Precisely.” | CB04/R31 → he reopens excluded evidence. | He does not suddenly accept magic; he admits relevance. DT. | First |
| C4W3-MAT-14 | contextual · CS | “Marcel was wrong about my intent. I was wrong to treat his error as proof of his.” | R09/R12/R29–R30 → symmetrical sincere inference. | Directly true, not reconciliation. DT. | First |
| C4W3-MAT-15 | result · EV | “The final differential is exact. Its meaning is not.” | Total War result versus historical meaning. | Mechanically and philosophically true. DT. | Post-C4 |
| C4W3-MAT-16 | G resolution · CS | “I never proved it.” | R29/R37 → final evidentiary admission. | Do not expand, qualify, or follow with his theory of the cause. DT. | First |

The guaranteed Campaign-completion reply is a narrative-surface record, not an opponent bank line:

> **Marcel:** “Non. Neither did I.”

No Bastien response follows.

## 6. Evergreen Reserve Pools

These order-independent variants combine with each encounter's EV lines. They prevent immediate repetition without weakening authored disclosure. Once all eligible lines for one trigger have appeared in a War, prefer silence to cycling them again.

### 6.1 Marcel

| ID | Trigger | Preferred line | Replay | Truth / function |
| --- | --- | --- | --- | --- |
| EV-MAR-01 | special clash | “An exception is not anarchy, monsieur. It is a rule with dramatic tailoring.” | Any | DT; rule respect + pomposity. |
| EV-MAR-02 | narrow clash | “A thin margin can still possess excellent provenance.” | Any | DT; tasting vocabulary. |
| EV-MAR-03 | rescue | “Worth preserving. Return it to service.” | Any | DT; Quartermaster behavior. |
| EV-MAR-04 | failed rescue | “A poor expenditure with a lingering finish.” | Any | DT; tasting-note critique. |
| EV-MAR-05 | notable Battle loss | “Record the loss. Then protect what has survived it.” | Any | DT; reserve discipline. |
| EV-MAR-06 | concession | “We do not bankrupt the cellar for one course.” | Any | DT; conservative AI. |
| EV-MAR-07 | desperate rescue | “Very well. Break the seal on the reserve.” | Any | DT; low-deck shift. |

### 6.2 Matthias

| ID | Trigger | Preferred line | Replay | Truth / function |
| --- | --- | --- | --- | --- |
| EV-MAT-01 | special clash | “Categorical exception. Valid result.” | Any | DT; compact Analyst voice. |
| EV-MAT-02 | narrow clash | “Minimum decisive interval.” | Any | DT; exactness. |
| EV-MAT-03 | rescue | “Commitment justified by the visible pool.” | Any | DT; fair-play AI. |
| EV-MAT-04 | failed rescue | “Probability described risk. It did not cancel it.” | Any | DT; core distinction. |
| EV-MAT-05 | notable Battle loss | “Update the record. Continue.” | Any | DT; terse control. |
| EV-MAT-06 | concession | “Expected value is negative. Nein.” | Any | DT; selective flavor. |
| EV-MAT-07 | desperate rescue | “Threshold crossed. Recalculate.” | Any | DT; desperation weights. |

### 6.3 Edmund

| ID | Trigger | Preferred line | Replay | Truth / function |
| --- | --- | --- | --- | --- |
| EV-EDM-01 | special clash | “The rule keeps one excellent surprise in its sleeve.” | Any | DT; sporting delight. |
| EV-EDM-02 | narrow clash | “Close enough to make the next one tempting.” | Any | DT; gamble appetite. |
| EV-EDM-03 | rescue | “Splendid. The inadvisable card has become timely.” | Any | DT; dry reversal. |
| EV-EDM-04 | failed rescue | “Well, certainty would have been less expensive.” | Any | SSF; self-aware rationalization. |
| EV-EDM-05 | notable Battle loss | “Rather a lot of history for one table.” | Any | DT/TI; understatement. |
| EV-EDM-06 | concession | “Cold table. Keep the stake.” | Any | DT; Gambler still evaluates. |
| EV-EDM-07 | desperate rescue | “Nothing left but nerve. Convenient.” | Any | DT; low-deck appetite. |

### 6.4 Lorenzo

| ID | Trigger | Preferred line | Replay | Truth / function |
| --- | --- | --- | --- | --- |
| EV-LOR-01 | special clash | “Even an Ace has an unguarded road.” | Any | DT; pass/flank vocabulary. |
| EV-LOR-02 | narrow clash | “One step is how encirclement introduces itself.” | Any | SSF; comic forecasting. |
| EV-LOR-03 | rescue | “The breach closes. Bene.” | Any | DT; defensive control. |
| EV-LOR-04 | failed rescue | “Reinforcement arrived after consequence.” | Any | DT; temporal anxiety. |
| EV-LOR-05 | notable Battle loss | “Realign the line before the loss acquires ambitions.” | Any | DT/SSF; threat projection joke. |
| EV-LOR-06 | concession | “Choose the ground. Yield the card.” | Any | DT; controlled defense. |
| EV-LOR-07 | desperate rescue | “The wall is behind us. Forward.” | Any | DT; cornered surge. |

### 6.5 Bastien

| ID | Trigger | Preferred line | Replay | Truth / function |
| --- | --- | --- | --- | --- |
| EV-BAS-01 | special clash | “The little card has remembered its oldest dream.” | Any | PM; Two/Ace identity. |
| EV-BAS-02 | narrow clash | “One crumb tips the board. The board was hungry.” | Any | PM; small margin. |
| EV-BAS-03 | rescue | “The whey returns what the curd misplaced.” | Any | PM; successful rescue. |
| EV-BAS-04 | failed rescue | “The second card arrived at the wrong prophecy.” | Any | PM; spoken after outcome, no hidden knowledge. |
| EV-BAS-05 | notable Battle loss | “The rind keeps every scar, even when the tongue forgets.” | Any | PM; long horizon. |
| EV-BAS-06 | concession | “Release one card. Preserve the cave.” | Any | PM; Attritionist restraint. |
| EV-BAS-07 | desperate rescue | “There is no deeper shelf. Stand here.” | Any | PM; low-deck threshold. |

## 7. Selection and Pacing Rules

1. Play `G intro`, `G context`, and `G resolution` on reliable surfaces. They are not subject to reaction probability.
2. Never show more than one optional commander quip for a single resolved gameplay event.
3. Do not repeat a creative ID within one War. When an eligible pool is exhausted, silence wins.
4. Give essential copy time to finish, but let the player tap/Continue to complete its presentation immediately. Optional quips must never block input.
5. A result reaction may follow any player win, loss, or tie; the guaranteed narrative resolution follows separately and is outcome-independent.
6. First-play ordered records are selected by exact chapter + War index + commander. Future randomized replay may select only records whose replay gate has been satisfied.
7. Do not play a Bastien prophecy before the triggering cards/outcome are public. Prophecy changes voice, not information access.
8. Fog of War redaction applies to the Chronicle and historical card identities. Dialogue may reference only currently public events and already unlocked narrative knowledge.

## 8. Dialogue Counts

The authored encounter bank contains exactly **192 creative records**: sixteen per encounter and forty-eight per chapter.

| Commander | Chapter I | Chapter II | Chapter III | Chapter IV | Encounter-bank total | Evergreen reserve | Total records |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Marcel de Brie | 16 | 16 | 16 | 0 | 48 | 7 | 55 |
| Matthias von Greyerz | 16 | 0 | 16 | 16 | 48 | 7 | 55 |
| Sir Edmund Gloucester | 0 | 16 | 0 | 16 | 32 | 7 | 39 |
| Lorenzo di Taleggio | 0 | 16 | 0 | 16 | 32 | 7 | 39 |
| Bastien de Herve | 16 | 0 | 16 | 0 | 32 | 7 | 39 |
| **All commanders** | **48** | **48** | **48** | **48** | **192** | **35** | **227** |

The sixteen guaranteed chapter framing/transition records (`TR-C1-01` through `TR-C4-04`) and progressive dossier entries are counted separately because they are narrative-surface records, not commander dialogue-bank fragments.

## 9. Validation Results

### 9.1 Twelve-War continuity

- Marcel I.1 accuses, II.3 justifies, and III.2 doubts; no appearance repeats his dramatic function.
- Matthias I.2 counters, III.1 fractures, and IV.3 admits; his sentences visibly simplify.
- Edmund and Lorenzo first defend their counsel, then separately recognize its effect.
- Bastien repeats no major prophecy verbatim in live dialogue; images recur from a new angle. The dossier deliberately preserves P01 verbatim so the annotation—not the quotation—evolves.
- Every required reveal appears in a guaranteed intro, context, resolution, transition, dossier, or Field Manual unlock. Missing optional quips cannot break comprehension.

### 9.2 Voice-blind sample

Speaker labels were removed from a cross-chapter sample. Identity remained recoverable through these non-national signals:

| Unlabeled fingerprint | Identifying features |
| --- | --- |
| “A poor expenditure with a lingering finish.” | Tasting-note judgment + reserve economics → Marcel |
| “Probability described risk. It did not cancel it.” | Evidence/probability distinction → Matthias |
| “Nothing left but nerve. Convenient.” | Catastrophe as dry opportunity → Edmund |
| “One step is how encirclement introduces itself.” | Small fact projected into strategic enclosure → Lorenzo |
| “The little card has remembered its oldest dream.” | Concrete card rendered as prophetic organic image → Bastien |

Nationality words are not needed to identify any of the five samples.

### 9.3 Accent and TTS/readability

- Required reveals use ordinary English syntax and do not depend on phonetic spellings.
- `monsieur`, `non`, `mais`, `ja`, `nein`, `Madonna mia`, and `bene` are sparse, contextual signals.
- No line exhaustively rewrites an accent. Bastien is distinguished by imagery, not repeated `ze` spellings.
- Specialized terms are pronounceable and receive dossier/source support; none blocks immediate comprehension of a gameplay outcome.

### 9.4 Rereading and truthfulness

- Marcel's early anger becomes evidence of prior trust, not proof he lied.
- Matthias's early exactness remains a sincere attempt at control; Chapter III corrects its scope.
- Edmund's early jokes expose his appetite for action after IV.1.
- Lorenzo's future-tense opera exposes his weighting after IV.2.
- Bastien's P01–P09 imagery remains aligned with private canon. No line makes him a partisan, troll, or hidden-information cheat.
- No original accusation is classified as a conscious lie.

### 9.5 Spoiler and replay

- Chapters I–II contain no plain natural explanation. Bastien's strongest early images are useful only in hindsight.
- Chapter III permits field/stem/breath inference but never states the mouse/hay sequence.
- Chapter IV characters admit evidentiary and moral failures without learning the private mechanism.
- `First` lines remain tied to authored sequence. `Any` lines and satisfied `Post-C#` lines form the safe pool for the later, explicitly deferred randomized-replay polish.

### 9.6 Humor and repetition

- Humor rotates among cellar craft, quantitative pedantry, wagers, strategic opera, prophecy, bureaucracy, and real-world history.
- Recurring phrases are deliberate callbacks: “no choice,” “the record is exact,” “what does the cheese say,” possibility/urgency, and the blind wheel.
- Characteristic interjections are limited. Repetition should be tested again after runtime selection probabilities and on-device line wrapping are known.
- Weak generic filler is intentionally excluded; silence is preferable to an unearned pun.
