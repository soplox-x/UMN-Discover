import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import './App.css';
import Calendar from './components/Calendar'; 

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <Routes>
          <Route path="/" element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="*" element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;