import React, { createContext, useContext, useState } from 'react';

const GameStateContext = createContext();

export const useGameState = () => useContext(GameStateContext);

export const GameStateProvider = ({ children }) => {
  const [boardSize, setBoardSize] = useState('19');
  const [aiLevel, setAiLevel] = useState('beginner');

  const value = {
    boardSize,
    setBoardSize,
    aiLevel,
    setAiLevel
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};