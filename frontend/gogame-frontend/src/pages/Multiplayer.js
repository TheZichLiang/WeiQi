// Multiplayer.js
import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../components/GameStateContext';
import TopLayer from '../components/TopLayer';
import BottomLayer from '../components/BottomLayer';
import BoardPanel from '../components/BoardPanel';
import styles from './Multiplayer.module.css';

function Multiplayer() {
  const { boardSize } = useGameState();
  const [playerId, setPlayerId] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [playerColor, setPlayerColor] = useState('');
  const [currentTurn, setCurrentTurn] = useState('');
  const [liveBoardState, setLiveBoardState] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const [capturedBlack, setCapturedBlack] = useState(0);
  const [capturedWhite, setCapturedWhite] = useState(0);
  const [latestBlackMove, setLatestBlackMove] = useState(null);
  const [latestWhiteMove, setLatestWhiteMove] = useState(null);
  const [aiMessage, setAiMessage] = useState('');

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
      setAiMessage(data.message);
      setGameOver(true);
    } catch {
      alert('Resignation failed');
    }
  };

  if (!signedIn) {
    return (
      <div className={styles.container}>
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
      </div>
    );
  }

  const baseUrl = process.env.REACT_APP_BASE_URL;

  return (
    <div className={styles.GameContainer}>
      <TopLayer baseUrl={baseUrl} gameOver={gameOver} />
      <BottomLayer
        capturedWhite={capturedWhite}
        capturedBlack={capturedBlack}
        latestBlackMove={latestBlackMove}
        latestWhiteMove={latestWhiteMove}
        blackScore={0}
        whiteScore={0}
        showScores={false}
        aiMessage={aiMessage}
        onPass={() => {}}
        onResign={handleResign}
        onToggleTurns={() => {}}
        onScore={() => {}}
        showTurnNumbers={false}
      >
        <BoardPanel
          gameHistory={liveBoardState}
          toggleType="manual-live"
          playerId={playerId}
          playerColor={playerColor}
          currentTurn={currentTurn}
        />
      </BottomLayer>
    </div>
  );
}

export default Multiplayer;