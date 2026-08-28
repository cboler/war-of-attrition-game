# Canonical Commander Portrait Assets

The supplied five-commander production sheet is the canonical portrait and crest artwork. Do not regenerate, redraw, or reinterpret it.

## Source and deterministic extraction

- Preserved master: `developer-docs/assets/commander-portraits/commander-sprite-sheet.png`
- Runtime derivatives: `public/assets/commanders/<commander-id>/`
- Reproducible extractor: `scripts/extract-commander-art.ps1`
- Typed runtime registry: `src/app/core/models/commander-art.model.ts`

The extractor verifies the expected 1491×1055 master dimensions, uses explicit pixel crop rectangles inspected from that image, and writes web-sized JPEG crops without sheet labels, borders, or neighboring cells. The master remains untouched.

## Identity and presentation contract

The registry uses the permanent strategy/commander IDs: `quartermaster`, `gambler`, `analyst`, `attritionist`, and `cornered-general`. Each maps to Calm, Smug, Determined, Angry, Sad, and Surprised portraits plus one heraldic crest.

Calm is the default. `TableReactionService` assigns expression metadata only where it already understands the semantic event; dialogue text is never keyword-parsed. The table returns to Calm when the existing reaction expires, and portrait state never changes resolution, AI behavior, sequencing, or animation duration.

Table and dossier portraits are decorative when adjacent text already names the commander. Crest switcher buttons retain visible names and accessible labels. Expression is never the only carrier of gameplay or narrative information.
