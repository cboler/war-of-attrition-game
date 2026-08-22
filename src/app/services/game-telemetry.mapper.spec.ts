import { CardImpl, Rank, Suit } from '../core/models/card.model';
import { DeckColor, GameOutcome, PlayerType } from '../core/models/game-state.model';
import { TelemetryEnvelope } from '../core/models/telemetry.model';
import { ComparisonResult } from '../core/services/card-comparison.service';
import { mapGameEventToTelemetry } from './game-telemetry.mapper';
import { normalizeTelemetryRecordForGa4 } from './telemetry-transport.service';

describe('game telemetry mapper', () => {
  const envelope: TelemetryEnvelope = {
    schemaVersion: 1,
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
    expect(mapped?.parameters['schema_version']).toBe(1);
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
});
