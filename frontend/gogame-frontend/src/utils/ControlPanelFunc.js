/* 
Suppose you're given a history stack like this. [gameState0, gameState1, ..., gameStateN]
This is coming off of probably having some moves or no moves placed down while you're in another mode.
You'll need to push new moves onto this stack, pop them off.
But no matter what these moves must not conflict with the current game state. 

The main data structure used to integrate manual moves:

    history = [gameState0, gameState1, ..., gameStateN];
    manualStep = 0 to history.length - 1;

Each gamestate after fetching from the backend may look something in the form of json like this:

    {
        boardState: [...],       // array of intersection states
        currentStone: 'black',   // who's turn it is
        turn: number,            // turn counter
        capturedBlack: number,
        capturedWhite: number,
        // ... more fields as needed
    }

These file will be sourcing the main control panel functionalities, including core manual-mode operations.*/

/* Push to History - allows adding a new game state to the history stack.
 If manualStep is provided, it will truncate the history to that point before adding the new state.*/

export function pushToHistory(newState, history, manualStep = null) {
  const base = manualStep !== null ? history.slice(0, manualStep + 1) : history;
  return [...base, newState];
}

/* Pop from History - allows removing the last game state from the history stack.*/
export function stepBack(history, manualStep) {
  return Math.max(manualStep - 1, 0);
}

/* Step Back 10 - allows moving back in the history stack by 10 steps, ensuring it doesn't go below zero.*/
export function stepBack10(history, manualStep) {
  return Math.max(manualStep - 10, 0);
}

/* Step Forward - allows moving forward in the history stack, ensuring it doesn't exceed the current length.*/
export function stepForward(history, manualStep) {
  return Math.min(manualStep + 1, history.length - 1);
}

/* Step Forward 10 - allows moving forward in the history stack by 10 steps, ensuring it doesn't exceed the current length.*/
export function stepForward10(history, manualStep) {
  return Math.min(manualStep + 10, history.length - 1);
}

/* getcurrentState - retrieves the current game state from the history stack based on the manual step.*/
export function getCurrentState(history, manualStep) {
  return history[manualStep] || null;
}

/* Clear History - resets the history stack to an initial state, optionally provided.*/
export function clearHistory(initialState = null) {
  return initialState ? [initialState] : [];
}

/* Replace Tail - replaces the tail of the history stack with a new state, starting from a specific manual step.*/
export function replaceTail(newState, history, manualStep) {
  return [
    ...history.slice(0, manualStep),
    newState,
    ...history.slice(manualStep + 1)
  ];
}

/* truncateHistory - truncates the history stack to a specific manual step, removing all states after that point.*/
export function truncateHistory(history, manualStep) {
  return history.slice(0, manualStep + 1);
}