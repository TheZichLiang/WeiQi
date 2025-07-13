import React from 'react';
import GBstyles from './GoBoardAI.module.css';

function GoBoardAI({
  boardRef,
  boardImage,
  handleUserMove,
  handleImageLoad,
  intersections,
  boardState,
  latestMoveIdx,
  cellSize,
  getClientPixels,
  showTurnNumbers,
  gameOver,
  showScores,
  blackTerritory,
  whiteTerritory
}) {
  return (
    <div className={GBstyles.boardContainer}>
      <div className={GBstyles.boardWrapper}>
        <img
          ref={boardRef}
          src={boardImage}
          alt="Go board"
          className={GBstyles.boardimg}
          onClick={handleUserMove}
          onLoad={handleImageLoad}
        />

        {intersections.map((intersection, index) => {
          const pixelCoord = getClientPixels(intersection.gridCol, intersection.gridRow);
          const stone = boardState[index];
          if (!stone) return null;

          return (
            <div
              key={index}
              className={`${GBstyles.stoneContainer} ${index === latestMoveIdx ? GBstyles.stoneOutline : ''}`}
              style={{
                top: `${pixelCoord.y}px`,
                left: `${pixelCoord.x}px`,
                width: `${cellSize.width * 0.9}px`,
                height: `${cellSize.height * 0.9}px`
              }}
            >
              <img
                src={`${process.env.REACT_APP_BASE_URL}/assets/GO${stone.stone.toUpperCase()}STONE.png`}
                className={GBstyles.stone}
                alt={stone.stone}
              />
              {showTurnNumbers && (
                <span className={GBstyles.turnNumber} style={{ fontSize: `${cellSize.height * 0.3}px` }}>
                  {stone.turn}
                </span>
              )}
            </div>
          );
        })}

        {showScores && blackTerritory.map((coord, i) => {
          const { x, y } = getClientPixels(coord.col, coord.row);
          return (
            <div
              key={`black-${i}`}
              className={GBstyles.blackTerritory}
              style={{
                top: `${y}px`,
                left: `${x}px`,
                width: `${cellSize.width * 0.25}px`,
                height: `${cellSize.height * 0.25}px`
              }}
            />
          );
        })}

        {showScores && whiteTerritory.map((coord, i) => {
          const { x, y } = getClientPixels(coord.col, coord.row);
          return (
            <div
              key={`white-${i}`}
              className={GBstyles.whiteTerritory}
              style={{
                top: `${y}px`,
                left: `${x}px`,
                width: `${cellSize.width * 0.25}px`,
                height: `${cellSize.height * 0.25}px`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default GoBoardAI;