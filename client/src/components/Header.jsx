import React from 'react';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/Header.css';

const Header = ({ darkMode, setDarkMode }) => {
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
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
          <Link to="/contact">Contact</Link>
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
          <Link to="/account" className="account">Account</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;