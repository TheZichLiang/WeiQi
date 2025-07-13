/*
* Toggle the color between black and white based on whos turn it is.
*/
export function toggleColor(color) {
  return color === 'black' ? 'white' : 'black';
}

/* Find the turn number for a specific move in manual mode.*/
export function findManualTurnNumber(mv, manualLastMoves) {
  for (let i = 1; i < manualLastMoves.length; i++) {
    const lm = manualLastMoves[i];
    if (lm && lm.col === mv.col && lm.row === mv.row) return i;
  }
  return null;
}