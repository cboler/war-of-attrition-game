import { OpponentCommanderId } from './commander.model';
import { CampaignModifierId, CampaignModeId, DeckColor } from './progression.model';

export const GAME_TELEMETRY_SCHEMA_VERSION = 3;
export const UI_TELEMETRY_SCHEMA_VERSION = 1;

export type TelemetryValue = string | number;
export type TelemetryParameters = Readonly<Record<string, TelemetryValue>>;

export interface TelemetryRecord {
  readonly name: string;
  readonly parameters: TelemetryParameters;
}

export interface TelemetryConfig {
  readonly measurementId: string;
  readonly appVersion: string;
  readonly rulesetVersion: string;
}

export interface WarTelemetryContext {
  readonly warId: string;
  readonly campaignId: string;
  readonly campaignWarIndex: 1 | 2 | 3;
  readonly playerDeckColor: DeckColor;
  readonly commanderId?: OpponentCommanderId;
  readonly campaignMode?: CampaignModeId;
  readonly campaignModifiers?: readonly CampaignModifierId[];
}

export interface TelemetryEnvelope extends WarTelemetryContext {
  readonly eventSeq: number;
  readonly schemaVersion: typeof GAME_TELEMETRY_SCHEMA_VERSION;
  readonly appVersion: string;
  readonly rulesetVersion: string;
}

export type UiTelemetrySurface =
  | 'table'
  | 'chronicle'
  | 'field_manual'
  | 'rules'
  | 'profile'
  | 'achievements'
  | 'settings';

export type UiTelemetrySubsurface =
  | 'career_records'
  | 'entry_detail'
  | 'hall_of_valor'
  | 'commander_dossier'
  | 'card_reference'
  | 'rule_demo';

export type UiTelemetryManualEntryType =
  | 'hall_of_valor'
  | 'commander_dossier'
  | 'card_reference';

export type UiTelemetryRuleId =
  | 'objective'
  | 'ranks'
  | 'battle'
  | 'reinforcement'
  | 'boneyard'
  | 'war-resolution';

export type UiTelemetryChronicleEntry =
  | 'clash'
  | 'challenge'
  | 'battle_header'
  | 'battle_selection'
  | 'battle_reveal'
  | 'casualty'
  | 'quip'
  | 'achievement'
  | 'game_over';

export type UiTelemetryDurationBucket =
  | 'lt_10s'
  | '10_30s'
  | '30_60s'
  | '1_3m'
  | '3m_plus';

/**
 * A deliberately small whitelist for semantic app-surface context. Feature
 * code cannot attach free-form values to UI telemetry records.
 */
export interface UiSurfaceTelemetryContext {
  readonly surface: UiTelemetrySurface;
  readonly subsurface?: UiTelemetrySubsurface;
  readonly sourceSurface?: UiTelemetrySurface;
  readonly commanderId?: OpponentCommanderId;
  readonly ruleId?: UiTelemetryRuleId;
  readonly chronicleEntry?: UiTelemetryChronicleEntry;
  readonly manualEntryType?: UiTelemetryManualEntryType;
}
