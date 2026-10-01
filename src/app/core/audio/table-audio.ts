/**
 * Entry point for the table's synthesised audio.
 *
 * SoundService loads this module on demand so the synthesis code stays out of
 * the initial bundle, the same way the WebGL effects engine does.
 */
export { TableAmbience } from './table-ambience';
export { TableAudioEngine, renderTableAudio } from './table-audio-engine';
