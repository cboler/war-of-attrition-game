import { Rank } from '../core/models/card.model';
import { GameEvent } from '../core/models/game-events.model';
import {
  TelemetryEnvelope,
  TelemetryParameters,
  TelemetryRecord
} from '../core/models/telemetry.model';
import { ProgressionDomainEvent } from '../core/services/campaign-progression.service';

export function mapGameEventToTelemetry(
  event: GameEvent,
  envelope: TelemetryEnvelope
): TelemetryRecord | null {
  const common = commonParameters(envelope, event.turnNumber);
  const isFog = envelope.campaignMode === 'fog_of_war';

  switch (event.type) {
    // beginWar() owns the one canonical start record; the domain event exists
    // for achievements and must not duplicate it.
    case 'war_started':
      return null;

    case 'turn_started':
      return record('turn_started', common);

    case 'clash_resolved':
      return record('comparison_resolved', {
        ...common,
        stage: 'clash',
        ...(isFog ? {} : {
          ...cardParameters('player_card', event.playerCard),
          ...cardParameters('opponent_card', event.opponentCard),
          value_gap: event.specialRule ? 0 : Math.abs(event.playerCard.value - event.opponentCard.value),
          close_victory: !event.specialRule && Math.abs(event.playerCard.value - event.opponentCard.value) === 1 ? 1 : 0
        }),
        comparison: event.comparison,
        winner: event.winner ?? 'tie',
        special_rule: event.specialRule ? 'two_beats_ace' : 'none'
      });

    case 'challenge_offered':
      return record('reinforcement_offered', {
        ...common,
        defender: event.defender
      });

    case 'challenge_accepted':
      return record('reinforcement_decision', {
        ...common,
        actor: event.challenger,
        choice: 'accepted',
        ...(isFog ? {} : cardParameters('reinforcement', event.reinforcementCard))
      });

    case 'challenge_conceded':
      return record('reinforcement_decision', {
        ...common,
        actor: event.loser,
        choice: 'conceded',
        winner: event.winner
      });

    case 'challenge_resolved':
      return record('reinforcement_resolved', {
        ...common,
        challenger: event.challenger,
        ...(isFog ? {} : {
          ...compactCardParameters('original_card', event.originalBeatenCard),
          ...compactCardParameters('reinforcement', event.reinforcementCard),
          ...compactCardParameters('opposing_card', event.originalWinnerCard),
          rescued_two: event.originalBeatenCard?.rank === Rank.TWO && event.challengerWon ? 1 : 0,
          ace_rescued_two: event.originalBeatenCard?.rank === Rank.TWO &&
            event.reinforcementCard.rank === Rank.ACE && event.challengerWon ? 1 : 0,
          two_defeated_ace: isTwoVersusAce(
            event.reinforcementCard.rank,
            event.originalWinnerCard.rank,
          ) && event.winner !== null ? 1 : 0
        }),
        comparison: event.comparison,
        outcome: event.winner === null ? 'battle' : event.challengerWon ? 'success' : 'failure',
        escalated_to_battle: event.winner === null ? 1 : 0
      });

    case 'battle_started':
      return record('battle_started', { ...common, battle_depth: event.layerRound });

    case 'battle_layer_added':
      return record('battle_layer_added', { ...common, battle_depth: event.layerRound });

    case 'battle_target_selected':
      return record('battle_target_selected', {
        ...common,
        battle_depth: event.layerRound,
        selector: event.selector,
        target_index: event.targetIndex
      });

    case 'battle_cards_revealed':
      return record('comparison_resolved', {
        ...common,
        stage: 'battle',
        battle_depth: event.selection.layerRound,
        ...(isFog ? {} : {
          ...cardParameters('player_card', event.selection.playerCard),
          ...cardParameters('opponent_card', event.selection.opponentCard),
          value_gap: event.selection.specialRule ? 0 : Math.abs(
            event.selection.playerCard.value - event.selection.opponentCard.value
          ),
          close_victory: !event.selection.specialRule && Math.abs(
            event.selection.playerCard.value - event.selection.opponentCard.value
          ) === 1 ? 1 : 0
        }),
        comparison: event.selection.comparison,
        winner: event.selection.winner ?? 'tie',
        special_rule: event.selection.specialRule ? 'two_beats_ace' : 'none'
      });

    case 'battle_continues':
      return record('battle_continues', { ...common, battle_depth: event.layerRound });

    case 'casualty_revealed':
      return record('card_eliminated', {
        ...common,
        source: event.source ?? 'unknown',
        card_owner: event.loser,
        ...(isFog ? {} : {
          ...cardParameters('card', event.card),
          casualty_index: event.casualtyIndex,
          casualty_count: event.totalCasualties,
          high_value: isHighValue(event.card.rank) ? 1 : 0,
          ...compactCardParameters('decisive_card', event.decisiveCard)
        })
      });

    case 'battle_resolved': {
      const outcome = event.outcome;
      return record('battle_resolved', {
        ...common,
        battle_depth: outcome.battleDepth,
        winner: outcome.winner,
        loser: outcome.loser,
        ...(isFog ? {} : {
          ...compactCardParameters('player_champion', outcome.selection?.playerCard),
          ...compactCardParameters('opponent_champion', outcome.selection?.opponentCard),
          casualty_count: outcome.casualties.length,
          hidden_winner_count: outcome.hiddenWinnerCount
        }),
        ...optionalParameter('comparison', outcome.selection?.comparison),
        special_rule: outcome.selection?.specialRule ? 1 : 0,
        cards_at_stake: outcome.playerCardsAtStakeCount,
        player_cards_after: outcome.finalPlayerDeckCount,
        opponent_cards_after: outcome.finalOpponentDeckCount
      });
    }

    case 'settlement_resolved':
      return record('settlement_resolved', {
        ...common,
        source: event.attribution.source,
        winner: event.attribution.winner,
        loser: event.attribution.loser,
        battle_depth: event.attribution.battleDepth,
        ...(isFog ? {} : {
          ...cardParameters('decisive_card', event.attribution.decisiveCard),
          casualty_count: event.attribution.casualties.length,
          high_value_casualties: event.attribution.casualties
            .filter(card => isHighValue(card.rank)).length
        })
      });

    case 'cards_returned':
      return record('cards_returned', {
        ...common,
        winner: event.winner,
        public_count: event.publicCount,
        hidden_count: event.hiddenCount
      });

    case 'cards_sent_to_boneyard':
      return record('cards_sent_to_boneyard', {
        ...common,
        ...(isFog ? {} : { casualty_count: event.cards.length })
      });

    case 'achievement_unlocked':
      return record('achievement_unlocked', {
        ...common,
        achievement_id: event.achievementId
      });

    case 'game_resolved':
      return record('war_resolved', {
        ...common,
        ...(envelope.commanderId ? { commander_id: envelope.commanderId } : {}),
        outcome: event.outcome,
        turns: event.turns,
        player_remaining: event.playerCardsRemaining,
        opponent_remaining: event.opponentCardsRemaining,
        attrition_differential: event.outcome === 'player_win'
          ? event.playerCardsRemaining
          : event.outcome === 'opponent_win'
            ? -event.opponentCardsRemaining
            : 0,
        largest_deficit: event.maxDeficitExperienced,
        comeback: event.isComeback ? 1 : 0,
        battles: event.battlesCount,
        player_reinforcements: event.playerReinforcementsSent,
        player_deck_color: event.playerDeckColor ?? envelope.playerDeckColor
      });

    case 'game_abandoned': {
      const abandonmentAction = event.abandonmentAction ??
        (event.lastDecision === 'restart' || event.lastDecision === 'abandon'
          ? event.lastDecision
          : 'unspecified');
      const lastMeaningfulDecision = event.lastDecision === 'restart' || event.lastDecision === 'abandon'
        ? undefined
        : event.lastDecision;
      return record('war_abandoned', {
        ...common,
        ...(envelope.commanderId ? { commander_id: envelope.commanderId } : {}),
        abandonment_type: 'explicit',
        abandonment_action: abandonmentAction,
        player_deck_count: event.playerDeckCount,
        opponent_deck_count: event.opponentDeckCount,
        player_stake_count: event.playerCardsAtStakeCount,
        opponent_stake_count: event.opponentCardsAtStakeCount,
        player_deficit: event.playerCardDeficit,
        game_phase: event.gamePhase,
        battle_depth: event.battleDepth,
        ...optionalParameter('battle_win_streak', event.currentBattleWinStreak),
        ...optionalParameter('battle_loss_streak', event.currentBattleLossStreak),
        ...optionalParameter('presentation_phase', event.presentationPhase),
        ...optionalParameter('animation_speed', event.animationSpeed),
        ...optionalParameter('last_decision', lastMeaningfulDecision),
        ...optionalParameter('recent_event', event.recentEventCategory),
        ...optionalParameter('reaction_category', event.recentReactionCategory),
        player_deck_color: envelope.playerDeckColor
      });
    }

    case 'quip_spoken':
      return event.category ? record('reaction_spoken', {
        ...common,
        speaker: event.speaker,
        reaction_category: event.category
      }) : null;

    // Presentation-only or domain-specific events without standalone telemetry records.
    case 'battle_presentation_complete':
    case 'valor_citation_awarded':
      return null;
  }
}

export function mapProgressionEventToTelemetry(
  event: ProgressionDomainEvent,
  versions: Pick<TelemetryEnvelope, 'schemaVersion' | 'appVersion' | 'rulesetVersion'>,
  eventSeq: number
): TelemetryRecord {
  if (event.type === 'campaign_resolved') {
    const campaign = event.campaign;
    return record('campaign_resolved', {
      schema_version: versions.schemaVersion,
      ruleset_version: versions.rulesetVersion,
      app_version: versions.appVersion,
      campaign_id: campaign.campaignId,
      war_id: campaign.wars[campaign.wars.length - 1].warId,
      campaign_war_index: 3,
      campaign_mode: campaign.mode ?? 'standard',
      war_1_commander_id: campaign.wars[0].commanderId,
      war_2_commander_id: campaign.wars[1].commanderId,
      war_3_commander_id: campaign.wars[2].commanderId,
      ...(campaign.remainingReserves !== undefined ? { remaining_reserves: campaign.remainingReserves } : {}),
      event_seq: eventSeq,
      outcome: campaign.outcome,
      wins: campaign.wins,
      losses: campaign.losses,
      ties: campaign.ties,
      war_1_margin: campaign.wars[0].margin,
      war_2_margin: campaign.wars[1].margin,
      war_3_margin: campaign.wars[2].margin,
      final_differential: campaign.differential,
      tokens_earned: campaign.tokensEarned,
      token_balance_after: event.tokenBalanceAfter
    });
  }

  return record('cosmetic_unlocked', {
    schema_version: versions.schemaVersion,
    ruleset_version: versions.rulesetVersion,
    app_version: versions.appVersion,
    event_seq: eventSeq,
    item_type: event.unlock.cosmeticType,
    item_id: event.unlock.cosmeticId,
    unlock_reason: event.unlock.reason,
    token_cost: event.unlock.tokenCost ?? 0,
    token_balance_after: event.tokenBalanceAfter
  });
}

function commonParameters(envelope: TelemetryEnvelope, turnNumber: number): TelemetryParameters {
  return {
    schema_version: envelope.schemaVersion,
    ruleset_version: envelope.rulesetVersion,
    app_version: envelope.appVersion,
    war_id: envelope.warId,
    campaign_id: envelope.campaignId,
    campaign_war_index: envelope.campaignWarIndex,
    campaign_mode: envelope.campaignMode ?? 'standard',
    event_seq: envelope.eventSeq,
    turn_number: turnNumber
  };
}

function cardParameters(prefix: string, card: { id: string; rank: string; suit: string; value: number }): TelemetryParameters {
  return {
    [`${prefix}_id`]: card.id,
    [`${prefix}_rank`]: card.rank,
    [`${prefix}_suit`]: card.suit,
    [`${prefix}_value`]: card.value
  };
}

function compactCardParameters(
  prefix: string,
  card: { id: string; rank: string; suit: string } | null | undefined
): TelemetryParameters {
  return card ? {
    [`${prefix}_id`]: card.id,
    [`${prefix}_rank`]: card.rank,
    [`${prefix}_suit`]: card.suit
  } : {};
}

function optionalParameter(
  key: string,
  value: string | number | undefined
): TelemetryParameters {
  return value === undefined ? {} : { [key]: value };
}

function record(name: string, parameters: TelemetryParameters): TelemetryRecord {
  return { name, parameters };
}

function isTwoVersusAce(first: Rank, second: Rank): boolean {
  return (first === Rank.TWO && second === Rank.ACE) ||
    (first === Rank.ACE && second === Rank.TWO);
}

function isHighValue(rank: Rank): boolean {
  return rank === Rank.ACE || rank === Rank.KING || rank === Rank.QUEEN || rank === Rank.JACK;
}
