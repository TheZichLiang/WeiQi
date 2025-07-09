import React, { useEffect, useState, useRef } from 'react';
import VertexDetector from "../components/VertexDetector";
import ControlPanel from "../components/ControlPanel";
import styles from "./SGFView.module.css";
import { useLoaderData } from 'react-router-dom';

function cleanSgf(raw) {
  return raw
    .replace(/GN\[[^\]]*\]/, '')
    .replace(/[\[\];]/g, '')
    .trim();
}

function extractGameName(block, index) {
  const m = block.match(/GN\[([^\]]+)\]/);
  return m ? m[1] : `Kifu ${index + 1}`;
}

function SgfViewer() {
  const boardSize = 19;
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const boardImg = `${baseUrl}/assets/GO${boardSize}x${boardSize}.png`;
  const boardRef = useRef(null);

  // board geometry
  const [intersections, setIntersections] = useState([]);
  const [scale, setScale] = useState({ w: 1, h: 1 });
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });

  // SGF auto-play
  const [gameList, setGameList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [autoBoardState, setAutoBoardState] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [totalMoves, setTotalMoves] = useState(0);

  // manual mode: history and markers
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualBoardStates, setManualBoardStates] = useState([]);
  const [manualLastMoves, setManualLastMoves] = useState([]);
  const [manualColor, setManualColor] = useState('black');

  const [savedAutoStep, setSavedAutoStep] = useState(0);

  // detect intersections
  useEffect(() => {
    new VertexDetector(boardImg)
      .processImage(boardSize)
      .then(setIntersections);
  }, [boardImg]);

  // compute scale & cell size
  useEffect(() => {
    const img = boardRef.current;
    if (!img?.naturalWidth) return;
    const wscale = img.clientWidth / img.naturalWidth;
    const hscale = img.clientHeight / img.naturalHeight;
    setScale({ w: wscale, h: hscale });
    setCellSize({ width: img.clientWidth / boardSize, height: img.clientHeight / boardSize });
  }, [intersections]);

  // load SGF list
  useEffect(() => {
    fetch(`${baseUrl}/data/games.txt`)
      .then(r => r.text())
      .then(txt => {
        const blocks = txt.split('<|startoftext|>').map(b => b.trim()).filter(Boolean);
        setGameList(blocks);
      });
  }, [baseUrl]);

  const handleSelectGame = newIndex => {
    setSelectedIndex(newIndex);
    setIsManualMode(false);
    setStep(0);
    setSavedAutoStep(0);
    setManualBoardStates([]);
    setManualLastMoves([]);
  };

  // auto-mode fetch
  useEffect(() => {
    if (isManualMode || !gameList.length) return;
    const sgf = cleanSgf(gameList[selectedIndex]);
    fetch('/api/sgf/board', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sgf, step })
    })
      .then(r => r.json())
      .then(data => {
        setAutoBoardState(data.boardState || []);
        setLastMove(data.lastMove || null);
        setTotalMoves(data.totalMoves || 0);
      });
  }, [selectedIndex, step, gameList, isManualMode]);

  // enter manual: snapshot
  const enterManual = () => {
    setSavedAutoStep(step);
    const sgf = cleanSgf(gameList[selectedIndex]);
    fetch('/api/sgf/board', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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
  };

  const exitManual = () => {
    setIsManualMode(false);
    setStep(savedAutoStep);
  };

  const toggleManual = () => {
    if (!isManualMode) enterManual(); else exitManual();
  };

  // handle manual click: record new state and marker
  const handleBoardClick = e => {
    if (!isManualMode) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale.w;
    const y = (e.clientY - rect.top) / scale.h;
    let closest, dist = Infinity;
    intersections.forEach(pt => {
      const dx = x - pt.x, dy = y - pt.y, d = dx*dx + dy*dy;
      if (d < dist) { dist = d; closest = pt; }
    });
    if (!closest) return;
    if (manualBoardStates[step].some(s => s.col === closest.gridCol && s.row === closest.gridRow)) {
      return alert('Occupied');
    }
    const mv = { col: closest.gridCol, row: closest.gridRow, color: manualColor };
    fetch('/api/manualmove', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mv)
    })
      .then(r => r.json())
      .then(data => {
        setManualBoardStates(prev => [...prev, data.boardState || []]);
        setManualLastMoves(prev => [...prev, data.lastMove || null]);
        setStep(prev => prev + 1);
        setManualColor(c => (c === 'black' ? 'white' : 'black'));
      });
  };

  // clear handler
  const handleClear = () => {
    if (isManualMode) {
      setManualBoardStates([manualBoardStates[0]]);
      setManualLastMoves([manualLastMoves[0]]);
      setStep(0);
    } else {
      setStep(0);
    }
  };

  // choose board + marker
  const boardToRender = isManualMode
    ? manualBoardStates[step] || []
    : autoBoardState;
  const markerMove = isManualMode
    ? manualLastMoves[step]
    : lastMove;

  // bounds
  const minStep = 0;
  const maxStep = isManualMode
    ? manualBoardStates.length - 1
    : totalMoves;

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <label htmlFor="gameDropdown" className={styles.dropdownLabel}>SELECT GAME</label>
        <select
          id="gameDropdown"
          className={styles.dropdown}
          size={5}
          value={selectedIndex}
          onChange={e => handleSelectGame(+e.target.value)}
        >
          {gameList.map((b,i)=><option key={i} value={i}>{extractGameName(b,i)}</option>)}
        </select>
      </div>
      <div className={styles.main}>
        <div className={styles.boardWrapper}>
          <img
            ref={boardRef}
            src={boardImg}
            alt="Go board"
            className={styles.boardimg}
            onClick={handleBoardClick}
          />
          {boardToRender.map((mv,i)=>{
            const pt = intersections.find(pt=>pt.gridCol===mv.col && pt.gridRow===mv.row);
            if (!pt) return null;
            const pixel = { x: pt.x*scale.w, y: pt.y*scale.h };
            const stoneSize = {
              width: cellSize.width * 0.9,
              height: cellSize.height * 0.9
            };
            const isLatest = markerMove&& mv.col === markerMove.col&& mv.row === markerMove.row && (!isManualMode || step > 0);
            const containerClass = isManualMode && isLatest
              ? `${styles.stoneContainer} ${styles.stoneOutline}`
              : styles.stoneContainer;
            // determine turn number label
            let turnLabel = null;
            if (isManualMode) {
              manualLastMoves.forEach((lm, idx) => {
                if (idx>0 && lm.col===mv.col && lm.row===mv.row) {
                  turnLabel = idx;
                }
              });
            }
            return (
              <div key={i} className={containerClass} style={{ top: pixel.y, left: pixel.x, width: stoneSize.width, height: stoneSize.height}} >
                <img
                  src={`${baseUrl}/assets/GO${mv.color==='black'?'BLACK':'WHITE'}STONE.png`}
                  className={styles.stone}
                  style={{  width: "100%", height: "100%", top: "50%",left: "50%"}}
                  alt={mv.color}
                />
                {isManualMode && turnLabel && (
                  <span className={styles.turnNumber}>{turnLabel}</span>
                )}
                {!isManualMode && isLatest && (
                  <div className={`${styles.marker} ${styles[mv.color]}`} />
                )}
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
          toggleType="manual-auto"
        />
      </div>
    </div>
  );
}


export default SgfViewer;