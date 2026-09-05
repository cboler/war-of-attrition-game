import { CardImpl, Rank, Suit } from '../core/models/card.model';
import { DeckColor, GameOutcome, PlayerType } from '../core/models/game-state.model';
import { TelemetryEnvelope } from '../core/models/telemetry.model';
import { ComparisonResult } from '../core/services/card-comparison.service';
import { mapGameEventToTelemetry } from './game-telemetry.mapper';
import { normalizeTelemetryRecordForGa4 } from './telemetry-transport.service';

describe('game telemetry mapper', () => {
  const envelope: TelemetryEnvelope = {
    schemaVersion: 3,
    rulesetVersion: 'rules-test',
    appVersion: 'app-test',
    warId: 'war-test',
    campaignId: 'campaign-test',
    campaignWarIndex: 2,
    playerDeckColor: DeckColor.BLACK,
    eventSeq: 7
  };

  it('maps a public comparison through an explicit whitelist without message text', () => {
    const playerCard = new CardImpl(Suit.HEARTS, Rank.JACK);
    const opponentCard = new CardImpl(Suit.CLUBS, Rank.TEN);
    const mapped = mapGameEventToTelemetry({
      type: 'clash_resolved',
      turnNumber: 4,
      playerCard,
      opponentCard,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      specialRule: false,
      message: 'free text must never leave the app'
    }, envelope);

    expect(mapped?.name).toBe('comparison_resolved');
    expect(mapped?.parameters['player_card_id']).toBe(playerCard.id);
    expect(mapped?.parameters['opponent_card_id']).toBe(opponentCard.id);
    expect(mapped?.parameters['close_victory']).toBe(1);
    expect(JSON.stringify(mapped)).not.toContain('free text must never leave the app');
    expect(mapped?.parameters['schema_version']).toBe(3);
    expect(mapped?.parameters['ruleset_version']).toBe('rules-test');
    expect(mapped?.parameters['app_version']).toBe('app-test');
  });

  it('does not serialize hidden Battle card identities', () => {
    const playerChampion = new CardImpl(Suit.HEARTS, Rank.ACE);
    const opponentChampion = new CardImpl(Suit.SPADES, Rank.KING);
    const hiddenWinner = new CardImpl(Suit.DIAMONDS, Rank.TWO);
    const casualty = new CardImpl(Suit.CLUBS, Rank.QUEEN);
    const mapped = mapGameEventToTelemetry({
      type: 'battle_resolved',
      turnNumber: 9,
      outcome: {
        winner: PlayerType.PLAYER,
        loser: PlayerType.OPPONENT,
        battleDepth: 1,
        selection: {
          layerRound: 1,
          playerCard: playerChampion,
          opponentCard: opponentChampion,
          playerCardId: playerChampion.id,
          opponentCardId: opponentChampion.id,
          comparison: ComparisonResult.PLAYER_WINS,
          winner: PlayerType.PLAYER,
          specialRule: false
        },
        casualties: [casualty],
        casualtyIds: [casualty.id],
        selectedPlayerChampion: playerChampion,
        selectedOpponentChampion: opponentChampion,
        hiddenWinnerCount: 1,
        publicWinnerCount: 1,
        playerCardsAtStakeCount: 2,
        opponentCardsAtStakeCount: 2,
        finalPlayerDeckCount: 22,
        finalOpponentDeckCount: 19,
        finalBoneyardCount: 9
      }
    }, envelope);

    const serialized = JSON.stringify(mapped);
    expect(serialized).toContain(playerChampion.id);
    expect(serialized).toContain(opponentChampion.id);
    expect(serialized).not.toContain(hiddenWinner.id);
    expect(serialized).not.toContain(casualty.id);
    expect(Object.keys(mapped?.parameters ?? {}).length).toBe(25);
  });

  it('keeps all three reinforcement cards and causal rescue flags within 25 parameters', () => {
    const originalCard = new CardImpl(Suit.HEARTS, Rank.TWO);
    const reinforcement = new CardImpl(Suit.DIAMONDS, Rank.ACE);
    const opposingCard = new CardImpl(Suit.CLUBS, Rank.KING);
    const mapped = mapGameEventToTelemetry({
      escalatedToBattle: false,
      type: 'challenge_resolved',
      turnNumber: 3,
      challenger: PlayerType.PLAYER,
      originalBeatenCard: originalCard,
      reinforcementCard: reinforcement,
      originalWinnerCard: opposingCard,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      challengerWon: true,
      savedTwo: true,
      message: 'not collected'
    }, envelope);
    const normalized = mapped ? normalizeTelemetryRecordForGa4(mapped) : null;

    expect(normalized).not.toBeNull();
    expect(Object.keys(normalized?.parameters ?? {}).length).toBe(25);
    expect(normalized?.parameters['original_card_id']).toBe(originalCard.id);
    expect(normalized?.parameters['reinforcement_id']).toBe(reinforcement.id);
    expect(normalized?.parameters['opposing_card_id']).toBe(opposingCard.id);
    expect(normalized?.parameters['rescued_two']).toBe(1);
    expect(normalized?.parameters['ace_rescued_two']).toBe(1);
  });

  const reinforcementOutcomes = [
    [PlayerType.PLAYER, ComparisonResult.PLAYER_WINS, PlayerType.PLAYER, true, false, 'success'],
    [PlayerType.PLAYER, ComparisonResult.OPPONENT_WINS, PlayerType.OPPONENT, false, false, 'failure'],
    [PlayerType.OPPONENT, ComparisonResult.OPPONENT_WINS, PlayerType.OPPONENT, true, false, 'success'],
    [PlayerType.OPPONENT, ComparisonResult.PLAYER_WINS, PlayerType.PLAYER, false, false, 'failure'],
    [PlayerType.PLAYER, ComparisonResult.TIE, null, false, true, 'battle'],
    [PlayerType.PLAYER, ComparisonResult.TIE, PlayerType.PLAYER, false, false, 'tie'],
    [PlayerType.PLAYER, ComparisonResult.TIE, PlayerType.OPPONENT, false, false, 'tie'],
    [PlayerType.PLAYER, ComparisonResult.TIE, null, false, false, 'tie'],
    [PlayerType.OPPONENT, ComparisonResult.TIE, PlayerType.OPPONENT, false, false, 'tie'],
  ] as const;

  for (const [challenger, comparison, winner, challengerWon, escalatedToBattle, outcome] of reinforcementOutcomes) {
    it(`maps ${challenger} reinforcement ${comparison}/${winner}/${escalatedToBattle} as ${outcome}`, () => {
      const mapped = mapGameEventToTelemetry({
        type: 'challenge_resolved',
        turnNumber: 3,
        challenger,
        comparison,
        winner,
        challengerWon,
        escalatedToBattle,
        originalBeatenCard: new CardImpl(Suit.HEARTS, Rank.TWO),
        reinforcementCard: new CardImpl(Suit.DIAMONDS,
          comparison === ComparisonResult.TIE ? Rank.KING : challengerWon ? Rank.ACE : Rank.THREE),
        originalWinnerCard: new CardImpl(Suit.CLUBS, Rank.KING),
        savedTwo: challengerWon,
        message: 'not collected',
      }, envelope)!;
      const normalized = normalizeTelemetryRecordForGa4(mapped);

      expect(normalized).not.toBeNull();
      expect(Object.keys(mapped.parameters).length).toBe(25);
      expect(mapped.parameters['outcome']).toBe(outcome);
      expect(mapped.parameters['escalated_to_battle']).toBe(escalatedToBattle ? 1 : 0);
      expect(mapped.parameters['rescued_two']).toBe(challengerWon ? 1 : 0);
      expect(mapped.parameters['ace_rescued_two']).toBe(challengerWon ? 1 : 0);
    });
  }

  it('maps public causal settlement attribution without casualty identities', () => {
    const decisiveCard = new CardImpl(Suit.HEARTS, Rank.QUEEN);
    const casualty = new CardImpl(Suit.CLUBS, Rank.JACK);
    const mapped = mapGameEventToTelemetry({
      type: 'settlement_resolved',
      turnNumber: 6,
      attribution: {
        source: 'challenge',
        winner: PlayerType.PLAYER,
        loser: PlayerType.OPPONENT,
        decisiveCard,
        casualties: [casualty],
        battleDepth: 0
      }
    }, envelope);

    expect(mapped?.parameters['source']).toBe('challenge');
    expect(mapped?.parameters['decisive_card_id']).toBe(decisiveCard.id);
    expect(mapped?.parameters['casualty_count']).toBe(1);
    expect(JSON.stringify(mapped)).not.toContain(casualty.id);
  });

  it('maps a canonical War summary with signed attrition differential and deck color', () => {
    const mapped = mapGameEventToTelemetry({
      type: 'game_resolved',
      turnNumber: 42,
      outcome: GameOutcome.OPPONENT_WIN,
      turns: 42,
      playerCardsRemaining: 0,
      opponentCardsRemaining: 6,
      maxDeficitExperienced: 11,
      isComeback: false,
      battlesCount: 3,
      playerReinforcementsSent: 4
    }, envelope);

    expect(mapped?.name).toBe('war_resolved');
    expect(mapped?.parameters['attrition_differential']).toBe(-6);
    expect(mapped?.parameters['player_deck_color']).toBe('black');
    expect(Object.keys(mapped?.parameters ?? {}).length).toBeLessThanOrEqual(25);
  });

  it('keeps only an enumerated quip category and drops its free text', () => {
    const mapped = mapGameEventToTelemetry({
      type: 'quip_spoken',
      turnNumber: 1,
      speaker: PlayerType.OPPONENT,
      message: 'possibly sensitive free text',
      category: 'narrow_clash'
    }, envelope);

    expect(mapped?.name).toBe('reaction_spoken');
    expect(mapped?.parameters['reaction_category']).toBe('narrow_clash');
    expect(JSON.stringify(mapped)).not.toContain('possibly sensitive free text');
  });

  describe('Campaign mode telemetry policies (Standard, Limited Reserves, Total War, Fog of War)', () => {
    const playerCard = new CardImpl(Suit.HEARTS, Rank.ACE);
    const opponentCard = new CardImpl(Suit.SPADES, Rank.TWO);
    const decisiveCard = new CardImpl(Suit.DIAMONDS, Rank.KING);
    const casualty = new CardImpl(Suit.CLUBS, Rank.QUEEN);

    it('retains detailed card-ledger parameters for Standard, Limited Reserves, and Total War', () => {
      const modes: Array<'standard' | 'limited_reserves' | 'total_war'> = [
        'standard',
        'limited_reserves',
        'total_war'
      ];

      for (const mode of modes) {
        const modeEnvelope: TelemetryEnvelope = { ...envelope, campaignMode: mode };

        // 1. Clash
        const clash = mapGameEventToTelemetry({
          type: 'clash_resolved',
          turnNumber: 1,
          playerCard,
          opponentCard,
          comparison: ComparisonResult.OPPONENT_WINS,
          winner: PlayerType.OPPONENT,
          specialRule: true,
          message: 'Opponent card survives.'
        }, modeEnvelope);
        expect(clash?.parameters['player_card_id']).toBe(playerCard.id);
        expect(clash?.parameters['opponent_card_id']).toBe(opponentCard.id);
        expect(clash?.parameters['player_card_rank']).toBe(Rank.ACE);
        expect(clash?.parameters['opponent_card_rank']).toBe(Rank.TWO);

        // 2. Casualty
        const casualtyEvent = mapGameEventToTelemetry({
          type: 'casualty_revealed',
          turnNumber: 1,
          source: 'clash',
          card: casualty,
          loser: PlayerType.PLAYER,
          casualtyIndex: 1,
          totalCasualties: 1,
          decisiveCard
        }, modeEnvelope);
        expect(casualtyEvent?.parameters['card_id']).toBe(casualty.id);
        expect(casualtyEvent?.parameters['card_rank']).toBe(Rank.QUEEN);
        expect(casualtyEvent?.parameters['casualty_index']).toBe(1);
        expect(casualtyEvent?.parameters['casualty_count']).toBe(1);
        expect(casualtyEvent?.parameters['decisive_card_id']).toBe(decisiveCard.id);

        // 3. Reinforcement decision and resolution
        const reinforceAccepted = mapGameEventToTelemetry({
          type: 'challenge_accepted',
          turnNumber: 2,
          challenger: PlayerType.PLAYER,
          reinforcementCard: playerCard
        }, modeEnvelope);
        expect(reinforceAccepted?.parameters['reinforcement_id']).toBe(playerCard.id);
        expect(reinforceAccepted?.parameters['reinforcement_rank']).toBe(Rank.ACE);

        const cardTwo = new CardImpl(Suit.HEARTS, Rank.TWO);
        const cardAce = new CardImpl(Suit.SPADES, Rank.ACE);
        const reinforceResolved = mapGameEventToTelemetry({
          escalatedToBattle: false,
          type: 'challenge_resolved',
          turnNumber: 2,
          challenger: PlayerType.PLAYER,
          originalBeatenCard: opponentCard,
          reinforcementCard: cardTwo,
          originalWinnerCard: cardAce,
          comparison: ComparisonResult.PLAYER_WINS,
          winner: PlayerType.PLAYER,
          challengerWon: true,
          savedTwo: true,
          message: 'Card rescued.'
        }, modeEnvelope);
        expect(reinforceResolved?.parameters['reinforcement_id']).toBe(cardTwo.id);
        expect(reinforceResolved?.parameters['original_card_id']).toBe(opponentCard.id);
        expect(reinforceResolved?.parameters['opposing_card_id']).toBe(cardAce.id);
        expect(reinforceResolved?.parameters['two_defeated_ace']).toBe(1);

        // 4. Settlement
        const settlement = mapGameEventToTelemetry({
          type: 'settlement_resolved',
          turnNumber: 3,
          attribution: {
            source: 'battle',
            winner: PlayerType.PLAYER,
            loser: PlayerType.OPPONENT,
            decisiveCard,
            casualties: [casualty],
            battleDepth: 1
          }
        }, modeEnvelope);
        expect(settlement?.parameters['decisive_card_id']).toBe(decisiveCard.id);
        expect(settlement?.parameters['casualty_count']).toBe(1);
        expect(settlement?.parameters['high_value_casualties']).toBe(1);
      }
    });

    it('suppresses card-ledger and Boneyard reconstruction parameters when Fog is in a modifier stack', () => {
      const fogEnvelope: TelemetryEnvelope = {
        ...envelope,
        campaignMode: 'standard',
        campaignModifiers: ['limited_reserves', 'fog_of_war'],
      };

      // 1. Clash: retains comparison and winner, suppresses exact card IDs/ranks/values
      const clash = mapGameEventToTelemetry({
        type: 'clash_resolved',
        turnNumber: 1,
        playerCard,
        opponentCard,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        specialRule: true,
        message: 'Opponent card survives.'
      }, fogEnvelope);
      expect(clash?.parameters['campaign_mode']).toBe('standard');
      expect(clash?.parameters['campaign_modifiers']).toBe('limited_reserves+fog_of_war');
      expect(clash?.parameters['stage']).toBe('clash');
      expect(clash?.parameters['comparison']).toBe(ComparisonResult.OPPONENT_WINS);
      expect(clash?.parameters['winner']).toBe(PlayerType.OPPONENT);
      expect(clash?.parameters['special_rule']).toBe('two_beats_ace');
      expect(clash?.parameters['player_card_id']).toBeUndefined();
      expect(clash?.parameters['player_card_rank']).toBeUndefined();
      expect(clash?.parameters['player_card_suit']).toBeUndefined();
      expect(clash?.parameters['player_card_value']).toBeUndefined();
      expect(clash?.parameters['opponent_card_id']).toBeUndefined();
      expect(clash?.parameters['opponent_card_rank']).toBeUndefined();
      expect(clash?.parameters['value_gap']).toBeUndefined();
      expect(clash?.parameters['close_victory']).toBeUndefined();

      // 2. Casualty: retains source and owner, suppresses card identity, index, and total count
      const casualtyEvent = mapGameEventToTelemetry({
        type: 'casualty_revealed',
        turnNumber: 1,
        source: 'clash',
        card: casualty,
        loser: PlayerType.PLAYER,
        casualtyIndex: 1,
        totalCasualties: 1,
        decisiveCard
      }, fogEnvelope);
      expect(casualtyEvent?.name).toBe('card_eliminated');
      expect(casualtyEvent?.parameters['source']).toBe('clash');
      expect(casualtyEvent?.parameters['card_owner']).toBe(PlayerType.PLAYER);
      expect(casualtyEvent?.parameters['card_id']).toBeUndefined();
      expect(casualtyEvent?.parameters['card_rank']).toBeUndefined();
      expect(casualtyEvent?.parameters['casualty_index']).toBeUndefined();
      expect(casualtyEvent?.parameters['casualty_count']).toBeUndefined();
      expect(casualtyEvent?.parameters['decisive_card_id']).toBeUndefined();
      expect(casualtyEvent?.parameters['high_value']).toBeUndefined();

      // 3. Reinforcement: suppresses card identities and rank-revealing causal flags
      const reinforceAccepted = mapGameEventToTelemetry({
        type: 'challenge_accepted',
        turnNumber: 2,
        challenger: PlayerType.PLAYER,
        reinforcementCard: playerCard
      }, fogEnvelope);
      expect(reinforceAccepted?.parameters['actor']).toBe(PlayerType.PLAYER);
      expect(reinforceAccepted?.parameters['choice']).toBe('accepted');
      expect(reinforceAccepted?.parameters['reinforcement_id']).toBeUndefined();
      expect(reinforceAccepted?.parameters['reinforcement_rank']).toBeUndefined();

      const reinforceResolved = mapGameEventToTelemetry({
        escalatedToBattle: false,
        type: 'challenge_resolved',
        turnNumber: 2,
        challenger: PlayerType.PLAYER,
        originalBeatenCard: opponentCard,
        reinforcementCard: playerCard,
        originalWinnerCard: decisiveCard,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        challengerWon: true,
        savedTwo: true,
        message: 'Card rescued.'
      }, fogEnvelope);
      expect(reinforceResolved?.parameters['challenger']).toBe(PlayerType.PLAYER);
      expect(reinforceResolved?.parameters['comparison']).toBeUndefined();
      expect(reinforceResolved?.parameters['outcome']).toBe('success');
      expect(reinforceResolved?.parameters['reinforcement_id']).toBeUndefined();
      expect(reinforceResolved?.parameters['original_card_id']).toBeUndefined();
      expect(reinforceResolved?.parameters['opposing_card_id']).toBeUndefined();
      expect(reinforceResolved?.parameters['two_defeated_ace']).toBeUndefined();
      expect(reinforceResolved?.parameters['rescued_two']).toBeUndefined();
      expect(reinforceResolved?.parameters['ace_rescued_two']).toBeUndefined();

      // 4. Battle reveal and resolution
      const battleReveal = mapGameEventToTelemetry({
        type: 'battle_cards_revealed',
        turnNumber: 5,
        layerRound: 1,
        playerChosenCard: playerCard,
        opponentChosenCard: opponentCard,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: false,
        message: 'Champions clash.',
        selection: {
          layerRound: 1,
          playerCard,
          opponentCard,
          playerCardId: playerCard.id,
          opponentCardId: opponentCard.id,
          comparison: ComparisonResult.PLAYER_WINS,
          winner: PlayerType.PLAYER,
          specialRule: false
        }
      }, fogEnvelope);
      expect(battleReveal?.parameters['stage']).toBe('battle');
      expect(battleReveal?.parameters['battle_depth']).toBe(1);
      expect(battleReveal?.parameters['player_card_id']).toBeUndefined();
      expect(battleReveal?.parameters['opponent_card_id']).toBeUndefined();

      const battleResolved = mapGameEventToTelemetry({
        type: 'battle_resolved',
        turnNumber: 5,
        outcome: {
          winner: PlayerType.PLAYER,
          loser: PlayerType.OPPONENT,
          battleDepth: 1,
          selection: {
            layerRound: 1,
            playerCard,
            opponentCard,
            playerCardId: playerCard.id,
            opponentCardId: opponentCard.id,
            comparison: ComparisonResult.PLAYER_WINS,
            winner: PlayerType.PLAYER,
            specialRule: false
          },
          casualties: [casualty],
          casualtyIds: [casualty.id],
          selectedPlayerChampion: playerCard,
          selectedOpponentChampion: opponentCard,
          hiddenWinnerCount: 1,
          publicWinnerCount: 1,
          playerCardsAtStakeCount: 2,
          opponentCardsAtStakeCount: 2,
          finalPlayerDeckCount: 22,
          finalOpponentDeckCount: 19,
          finalBoneyardCount: 9
        }
      }, fogEnvelope);
      expect(battleResolved?.parameters['winner']).toBe(PlayerType.PLAYER);
      expect(battleResolved?.parameters['player_champion_id']).toBeUndefined();
      expect(battleResolved?.parameters['opponent_champion_id']).toBeUndefined();
      expect(battleResolved?.parameters['casualty_count']).toBeUndefined();
      expect(battleResolved?.parameters['hidden_winner_count']).toBeUndefined();

      // 5. Settlement
      const settlement = mapGameEventToTelemetry({
        type: 'settlement_resolved',
        turnNumber: 5,
        attribution: {
          source: 'battle',
          winner: PlayerType.PLAYER,
          loser: PlayerType.OPPONENT,
          decisiveCard,
          casualties: [casualty],
          battleDepth: 1
        }
      }, fogEnvelope);
      expect(settlement?.parameters['source']).toBe('battle');
      expect(settlement?.parameters['winner']).toBe(PlayerType.PLAYER);
      expect(settlement?.parameters['decisive_card_id']).toBeUndefined();
      expect(settlement?.parameters['casualty_count']).toBeUndefined();
      expect(settlement?.parameters['high_value_casualties']).toBeUndefined();
    });

    it('transmits complete aggregate telemetry when a Fog of War War and Campaign conclude', () => {
      const fogEnvelope: TelemetryEnvelope = { ...envelope, campaignMode: 'fog_of_war' };

      const warResolved = mapGameEventToTelemetry({
        type: 'game_resolved',
        turnNumber: 30,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 30,
        playerCardsRemaining: 14,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 2,
        isComeback: false,
        battlesCount: 2,
        playerReinforcementsSent: 3,
        playerDeckColor: DeckColor.BLACK
      }, fogEnvelope);

      expect(warResolved?.name).toBe('war_resolved');
      expect(warResolved?.parameters['campaign_mode']).toBe('fog_of_war');
      expect(warResolved?.parameters['outcome']).toBe(GameOutcome.PLAYER_WIN);
      expect(warResolved?.parameters['turns']).toBe(30);
      expect(warResolved?.parameters['player_remaining']).toBe(14);
      expect(warResolved?.parameters['opponent_remaining']).toBe(0);
      expect(warResolved?.parameters['attrition_differential']).toBe(14);
      expect(warResolved?.parameters['battles']).toBe(2);
      expect(warResolved?.parameters['player_reinforcements']).toBe(3);
      expect(Object.keys(warResolved?.parameters ?? {}).length).toBeLessThanOrEqual(25);
    });
  });
});
