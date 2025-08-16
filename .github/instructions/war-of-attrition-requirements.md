# **Requirements for "War of Attrition" Card Game**

This document outlines the functional, non-functional, and user interface requirements for building a Progressive Web Application (PWA) card game using the Angular framework and Angular Material components. It is intended to be the single source of truth for development.

## **1\. Core Concept 🃏**

The application is a two-player, head-to-head card game of attrition. The objective is to win all of the opponent's cards. A standard 52-card deck is split by color (Red for Player, Black for Opponent). Players draw cards each turn, and the higher card wins. The game features special mechanics for ties ("Battles") and for challenging a loss. The game ends when one player runs out of cards.

## **2\. Functional Requirements (Game Logic)**

### **2.1. Game Setup**

* **Deck Initialization**: A standard 52-card deck is used.  
* **Player Decks**: One player receives all 26 **red** cards (Hearts, Diamonds). The other player (Opponent/AI) receives all 26 **black** cards (Clubs, Spades).  
* **Shuffling**: Both players' decks are shuffled independently at the start of a new game.

### **2.2. Turn Flow**

1. **Initiation**: The turn begins when the Player clicks on their deck.  
2. **Card Draw**: Both the Player and the Opponent automatically draw one card from the top of their respective decks. These become the "active" cards for the turn.  
3. **Comparison**: The values of the active cards are compared to determine the turn's winner.  
4. **Resolution**: Cards are awarded to the winner or discarded based on the outcome (see below).  
5. **Loop**: The flow returns to Step 1, awaiting the Player's next action.

### **2.3. Card Comparison & Ranking**

* **Standard Ranking**: Cards are ranked from high to low: Ace (A), King (K), Queen (Q), Jack (J), 10, 9, 8, 7, 6, 5, 4, 3, 2\.  
* **Special Rule**: An **Ace** loses to a **2**. This is the only exception to the standard ranking. (A \> K, but 2 \> A).

### **2.4. Turn Resolution Scenarios**

#### **2.4.1. Normal Win/Loss**

* **Condition**: One player's card has a higher value than the opponent's (and the Ace vs. 2 rule does not apply).  
* **Outcome**:  
  * The **winner** keeps their active card, which is returned to their deck.  
  * The **loser's** active card is sent to a **discard pile** and is permanently removed from play.

#### **2.4.2. Challenge**

* **Condition**: Occurs when a player has just lost a standard comparison. The losing player is given the option to "Challenge".  
* **Mechanic**:  
  1. The losing player draws a new, second card from their deck.  
  2. This new card is compared against the *original winning card* of the opponent.  
* **Outcome**:  
  * **Challenge Win**: If the challenger's new card wins, they keep **all** of their active cards (the original losing card and the new challenge card). The opponent's winning card is discarded.  
  * **Challenge Loss**: If the challenger's new card loses or ties, they lose **all** of their active cards (both the original and the challenge card). The opponent keeps their winning card.

#### **2.4.3. Battle**

* **Condition**: Occurs when the Player's and Opponent's cards are of equal value.  
* **Mechanic**:  
  1. Both players place the next **three** cards from their deck face-down.  
  2. The Player is presented with the Opponent's three face-down cards and must select one.  
  3. The Opponent AI simultaneously selects one of the Player's three face-down cards.  
  4. These two selected cards are revealed and compared.  
* **Outcome**:  
  * **Battle Win**: The winner of the comparison keeps **all of their own cards** involved in the battle (the initial tying card, their three face-down cards). All of the **loser's** cards from the battle (initial tying card \+ three face-down cards) are sent to the discard pile.  
  * **Recursive Battle**: If the two selected cards are also a tie, the Battle process repeats from step 1\. All cards currently staked remain in play for the next round of the Battle.

### **2.5. Win/Loss Conditions**

* **Primary Loss Condition**: A player loses the game immediately when their card count reaches zero.  
* **Attrition Loss**: A player loses if they cannot complete a required action due to an insufficient number of cards (e.g., not having 4 cards to conduct a Battle). Their health immediately drops to 0\.

## **3\. UI & UX Requirements 🖥️**

### **3.1. Game Screen Layout**

* **Head-to-Head View**: The screen shall be split, with the Player's area at the bottom and the Opponent's area at the top.  
* **Central "Table"**: A dedicated area in the center of the screen where cards are played and compared.  
* **Core Elements**: Each side must display:  
  * A representation of their deck.  
  * An area for the "active" card(s) to be played.  
  * A Health Bar.

### **3.2. Health Bar System**

* **HP Representation**: Each player starts with a Health Bar representing 26 HP, where 1 HP \= 1 card.  
* **Color States**: The health bar must change color based on the percentage of cards remaining:  
  * **Green**: 75-100%  
  * **Yellow**: 50-74%  
  * **Orange**: 25-49%  
  * **Red**: 1-24%  
* **"In Danger" State**: When cards are active on the field (during comparison, challenge, or battle), the corresponding percentage of the Health Bar should be highlighted to indicate those cards are at risk. This highlight is removed once the turn is resolved.  
* **"Damage" Animation**: When a player loses card(s), the "in danger" segment of their health bar must flash and animate "falling away" as the total HP value decreases.

### **3.3. Card & Player Action Visual Cues**

* **Action Prompt**: A **blue glow** effect must be used to indicate a required player action. This applies to:  
  * The Player's deck at the start of a turn.  
  * The Player's deck when a "Challenge" is available.  
  * The Opponent's three face-down cards during a "Battle" from which the Player must choose.  
* **Card Reveal Animation**:  
  1. A face-down card slides from the deck to the central "table" area.  
  2. The card animates a slow flip to reveal its value.  
  3. This animation sequence must complete before the comparison is resolved.  
* **Comparison Highlighting**:  
  * When two cards are first revealed for comparison, both should have a neutral **blue glow**.  
  * After comparison, the winning card glows **green**, and the losing card glows **red**.  
* **Animations**:  
  * **Battle Clash**: During a battle comparison, the two revealed cards should animate clashing. The winning card remains (glowing green), while the loser animates falling off-screen (glowing red).  
  * **Lost Cards Reveal**: Face-down cards lost in a battle must be revealed to the player as they are animated being discarded.

### **3.4. User Interaction**

* **Challenge Prompt**: When a challenge is possible, a text message ("Challenge?") should appear in a dedicated message area in the Player's UI. No modal dialog should be used. The action is taken by clicking the glowing deck.  
* **Discard Pile**: The discard pile should not be persistently visible. A button or link should be available to open a view (modal or separate route) displaying all discarded cards in a scrollable carousel format.

### **3.5. Visual Theme & Customization**

* **Background**: The main game board background shall be a classic "solitaire green" color.  
* **Card Backings**: The face-down side of cards should feature various repeating patterns.  
* **Settings Menu**: A configuration/settings menu must be accessible.  
* **Customization Option**: Within the settings menu, the player must be able to select their preferred card backing design from a list of available options.

## **4\. Non-Functional Requirements**

* **Framework**: The application must be built using **Angular** and the **Angular CLI**.  
* **UI Library**: UI components must be implemented using **Angular Material**.  
* **Application Type**: It must be a **Progressive Web Application (PWA)**, making it installable on supported devices.  
* **Responsiveness**: The layout must be fully responsive and functional on desktop, tablet, and mobile screen sizes.

## **5\. User Stories**

* **As a player**, I want to start a new game so that I can play against the opponent.  
* **As a player**, I want my deck to be automatically shuffled so that each game is unpredictable.  
* **As a player**, I want to click my deck to start a new turn so that the game progresses at my pace.  
* **As a player**, I want to see my health and the opponent's health as bars so I can quickly gauge who is winning.  
* **As a player**, I want to see which cards are at risk during a turn reflected in my health bar so I understand the stakes.  
* **As a player**, I want clear visual cues (glowing cards) to tell me what action I need to take next.  
* **As a player**, when I lose a turn, I want the option to challenge so I have a chance to save my card.  
* **As a player**, I want to see exciting animations when cards battle so that the game feels dynamic and engaging.  
* **As a player**, I want to be able to view the discard pile so I can see which cards are out of play.  
* **As a player**, I want to be able to change the design on the back of my cards so I can personalize my experience.  
* **As a player**, I want the game to clearly declare a winner and a loser so I know when the game is over.

## **6\. EARS Requirements (Easy Approach to Requirements Syntax)**

This section specifies key system behaviors using the EARS format to ensure clarity and testability. The system in this context is the "War of Attrition" application.

### **6.1. Ubiquitous Requirements (Always True)**

* The system shall provide one player with all 26 red cards and the opponent with all 26 black cards.  
* The system shall rank cards from high to low as A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2, except where a 2 is higher than an Ace.  
* The system shall display a health bar for each player representing their remaining card count.

### **6.2. Event-Driven Requirements (Trigger \-\> Response)**

* When a new game is started, the system shall shuffle each player's deck independently.  
* When the player clicks their deck to start a turn, the system shall draw one card for the player and one for the opponent.  
* When cards are drawn for a turn, the system shall compare their values to determine the winner.  
* When a player's and opponent's cards are of equal value, the system shall initiate a "Battle".  
* When a "Battle" is initiated, the system shall require each player to place three cards face-down.  
* When a player must take an action, the system shall apply a blue glow effect to the interactive UI element.  
* When a card is played, the system shall animate it sliding to the table and flipping over.  
* When cards are compared, the system shall apply a green glow to the winning card and a red glow to the losing card.

### **6.3. State-Driven Requirements (While in a State)**

* While a player has just lost a turn, the system shall provide an option to "Challenge".  
* While cards are in play for a turn, the system shall highlight the at-risk portion of the corresponding player's health bar.

### **6.4. Unwanted Behaviour Requirements (If \-\> Then)**

* If a player's card count reaches zero, then the system shall end the game and declare that player the loser.  
* If a player cannot draw the required number of cards for a Battle, then the system shall end the game and declare that player the loser.