// BoardPanel.js
import React, { useEffect, useRef, useState } from 'react';
import ControlPanel from './ControlPanel';
import VertexDetector from '../utils/VertexDetector';
import BPstyles from './BoardPanel.module.css';

function cleanSgf(raw) {
  return raw
    .replace(/GN\[[^\]]*\]/, '')
    .replace(/[\[\];]/g, '')
    .trim();
}

function BoardPanel({ gameHistory, toggleType = 'manual-auto' , playerId = '', playerColor = '', currentTurn = '' }) {
  const boardSize = 19;
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const boardImg = `${baseUrl}/assets/GO${boardSize}x${boardSize}.png`;
  const boardRef = useRef(null);

  const [intersections, setIntersections] = useState([]);
  const [scale, setScale] = useState({ w: 1, h: 1 });
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });

  const [isManualMode, setIsManualMode] = useState(false);
  const [autoBoardState, setAutoBoardState] = useState([]);
  const [manualBoardStates, setManualBoardStates] = useState([]);
  const [manualLastMoves, setManualLastMoves] = useState([]);
  const [manualColor, setManualColor] = useState('black');
  const [lastMove, setLastMove] = useState(null);
  const [totalMoves, setTotalMoves] = useState(0);
  const [step, setStep] = useState(0);
  const [savedAutoStep, setSavedAutoStep] = useState(0);
  const [isPlacingMove, setIsPlacingMove] = useState(false);

  const basePath = toggleType === 'manual-live' ? '/api/game' : '/api';

  useEffect(() => {
    new VertexDetector(boardImg)
      .processImage(boardSize)
      .then(setIntersections);
  }, [boardImg]);

  useEffect(() => {
    const img = boardRef.current;
    if (!img?.naturalWidth) return;
    const wscale = img.clientWidth / img.naturalWidth;
    const hscale = img.clientHeight / img.naturalHeight;
    setScale({ w: wscale, h: hscale });
    setCellSize({ width: img.clientWidth / boardSize, height: img.clientHeight / boardSize });
  }, [intersections]);

  useEffect(() => {
    if (isManualMode) return;
    if (typeof gameHistory === 'string') {
      const sgf = cleanSgf(gameHistory);
      fetch('/api/sgf/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sgf, step })
      })
        .then(r => r.json())
        .then(data => {
          setAutoBoardState(data.boardState || []);
          setLastMove(data.lastMove || null);
          setTotalMoves(data.totalMoves || 0);
        });
    } else {
      setAutoBoardState(gameHistory.boardState || []);
      setLastMove(gameHistory.lastMove || null);
      setTotalMoves(gameHistory.totalMoves || 0);
    }
  }, [gameHistory, step, isManualMode]);

  const enterManual = () => {
    setSavedAutoStep(step);

    if (toggleType === 'manual-live') {
      // Multiplayer: Initialize with current board snapshot
      fetch(`${basePath}/manualinit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, step })
      })
        .then(r => r.json())
        .then(data => {
          const boardSnapshot = data.board || [];

          // Initialize with only the current snapshot
          setManualBoardStates([boardSnapshot]);
          setManualLastMoves([null]);  // No last move yet

          setStep(0);
          setManualColor((step % 2 === 0) ? 'black' : 'white');
          setIsManualMode(true);
        });

    } else if (typeof gameHistory === 'string') {
      // SGF Viewer: Load snapshot at current step
      const sgf = cleanSgf(gameHistory);
      fetch(`${basePath}/sgf/board`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sgf, step })
      })
        .then(r => r.json())
        .then(data => {
          setManualBoardStates([data.boardState || []]);
          setManualLastMoves([data.lastMove || null]);

          setStep(0);
          setManualColor((step % 2 === 0) ? 'black' : 'white');
          setIsManualMode(true);
        });
    }
  };

  const exitManual = () => {
    setIsManualMode(false);
    setStep(savedAutoStep);
  };

  const toggleManual = () => {
    if (!isManualMode) enterManual(); else exitManual();
  };

  const handleBoardClick = e => {
    if (toggleType === 'manual-auto' && !isManualMode) return;

     // 🛑 Block ONLY in live mode, and only when NOT in manual mode
    console.log("Mode:", toggleType, "isManualMode:", isManualMode, "Your color:", playerColor, "Current turn:", currentTurn);
    if (!isManualMode && toggleType === 'manual-live' && playerColor !== currentTurn) {
      alert("It's not your turn.");
      return;
    }

    if (isPlacingMove) return;
    setIsPlacingMove(true);

    const rect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale.w;
    const y = (e.clientY - rect.top) / scale.h;
    let closest, dist = Infinity;
    intersections.forEach(pt => {
      const dx = x - pt.x, dy = y - pt.y, d = dx * dx + dy * dy;
      if (d < dist) {
        dist = d;
        closest = pt;
      }
    });
    if (!closest) return;

    const currentBoard = isManualMode
      ? manualBoardStates[step] || []
      : autoBoardState;

    const isOccupied = currentBoard.some(
      s => s.col === closest.gridCol && s.row === closest.gridRow
    );
    if (isOccupied) return alert('Occupied');

    const mv = {
      col: closest.gridCol,
      row: closest.gridRow,
      color: manualColor,
      ...(toggleType === 'manual-live' && { playerId, step })
    };

    const moveEndpoint = toggleType === 'manual-live' ? 'move' : 'manualmove';

    fetch(`${basePath}/${moveEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mv)
    })
    .then(r => r.json())
    .then(data => {
      if (!isManualMode && toggleType === 'manual-live') {
        // Live multiplayer game mode
        return fetch(`${basePath}/state?playerId=${playerId}`)
          .then(res => res.json())
          .then(data => {
            setAutoBoardState(data.board ?? []);
            setLastMove(data.lastMove ?? null);
            setTotalMoves(data.board?.length ?? 0);
          });
      }

      // Manual mode behavior (SGF or Manual-Live toggled into Manual)
      const newBoard = [...currentBoard, mv];
      console.log("Manual move placed:", mv);
      setManualBoardStates(prev => [...prev, newBoard]);
      setManualLastMoves(prev => [...prev, data.lastMove || null]);
      setStep(prev => prev + 1);
      setManualColor(c => (c === 'black' ? 'white' : 'black'));
    })
    .catch(err => {
      console.error("Move error:", err);
    })
    .finally(() => setIsPlacingMove(false));
  };

  const handleClear = () => {
    if (isManualMode) {
      setManualBoardStates([manualBoardStates[0]]);
      setManualLastMoves([manualLastMoves[0]]);
      setStep(0);
    } else {
      setStep(0);
    }
  };

  const boardToRender = isManualMode ? manualBoardStates[step] || [] : autoBoardState;
  const markerMove = isManualMode ? manualLastMoves[step] : lastMove;
  const minStep = 0;
  const maxStep = isManualMode ? manualBoardStates.length - 1 : totalMoves;

  return (
    <div className={BPstyles.main}>
      <div className={BPstyles.boardWrapper}>
        <img
          ref={boardRef}
          src={boardImg}
          alt="Go board"
          className={BPstyles.boardimg}
          onClick={handleBoardClick}
        />
        {boardToRender.map((mv, i) => {
          const pt = intersections.find(pt => pt.gridCol === mv.col && pt.gridRow === mv.row);
          if (!pt) return null;
          const pixel = { x: pt.x * scale.w, y: pt.y * scale.h };
          const stoneSize = {
            width: cellSize.width * 0.9,
            height: cellSize.height * 0.9
          };
          const isLatest = markerMove && mv.col === markerMove.col && mv.row === markerMove.row && (!isManualMode || step > 0);
          const containerClass = isManualMode && isLatest ? `${BPstyles.stoneContainer} ${BPstyles.stoneOutline}` : BPstyles.stoneContainer;

          let turnLabel = null;
          if (isManualMode) {
            manualLastMoves.forEach((lm, idx) => {
              if (idx > 0 && typeof lm === 'object' && lm !== null && lm.col === mv.col && lm.row === mv.row) {
                turnLabel = idx;
              }
            });
          }

          return (
            <div key={i} className={containerClass} style={{ top: pixel.y, left: pixel.x, width: stoneSize.width, height: stoneSize.height }}>
              <img
                src={`${baseUrl}/assets/GO${mv.color === 'black' ? 'BLACK' : 'WHITE'}STONE.png`}
                className={BPstyles.stone}
                style={{ width: "100%", height: "100%", top: "50%", left: "50%" }}
                alt={mv.color}
              />
              {isManualMode && turnLabel && <span className={BPstyles.turnNumber}>{turnLabel}</span>}
              {!isManualMode && isLatest && <div className={`${BPstyles.marker} ${BPstyles[mv.color]}`} />}
            </div>
          );
        })}
      </div>
      <ControlPanel
        step={step}
        maxStep={maxStep}
        isManualMode={isManualMode}
        onClear={handleClear}
        onBack={() => setStep(s => Math.max(minStep, s - 1))}
        onBack10={() => setStep(s => Math.max(minStep, s - 10))}
        onForward={() => setStep(s => Math.min(maxStep, s + 1))}
        onForward10={() => setStep(s => Math.min(maxStep, s + 10))}
        onFull={() => setStep(maxStep)}
        onToggleManual={toggleManual}
        toggleType={toggleType}
      />
    </div>
  );
}

export default BoardPanel;
