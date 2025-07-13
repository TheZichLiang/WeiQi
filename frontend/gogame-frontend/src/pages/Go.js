import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useGameState } from "../components/GameStateContext";
import VertexDetector from "../utils/VertexDetector";
import TopLayer from "../components/TopLayer";
import BottomLayer from "../components/BottomLayer";
import GoBoardAI from "../components/GoBoardAI"; 
import Gostyles from './Go.module.css'; // Assuming you have a Go.module.css for GoGostyles
import {userMove, postSpecialMove, fetchScoreData} from '../utils/APIHelpers';
import {gridToClientPixels, selectBoardImage, handleBoardClick, extractBoardMetrics} from '../utils/BoardUtils';

function Go() {
  const { boardSize, aiLevel} = useGameState();
  const boardRef = useRef(null);
  const [scaleWidth, setScaleWidth] = useState(1);
  const [scaleHeight, setScaleHeight] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [boardImage, setBoardImage] = useState('');
  const [intersections, setIntersections] = useState([]);
  const [boardState, setBoardState] = useState([]);
  const [currentStone, setCurrentStone] = useState('black');
  const [boardRect, setBoardRect] = useState({});
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const [turnCounter, setTurnCounter] = useState(1);
  const [latestMoveIdx, setLatestMoveIdx] = useState(null); 
  const [capturedBlack, setCapturedBlack] = useState(0);
  const [capturedWhite, setCapturedWhite] = useState(0);
  const [latestBlackMove, setLatestBlackMove] = useState(null);
  const [latestWhiteMove, setLatestWhiteMove] = useState(null);
  const [blackTerritory, setBlackTerritory] = useState([]);
  const [whiteTerritory, setWhiteTerritory] = useState([]);
  const [blackScore, setBlackScore] = useState(0);
  const [whiteScore, setWhiteScore] = useState(0);
  const [aiMessage, setAiMessage] = useState('');
  const [showScores, setShowScores] = useState(false);
  const [showTurnNumbers, setShowTurnNumbers] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);
  const aiThinkingInterval = useRef(null);
  
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const baseUrl = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const startGame = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/startgame`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ boardSize: boardSize, aiLevel: aiLevel })
        });

        console.log('Start Game Response:', response);

        if (response.ok) {
          const data = await response.json();
          setGameStarted(true);
          setBoardImage(selectBoardImage(baseUrl, boardSize));
        } else {
          throw new Error('Failed to start game');
        }
      } catch (error) {
        setAiMessage('Failed to start game. Please contact admin to activate server.');
      }
    };

    startGame();
  }, [boardSize, aiLevel, apiBaseUrl, baseUrl]);

  
  const handleImageLoad = () => {
    const metrics = extractBoardMetrics(boardRef, boardSize);
    if (!metrics) return;

    setScaleWidth(metrics.scaleW);
    setScaleHeight(metrics.scaleH);
    setCellSize(metrics.cell);
    setBoardRect(metrics.rect);
  };

  useEffect(() => {
    if (!boardImage || !gameStarted) return;
    const processImage = async () => {
      const vtxDetector = new VertexDetector(boardImage);
      const pts = await vtxDetector.processImage(parseInt(boardSize));
      setIntersections(pts);
      setBoardState(new Array(pts.length).fill(null));
    };
    processImage();
  }, [boardImage, gameStarted, boardSize]);

  const startAIThinking = (baseMessage) => {
    let dots = 0;
    const maxDots = 6;

    aiThinkingInterval.current = setInterval(() => {
      dots = (dots + 1) % (maxDots + 1);
      setAiMessage(`${baseMessage}AI thinking${'.'.repeat(dots)}`);
    }, 500);
  };

  const stopAIThinking = () => {
    if (aiThinkingInterval.current) {
      clearInterval(aiThinkingInterval.current);
      aiThinkingInterval.current = null;
    }
  };
  
  useEffect(() => {
    if (gameOver) {
      handleScoreClick();
      stopAIThinking();
    }
  }, [gameOver]);

  const handleUserMove = async (event) => {
    if (gameOver) {
      setAiMessage("Game is over.");
      return;
    }
    if (currentStone !== 'black') {
      setAiMessage("It's not your turn yet.");
      return;
    }
    if (isAITurn) {
      setAiMessage("AI is still thinking. Please wait...");
      return;
    }
    setIsAITurn(true);

    const nearest = handleBoardClick(event, intersections, boardRect, scaleWidth, scaleHeight, cellSize);
    if (!nearest) {
      setAiMessage("Click is invalid. Please try again.");
      setIsAITurn(false); 
      return;
    }

    const baseMessage = `You played at (${nearest.gridCol}, ${nearest.gridRow}). `;
    startAIThinking(baseMessage); 

    const moveResult = await userMove({
      url: `${apiBaseUrl}/usermove`,
      col: nearest.gridCol,
      row: nearest.gridRow,
      boardState,
      turnCounter,
      intersections,
    });

    if (!moveResult.valid) {
      stopAIThinking(); 
      setAiMessage("Invalid user move. Please try again.");
      setIsAITurn(false);
      return;
    }

    const {
      newBoardState,
      moveIndex,
      capturedCount
    } = moveResult;

    setBoardState(newBoardState);
    setLatestBlackMove({ col: nearest.gridCol, row: nearest.gridRow });
    setTurnCounter(turnCounter + 1);
    setCurrentStone('white');
    setLatestMoveIdx(moveIndex);
    setCapturedWhite(capturedWhite + capturedCount);

    handleAIMove(newBoardState);
  };

  const handleAIMove = async (newBoardState) => {
    try {
      const response = await fetch(`${apiBaseUrl}/aimove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('AI move failed');

      const data = await response.json();

      setTimeout(() => {
        stopAIThinking();

        if (data.gameOver) {
          setAiMessage(data.message);
          setGameOver(true);
          return;
        }

        if (data.message === "AI passed.") {
          setAiMessage("AI passed its turn.");
          setCurrentStone('black');
          setIsAITurn(false);
          return;
        }

        setAiMessage(`AI played at (${data.aiMove.col}, ${data.aiMove.row})`);
        const aiMoveIndex = intersections.findIndex(
          (p) => p.gridCol === data.aiMove.col && p.gridRow === data.aiMove.row
        );

        const updatedBoard = [...newBoardState];
        updatedBoard[aiMoveIndex] = { stone: 'white', turn: turnCounter + 1 };
        setLatestWhiteMove({ col: data.aiMove.col, row: data.aiMove.row });

        data.aiCapturedPoints.forEach(({ col, row }) => {
          const idx = intersections.findIndex(p => p.gridCol === col && p.gridRow === row);
          if (idx !== -1) updatedBoard[idx] = null;
        });

        setBoardState(updatedBoard);
        setTurnCounter(turnCounter + 2);
        setCurrentStone('black');
        setLatestMoveIdx(aiMoveIndex);
        setCapturedBlack(capturedBlack + data.aiCapturedPoints.length);
        setIsAITurn(false);
      }, 1500);
    } catch (error) {
      stopAIThinking();
      setAiMessage("Failed to execute AI move.");
      setIsAITurn(false);
    }
  };

  const handlePass = async () => {
    if (gameOver || currentStone !== 'black') return;

    const baseMessage = "You passed your turn. ";
    startAIThinking(baseMessage);

    try {
      await postSpecialMove({
        moveType: "pass",
        url: `${apiBaseUrl}/usermove`,
        setAiMessage,
        setGameOver,
        turnUpdateCallback: () => {
          setAiMessage(baseMessage + "AI thinking");
          setTurnCounter(turnCounter + 1);
          setCurrentStone('white');
          handleAIMove(boardState); // this will stop dots
        }
      });
    } catch (err) {
      stopAIThinking();
      setAiMessage("Failed to process pass.");
      setIsAITurn(false);
    }
  };


  const handleResign = () => {
    if (gameOver || currentStone !== 'black') return;
    postSpecialMove({
      moveType: "resign",
      url: `${apiBaseUrl}/usermove`,
      setAiMessage,
      setGameOver
    });
  };

  const handleTurnToggle = () => {
    setShowTurnNumbers(!showTurnNumbers);
  };

  const handleScoreClick = async () => {
    if (showScores) {
      setShowScores(false);
      return;
    }

    const result = await fetchScoreData(`${apiBaseUrl}/scoring`);
    if (!result.success) {
      setAiMessage("Failed to execute score click.");
      return;
    }

    const data = result.data;
    if (data.resignstatus) {
      setShowScores(false);
      return;
    }

    setBlackScore(data.blackScore);
    setWhiteScore(data.whiteScore);
    setBlackTerritory(data.blackTerritory);
    setWhiteTerritory(data.whiteTerritory);
    if (gameOver) {
      setAiMessage(`${data.winner} wins by ${data.winningMargin} points!`);
    }
    setShowScores(true);
  };

  const getClientPixels = (gridCol, gridRow) => {
    return gridToClientPixels(gridCol, gridRow, intersections, scaleWidth, scaleHeight);
  };

  return (
    <div className={Gostyles.GameContainer}>
      <TopLayer baseUrl={baseUrl} gameOver={gameOver} />
      <BottomLayer
        capturedWhite={capturedWhite}
        capturedBlack={capturedBlack}
        latestBlackMove={latestBlackMove}
        latestWhiteMove={latestWhiteMove}
        blackScore={blackScore}
        whiteScore={whiteScore}
        showScores={showScores}
        aiMessage={aiMessage}
        onPass={handlePass}
        onResign={handleResign}
        onToggleTurns={handleTurnToggle}
        onScore={handleScoreClick}
        showTurnNumbers={showTurnNumbers}
      >
        <GoBoardAI
          boardRef={boardRef}
          boardImage={boardImage}
          handleUserMove={handleUserMove}
          handleImageLoad={handleImageLoad}
          intersections={intersections}
          boardState={boardState}
          latestMoveIdx={latestMoveIdx}
          cellSize={cellSize}
          getClientPixels={getClientPixels}
          showTurnNumbers={showTurnNumbers}
          gameOver={gameOver}
          showScores={showScores}
          blackTerritory={blackTerritory}
          whiteTerritory={whiteTerritory}
        />
      </BottomLayer>
    </div>
  );
}

export default Go;