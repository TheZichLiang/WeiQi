/**
 * This file handles API interactions between the frontend and the Go backend server.
 * It includes reusable logic for making user moves and sending special commands
 * like "pass" or "resign", abstracted for use across all game modes.
 */

/**
 * userMove - Handles a user-initiated move on the board.
 *
 * @param {Object} options
 * @param {string} options.url - Backend endpoint for move submission (e.g. /api/usermove).
 * @param {number} options.col - Column of the intersection clicked.
 * @param {number} options.row - Row of the intersection clicked.
 * @param {Array} options.boardState - Current board state (array of stones or nulls).
 * @param {number} options.turnCounter - Current turn number (used to tag stone).
 * @param {Array} options.intersections - Array of grid point metadata for the board.
 *
 * @returns {Object} If valid: `{ valid: true, newBoardState, capturedCount, moveIndex }`
 *                   If invalid or error: `{ valid: false [, error] }`
 */
export async function userMove({
  url,
  col,
  row,
  boardState,
  turnCounter,
  intersections,
}) {
  const payload = { gridCol: col, gridRow: row, moveType: "play" };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Request failed');

    const data = await res.json();
    if (!data.validMove) return { valid: false };

    const newBoard = [...boardState];
    const moveIndex = intersections.findIndex(i => i.gridCol === col && i.gridRow === row);
    newBoard[moveIndex] = { stone: 'black', turn: turnCounter };

    data.capturedPoints.forEach(pt => {
      const idx = intersections.findIndex(i => i.gridCol === pt.col && i.gridRow === pt.row);
      if (idx !== -1) newBoard[idx] = null;
    });

    return {
      valid: true,
      newBoardState: newBoard,
      capturedCount: data.capturedPoints.length,
      moveIndex,
    };
  } catch (err) {
    console.error("userMove error:", err);
    return { valid: false, error: err.message };
  }
}


/**
 * postSpecialMove - Sends special user moves like "pass" or "resign" to the backend.
 *
 * @param {Object} options
 * @param {string} options.moveType - Either 'pass' or 'resign'.
 * @param {string} options.url - Backend endpoint (e.g. /api/usermove).
 * @param {Function} options.setAiMessage - React state setter to update AI message display.
 * @param {Function} options.setGameOver - React state setter to mark the game as over.
 * @param {Function} [options.turnUpdateCallback] - Optional function to execute if game continues.
 *
 * @returns {Promise<void>}
 */
export async function postSpecialMove({
  moveType,
  url,
  setAiMessage,
  setGameOver,
  turnUpdateCallback = () => {},
}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gridCol: -1, gridRow: -1, moveType })
    });

    if (response.ok) {
      const data = await response.json();
      setAiMessage(data.message);
      if (data.gameOver) setGameOver(true);
      else turnUpdateCallback(data);
    } else {
      throw new Error(`Failed to ${moveType}.`);
    }
  } catch (err) {
    setAiMessage(`Failed to execute ${moveType}.`);
  }
}

/**
 * fetchScoreData - Fetches the current score data from the server.
 *
 * @param {string} url - The base URL for the API.
 * @returns {Promise<Object>} - A promise that resolves to the score data or an error.
 */
export async function fetchScoreData(url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Score fetch failed');

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Score fetch error:", err);
    return { success: false, error: err.message };
  }
}