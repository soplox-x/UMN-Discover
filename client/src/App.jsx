import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Calendar from './components/Calendar';
import GradeSearch from './components/GradeSearch';
import CourseDetail from './components/CourseDetail';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './components/Profile';
import Social from './components/Social';
import UserProfile from './components/UserProfile';
import './App.css';
import Professors from './components/Professors';
import StudySpots from './components/study_spot_code/StudySpots';
import WestBankPage from './components/study_spot_code/WestBankPage';
import EastBankPage from './components/study_spot_code/EastBankPage';
import StPaulPage from './components/study_spot_code/StPaulPage';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (authChecked) return;

    const checkAuth = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        if (token && userParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userParam));
            setUser(userData);
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error('Error processing OAuth callback:', error);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else {
          const existingToken = localStorage.getItem('authToken');
          const existingUserData = localStorage.getItem('userData');
          
          if (existingToken && existingUserData) {
            try {
              const parsedUser = JSON.parse(existingUserData);
              setUser(parsedUser);
            } catch (error) {
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setAuthLoading(false);
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [authChecked]);

  const handleAuthSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('oauth_processed');
  };
  if (authLoading) {
    return (
      <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`} style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid transparent',
            borderTop: '4px solid var(--primary-medium)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <Router>
      <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <Header 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
          user={user}
          onAuthSuccess={handleAuthSuccess}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/professors" element={<Professors />} />
          <Route path="/grades" element={<GradeSearch />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/studyspots" element={<StudySpots />} />
          <Route path="/social" element={<Social user={user} />} />
          <Route path="/profile/:username" element={<UserProfile user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/studyspots/westbank" element={<WestBankPage />} />
          <Route path="/studyspots/eastbank" element={<EastBankPage />} />
          <Route path="/studyspots/stpaul" element={<StPaulPage />} />
          <Route path="*" element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;