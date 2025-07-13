import React from 'react';
import BLstyles from './BottomLayer.module.css';

function BottomLayer({
  capturedWhite,
  capturedBlack,
  latestBlackMove,
  latestWhiteMove,
  blackScore,
  whiteScore,
  showScores,
  aiMessage,
  onPass,
  onResign,
  onToggleTurns,
  onScore,
  showTurnNumbers,
  children  // GoBoardAI component passed here
}) {
  return (
    <>
      {/* Left Panel: Black Stats + Buttons */}
      <div className={BLstyles.leftPanel}>
        <table className={BLstyles.statsTableBlack}>
          <thead>
            <tr><th colSpan="2">Player Statistics (Black)</th></tr>
          </thead>
          <tbody>
            <tr><td>Time Left</td><td>1:00</td></tr>
            <tr><td>Last Move</td><td>{latestBlackMove ? `(${latestBlackMove.col}, ${latestBlackMove.row})` : 'N/A'}</td></tr>
            <tr><td>Captured</td><td>{capturedWhite}</td></tr>
            <tr><td>Score</td><td>{showScores ? blackScore : 'N/A'}</td></tr>
          </tbody>
        </table>
        <div className={BLstyles.buttonsContainer}>
          <button className={BLstyles.panelButton} onClick={() => onPass('black')}>PASS</button>
          <button className={BLstyles.panelButton} onClick={onResign}>RESIGN</button>
          <button className={BLstyles.panelButton} onClick={onToggleTurns}>
            {showTurnNumbers ? 'HIDE TURNS' : 'SHOW TURNS'}
          </button>
          <button className={BLstyles.scoreButton} onClick={onScore}>
            {showScores ? 'HIDE SCORE' : 'VIEW SCORE'}
          </button>
        </div>
      </div>

      {/* Middle Panel: Go Board */}
      <div className={BLstyles.middlePanel}>
        {children}
      </div>

      {/* Right Panel: White Stats + Message */}
      <div className={BLstyles.rightPanel}>
        <table className={BLstyles.statsTableWhite}>
          <thead>
            <tr><th colSpan="2">Player Statistics (White)</th></tr>
          </thead>
          <tbody>
            <tr><td>Time Left</td><td>1:00</td></tr>
            <tr><td>Last Move</td><td>{latestWhiteMove ? `(${latestWhiteMove.col}, ${latestWhiteMove.row})` : 'N/A'}</td></tr>
            <tr><td>Captured</td><td>{capturedBlack}</td></tr>
            <tr><td>Score</td><td>{showScores ? whiteScore : 'N/A'}</td></tr>
          </tbody>
        </table>
        <div className={BLstyles.aiMessageBox}>
          <h4 className={BLstyles.messageTitle}>MESSAGE BOX</h4>
          <p className={BLstyles.message}>{aiMessage}</p>
        </div>
      </div>
    </>
  );
}

export default BottomLayer;
