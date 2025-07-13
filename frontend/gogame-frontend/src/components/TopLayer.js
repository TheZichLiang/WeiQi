import React from 'react';
import TLstyles from './TopLayer.module.css';

function TopLayer({ baseUrl, gameOver }) {
  return (
    <>
      <div className={TLstyles.topLeft}>
        <span className={TLstyles.columnHeader}>You:</span>
        <img
          src={`${baseUrl}/assets/GOBLACKSTONE.png`}
          alt="Black Stone"
          className={TLstyles.stoneImg}
        />
      </div>
      <div className={TLstyles.topMiddle}>
        <h1 className={TLstyles.title}>
          {gameOver ? 'GAME ENDED' : 'GAME IN SESSION'}
        </h1>
      </div>
      <div className={TLstyles.topRight}>
        <span className={TLstyles.columnHeader}>AI:</span>
        <img
          src={`${baseUrl}/assets/GOWHITESTONE.png`}
          alt="White Stone"
          className={TLstyles.stoneImg}
        />
      </div>
    </>
  );
}

export default TopLayer;
