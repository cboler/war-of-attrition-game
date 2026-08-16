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
    START["Start War of Attrition"] --> SETUP["Split standard deck by color<br/>Player: Red · Opponent: Black"]
    SETUP --> SHUFFLE["Shuffle both decks independently"]
    SHUFFLE --> READY["Ready for next turn"]

    READY --> CAN_DRAW{"Can both players draw?"}
    CAN_DRAW -- No --> DRAW_END{"Compare remaining cards"}
    DRAW_END -- Player has more --> PLAYER_GAME_WIN["Player wins the war"]
    DRAW_END -- Opponent has more --> OPP_GAME_WIN["Opponent wins the war"]
    DRAW_END -- Equal --> GAME_TIE["Game ends in a true tie"]

    CAN_DRAW -- Yes --> DRAW["Each player draws 1 active card<br/>Cards become table stakes"]
    DRAW --> COMPARE{"Compare active cards"}

    COMPARE -- "2 vs Ace" --> SPECIAL["2 defeats Ace<br/>No challenge"]
    SPECIAL --> NORMAL_RESOLVE

    COMPARE -- Equal --> BATTLE_CHECK
    COMPARE -- Player wins --> OPP_CHOICE{"Opponent sends reinforcement?"}
    COMPARE -- Opponent wins --> PLAYER_CHOICE{"Player sends reinforcement?"}

    OPP_CHOICE -- No --> NORMAL_RESOLVE["Loser's card → Boneyard<br/>Winner's card → deck"]
    PLAYER_CHOICE -- No --> NORMAL_RESOLVE

    OPP_CHOICE -- Yes --> OPP_REINFORCE["Opponent draws 1 reinforcement"]
    PLAYER_CHOICE -- Yes --> PLAYER_REINFORCE["Player draws 1 reinforcement"]

    OPP_REINFORCE --> OPP_COMPARE{"Reinforcement vs<br/>original winning card"}
    PLAYER_REINFORCE --> PLAYER_COMPARE{"Reinforcement vs<br/>original winning card"}

    OPP_COMPARE -- Challenger wins --> CHALLENGE_RESOLVE
    OPP_COMPARE -- Original card wins --> CHALLENGE_RESOLVE
    OPP_COMPARE -- Equal --> BATTLE_CHECK

    PLAYER_COMPARE -- Challenger wins --> CHALLENGE_RESOLVE["Winner's owned stakes → deck<br/>Loser's owned stakes → Boneyard"]
    PLAYER_COMPARE -- Original card wins --> CHALLENGE_RESOLVE
    PLAYER_COMPARE -- Equal --> BATTLE_CHECK

    NORMAL_RESOLVE --> READY
    CHALLENGE_RESOLVE --> READY

    BATTLE_CHECK{"Can BOTH players add<br/>3 new Battle cards?"}

    BATTLE_CHECK -- Yes --> DEAL_BATTLE["Each player adds 3 NEW<br/>face-down cards to the stake"]
    DEAL_BATTLE --> SELECT["Player blindly selects 1 of opponent's NEW cards<br/>Opponent blindly selects 1 of player's NEW cards"]
    SELECT --> REVEAL["Reveal ONLY the 2 selected cards"]
    REVEAL --> BATTLE_COMPARE{"Compare selected cards"}

    BATTLE_COMPARE -- Player wins --> PLAYER_BATTLE_WIN
    BATTLE_COMPARE -- Opponent wins --> OPP_BATTLE_WIN
    BATTLE_COMPARE -- Equal --> RECURSE["Battle continues<br/>Previous layer remains staked and locked"]
    RECURSE --> BATTLE_CHECK

    BATTLE_CHECK -- No --> CAN_EITHER{"Can exactly one player<br/>add 3 cards?"}
    CAN_EITHER -- Player only --> PLAYER_BATTLE_WIN
    CAN_EITHER -- Opponent only --> OPP_BATTLE_WIN
    CAN_EITHER -- Neither --> ATTRITION_COUNT{"Compare remaining<br/>deck counts"}
    ATTRITION_COUNT -- Player has more --> PLAYER_BATTLE_WIN
    ATTRITION_COUNT -- Opponent has more --> OPP_BATTLE_WIN
    ATTRITION_COUNT -- Equal --> GAME_TIE

    PLAYER_BATTLE_WIN["Player wins Battle"]
    OPP_BATTLE_WIN["Opponent wins Battle"]

    PLAYER_BATTLE_WIN --> PLAYER_PRIVACY["Return player's hidden stakes FACE-DOWN<br/>Reveal opponent's remaining hidden casualties"]
    OPP_BATTLE_WIN --> OPP_PRIVACY["Return opponent's hidden stakes FACE-DOWN<br/>Reveal player's remaining hidden casualties"]

    PLAYER_PRIVACY --> PLAYER_SETTLE["Opponent casualties → Boneyard<br/>Player stakes → deck"]
    OPP_PRIVACY --> OPP_SETTLE["Player casualties → Boneyard<br/>Opponent stakes → deck"]

    PLAYER_SETTLE --> READY
    OPP_SETTLE --> READY

    PLAYER_GAME_WIN --> END["Game Over"]
    OPP_GAME_WIN --> END
    GAME_TIE --> END
```

## Development Progress

**📋 Centralized Progress Tracking**: Development progress is now managed centrally to ensure consistency across all reporting locations:

- **Progress Data**: `.github/instructions/progress-data.json` - Single source of truth for current status
- **Progress Service**: `src/app/services/progress.service.ts` - Angular service for accessing progress data
- **Live Display**: Progress information is displayed in the running application

For detailed development status and next steps, see `.github/instructions/current-development-status.md`
