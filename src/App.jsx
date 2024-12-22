import React from "react";
export const MapContext = React.createContext();
import "./App.css";
import { Navbar } from "./components/Navbar";
import { MapContainer } from "./MapContainer";

function App() {
  return (
    <div id="container" className="site-container">
      <a className="skip-link screen-reader-text" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <div className="map-container">
          <MapContainer MapContext={MapContext} />
        </div>
      </main>
      <footer id="colophon" className="site-footer">
        <div className="site-info">
          <p className="app-footer__credit">© 2024 <a className="home-link" href="/">Riverwood Properties</a></p>
        </div>
      </footer>
    </div>
  );
}

export default App;
