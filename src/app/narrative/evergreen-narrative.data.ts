import { AuthoredDialogueRecord } from '../core/models/narrative.model';

export const EVERGREEN_DIALOGUE: readonly AuthoredDialogueRecord[] = [
  // Marcel de Brie (7 evergreen records)
  { id: 'EV-MAR-01', commanderId: 'quartermaster', event: 'special_clash', text: 'An exception is not anarchy, monsieur. It is a rule with dramatic tailoring.', availability: 'any' },
  { id: 'EV-MAR-02', commanderId: 'quartermaster', event: 'narrow_clash', text: 'A thin margin can still possess excellent provenance.', availability: 'any' },
  { id: 'EV-MAR-03', commanderId: 'quartermaster', event: 'rescue', text: 'Worth preserving. Return it to service.', availability: 'any' },
  { id: 'EV-MAR-04', commanderId: 'quartermaster', event: 'failed_rescue', text: 'A poor expenditure with a lingering finish.', availability: 'any' },
  { id: 'EV-MAR-05', commanderId: 'quartermaster', event: 'large_battle_loss', text: 'Record the loss. Then protect what has survived it.', availability: 'any' },
  { id: 'EV-MAR-06', commanderId: 'quartermaster', event: 'concession', text: 'We do not bankrupt the cellar for one course.', availability: 'any' },
  { id: 'EV-MAR-07', commanderId: 'quartermaster', event: 'desperate_rescue', text: 'Very well. Break the seal on the reserve.', availability: 'any' },

  // Matthias von Greyerz (7 evergreen records)
  { id: 'EV-MAT-01', commanderId: 'analyst', event: 'special_clash', text: 'Categorical exception. Valid result.', availability: 'any' },
  { id: 'EV-MAT-02', commanderId: 'analyst', event: 'narrow_clash', text: 'Minimum decisive interval.', availability: 'any' },
  { id: 'EV-MAT-03', commanderId: 'analyst', event: 'rescue', text: 'Commitment justified by the visible pool.', availability: 'any' },
  { id: 'EV-MAT-04', commanderId: 'analyst', event: 'failed_rescue', text: 'Probability described risk. It did not cancel it.', availability: 'any' },
  { id: 'EV-MAT-05', commanderId: 'analyst', event: 'large_battle_loss', text: 'Update the record. Continue.', availability: 'any' },
  { id: 'EV-MAT-06', commanderId: 'analyst', event: 'concession', text: 'Expected value is negative. Nein.', availability: 'any' },
  { id: 'EV-MAT-07', commanderId: 'analyst', event: 'desperate_rescue', text: 'Threshold crossed. Recalculate.', availability: 'any' },

  // Sir Edmund Gloucester (7 evergreen records)
  { id: 'EV-EDM-01', commanderId: 'gambler', event: 'special_clash', text: 'The rule keeps one excellent surprise in its sleeve.', availability: 'any' },
  { id: 'EV-EDM-02', commanderId: 'gambler', event: 'narrow_clash', text: 'Close enough to make the next one tempting.', availability: 'any' },
  { id: 'EV-EDM-03', commanderId: 'gambler', event: 'rescue', text: 'Splendid. The inadvisable card has become timely.', availability: 'any' },
  { id: 'EV-EDM-04', commanderId: 'gambler', event: 'failed_rescue', text: 'Well, certainty would have been less expensive.', availability: 'any' },
  { id: 'EV-EDM-05', commanderId: 'gambler', event: 'large_battle_loss', text: 'Rather a lot of history for one table.', availability: 'any' },
  { id: 'EV-EDM-06', commanderId: 'gambler', event: 'concession', text: 'Cold table. Keep the stake.', availability: 'any' },
  { id: 'EV-EDM-07', commanderId: 'gambler', event: 'desperate_rescue', text: 'Nothing left but nerve. Convenient.', availability: 'any' },

  // Lorenzo di Taleggio (7 evergreen records)
  { id: 'EV-LOR-01', commanderId: 'cornered-general', event: 'special_clash', text: 'Even an Ace has an unguarded road.', availability: 'any' },
  { id: 'EV-LOR-02', commanderId: 'cornered-general', event: 'narrow_clash', text: 'One step is how encirclement introduces itself.', availability: 'any' },
  { id: 'EV-LOR-03', commanderId: 'cornered-general', event: 'rescue', text: 'The breach closes. Bene.', availability: 'any' },
  { id: 'EV-LOR-04', commanderId: 'cornered-general', event: 'failed_rescue', text: 'Reinforcement arrived after consequence.', availability: 'any' },
  { id: 'EV-LOR-05', commanderId: 'cornered-general', event: 'large_battle_loss', text: 'Realign the line before the loss acquires ambitions.', availability: 'any' },
  { id: 'EV-LOR-06', commanderId: 'cornered-general', event: 'concession', text: 'Choose the ground. Yield the card.', availability: 'any' },
  { id: 'EV-LOR-07', commanderId: 'cornered-general', event: 'desperate_rescue', text: 'The wall is behind us. Forward.', availability: 'any' },

  // Bastien de Herve (7 evergreen records)
  { id: 'EV-BAS-01', commanderId: 'attritionist', event: 'special_clash', text: 'The little card has remembered its oldest dream.', availability: 'any' },
  { id: 'EV-BAS-02', commanderId: 'attritionist', event: 'narrow_clash', text: 'One crumb tips the board. The board was hungry.', availability: 'any' },
  { id: 'EV-BAS-03', commanderId: 'attritionist', event: 'rescue', text: 'The whey returns what the curd misplaced.', availability: 'any' },
  { id: 'EV-BAS-04', commanderId: 'attritionist', event: 'failed_rescue', text: 'The second card arrived at the wrong prophecy.', availability: 'any' },
  { id: 'EV-BAS-05', commanderId: 'attritionist', event: 'large_battle_loss', text: 'The rind keeps every scar, even when the tongue forgets.', availability: 'any' },
  { id: 'EV-BAS-06', commanderId: 'attritionist', event: 'concession', text: 'Release one card. Preserve the cave.', availability: 'any' },
  { id: 'EV-BAS-07', commanderId: 'attritionist', event: 'desperate_rescue', text: 'There is no deeper shelf. Stand here.', availability: 'any' }
];
