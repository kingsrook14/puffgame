# Project: Bubbles' Bubble-Pop Adventure

## Overview
A 12-round web-based game featuring Bubbles from The Powerpuff Girls. The goal is to rescue animals by clicking to create bubbles around them and guiding them to a 'Safety Cloud' while avoiding Mojo Jojo's robots.

## Visual Style
- **Aesthetic:** Pastel blue theme, 'kawaii' UI, sparkly particle effects.
- **Assets:** Bubbles (flying animation), kittens, puppies, Octi (the octopus plushie), and Mojo Jojo drones.
- **Backgrounds:** The City of Townsville park, Professor Utonium's lab, and the sky.

## Game Mechanics
- **Rescue:** Click on falling animals to 'bubble' them. Once bubbled, they float upward.
- **Protection:** Drag your mouse to create a 'shield' or blow bubbles to push away Mojo's drones.
- **Rounds:** 12 total. Each round increases the speed of falling animals and the number of drones.
- **Special Power:** Every 3 rounds, a 'Hardcore Bubbles' meter fills, allowing a screen-clear 'Sonic Scream'.

## Technical Requirements (Vercel Deployment)
- **Framework:** React or Vanilla JS/Canvas.
- **Responsive:** Optimized for both desktop and mobile browsers.
- **State Management:** Track score, lives (represented by hearts), and current round (1-12).

## Implementation Steps for Antigravity Agent
1. Create a `game.js` or `App.js` with the core game loop.
2. Design a `RoundManager` that handles the 1-12 progression.
3. Implement collision detection between bubbles and drones.
4. Add cute sound effects (bubbles popping, sparkles, animal sounds).
5. Add a 'Win Screen' featuring Bubbles and Octi celebrating.
