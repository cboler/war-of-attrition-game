/**
 * Expressive dialogue markup parser and utilities.
 * Supports a lightweight subset of Markdown and Yarn Spinner tags:
 * - *italics* for inflection / emphasis
 * - **bold** for strong emphasis
 * - [shout]...[/shout] for elevated volume / larger font
 * - [whisper]...[/whisper] for lowered volume / smaller font
 * - [pause] or [pause:ms] for explicit dramatic hesitations
 *
 * Intentional simplification: Regex-based tokenization without full AST overhead.
 * Upgrade path: Formal character-stream lexer if nested macro directives are ever needed.
 */

export type DialogueVolume = 'whisper' | 'normal' | 'shout';

export interface DialogueSpan {
  readonly text: string;
  readonly italic?: boolean;
  readonly bold?: boolean;
  readonly volume?: DialogueVolume;
  readonly pauseAfterMs?: number;
}

export function parseDialogueMarkup(rawText: string): DialogueSpan[] {
  if (!rawText) return [];

  const tokenRegex = /(\[shout\]|\[\/shout\]|\[whisper\]|\[\/whisper\]|\[pause(?::\d+)?\]|\*\*\*|\*\*|\*)/g;

  const spans: DialogueSpan[] = [];
  let bold = false;
  let italic = false;
  let volume: DialogueVolume = 'normal';
  let pendingPause: number | undefined;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(rawText)) !== null) {
    const textSegment = rawText.slice(lastIndex, match.index);
    if (textSegment) {
      spans.push({
        text: textSegment,
        ...(bold ? { bold: true } : {}),
        ...(italic ? { italic: true } : {}),
        ...(volume !== 'normal' ? { volume } : {}),
        ...(pendingPause !== undefined ? { pauseAfterMs: pendingPause } : {})
      });
      pendingPause = undefined;
    }

    const token = match[0];
    if (token === '[shout]') {
      volume = 'shout';
    } else if (token === '[/shout]') {
      volume = 'normal';
    } else if (token === '[whisper]') {
      volume = 'whisper';
    } else if (token === '[/whisper]') {
      volume = 'normal';
    } else if (token.startsWith('[pause')) {
      const msMatch = token.match(/\[pause:(\d+)\]/);
      const pauseMs = msMatch ? parseInt(msMatch[1], 10) : 350;
      if (spans.length > 0) {
        const prev = spans[spans.length - 1];
        spans[spans.length - 1] = {
          ...prev,
          pauseAfterMs: (prev.pauseAfterMs ?? 0) + pauseMs
        };
      } else {
        pendingPause = (pendingPause ?? 0) + pauseMs;
      }
    } else if (token === '***') {
      bold = !bold;
      italic = !italic;
    } else if (token === '**') {
      bold = !bold;
    } else if (token === '*') {
      italic = !italic;
    }

    lastIndex = tokenRegex.lastIndex;
  }

  const trailing = rawText.slice(lastIndex);
  if (trailing) {
    spans.push({
      text: trailing,
      ...(bold ? { bold: true } : {}),
      ...(italic ? { italic: true } : {}),
      ...(volume !== 'normal' ? { volume } : {}),
      ...(pendingPause !== undefined ? { pauseAfterMs: pendingPause } : {})
    });
  }

  // Merge adjacent spans that share identical attributes and have no pause between them
  const merged: DialogueSpan[] = [];
  for (const span of spans) {
    if (span.text.length === 0) continue;
    const prev = merged[merged.length - 1];
    if (
      prev &&
      !prev.pauseAfterMs &&
      prev.bold === span.bold &&
      prev.italic === span.italic &&
      prev.volume === span.volume
    ) {
      merged[merged.length - 1] = {
        ...prev,
        text: prev.text + span.text,
        pauseAfterMs: span.pauseAfterMs
      };
    } else {
      merged.push(span);
    }
  }

  return merged;
}

/**
 * Strips all dialogue markup tags and delimiters for clean text rendering in
 * telemetry, screen readers, and testing assertions.
 */
export function stripDialogueMarkup(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\[\/?(?:shout|whisper)\]/g, '')
    .replace(/\[pause(?::\d+)?\]/g, '')
    .replace(/\*{1,3}/g, '');
}
