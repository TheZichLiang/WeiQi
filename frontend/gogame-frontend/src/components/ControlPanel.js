import React from 'react';
import styles from './BoardPanel.module.css';

function ControlPanel({
  step,
  maxStep,
  isManualMode,
  onClear,
  onBack,
  onBack10,
  onForward,
  onForward10,
  onFull,
  onToggleManual,
  toggleType
}) {
  // Disable step buttons if watching live game
  const disableStepButtons = toggleType === 'manual-live' && !isManualMode;

  // Always disable CLEAR and FULL in manual mode
  const disableClearFull = isManualMode;

  return (
    <div className={styles.controls}>
      <div className={styles['controls-left']}>
        <button className={styles.rectButton} disabled={disableClearFull} onClick={onClear}>CLEAR</button>
      </div>
      <div className={styles['controls-center']}>
        <button
          className={styles.iconButton}
          disabled={disableStepButtons || step <= 0}
          onClick={onBack10}
          title="Back 10">⏮️</button>
        <button
          className={styles.iconButton}
          disabled={disableStepButtons || step <= 0}
          onClick={onBack}
          title="Back 1">◀️</button>
        <span className={styles.moveCounter}>
          {isManualMode ? `Manual: ${step}` : `Move: ${step} / ${maxStep}`}
        </span>
        <button
          className={styles.iconButton}
          disabled={disableStepButtons || step >= maxStep}
          onClick={onForward}
          title="Forward 1">▶️</button>
        <button
          className={styles.iconButton}
          disabled={disableStepButtons || step >= maxStep}
          onClick={onForward10}
          title="Forward 10">⏭️</button>
      </div>
      <div className={styles['controls-right']}>
        <button className={styles.rectButton} disabled={disableClearFull} onClick={onFull}>FULL</button>
        {onToggleManual && toggleType === 'manual-auto' && (
          <button className={styles.rectButton} onClick={onToggleManual}>
            {isManualMode ? 'Auto' : 'Manual'}
          </button>
        )}
        {onToggleManual && toggleType === 'manual-live' && (
          <button className={styles.rectButton} onClick={onToggleManual}>
            {isManualMode ? 'Live' : 'Manual'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ControlPanel;