import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../components/GameStateContext';
import VertexDetector from '../components/VertexDetector';
import ControlPanel from "../components/ControlPanel";
import Gostyles from './Multiplayer.module.css';

function Multiplayer() {
  const { boardSize } = useGameState();
  const [boardImage, setBoardImage] = useState('');
  const [intersections, setIntersections] = useState([]);
  const [boardState, setBoardState] = useState([]);
  const [playerId, setPlayerId] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [playerColor, setPlayerColor] = useState('');
  const [currentTurn, setCurrentTurn] = useState('');
  const boardRef = useRef(null);

  const [mode, setMode] = useState('live'); // 'live' or 'manual'
  const isLiveMode = mode === 'live';
  const isManualMode = mode === 'manual';

  const [step, setStep] = useState(0);
  const [manualMoves, setManualMoves] = useState([]);
  const [manualColor, setManualColor] = useState('black');

  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const STONE_SIZE_RATIO = 0.05;

  const onBoardLoad = () => {
    const img = boardRef.current;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const actualW = img.clientWidth;
    const actualH = img.clientHeight;
    setScaleX(actualW / naturalW);
    setScaleY(actualH / naturalH);
  };

  useEffect(() => {
    switch (boardSize) {
      case '9':
        setBoardImage(`${baseUrl}/assets/GO9x9.png`);
        break;
      case '13':
        setBoardImage(`${baseUrl}/assets/GO13x13.png`);
        break;
      default:
        setBoardImage(`${baseUrl}/assets/GO19x19.png`);
    }
  }, [boardSize, baseUrl]);

  const initBoard = async () => {
    const detector = new VertexDetector(boardImage);
    const coords = await detector.processImage(parseInt(boardSize, 10));
    setIntersections(coords);
    setBoardState(new Array(coords.length).fill(null));
    return coords;
  };

  useEffect(() => {
    const updateScales = () => {
      if (!boardRef.current) return;
      const img = boardRef.current;
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      const actualW = img.clientWidth;
      const actualH = img.clientHeight;
      setScaleX(actualW / naturalW);
      setScaleY(actualH / naturalH);
    };
    updateScales();
    window.addEventListener('resize', updateScales);
    return () => window.removeEventListener('resize', updateScales);
  }, []);

  const refreshBoard = async (coords = intersections) => {
    try {
      const res = await fetch(`${apiBaseUrl}/game/state?playerId=${playerId}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      const boardList = data.board ?? data;
      const newBoard = new Array(coords.length).fill(null);
      boardList.forEach(({ col, row, color }) => {
        const idx = coords.findIndex(pt => pt.gridCol === col && pt.gridRow === row);
        if (idx !== -1) newBoard[idx] = { stone: color };
      });
      setBoardState(newBoard);
      if (data.currentTurn) setCurrentTurn(data.currentTurn);
    } catch (err) {
      console.error('Error refreshing board:', err);
    }
  };

  useEffect(() => {
    if (signedIn && intersections.length && isLiveMode) {
      const id = setInterval(refreshBoard, 3000);
      return () => clearInterval(id);
    }
  }, [signedIn, intersections, isLiveMode]);

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
      const coords = await initBoard();
      await refreshBoard(coords);
    } catch {
      alert('Unable to sign in');
    }
  };

  const handleBoardClick = async (e) => {
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const closest = intersections.reduce(
      (acc, pt, idx) => {
        const dx = pt.x * scaleX - x;
        const dy = pt.y * scaleY - y;
        const dist = Math.hypot(dx, dy);
        return dist < acc.dist ? { dist, idx } : acc;
      },
      { dist: Infinity, idx: -1 }
    );
    if (closest.idx < 0) return;

    const { gridCol: col, gridRow: row } = intersections[closest.idx];

    if (isLiveMode) {
      if (!signedIn || playerColor !== currentTurn) return;
      try {
        const res = await fetch(`${apiBaseUrl}/game/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, col, row }),
        });
        const data = await res.json();
        if (data.validMove) await refreshBoard();
        else alert(data.error || 'Invalid move');
      } catch {
        alert('Move failed');
      }
    } else if (isManualMode) {
      try {
        const res = await fetch(`${apiBaseUrl}/game/manualmove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: manualMoves.length, col, row, color: manualColor }),
        });
        const data = await res.json();
        if (!data.validMove) {
          alert('Invalid manual move');
          return;
        }
        setManualMoves([...manualMoves, { col, row, color: manualColor }]);
        setManualColor(manualColor === 'black' ? 'white' : 'black');
      } catch {
        alert('Manual move failed');
      }
    }
  };

  const enterManualMode = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/game/manualinit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, step }),
      });
      const data = await res.json();
      const boardList = data.board ?? [];
      const newManual = new Array(intersections.length).fill(null);
      boardList.forEach(({ col, row, color }) => {
        const idx = intersections.findIndex(pt => pt.gridCol === col && pt.gridRow === row);
        if (idx !== -1) newManual[idx] = { stone: color };
      });
      setManualMoves(boardList);
      setManualColor((step % 2 === 0) ? 'black' : 'white');
      setMode('manual');
    } catch {
      alert("Failed to initialize manual board.");
    }
  };

  const toggleManual = () => isManualMode ? setMode('live') : enterManualMode();

  const renderedStones = new Array(intersections.length).fill(null);
  if (isLiveMode) {
    boardState.forEach((stone, idx) => { renderedStones[idx] = stone });
  } else if (isManualMode) {
    for (let i = 0; i < manualMoves.length; i++) {
      const { col, row, color } = manualMoves[i];
      const idx = intersections.findIndex(pt => pt.gridCol === col && pt.gridRow === row);
      if (idx !== -1) renderedStones[idx] = { stone: color };
    }
  }

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

  const boardSizePx = boardRef.current?.clientWidth || 0;
  const stoneSizePx = boardSizePx * STONE_SIZE_RATIO;

  return (
    <div className={Gostyles.container}>
      {!signedIn ? (
        <div className={Gostyles.joinRoomBox}>
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
          <div className={Gostyles.boardWrapper}>
            <div className={Gostyles.boardContent}>
              <img
                src={boardImage}
                alt="Go board"
                className={Gostyles.boardImage}
                ref={boardRef}
                onLoad={onBoardLoad}
                onClick={handleBoardClick}
              />
              {intersections.map((pt, idx) =>
                renderedStones[idx] ? (
                  <div
                    key={idx}
                    className={Gostyles.stone}
                    style={{
                      left: `${pt.x * scaleX}px`,
                      top: `${pt.y * scaleY}px`,
                      width: `${stoneSizePx}px`,
                      height: `${stoneSizePx}px`,
                    }}
                  >
                    <img
                      src={
                        renderedStones[idx].stone === 'black'
                          ? `${baseUrl}/assets/GOBLACKSTONE.png`
                          : `${baseUrl}/assets/GOWHITESTONE.png`
                      }
                      alt="stone"
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>

          <div className={Gostyles.controlArea}>
            {isLiveMode && (
              <button className={Gostyles.resignButton} onClick={handleResign}>
                Resign
              </button>
            )}
            <ControlPanel
              step={step}
              maxStep={manualMoves.length}
              isManualMode={isManualMode}
              onClear={() => setManualMoves([])}
              onBack={() => setStep(prev => Math.max(0, prev - 1))}
              onBack10={() => setStep(prev => Math.max(0, prev - 10))}
              onForward={() => setStep(prev => Math.min(manualMoves.length, prev + 1))}
              onForward10={() => setStep(prev => Math.min(manualMoves.length, prev + 10))}
              onFull={() => setStep(manualMoves.length)}
              onToggleManual={toggleManual}
              toggleType="manual-live"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Multiplayer;
