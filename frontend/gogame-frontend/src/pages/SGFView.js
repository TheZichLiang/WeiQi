// SgfViewer.js
import React, { useEffect, useState } from 'react';
import BoardPanel from "../components/BoardPanel";
import SGFstyles from "./SGFView.module.css";

function cleanSgf(raw) {
  return raw
    .replace(/GN\[[^\]]*\]/, '')
    .replace(/[\[\];]/g, '')
    .trim();
}

function extractGameName(block, index) {
  const m = block.match(/GN\[([^\]]+)\]/);
  return m ? m[1] : `Kifu ${index + 1}`;
}

function SgfViewer() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [gameList, setGameList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    fetch(`${baseUrl}/data/games.txt`)
      .then(r => r.text())
      .then(txt => {
        const blocks = txt.split('<|startoftext|>').map(b => b.trim()).filter(Boolean);
        setGameList(blocks);
      });
  }, [baseUrl]);

  const handleSelectGame = newIndex => {
      setSelectedIndex(newIndex);    
  };

  const selectedSgf = cleanSgf(gameList[selectedIndex] || '');

  return (
    <div className={SGFstyles.container}>
      <div className={SGFstyles.sidebar}>
        <label htmlFor="gameDropdown" className={SGFstyles.dropdownLabel}>SELECT GAME</label>
        <select
          id="gameDropdown"
          className={SGFstyles.dropdown}
          size={5}
          value={selectedIndex}
          onChange={e => handleSelectGame(+e.target.value)}
        >
          {gameList.map((b, i) => (
            <option key={i} value={i}>
              {extractGameName(b, i)}
            </option>
          ))}
        </select>
      </div>
      <BoardPanel key={selectedIndex} gameHistory={selectedSgf} toggleType="manual-auto" />
    </div>
  );
}

export default SgfViewer;