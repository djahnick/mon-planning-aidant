// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import Planning from './components/Planning';
import Clients from './components/Clients';
import Employes from './components/Employes';
import Recap from './components/Recap';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-blue-50">
        {/* Barre de navigation */}
        <AppNavbar />
        {/* Contenu principal */}
        <div className="container mx-auto py-6">
          <Routes>
            <Route path="/" element={<Planning />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/employes" element={<Employes />} />
            <Route path="/recap" element={<Recap />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
