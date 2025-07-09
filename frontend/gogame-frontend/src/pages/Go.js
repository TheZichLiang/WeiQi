import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useGameState } from "../components/GameStateContext";
import VertexDetector from "../components/VertexDetector";
import Gostyles from "./Go.module.css";


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
          console.log('Start Game Data:', data);
          setGameStarted(true);
          selectBoardImage(boardSize);
        } else {
          throw new Error('Failed to start game');
        }
      } catch (error) {
        setAiMessage('Failed to start game. Please contact admin to activate server.');
      }
    };

    startGame();
  }, [boardSize, aiLevel, apiBaseUrl]);

  const updateScalesAndRect = useCallback(() => {
    if (boardRef.current) {
      const { naturalWidth, naturalHeight, clientWidth, clientHeight } = boardRef.current;
      setScaleWidth(clientWidth / naturalWidth);
      setScaleHeight(clientHeight / naturalHeight);
      setBoardRect(boardRef.current.getBoundingClientRect());
      setCellSize({ width: clientWidth / boardSize, height: clientHeight / boardSize });
    }
  }, [boardSize]);

  useEffect(() => {
    window.addEventListener('resize', updateScalesAndRect);
    return () => window.removeEventListener('resize', updateScalesAndRect);
  }, [updateScalesAndRect]);

  useEffect(() => {
    updateScalesAndRect();
  }, [boardImage, updateScalesAndRect]);

  useEffect(() => {
    if (boardImage && gameStarted) {
      const processImage = async () => {
        const vtxDetector = new VertexDetector(boardImage);
        const coordPts = await vtxDetector.processImage(parseInt(boardSize));
        setIntersections(coordPts);
        console.log('Intersection Points:', coordPts);
        setBoardState(new Array(coordPts.length).fill(null));
      };
      processImage();
    }
  }, [boardImage, gameStarted, boardSize]);

  const selectBoardImage = (size) => {
    switch (size) {
      case '9':
        setBoardImage(`${baseUrl}/assets/GO9x9.png`);
        break;
      case '13':
        setBoardImage(`${baseUrl}/assets/GO13x13.png`);
        break;
      case '19':
        setBoardImage(`${baseUrl}/assets/GO19x19.png`);
        break;
      default:
        setBoardImage(`${baseUrl}/assets/GO19x19.png`);
    }
  }

  const handleImageLoad = () => {
    updateScalesAndRect();
  };

  
  useEffect(() => {
    if (gameOver) {
      handleScoreClick();
    }
  }, [gameOver]);

  function findNearestIdx(x, y, intersections, threshold = 0.8) {
    let minDistance = Infinity;
    let nearestIndex = -1;

    intersections.forEach((intersection, index) => {
      const dx = x - intersection.x;
      const dy = y - intersection.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    const within = threshold * Math.min(cellSize.width, cellSize.height);
    // Check if the minimum distance is within the threshold
    if (minDistance < within) {
      return nearestIndex;
    } else {
      return -1; 
    }
  }

  const handleBoardClick = (event, intersections) =>{
    const rect = boardRect;
    const x = (event.clientX - rect.left) / scaleWidth;
    const y = (event.clientY - rect.top) / scaleHeight;
    const nearestIndex = findNearestIdx(x, y, intersections);

    if (nearestIndex !== -1){ 
      const nearestIntersection = intersections[nearestIndex];
      return nearestIntersection;
    }else{
      setAiMessage('Click is invalid. Please try again.');
      return null;
    }
  }

  const handleUserMove = async (event) => {
    if (gameOver) {
      setAiMessage("Game is over.");
      return;
    }else if (currentStone=== 'white'){
      setAiMessage("Moves are not allowed before AI moves.");
      return;
    }
    const nearestIntersection = handleBoardClick(event, intersections);
    if (nearestIntersection !== null) {
      try {
        const response = await fetch(`${apiBaseUrl}/usermove`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gridCol: nearestIntersection.gridCol, gridRow: nearestIntersection.gridRow, moveType: "play" })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.validMove) {
            const newBoardState = [...boardState];

            const baseMessage = `You played at (${nearestIntersection.gridCol}, ${nearestIntersection.gridRow}). `;
            setAiMessage(baseMessage + 'AI thinking');
            let dots = 0;
            const maxDots = 6;

            aiThinkingInterval.current = setInterval(() => {
              dots = (dots + 1) % (maxDots + 1);
              const loadingDots = '.'.repeat(dots);
              setAiMessage(baseMessage + `AI thinking${loadingDots}`);
            }, 500);

            const nearestIndex = intersections.findIndex(intersection =>
              intersection.gridCol === nearestIntersection.gridCol && intersection.gridRow === nearestIntersection.gridRow
            );
            newBoardState[nearestIndex] = { stone: 'black', turn: turnCounter };
            setBoardState(newBoardState);
            setLatestBlackMove({ col: nearestIntersection.gridCol, row: nearestIntersection.gridRow });
  
            data.capturedPoints.forEach(point => {
              const captureIndex = intersections.findIndex(intersection =>
                intersection.gridCol === point.col && intersection.gridRow === point.row
              );
              if (captureIndex !== -1) {
                newBoardState[captureIndex] = null;
              }
            });
            setBoardState(newBoardState);
            setTurnCounter(turnCounter + 1);
            setCurrentStone('white');
            setLatestMoveIdx(nearestIndex);
            setCapturedWhite(capturedWhite + data.capturedPoints.length);
            handleAIMove(newBoardState, intersections);
          } else {
            setAiMessage('Invalid user move. Please try again.');
          }
        } else {
          throw new Error('Failed to make user move. Please try again.');
        }
      } catch (error) {
        setAiMessage('Failed to execute user move.');
      }
    }
  };

  const handleAIMove = async (newBoardState) => {
    try {
      const response = await fetch(`${apiBaseUrl}/aimove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();

        setTimeout(async () => {
          if (data.gameOver){
            setAiMessage(data.message);
            setGameOver(true);
          }else if (data.message === "AI passed.") {
            setAiMessage("AI passed its turn.");
            setCurrentStone('black');
          }else {
            clearInterval(aiThinkingInterval.current);
            aiThinkingInterval.current = null;
            setAiMessage(`AI played at (${data.aiMove.col}, ${data.aiMove.row})`);
            const aiMoveIndex = intersections.findIndex(intersection =>
              intersection.gridCol === data.aiMove.col && intersection.gridRow === data.aiMove.row
            );

            const newBoardStateAI = [...newBoardState];
            newBoardStateAI[aiMoveIndex] = { stone: 'white', turn: turnCounter + 1 };
            setLatestWhiteMove({ col: data.aiMove.col, row: data.aiMove.row });

            data.aiCapturedPoints.forEach(point => {
              const captureIndex = intersections.findIndex(intersection =>
                intersection.gridCol === point.col && intersection.gridRow === point.row
              );
              if (captureIndex !== -1) {
                newBoardStateAI[captureIndex] = null;
              }
            });

            setBoardState(newBoardStateAI);
            setTurnCounter(turnCounter + 2);
            setCurrentStone('black');
            setLatestMoveIdx(aiMoveIndex);
            setCapturedBlack(capturedBlack + data.aiCapturedPoints.length);
          }
        }, 1500);
      } else {
        throw new Error('Failed to process AI move. Please try again.');
      }
    } catch (error) {
      setAiMessage('Failed to execute AI move.');
    }
  };

  const handlePass = async () => {
    if (gameOver) {
      setAiMessage("Game is over.")
      return;
    }else if (currentStone=== 'white'){
      setAiMessage("Moves are not allowed until AI moves.");
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}/usermove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gridCol: -1, gridRow: -1, moveType: "pass" })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.gameOver) {
          setAiMessage(data.message);
          setGameOver(true);
        }else if (data.message === "You passed.") {
          setAiMessage("You passed your turn.");
          setTurnCounter(turnCounter + 1);
          setCurrentStone('white');
          handleAIMove(boardState);
        }
      } else {
        throw new Error('Failed to pass. Please try again.');
      }
    } catch (error) {
      setAiMessage('Failed to execute pass.');
    }
  };

  const handleResign = async () => {
    if (gameOver) {
      setAiMessage("Game is over.")
      return;
    }else if (currentStone!== 'black'){
      setAiMessage("Moves are not allowed before AI moves.");
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}/usermove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gridCol: -1, gridRow: -1, moveType: "resign" })
      });

      if (response.ok) {
        const data = await response.json();
        setAiMessage(data.message);
        setGameOver(true);
      } else {
        throw new Error('Failed to resign. Please try again.');
      }
    } catch (error) {
      setAiMessage('Failed to execute resign.');
    }
  };

  const handleTurnToggle = () => {
    setShowTurnNumbers(!showTurnNumbers);
  };

  const handleScoreClick = async () => {
    if (showScores) {
      setShowScores(false);
    }else{
      try {
        const response = await fetch(`${apiBaseUrl}/scoring`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.resignstatus) {
            setShowScores(false);
          }else{
            setBlackScore(data.blackScore);
            setWhiteScore(data.whiteScore);
            setBlackTerritory(data.blackTerritory);
            setWhiteTerritory(data.whiteTerritory);
            if(gameOver){
              setAiMessage(`${data.winner} wins by ${data.winningMargin} points!`);
            }
            setShowScores(true);
          }
        } else {
          throw new Error('Failed to get scores. Please try again.');
        }
      } catch (error) {
        setAiMessage('Failed to execute score click.');
      }
    }
  };

  const getClientPixels = (gridCol, gridRow) => {
    const intersection = intersections.find(intersection => 
      intersection.gridCol === gridCol && intersection.gridRow === gridRow
    );
    if (intersection) {
      return {
        x: intersection.x * scaleWidth,
        y: intersection.y * scaleHeight
      };
    }
    return null;
  };

  return (
    <div className={Gostyles.GameContainer}>
       <div className={Gostyles.topLeft}>
        <span className={Gostyles.columnHeader}>You:</span>
        <img src={`${baseUrl}/assets/GOBLACKSTONE.png`} alt="Black Stone" className={Gostyles.stoneImg} />
      </div>
      <div className={Gostyles.topMiddle}>
        <h1 className={Gostyles.title}>{gameOver ? 'GAME ENDED' : 'GAME IN SESSION'}</h1>
      </div>
      <div className={Gostyles.topRight}>
        <span className={Gostyles.columnHeader}>AI:</span>
        <img src={`${baseUrl}/assets/GOWHITESTONE.png`} alt="White Stone" className={Gostyles.stoneImg} />
      </div>
      <div className={Gostyles.bottomLeft}>
        <table className={Gostyles.statsTableBlack}>
          <thead>
            <tr>
              <th colSpan="2">Player Statistics (Black)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Time Left</td>
              <td>1:00</td>
            </tr>
            <tr>
              <td>Last Move (Col,Row)</td>
              <td>{latestBlackMove ? `(${latestBlackMove.col}, ${latestBlackMove.row})` : 'N/A'}</td>
            </tr>
            <tr>
              <td>Captured Stones</td>
              <td>{capturedWhite}</td>
            </tr>
            <tr>
              <td>SCORE</td>
              <td>{showScores? blackScore : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
        <div className={Gostyles.buttonsContainer}>
          <button className= {Gostyles.buttonNormal} onClick={handlePass}>PASS</button>
          <button className= {Gostyles.buttonNormal} onClick={handleResign}>RESIGN</button>
          <button className={Gostyles.buttonNormal} onClick={handleTurnToggle}>
            {showTurnNumbers ? 'HIDE TURNS' : 'SHOW TURNS'}
          </button>
          <button className={Gostyles.buttonScore} onClick={handleScoreClick}>
            {showScores ? 'HIDE SCORE' : 'VIEW SCORE'}
          </button>
        </div>
      </div>
      {gameStarted && boardImage && (
        <div className={Gostyles.bottomMiddle}>
          <div className={Gostyles.boardWrapper}>
            <img ref={boardRef}
              src={boardImage}
              alt={`Go board size ${boardSize}`}
              className={Gostyles.boardimg}
              onClick={handleUserMove}
              onLoad={handleImageLoad}
            />
            {intersections.map((intersection, index) => {
              const pixelCoord = getClientPixels(intersection.gridCol, intersection.gridRow);
              return (
                boardState[index] && (
                  <div key={index} className= {`${Gostyles.stoneContainer} ${index === latestMoveIdx ? Gostyles.stoneOutline : ''}`} style={{
                    top: `${pixelCoord.y}px`,
                    left: `${pixelCoord.x}px`,
                    width: `${cellSize.width * 0.9}px`,
                    height: `${cellSize.height * 0.9}px`
                  }}>
                  <img
                    src={boardState[index].stone === 'black' ? `${baseUrl}/assets/GOBLACKSTONE.png` : `${baseUrl}/assets/GOWHITESTONE.png`}
                    className={Gostyles.stone}
                    alt={boardState[index].stone}
                  />
                  {showTurnNumbers && (
                    <span className={Gostyles.turnNumber} style={{ fontSize: `${cellSize.height * 0.3}px` }}>
                      {boardState[index].turn}
                    </span>
                  )}
                </div>
                )
              );
            })}
            {showScores && blackTerritory.map((coord, index) => {
              const pixelCoord = getClientPixels(coord.col, coord.row);
              return pixelCoord && (
                <div
                  key={`black-${index}`}
                  className={Gostyles.blackTerritory}
                  style={{
                    top: `${pixelCoord.y}px`,
                    left: `${pixelCoord.x}px`,
                    width: `${cellSize.width * 0.25}px`,
                    height: `${cellSize.height * 0.25}px`
                  }}
                />
              );
            })}
            {showScores && whiteTerritory.map((coord, index) => {
              const pixelCoord = getClientPixels(coord.col, coord.row);
              return pixelCoord && (
                <div
                  key={`white-${index}`}
                  className={Gostyles.whiteTerritory}
                  style={{
                    top: `${pixelCoord.y}px`,
                    left: `${pixelCoord.x}px`,
                    width: `${cellSize.width * 0.25}px`,
                    height: `${cellSize.height * 0.25}px`
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
      <div className={Gostyles.bottomRight}>
      <table className={Gostyles.statsTableWhite}>
          <thead>
            <tr>
              <th colSpan="2">Player Statistics (White)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Time Left</td>
              <td>1:00</td>
            </tr>
            <tr>
              <td>Last Move (Col,Row)</td>
              <td>{latestWhiteMove ? `(${latestWhiteMove.col}, ${latestWhiteMove.row})` : 'N/A'}</td>
            </tr>
            <tr>
              <td>Captured Stones</td>
              <td>{capturedBlack}</td>
            </tr>
            <tr>
              <td>SCORE</td>
              <td>{showScores? whiteScore : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
        <div className={Gostyles.aiMessageBox}>
          <h4 className = {Gostyles.messageTitle}>MESSAGE BOX</h4>
          <p className = {Gostyles.message}>{aiMessage}</p>
        </div>
      </div>
    </div>
  );
}

export default Go;