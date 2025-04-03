import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import './index.css';
import App from './App';
import Go from './pages/Go';
import Rules from './pages/Rules'; // Import the Rules component
import Board from './pages/Board'; // Import the Board component
import Settings from './pages/Settings'; // Import the Settings component
import { GameStateProvider } from './components/GameStateContext';
import PathLogger from './pathlogger'; 
import NotFound from './notfound'; 

const baseUrl = process.env.REACT_APP_BASE_URL;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GameStateProvider>
    <Router basename = {baseUrl}>
      <PathLogger />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/playgo" element={<Go />} />
        <Route path="/gorules" element={<Rules />} />
        <Route path="/chooseboard" element={<Board />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} /> {/* This will catch all undefined routes */}
      </Routes>
    </Router>
  </GameStateProvider>
);