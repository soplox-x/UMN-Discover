import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import '../styles/Header.css';

const Header = ({ darkMode, setDarkMode, user, onAuthSuccess, onLogout }) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleAuthSuccess = (userData, token) => {
    onAuthSuccess(userData, token);
    setShowAuthModal(false);
    setShowAccountDropdown(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowAccountDropdown(false);
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }).catch(console.error);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        handleLogout();
        alert('Account deleted successfully');
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Failed to delete account');
    }
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
    setShowAccountDropdown(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo-container">
            <motion.div className="logo" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <img src="/gopher_icon.svg" alt="UMN Gopher Logo" className="logo-icon" />
            </motion.div>
            <div>
              <h1 className="app-name">UMN Discover</h1>
              <p className="tagline">University of Minnesota</p>
            </div>
          </Link>
          <nav className="nav-links">
            <Link to="/map">Map</Link>
            <Link to="/clubs">Clubs</Link>
            <Link to="/calendar">Calendar</Link>
            <Link to="/grades">Grades</Link>
            <Link to="/social">Social</Link>
            <Link to="/professors">Professors</Link>
            <Link to="/studyspots">Study Spots</Link>
            <motion.button
              className="theme-toggle"
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </motion.button>
            <div className="account-dropdown" ref={dropdownRef}>
              <button 
                className="account-button"
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              >
                {user ? (user.displayName || user.username) : 'Account'}
                <FaChevronDown className={`chevron ${showAccountDropdown ? 'rotated' : ''}`} />
              </button>
              <AnimatePresence>
                {showAccountDropdown && (
                  <motion.div
                    className="dropdown-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {user ? (
                      <>
                        <Link to="/profile" className="dropdown-item">Profile</Link>
                        <button className="dropdown-item" onClick={handleLogout}>Log Out</button>
                        <button className="dropdown-item delete" onClick={handleDeleteAccount}>Delete Account</button>
                      </>
                    ) : (
                      <>
                        <button className="dropdown-item" onClick={openAuthModal}>Sign In</button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>
      </header>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;