# WarOfAttritionGame

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Mermaid diagram

```mermaid
---
config:
  layout: elk
---
flowchart TD
    %% Initialization
    init["Start"] -- "Divide deck by color (Red/Black). Players shuffle." --> startTurn["Player clicks deck"]

    %% Pre-Turn & End-Game Check
    startTurn --> checkDrawCards{"Can both players draw a card?"}
    checkDrawCards -- "No" --> determineWinnerOnDeckOut{"Is Player out of cards?"}
    determineWinnerOnDeckOut -- "Yes" --> loseGame["Lose: No cards to draw"]
    determineWinnerOnDeckOut -- "No (Opponent is out)" --> winGame["Win! Opponent has no cards"]
    checkDrawCards -- "Yes" --> preCompare["Draw 1 card each. Increment turn count."]

    %% Main Turn Loop
    preCompare --> compareCards{"Compare cards"}

    %% Special Ace vs. 2 Rule
    compareCards -- "Player has Ace & Opponent has 2" --> resolveNormalLoss
    compareCards -- "Opponent has Ace & Player has 2" --> resolveNormalWin

    %% Standard Comparison
    compareCards -- "Player > Opponent" --> opponentChallenge{"Opponent challenges?"}
    compareCards -- "Opponent > Player" --> playerChallenge{"Player challenges?"}
    compareCards -- "Values are Equal" --> battleCheck

    %% Challenge Sub-flow
    opponentChallenge -- "No" --> resolveNormalWin
    opponentChallenge -- "Yes" --> drawOpponentChallenge["Opponent draws 1 card"]
    drawOpponentChallenge --> compareOpponentChallenge{"P's original vs. O's new card"}
    compareOpponentChallenge -- "Opponent wins" --> resolveChallengeLoss
    compareOpponentChallenge -- "Player wins" --> resolveChallengeWin
    compareOpponentChallenge -- "Cards are equal" --> battleCheck

    playerChallenge -- "No" --> resolveNormalLoss
    playerChallenge -- "Yes" --> drawPlayerChallenge["Player draws 1 card"]
    drawPlayerChallenge --> comparePlayerChallenge{"O's original vs. P's new card"}
    comparePlayerChallenge -- "Player wins" --> resolveChallengeWin
    comparePlayerChallenge -- "Opponent wins" --> resolveChallengeLoss
    comparePlayerChallenge -- "Cards are equal" --> battleCheck

    %% Battle Sub-flow
    battleCheck --> checkCardsForBattle{"Both have at least 4 cards?"}
    checkCardsForBattle -- "No" --> loseGame["A player cannot continue battle; game over."]
    checkCardsForBattle -- "Yes" --> setupBattle["Battle! Each places 3 cards face down."]
    setupBattle --> selectBattleCards["Both sides select a new card from opponent's 3 cards."]
    selectBattleCards --> compareBattleCards{"Compare the two newly selected cards"}
    compareBattleCards -- "Player > Opponent" --> resolveBattleWin
    compareBattleCards -- "Opponent > Player" --> resolveBattleLoss
    compareBattleCards -- "Equal" --> battleCheck

    %% Resolution Nodes
    subgraph Turn Resolution
        direction LR
        resolveNormalWin("Win Turn: Keep your card; Opponent's card discarded")
        resolveNormalLoss("Lose Turn: Your card discarded; Opponent keeps theirs")
        resolveChallengeWin("Win Challenge: Keep your cards; Opponent's discarded")
        resolveChallengeLoss("Lose Challenge: Your cards discarded; Opponent keeps theirs")
        resolveBattleWin("Win Battle: Keep all your cards; Opponent's discarded")
        resolveBattleLoss("Lose Battle: All your cards discarded; Opponent keeps theirs")
    end

    %% Link Resolutions to Next Turn
    resolveNormalWin & resolveNormalLoss --> startTurn
    resolveChallengeWin & resolveChallengeLoss --> startTurn
    resolveBattleWin & resolveBattleLoss --> startTurn
    
    %% End Game
    winGame --> playAgain{"Play again?"}
    loseGame --> playAgain
    playAgain --> init

    %% Styling
    style init fill:#000000,color:#FFFFFF
    style playAgain fill:#000000,color:#FFFFFF
    style startTurn fill:#FFCDD2
    style checkDrawCards fill:#4CAF50,color:#FFFFFF
    style determineWinnerOnDeckOut fill:#D50000,color:#FFFFFF
    style preCompare fill:#FFD600
    style compareCards fill:#FF6D00,color:#FFFFFF
    style battleCheck fill:#B71C1C,color:#FFFFFF
    style setupBattle fill:#FFD600
    style compareBattleCards fill:#B71C1C,color:#FFFFFF
    style loseGame fill:#D50000,color:#FFFFFF
    style opponentChallenge fill:#BBDEFB
    style playerChallenge fill:#BBDEFB
    style comparePlayerChallenge fill:#42A5F5,color:#FFFFFF
    style compareOpponentChallenge fill:#42A5F5,color:#FFFFFF
    style winGame fill:#00C853,color:#FFFFFF
    style resolveNormalWin fill:#A5D6A7
    style resolveNormalLoss fill:#EF9A9A
    style resolveChallengeWin fill:#66BB6A
    style resolveChallengeLoss fill:#E57373
    style resolveBattleWin fill:#2E7D32,color:#FFFFFF
    style resolveBattleLoss fill:#C62828,color:#FFFFFF
```
