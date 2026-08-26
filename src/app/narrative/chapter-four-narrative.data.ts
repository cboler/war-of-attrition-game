import {
  AuthoredDialogueRecord,
  CommanderDossierRecord,
  NarrativeTransitionRecord
} from '../core/models/narrative.model';

export const CHAPTER_FOUR_DIALOGUE: readonly AuthoredDialogueRecord[] = [
  // War 1 — Sir Edmund Gloucester
  { id: 'C4W1-EDM-01', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'introduction', text: 'I called it a bluff because waiting bored me and action looked brave. Marcel supplied the signature. I supplied the applause.', availability: 'first_play', revealIds: ['R27'] },
  { id: 'C4W1-EDM-02', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'context', text: 'I did not want a war. Rather thought that sentence would improve with repetition. It has not.', availability: 'first_play', revealIds: ['R19', 'R27'] },
  { id: 'C4W1-EDM-03', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'special_clash', text: 'The small card wins. I should be delighted. Give me a moment.', availability: 'replay' },
  { id: 'C4W1-EDM-04', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'narrow_clash', text: 'One rank. Enough to alter the total, which is how these things begin.', availability: 'replay' },
  { id: 'C4W1-EDM-05', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'rescue', text: 'A sound wager. I no longer confuse sound with harmless.', availability: 'replay' },
  { id: 'C4W1-EDM-06', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'failed_rescue', text: 'There it is: the second cost arriving behind the first.', availability: 'any' },
  { id: 'C4W1-EDM-07', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'battle_ace_lost', text: 'The grand piece is gone. No joke improves the differential.', availability: 'replay' },
  { id: 'C4W1-EDM-08', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'battle_two_lost', text: 'We spent the little answer before the large question arrived.', availability: 'any' },
  { id: 'C4W1-EDM-09', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'deep_battle', text: 'Another layer. Momentum is a splendid servant and an appalling chaperone.', availability: 'replay' },
  { id: 'C4W1-EDM-10', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'large_battle_loss', text: 'That started as one card. Most disasters prefer a modest introduction.', availability: 'replay', revealIds: ['R19'] },
  { id: 'C4W1-EDM-11', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'concession', text: 'Not every refusal is cowardice. Took me rather a lot of armies to learn that.', availability: 'replay' },
  { id: 'C4W1-EDM-12', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'desperate_rescue', text: 'Last chance. We act—but this time let us name the cost first.', availability: 'replay' },
  { id: 'C4W1-EDM-13', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'contextual', text: 'Don’t ask him. We have heard enough from things we laughed at.', availability: 'first_play' },
  { id: 'C4W1-EDM-14', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'contextual', text: 'I accused Lorenzo of turning possibility into a pistol. Mine was called a wager. Same powder.', availability: 'first_play', revealIds: ['R27', 'R28'] },
  { id: 'C4W1-EDM-15', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'result', text: 'Add it to the total. That is the wretchedly honest thing about totals.', availability: 'replay' },
  { id: 'C4W1-EDM-16', commanderId: 'gambler', mode: 'total_war', warIndex: 1, event: 'resolution', text: 'Marcel wanted one honorable reason to move. I handed him three amusing ones and made stillness feel like shame.', availability: 'first_play', revealIds: ['R27'] },

  // War 2 — Lorenzo di Taleggio
  { id: 'C4W2-LOR-01', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'introduction', text: 'I named every door France might close. Then I spoke as if I heard the key turn.', availability: 'first_play', revealIds: ['R28'] },
  { id: 'C4W2-LOR-02', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'context', text: 'The threats were plausible. My certainty was not.', availability: 'first_play', revealIds: ['R13', 'R28'] },
  { id: 'C4W2-LOR-03', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'special_clash', text: 'The smallest card found the open flank. No opera. Just consequence.', availability: 'replay' },
  { id: 'C4W2-LOR-04', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'narrow_clash', text: 'One rank. It enters the total.', availability: 'replay' },
  { id: 'C4W2-LOR-05', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'rescue', text: 'The line holds. Record the price.', availability: 'any' },
  { id: 'C4W2-LOR-06', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'failed_rescue', text: 'We doubled the risk and called it defense.', availability: 'any' },
  { id: 'C4W2-LOR-07', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'battle_ace_lost', text: 'The center is gone. We continue.', availability: 'replay' },
  { id: 'C4W2-LOR-08', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'battle_two_lost', text: 'The scout is gone. Adjust.', availability: 'replay' },
  { id: 'C4W2-LOR-09', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'deep_battle', text: 'We keep adding layers because the last layer now needs defending.', availability: 'replay' },
  { id: 'C4W2-LOR-10', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'large_battle_loss', text: 'This is the future I warned against. Warning did not keep my hands clean.', availability: 'replay', revealIds: ['R28'] },
  { id: 'C4W2-LOR-11', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'concession', text: 'Yield the card. Refusing every concession is how one becomes surrounded.', availability: 'replay' },
  { id: 'C4W2-LOR-12', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'desperate_rescue', text: 'No room remains. Act, and do not call necessity innocence.', availability: 'replay' },
  { id: 'C4W2-LOR-13', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'contextual', text: 'I heard a hinge and announced a prison.', availability: 'first_play', revealIds: ['R28'] },
  { id: 'C4W2-LOR-14', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'contextual', text: 'Edmund made danger sound delightful. I made it sound late. We both made it louder.', availability: 'first_play' },
  { id: 'C4W2-LOR-15', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'result', text: 'The margin remains after the speech ends.', availability: 'replay' },
  { id: 'C4W2-LOR-16', commanderId: 'cornered-general', mode: 'total_war', warIndex: 2, event: 'resolution', text: 'I made possibility urgent. Urgency made it real.', availability: 'first_play', revealIds: ['R19', 'R28'] },

  // War 3 — Matthias von Greyerz
  { id: 'C4W3-MAT-01', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'introduction', text: 'The wheel had eyes. I was afraid. Marcel acted. I called the sequence proof.', availability: 'first_play', revealIds: ['R07', 'R08', 'R12', 'R29'] },
  { id: 'C4W3-MAT-02', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'context', text: 'Unexplained is not the same as sabotaged. I knew the distinction. I did not live by it.', availability: 'first_play', revealIds: ['R21', 'R29'] },
  { id: 'C4W3-MAT-03', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'special_clash', text: 'The exception was always in the rules.', availability: 'replay' },
  { id: 'C4W3-MAT-04', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'narrow_clash', text: 'One rank. It counts.', availability: 'any' },
  { id: 'C4W3-MAT-05', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'rescue', text: 'The card returns. The cost remains.', availability: 'any' },
  { id: 'C4W3-MAT-06', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'failed_rescue', text: 'I expected better. Expectation is not evidence.', availability: 'replay' },
  { id: 'C4W3-MAT-07', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'battle_ace_lost', text: 'Ace lost.', availability: 'replay' },
  { id: 'C4W3-MAT-08', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'battle_two_lost', text: 'Two lost. The exception is gone.', availability: 'any' },
  { id: 'C4W3-MAT-09', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'deep_battle', text: 'Each layer made the last one feel necessary.', availability: 'replay' },
  { id: 'C4W3-MAT-10', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'large_battle_loss', text: 'A large loss is not proof that the first choice was right.', availability: 'replay' },
  { id: 'C4W3-MAT-11', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'concession', text: 'We stop here.', availability: 'replay' },
  { id: 'C4W3-MAT-12', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'desperate_rescue', text: 'The position requires action. Nothing more.', availability: 'replay' },
  { id: 'C4W3-MAT-13', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'contextual', text: 'Repeat the Belgian’s statement about the blind wheel. Precisely.', availability: 'first_play', revealIds: ['R31'] },
  { id: 'C4W3-MAT-14', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'contextual', text: 'Marcel was wrong about my intent. I was wrong to treat his error as proof of his.', availability: 'first_play', revealIds: ['R09', 'R12', 'R29', 'R30'] },
  { id: 'C4W3-MAT-15', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'result', text: 'The final differential is exact. Its meaning is not.', availability: 'replay' },
  { id: 'C4W3-MAT-16', commanderId: 'analyst', mode: 'total_war', warIndex: 3, event: 'resolution', text: 'I never proved it.', availability: 'first_play', revealIds: ['R29', 'R37'] }
];

export const CHAPTER_FOUR_TRANSITIONS: readonly NarrativeTransitionRecord[] = [
  { id: 'TR-C4-01', mode: 'total_war', placement: 'orders', title: 'The War of Attrition', text: 'No War stands alone. Every margin enters the final account; so did every choice that brought the armies here.', revealIds: ['R19'] },
  { id: 'TR-C4-02', mode: 'total_war', placement: 'after_war_1', title: 'English Memorandum', text: 'Edmund: “I accused Lorenzo of turning a possibility into a pistol. Bit awkward, discovering my own fingerprints on the other one.”', revealIds: ['R27'] },
  { id: 'TR-C4-03', mode: 'total_war', placement: 'after_war_2', title: 'Unadorned Italian Dispatch', text: 'Lorenzo: “I told Matthias what might happen. I did not tell him how much I wanted him to act.”', revealIds: ['R28'] },
  { id: 'TR-C4-04', mode: 'total_war', placement: 'campaign_complete', title: 'Campaign Resolution', text: 'Matthias: “I never proved it.”\nMarcel: “Non. Neither did I.”', revealIds: ['R29', 'R30', 'R37'] }
];

export const CHAPTER_FOUR_DOSSIERS: readonly CommanderDossierRecord[] = [
  { id: 'DOS-EDM-04', commanderId: 'gambler', unlock: { mode: 'total_war', completedWars: 1 }, section: 'Archived Statement', text: 'Gloucester acknowledged that action appealed to him, that he helped de Brie hear the advice de Brie wanted, and that not intending war did not erase the consequence.', evidence: 'documented', revealIds: ['R27'], source: { id: 'S12', label: "Cooper's Hill cheese-rolling", url: 'https://www.gloucestershire.gov.uk/archives/learning-for-all/online-exhibitions/here-we-are-now-entertain-us/' }, relationship: 'supplement' },
  { id: 'DOS-LOR-04', commanderId: 'cornered-general', unlock: { mode: 'total_war', completedWars: 2 }, section: 'Archived Statement', text: '“I named what might happen. Then I spoke as if I heard the key turn.” Taleggio accepted that his urgency helped produce the conditions he feared.', evidence: 'documented', revealIds: ['R28'], source: { id: 'S07', label: 'The geopolitician from Brig', url: 'https://blog.nationalmuseum.ch/en/2023/09/the-geopolitician-from-brig/' }, relationship: 'supplement' },
  { id: 'DOS-MAT-05', commanderId: 'analyst', unlock: { mode: 'total_war', completedWars: 3 }, section: 'Archived Statement', text: '“I never proved it.”', evidence: 'documented', revealIds: ['R29', 'R37'], relationship: 'supplement' },
  { id: 'DOS-MAR-05', commanderId: 'quartermaster', unlock: { mode: 'total_war', completedWars: 3 }, section: 'Archived Statement', text: 'Asked whether von Greyerz had ever proved sabotage, de Brie answered: “Non. Neither did I.”', evidence: 'documented', revealIds: ['R30', 'R37'], relationship: 'supplement' },
  { id: 'DOS-BAS-06', commanderId: 'attritionist', unlock: { mode: 'total_war', completedWars: 3 }, section: 'Campaign Notes', text: 'Requests for a final prediction are absent from the surviving correspondence.', evidence: 'documented', revealIds: [], relationship: 'supplement' }
];
