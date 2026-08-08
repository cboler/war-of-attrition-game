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
flowchart TD
    subgraph Setup ["Game Setup & Initialization"]
        init["Start Game"] --> splitDeck["Split Deck by Color:<br/>Red (Player) & Black (Opponent)"]
        splitDeck --> shuffle["Independent Deck Shuffling"]
        shuffle --> startTurn["Player Clicks Deck to Begin Turn"]
    end

    subgraph DrawPhase ["Draw & Deck Check Phase"]
        startTurn --> checkDraw{"Can both players draw a card?"}
        checkDraw -- "No" --> checkDeckWinner{"Who has remaining cards?"}
        checkDeckWinner -- "Player has cards" --> winGame["Player Wins Game!"]
        checkDeckWinner -- "Opponent has cards" --> loseGame["Opponent Wins Game!"]
        checkDraw -- "Yes" --> drawActive["Draw 1 Active Card Each & Increment Turn Count"]
    end

    subgraph NormalComparison ["Card Comparison Phase"]
        drawActive --> compareCards{"Compare Active Card Values<br/>(Ace beats K..3; 2 beats Ace)"}
        
        compareCards -- "Player > Opponent" --> oppChallengeChoice{"Opponent AI challenges?"}
        compareCards -- "Opponent > Player" --> playerChallengeChoice{"Player challenges?"}
        compareCards -- "Values are Equal" --> battleCheck["Initiate Battle Check"]
    end

    subgraph ChallengeBranch ["Challenge Phase"]
        oppChallengeChoice -- "No (Decline)" --> resolveNormalWin["Player Wins Turn:<br/>Keep active card; Opponent card discarded"]
        oppChallengeChoice -- "Yes (Challenge)" --> drawOppChallenge["Opponent draws 1 Challenge Card"]
        drawOppChallenge --> compareOppChallenge{"Compare Opponent's Challenge Card<br/>vs. Player's Original Card"}
        
        compareOppChallenge -- "Opponent Wins" --> resolveOppChallengeWin["Opponent Wins Challenge:<br/>Opponent keeps both cards; Player card discarded"]
        compareOppChallenge -- "Player Wins" --> resolveOppChallengeLoss["Opponent Loses Challenge:<br/>Player keeps original card; Opponent loses both cards"]
        compareOppChallenge -- "Cards are Equal (Tie)" --> battleCheck

        playerChallengeChoice -- "No (Decline)" --> resolveNormalLoss["Opponent Wins Turn:<br/>Opponent keeps active card; Player card discarded"]
        playerChallengeChoice -- "Yes (Challenge)" --> drawPlayerChallenge["Player draws 1 Challenge Card"]
        drawPlayerChallenge --> comparePlayerChallenge{"Compare Player's Challenge Card<br/>vs. Opponent's Original Card"}
        
        comparePlayerChallenge -- "Player Wins" --> resolvePlayerChallengeWin["Player Wins Challenge:<br/>Player keeps both cards; Opponent card discarded"]
        comparePlayerChallenge -- "Opponent Wins" --> resolvePlayerChallengeLoss["Player Loses Challenge:<br/>Opponent keeps original card; Player loses both cards"]
        comparePlayerChallenge -- "Cards are Equal (Tie)" --> battleCheck
    end

    subgraph BattleBranch ["Battle Phase (Ties & Recursive Battles)"]
        battleCheck --> checkBattleDeck{"Does each player have<br/>at least 3 cards in deck?"}
        checkBattleDeck -- "No (Insufficient cards)" --> attritionLoss["Attrition Loss!<br/>Player unable to battle loses game immediately"]
        attritionLoss --> loseGame
        
        checkBattleDeck -- "Yes" --> placeBattleCards["Battle! Each player places 3 face-down cards.<br/>All active cards on field remain staked."]
        placeBattleCards --> selectBattleCards["Select 1 face-down card from Opponent's 3 cards.<br/>AI selects 1 face-down card from Player's 3 cards."]
        selectBattleCards --> compareBattleCards{"Compare Selected Battle Cards"}
        
        compareBattleCards -- "Player > Opponent" --> resolveBattleWin["Player Wins Battle:<br/>Player keeps all staked cards;<br/>All Opponent battle cards discarded"]
        compareBattleCards -- "Opponent > Player" --> resolveBattleLoss["Opponent Wins Battle:<br/>Opponent keeps all staked cards;<br/>All Player battle cards discarded"]
        compareBattleCards -- "Equal (Tie)" --> battleCheck
    end

    subgraph TurnResolution ["Turn Resolution & Loop"]
        resolveNormalWin & resolveNormalLoss --> nextTurnPrompt["Turn Complete"]
        resolveOppChallengeWin & resolveOppChallengeLoss --> nextTurnPrompt
        resolvePlayerChallengeWin & resolvePlayerChallengeLoss --> nextTurnPrompt
        resolveBattleWin & resolveBattleLoss --> nextTurnPrompt
        nextTurnPrompt --> startTurn
    end

    subgraph GameOver ["Game Over"]
        winGame --> playAgain{"Play Again?"}
        loseGame --> playAgain
        playAgain -- "Yes" --> init
        playAgain -- "No" --> endApp["End Session"]
    end

    %% Styling
    style init fill:#1e293b,color:#fff,stroke:#334155
    style winGame fill:#15803d,color:#fff,stroke:#166534
    style loseGame fill:#b91c1c,color:#fff,stroke:#991b1b
    style attritionLoss fill:#991b1b,color:#fff,stroke:#7f1d1d
    style compareCards fill:#d97706,color:#fff,stroke:#b45309
    style compareOppChallenge fill:#2563eb,color:#fff,stroke:#1d4ed8
    style comparePlayerChallenge fill:#2563eb,color:#fff,stroke:#1d4ed8
    style compareBattleCards fill:#7c3aed,color:#fff,stroke:#6d28d9
```

## Development Progress

**📋 Centralized Progress Tracking**: Development progress is now managed centrally to ensure consistency across all reporting locations:

- **Progress Data**: `.github/instructions/progress-data.json` - Single source of truth for current status
- **Progress Service**: `src/app/services/progress.service.ts` - Angular service for accessing progress data
- **Live Display**: Progress information is displayed in the running application

For detailed development status and next steps, see `.github/instructions/current-development-status.md`
