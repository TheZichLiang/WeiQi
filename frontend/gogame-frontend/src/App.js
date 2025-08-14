import {Link} from "react-router-dom";
import "./App.css";

function App() {
  // Base URL for loading static assets
  const baseUrl = process.env.REACT_APP_BASE_URL;
  return (
    <div className="App">
      {/* ===== Navigation Bar ===== */}
      <nav className="navbar-container">
        {/* Logo section (Tydebreaker Systems Logo) */}
        <div className="navbar-logo">
          <img src={`${baseUrl}/assets/logo.png`} alt="Logo" className="logo" />
        </div>
        {/* Navigation bar links (clickables) */}
        <div className="navbar-links">
          <Link to="/">HOME</Link>
          <Link to="/gorules">GAME RULES</Link>
          <Link to= "/faq">FAQ</Link>
        </div>
      </nav>
      {/* ===== Main Content Section ===== */}
      <section className = "content-section">
        {/* Introductory title & text */}
        <div className="hero-section">
           <div className="hero-content">
            <h1>WELCOME TO GO</h1>
            <p>
              Discover the ancient game of Go, a strategic board game that's been
              played for thousands of years dating back to ancient China.
              Navigate through our site to learn the rules, choose your board, and
              adjust your settings for an optimal gaming experience.
            </p>
            {/* Main Home page display buttons */}
            <div className="button-container">
              <Link to="/play" style={{ textDecoration: "none" }}>
                <button>PLAY</button>
              </Link>
              <Link to="/multiplayer" style={{ textDecoration: "none" }}>
                <button>MULTIPLAYER</button>
              </Link>
              <Link to="/sgf" style={{ textDecoration: "none" }}>
                <button>SGF VIEWER</button>
              </Link>
            </div>
          </div>
        </div>
        {/* Custom Home page image for the Go board */}
        <div className="image-container">
          <img src={`${baseUrl}/assets/GOBACKGROUND.png`} alt="Go board" />
        </div>
      </section>
      {/* ===== Footer ===== */}
      <footer className="footer">
        <p>© 2025 TydeBreaker Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
