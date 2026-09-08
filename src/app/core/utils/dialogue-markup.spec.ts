import { parseDialogueMarkup, stripDialogueMarkup } from './dialogue-markup';

describe('dialogue-markup', () => {
  describe('parseDialogueMarkup', () => {
    it('returns an empty array for empty or falsy strings', () => {
      expect(parseDialogueMarkup('')).toEqual([]);
      expect(parseDialogueMarkup(null as unknown as string)).toEqual([]);
    });

    it('returns a single plain span when no markup is present', () => {
      const result = parseDialogueMarkup('Just a simple line.');
      expect(result).toEqual([{ text: 'Just a simple line.' }]);
    });

    it('parses italic spans denoted by single asterisks', () => {
      const result = parseDialogueMarkup('Only *one* of them arrived.');
      expect(result).toEqual([
        { text: 'Only ' },
        { text: 'one', italic: true },
        { text: ' of them arrived.' }
      ]);
    });

    it('parses bold spans denoted by double asterisks', () => {
      const result = parseDialogueMarkup('We do **not** spend a cellar.');
      expect(result).toEqual([
        { text: 'We do ' },
        { text: 'not', bold: true },
        { text: ' spend a cellar.' }
      ]);
    });

    it('parses combined bold and italic spans with triple asterisks', () => {
      const result = parseDialogueMarkup('This is ***crucial*** here.');
      expect(result).toEqual([
        { text: 'This is ' },
        { text: 'crucial', bold: true, italic: true },
        { text: ' here.' }
      ]);
    });

    it('parses [shout] and [whisper] volume tags', () => {
      const result = parseDialogueMarkup('[whisper]Quiet now...[/whisper] [shout]CHARGE![/shout]');
      expect(result).toEqual([
        { text: 'Quiet now...', volume: 'whisper' },
        { text: ' ' },
        { text: 'CHARGE!', volume: 'shout' }
      ]);
    });

    it('parses explicit [pause] and [pause:ms] tags', () => {
      const result = parseDialogueMarkup('Wait for it...[pause:500] Now!');
      expect(result).toEqual([
        { text: 'Wait for it...', pauseAfterMs: 500 },
        { text: ' Now!' }
      ]);
    });

    it('attaches default 350ms pause for untagged [pause]', () => {
      const result = parseDialogueMarkup('First.[pause] Second.');
      expect(result).toEqual([
        { text: 'First.', pauseAfterMs: 350 },
        { text: ' Second.' }
      ]);
    });

    it('handles nested markup cleanly', () => {
      const result = parseDialogueMarkup('[shout]Hold the **flank** now![/shout]');
      expect(result).toEqual([
        { text: 'Hold the ', volume: 'shout' },
        { text: 'flank', volume: 'shout', bold: true },
        { text: ' now!', volume: 'shout' }
      ]);
    });
  });

  describe('stripDialogueMarkup', () => {
    it('returns empty string for empty input', () => {
      expect(stripDialogueMarkup('')).toBe('');
    });

    it('strips asterisks, volume tags, and pause tags', () => {
      const input = '[whisper]Listen...[/whisper] *A* card without **pedigree** fells an [shout]Ace![/shout][pause:400]';
      const clean = stripDialogueMarkup(input);
      expect(clean).toBe('Listen... A card without pedigree fells an Ace!');
    });
  });
});
