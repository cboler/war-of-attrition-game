import { DeckColor } from './progression.model';

export const GAME_TELEMETRY_SCHEMA_VERSION = 1;

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
}

export interface TelemetryEnvelope extends WarTelemetryContext {
  readonly eventSeq: number;
  readonly schemaVersion: typeof GAME_TELEMETRY_SCHEMA_VERSION;
  readonly appVersion: string;
  readonly rulesetVersion: string;
}
