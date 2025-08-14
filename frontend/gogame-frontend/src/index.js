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
import Rules from './pages/Rules'; 
import SGFViewer from './pages/SGFView';
import FAQ from './pages/FAQ';
import Multiplayer from './pages/Multiplayer';
import { GameStateProvider } from './components/GameStateContext';
import PathLogger from './pathlogger'; 
import NotFound from './notfound'; 

/* Reads base URL for routing from environment variables, 
   this is important for production hosting under subpaths */
const baseUrl = process.env.REACT_APP_BASE_URL;
const root = ReactDOM.createRoot(document.getElementById('root'));
// The main app entry point
root.render(
   // Wraps the entire app in a context provider for game state
  <GameStateProvider>
    {/* BrowserRouter handles URL-based navigation */}
    <Router basename = {baseUrl}>
      {/* Logs path changes */}
      <PathLogger />
      <Routes>
        {/* Define all available routes */}
        <Route path="/" element={<App />} />
        <Route path="/play" element={<Go />} />
        <Route path="/multiplayer" element={<Multiplayer/>} />
        <Route path="/sgf" element={<SGFViewer />} />
        <Route path="/gorules" element={<Rules />} />
        <Route path="/faq" element={<FAQ />} />
        {/* Catch-all for undefined routes */}
        <Route path="*" element={<NotFound />} /> 
      </Routes>
    </Router>
  </GameStateProvider>
);