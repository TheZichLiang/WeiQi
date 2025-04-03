import React from 'react';
import boardstyle from "./Board.module.css";
import {useGameState} from "../components/GameStateContext";

function Board() {
  const {boardSize, setBoardSize} = useGameState();
  const baseUrl = process.env.REACT_APP_BASE_URL;

  const boardSizeChange = (event) => {
    setBoardSize(event.target.value);
  };

  return (
    <div className = {boardstyle.boardContainer}>
      <h1 className = {boardstyle.title}>CHOOSE YOUR BOARD</h1>
      <form className = {boardstyle.formContainer}>
        <div className = {boardstyle.buttonGroup}>
          <div className= {boardstyle.radioContainer}>
            <input type = "radio" id = "small" className={boardstyle.input} name = "boardtype" value = "9" onChange={boardSizeChange} checked = {boardSize === '9'}/>
            <img src = {`${baseUrl}/assets/GO9x9.png`} alt = "9x9" className={boardstyle.img} />
            <label htmlFor = "small" className={boardstyle.label}>9x9</label>
          </div>
          <div className= {boardstyle.radioContainer}>
            <input type = "radio" id = "medium" className={boardstyle.input} name = "boardtype" value = "13" onChange={boardSizeChange} checked = {boardSize === '13'}/>
            <img src = {`${baseUrl}/assets/GO13x13.png`}  alt = "13x13" className={boardstyle.img} />
            <label htmlFor = "medium" className={boardstyle.label} >13x13</label>
          </div>
          <div className= {boardstyle.radioContainer}>
            <input type = "radio" id = "large" className={boardstyle.input} name = "boardtype" value = "19" onChange={boardSizeChange} checked = {boardSize === '19'}/>
            <img src = {`${baseUrl}/assets/GO19x19.png`}  alt = "19x19" className={boardstyle.img} />
            <label htmlFor = "large" className={boardstyle.label} >19x19</label>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Board;