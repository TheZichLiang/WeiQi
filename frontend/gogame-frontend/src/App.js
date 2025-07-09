import {Link} from "react-router-dom";
import './App.css';

function App() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  return (
    <div className="App" style={{
      backgroundImage: `url(${baseUrl}/assets/GOBACKGROUND.png)`
    }}>
        <h1 className = "app-h1">WELCOME TO GO</h1>
        <div className = 'buttongroup'>
            <Link to= "/play" style={{ textDecoration: 'none' }}><button>PLAY</button></Link>
            <Link to="/multiplayer" style={{ textDecoration: 'none' }}><button>MULTIPLAYER</button></Link>
            <Link to="/sgf" style={{ textDecoration: 'none' }}><button>VIEW SGF GAME</button></Link>
            <Link to= "/gorules" style={{ textDecoration: 'none' }}><button>GAME RULES</button></Link>
            <Link to= "/chooseboard" style={{ textDecoration: 'none' }}><button>CHOOSE BOARD</button></Link>
            <Link to = "/settings" style={{ textDecoration: 'none' }}><button>SETTINGS</button></Link>
        </div>
        <h2>Adjust your preferences and press play to begin playing GO.</h2>
    </div>
  );
}

export default App;
