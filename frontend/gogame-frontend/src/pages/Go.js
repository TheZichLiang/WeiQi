import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from "../components/GameStateContext";
import VertexDetector from "../utils/VertexDetector";
import BottomLayer from "../components/BottomLayer";
import GoBoardAI from "../components/GoBoardAI";
import Gostyles from './Go.module.css';
import ControlPanel from '../components/ControlPanel';
import { userMove, postSpecialMove, fetchScoreData } from '../utils/APIHelpers';
import { gridToClientPixels, selectBoardImage, handleBoardClick, extractBoardMetrics } from '../utils/BoardUtils';
import {
  pushToHistory,
  stepBack,
  stepBack10,
  stepForward,
  stepForward10
} from '../utils/ControlPanelFunc';


function Go() {
  const { boardSize, aiLevel } = useGameState();
  const boardRef = useRef(null);


  // rendering & image metrics
  const [scaleWidth, setScaleWidth] = useState(1);
  const [scaleHeight, setScaleHeight] = useState(1);
  const [boardImage, setBoardImage] = useState('');
  const [intersections, setIntersections] = useState([]);
  const [boardRect, setBoardRect] = useState({});
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });


  // game state history
  const [history, setHistory] = useState([]);
  const [step, setStep] = useState(0);


  // manual "research" mode state
  const [isManualMode, setIsManualMode] = useState(false);
  const [lastManualStep, setLastManualStep] = useState(0);
  const [manualBoard, setManualBoard] = useState([]);
  const [manualStone, setManualStone] = useState('black');
  const [manualTurn, setManualTurn] = useState(0);


  // metadata
  const [latestMoveIdx, setLatestMoveIdx] = useState(null);
  const [latestBlackMove, setLatestBlackMove] = useState(null);
  const [latestWhiteMove, setLatestWhiteMove] = useState(null);
  const [blackTerritory, setBlackTerritory] = useState([]);
  const [whiteTerritory, setWhiteTerritory] = useState([]);
  const [blackScore, setBlackScore] = useState(0);
  const [whiteScore, setWhiteScore] = useState(0);
  //const [currTurn, setCurrTurn] = useState(0);

  // UI & flow
  const [gameStarted, setGameStarted] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [showScores, setShowScores] = useState(false);
  const [showTurnNumbers, setShowTurnNumbers] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);
  const aiThinkingInterval = useRef(null);


  // helpers for history-based state
  const safeStep = Math.min(step, history.length - 1);
  const getInitState = () => ({
    boardState: Array(intersections.length).fill(null),
    currentStone: 'black',
    turn: 0,
    capturedBlack: 0,
    capturedWhite: 0
  });
  
  const currentSnapshot = history[safeStep] || getInitState();
  const {
    boardState: currBoard,
    currentStone: currStone,
    turn: currTurn,
    capturedBlack: currCapB,
    capturedWhite: currCapW
  } = currentSnapshot;


  // when entering manual mode or changing step, seed manualBoard from snapshot
  /*useEffect(() => {
    if (isManualMode) {
      setManualBoard(currBoard);
      setManualStone(currStone);
      setManualTurn(currTurn);
    }
  }, [isManualMode, safeStep]);*/


  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const baseUrl = process.env.REACT_APP_BASE_URL;
 

  // start a new game
  useEffect(() => {
    async function startGame() {
      try {
        const resp = await fetch(`${apiBaseUrl}/startgame`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boardSize, aiLevel })
        });
        if (!resp.ok) throw new Error();
        setGameStarted(true);
        setBoardImage(selectBoardImage(baseUrl, boardSize));
      } catch {
        setAiMessage('Failed to start game. Please contact admin.');
      }
    }
    startGame();
  }, [boardSize, aiLevel, apiBaseUrl, baseUrl]);


  // handle board image load
  const handleImageLoad = () => {
    const m = extractBoardMetrics(boardRef, boardSize);
    if (!m) return;
    setScaleWidth(m.scaleW);
    setScaleHeight(m.scaleH);
    setCellSize(m.cell);
    setBoardRect(m.rect);
  };


  // detect intersections & initialize history
  useEffect(() => {
    if (!boardImage || !gameStarted) return;
    async function detect() {
      const detector = new VertexDetector(boardImage);
      const pts = await detector.processImage(parseInt(boardSize, 10));
      setIntersections(pts);
    }
    detect();
  }, [boardImage, gameStarted, boardSize]);


  // seed initial history after intersections
  useEffect(() => {
    if (!intersections.length) return;
    setHistory([getInitState()]);
    setStep(0);
  }, [intersections]);


  // AI thinking animation
  const startAIThinking = base => {
    let dots = 0;
    aiThinkingInterval.current = setInterval(() => {
      dots = (dots + 1) % 7;
      setAiMessage(`${base}\nAI thinking${'.'.repeat(dots)}`);
    }, 500);
  };
  const stopAIThinking = () => {
    clearInterval(aiThinkingInterval.current);
    aiThinkingInterval.current = null;
  };


  // user move handler (live vs manual)
  const handleUserMove = async e => {
    const nearest = handleBoardClick(e, intersections, boardRect, scaleWidth, scaleHeight, cellSize);
    if (!nearest) return;


    // manual research mode: local placement
    /*if (isManualMode) {
      const idx = intersections.findIndex(p => p.gridCol === nearest.gridCol && p.gridRow === nearest.gridRow);
      if (manualBoard[idx]) return; // occupied
      setManualBoard(mb => {
        const next = [...mb];
        next[idx] = { stone: manualStone, turn: manualTurn + 1 };
        return next;
      });
      console.log(manualTurn, showTurnNumbers);
      setManualTurn(t => t + 1);
      console.log(manualTurn, showTurnNumbers);
      setManualStone(s => (s === 'black' ? 'white' : 'black'));
      return;
    }*/
    // live gameplay
    if (gameOver || currStone !== 'black' || isAITurn) return;
    const userTurn = currTurn + 1;
    startAIThinking(`You played at (${nearest.gridCol}, ${nearest.gridRow}). `);
    //console.log("turn display...", currTurn);

    const result = await userMove({
      url: `${apiBaseUrl}/usermove`,
      col: nearest.gridCol,
      row: nearest.gridRow,
      boardState: currBoard,
      turnCounter: userTurn,
      intersections
    });
    if (!result.valid) {
      stopAIThinking();
      setAiMessage('Invalid user move. Please try again.');
      return;
    }


    const newState = {
      boardState: result.newBoardState,
      currentStone: 'white',
      turn: userTurn,
      capturedBlack: currCapB,
      capturedWhite: currCapW + result.capturedCount
    };
    setLatestBlackMove({ col: nearest.gridCol, row: nearest.gridRow });
    setLatestMoveIdx(result.moveIndex);


    setHistory(h => {
      const next = pushToHistory(newState, h);
      setStep(next.length - 1);
      return next;
    });


    setIsAITurn(true);
    handleAIMove(newState.boardState, userTurn);
  };


  // AI move
  const handleAIMove = async (prevBoard, lastTurn) => {
    try {
      const resp = await fetch(`${apiBaseUrl}/aimove`, { method: 'POST' });
      if (!resp.ok) throw new Error();
      const data = await resp.json();


      setTimeout(() => {
        stopAIThinking();
        let updated = [...prevBoard];
        if (data.message !== 'AI passed.') {
          const idx = intersections.findIndex(p => p.gridCol === data.aiMove.col && p.gridRow === data.aiMove.row);
          updated[idx] = { stone: 'white', turn: lastTurn + 1 };
          data.aiCapturedPoints.forEach(p => {
            const i = intersections.findIndex(pt => pt.gridCol === p.col && pt.gridRow === p.row);
            if (i !== -1) updated[i] = null;
          });


          const aiTurn = lastTurn + 1;
          const newState = {
            boardState: updated,
            currentStone: 'black',
            turn: aiTurn,
            capturedBlack: currCapB + data.aiCapturedPoints.length,
            capturedWhite: currCapW
          };
          setLatestWhiteMove(data.aiMove);
          setLatestMoveIdx(idx);


          setHistory(h => {
            const next = pushToHistory(newState, h);
            setStep(next.length - 1);
            return next;
          });
        }
        setAiMessage(data.message);
        if (data.gameOver) setGameOver(true);
        setIsAITurn(false);
      }, 1500);
    } catch {
      stopAIThinking();
      setAiMessage('Failed to execute AI move.');
      setIsAITurn(false);
    }
  };


  // pass & resign remain live only
  const handlePass = async () => {
    if (isManualMode || gameOver || currStone !== 'black') return;
    startAIThinking('You passed your turn. ');
    try {
      await postSpecialMove({
        moveType: 'pass',
        url: `${apiBaseUrl}/usermove`,
        setAiMessage,
        setGameOver,
        turnUpdateCallback: () => handleAIMove(currBoard, currTurn + 1)
      });
    } catch {
      stopAIThinking();
      setAiMessage('Failed to process pass.');
    }
  };
  const handleResign = () => {
    if (isManualMode || gameOver || currStone !== 'black') return;
    postSpecialMove({ moveType: 'resign', url: `${apiBaseUrl}/usermove`, setAiMessage, setGameOver });
  };


  // scoring remains live only
  const handleScoreClick = async () => {
    if (showScores) return setShowScores(false);
    const res = await fetchScoreData(`${apiBaseUrl}/scoring`);
    if (!res.success) return setAiMessage('Failed to score.');
    const d = res.data;
    setBlackScore(d.blackScore);
    setWhiteScore(d.whiteScore);
    setBlackTerritory(d.blackTerritory);
    setWhiteTerritory(d.whiteTerritory);
    if (gameOver) setAiMessage(`${d.winner} wins by ${d.winningMargin} points!`);
    setShowScores(true);
  };


  // manual/live toggle
  const handleToggleManual = () => {
    if (!isManualMode) {
      setLastManualStep(step);
      setIsManualMode(true);
    } else {
      setStep(lastManualStep);
      setIsManualMode(false);
    }
  };


  // clear = rewind only
  const handleClear = () => {
    setStep(0);
    setGameOver(false);
  };


  // jump to last
  const handleJumpToLast = () => setStep(history.length - 1);


  const displayBoard = isManualMode ? manualBoard : currBoard;
  const displayMoveIdx = isManualMode ? null : latestMoveIdx;


  const getClientPixels = (c, r) => gridToClientPixels(c, r, intersections, scaleWidth, scaleHeight);


  return (
    <div className={Gostyles.GameContainer}>
      <BottomLayer
        capturedWhite={isManualMode ? currCapW : currCapW}
        capturedBlack={isManualMode ? currCapB : currCapB}
        latestBlackMove={latestBlackMove}
        latestWhiteMove={latestWhiteMove}
        blackScore={blackScore}
        whiteScore={whiteScore}
        showScores={showScores}
        aiMessage={aiMessage}
        onPass={handlePass}
        onResign={handleResign}
        onToggleTurns={() => setShowTurnNumbers(!showTurnNumbers)}
        onScore={handleScoreClick}
        showTurnNumbers={showTurnNumbers}
      >
        <GoBoardAI
          key={`step-${step}-${isManualMode}`}
          boardRef={boardRef}
          boardImage={boardImage}
          manualTurn={manualTurn}
          isManualMode={isManualMode}
          handleUserMove={handleUserMove}
          handleImageLoad={handleImageLoad}
          intersections={intersections}
          boardState={displayBoard}
          latestMoveIdx={displayMoveIdx}
          cellSize={cellSize}
          getClientPixels={getClientPixels}
          showTurnNumbers={showTurnNumbers}
          gameOver={gameOver}
          showScores={showScores}
          blackTerritory={blackTerritory}
          whiteTerritory={whiteTerritory}
        />
        <ControlPanel
          step={step}
          maxStep={history.length - 1}
          isManualMode={isManualMode}
          toggleType="manual-live"
          onClear={handleClear}
          onBack={() => setStep(stepBack(history, step))}
          onBack10={() => setStep(stepBack10(history, step))}
          onForward={() => setStep(stepForward(history, step))}
          onForward10={() => setStep(stepForward10(history, step))}
          onFull={handleJumpToLast}
          onToggleManual={handleToggleManual}
        />
      </BottomLayer>
    </div>
  );
}


export default Go;