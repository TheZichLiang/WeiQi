import React from 'react';
import settingstyle from "./Settings.module.css";
import { useGameState } from '../components/GameStateContext';

function Settings() {

  const { aiLevel, setAiLevel } = useGameState();

  const aiLevelChange = (event) => {
    console.log("Changing AI level to:", event.target.value);
    setAiLevel(event.target.value);
  };

  return (
    <div className = {settingstyle.settingContainer}>
      <h1 className= {settingstyle.title}>CHOOSE DIFFICULTY</h1>
      <form className = {settingstyle.formContainer}>
        <div className={settingstyle.buttonGroup}>
            <input type="radio" id="beginner" className={settingstyle.input} name="ailevel" value="beginner" onChange={aiLevelChange} checked={aiLevel === 'beginner'}/>
            <label htmlFor="beginner" className={settingstyle.label}>Beginner</label><br/>
        </div>
        <div className={settingstyle.buttonGroup}>
            <input type="radio" id="ddk" className={settingstyle.input} name="ailevel" value="ddk" onChange={aiLevelChange} checked={aiLevel === 'ddk'} />
            <label htmlFor="ddk" className={settingstyle.label}>DDK</label><br/>
        </div>
        <div className={settingstyle.buttonGroup}>
            <input type="radio" id="sdk" className={settingstyle.input} name="ailevel" value="sdk" onChange={aiLevelChange} checked={aiLevel === 'sdk'}  />
            <label htmlFor="sdk" className={settingstyle.label}>SDK</label><br/>
        </div>
        <div className={settingstyle.buttonGroup}>
            <input type="radio" id="low-dan" className={settingstyle.input} name="ailevel" value="low-dan" onChange={aiLevelChange} checked={aiLevel === 'low-dan'} />
            <label htmlFor="low-dan" className={settingstyle.label}>Low Dan</label><br/>
        </div>
        <div className={settingstyle.buttonGroup}>
            <input type="radio" id="high-dan" className={settingstyle.input} name="ailevel" value="high-dan" onChange={aiLevelChange} checked={aiLevel === 'high-dan'}  />
            <label htmlFor="high-dan" className={settingstyle.label}>High Dan</label>
        </div>
      </form>
  </div>
  );
}

export default Settings;