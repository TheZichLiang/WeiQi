import React from 'react';
import styles from './ControlPanel.module.css'; 

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
  return (
    <div className={styles.controls}>
      <div className={styles['controls-left']}>
        <button className={styles.rectButton} disabled={isManualMode} onClick={onClear}>CLEAR</button>
      </div>
      <div className={styles['controls-center']}>
        <button
          className={styles.iconButton}
          disabled={step <= 0}
          onClick={onBack10}
          title="Back 10">⏮️</button>
        <button
          className={styles.iconButton}
          disabled={step <= 0}
          onClick={onBack}
          title="Back 1">◀️</button>
        <span className={styles.moveCounter}>
          {isManualMode ? `Manual: ${step}` : `Move: ${step} / ${maxStep}`}
        </span>
        <button
          className={styles.iconButton}
          disabled={step >= maxStep}
          onClick={onForward}
          title="Forward 1">▶️</button>
        <button
          className={styles.iconButton}
          disabled={step >= maxStep}
          onClick={onForward10}
          title="Forward 10">⏭️</button>
      </div>
      <div className={styles['controls-right']}>
        <button className={styles.rectButton} disabled={isManualMode} onClick={onFull}>FULL</button>
        {onToggleManual && toggleType === 'manual-auto' && (
          <button className={styles.rectButton} onClick={onToggleManual}>
            {isManualMode ? 'Auto' : 'Manual'}
          </button>
        )}

        {onToggleManual && toggleType === 'manual-live' && (
          <button className={styles.rectButton} onClick={onToggleManual}>
            {isManualMode ? 'Switch to Live' : 'Switch to Manual'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ControlPanel;