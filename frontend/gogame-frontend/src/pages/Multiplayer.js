// Multiplayer.js (Refactored to use BoardPanel)
import React, { useEffect, useState } from 'react';
import { useGameState } from '../components/GameStateContext';
import BoardPanel from '../components/BoardPanel';
import styles from './Multiplayer.module.css';

function Multiplayer() {
  const { boardSize } = useGameState();
  const [playerId, setPlayerId] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [playerColor, setPlayerColor] = useState('');
  const [currentTurn, setCurrentTurn] = useState('');
  const [liveBoardState, setLiveBoardState] = useState([]);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const handleSignIn = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/game/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, boardSize }),
      });
      if (!res.ok) throw new Error('Sign-in failed');
      const data = await res.json();
      setPlayerColor(data.yourColor);
      setSignedIn(true);
      refreshBoard();
    } catch {
      alert('Unable to sign in');
    }
  };

  useEffect(() => {
    if (signedIn) {
      const interval = setInterval(refreshBoard, 3000);
      return () => clearInterval(interval);
    }
  }, [signedIn]);

  const handleResign = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/game/resign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      alert(`${data.message}\nWinner: ${data.winner}`);
    } catch {
      alert('Resignation failed');
    }
  };

  const refreshBoard = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/game/state?playerId=${playerId}`);
      const data = await res.json();
      setLiveBoardState({
        boardState: data.board ?? [],
        lastMove: data.lastMove ?? null,
        totalMoves: data.board?.length ?? 0,
      });
      setCurrentTurn(data.currentTurn);
    } catch (err) {
      console.error('Error refreshing board:', err);
    }
  };

  return (
    <div className={styles.container}>
      {!signedIn ? (
        <div className={styles.joinRoomBox}>
          <h2>Join Game</h2>
          <input
            type="text"
            value={playerId}
            onChange={e => setPlayerId(e.target.value)}
            placeholder="Player ID"
          />
          <button onClick={handleSignIn}>Join</button>
        </div>
      ) : (
        <>
          <div className={styles.gameArea}>
            <div className={styles.leftColumn}>
              <button className={styles.resignButton} onClick={handleResign}>Resign</button>
            </div>
            <div className={styles.rightColumn}>
              <BoardPanel
                gameHistory={liveBoardState}
                toggleType="manual-live"
                playerId={playerId}
                playerColor={playerColor}
                currentTurn={currentTurn}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Multiplayer;