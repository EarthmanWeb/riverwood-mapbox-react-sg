import React from "react";
import { Routes, Route } from 'react-router-dom';
export const MapContext = React.createContext();
import "./App.css";
import { Navbar } from "./components/Navbar";
import { MapContainer } from "./MapContainer";

function App() {
  // console.log('App rendering, current path:', window.location.pathname);
  
  return (
    <div id="container" className="site-container">
      <a className="skip-link screen-reader-text" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <div className="map-container">
          <Routes>
            <Route path="/" element={<MapContainer MapContext={MapContext} />} />
            <Route path="/:slug" element={<MapContainer MapContext={MapContext} />} />
          </Routes>
        </div>
      </main>
      <footer id="colophon" className="site-footer p-0 m-0">
        <div className="site-info p-0 m-0">
          <p className="app-footer__credit p-0 m-0">© 2024 <a className="home-link" href="/">Riverwood Properties</a></p>
        </div>
      </footer>
    </div>
  );
}

export default App;
