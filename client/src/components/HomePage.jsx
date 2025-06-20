import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaGraduationCap, FaUtensils, 
         FaStar, FaSearch, FaBook, FaMoon, FaSun, FaGithub, FaDiscord } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/HomePage.css';

const HomePage = ({ darkMode, setDarkMode }) => {
  const features = [
    {
      icon: <FaSearch className="feature-icon" />,
      title: "Search & Review",
      description: "Find and review clubs, classes, professors, dining halls, and study spots",
      color: "blue"
    },
    {
      icon: <FaUsers className="feature-icon" />,
      title: "Student Profiles",
      description: "Create personalized profiles with controlled social media links",
      color: "green"
    },
    {
      icon: <FaCalendarAlt className="feature-icon" />,
      title: "Smart Scheduling",
      description: "Auto generate schedules accounting for commutes and club meetings",
      color: "purple"
    },
    {
      icon: <FaMapMarkerAlt className="feature-icon" />,
      title: "Campus Navigation",
      description: "Navigate efficiently via tunnel/skyway map directions",
      color: "orange"
    },
    {
      icon: <FaBook className="feature-icon" />,
      title: "Student Resources",
      description: "Access important student resources from one centralized dashboard",
      color: "red"
    }
  ];

  const quickLinks = [
    { icon: <FaUsers />, label: "Clubs", count: "0" },
    { icon: <FaUsers />, label: "Users", count: "0" },
    { icon: <FaMapMarkerAlt />, label: "Study Spots", count: "0" }
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`home-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="header">
        <div className="header-content">
        <Link to="/" className="logo-container">
        <motion.div
            className="logo"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <img src="/gopher_icon.svg" alt="UMN Gopher Logo" className="logo-icon" />
        </motion.div>
        <div>
            <h1 className="app-name">UMN Discover</h1>
            <p className="tagline">University of Minnesota</p>
        </div>
        </Link>
          <nav className="nav-links">
            <Link to="/features">Features</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/calendar">Calendar</Link>
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
      <section className="hero-section">
        <div className="hero-content">
          <motion.h2 
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            University Of Minnesota <span className="highlight">Descover</span>
          </motion.h2>
          <motion.p 
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The UMN Discover App brings together essential services and functions in one place, 
            making it easier to manage academics, campus navigation, and involvement.
          </motion.p>
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ zIndex: 2, position: 'relative' }}
          >
            <Link to="/signup" className="primary-button">Get Started</Link>
            <Link to="/learn-more" className="secondary-button">Learn More</Link>
          </motion.div>
        </div>
      </section>
      <section className="quick-stats">
        <div className="stats-container">
          {quickLinks.map((link, index) => (
            <motion.div 
              key={index} 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="stat-icon">{link.icon}</div>
              <div className="stat-count">{link.count}</div>
              <div className="stat-label">{link.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="features-section">
        <div className="section-header">
          <motion.h3 
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Features
          </motion.h3>
          <motion.p 
            className="section-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need to navigate university life, all in one place
          </motion.p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className={`feature-card ${feature.color}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="feature-icon-container">
                {feature.icon}
              </div>
              <h4 className="feature-title">{feature.title}</h4>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="cta-section">
        <div className="cta-content">
          <motion.h3 
            className="cta-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Ready to Discover UMN?
          </motion.h3>
          <motion.p 
            className="cta-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Crate your profile today and start exploring.
          </motion.p>
          <motion.div 
            className="cta-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/create-profile" className="primary-button">
              <FaUsers className="button-icon" />
              <span>Create Profile</span>
            </Link>
            <Link to="/explore" className="secondary-button">
              <FaMapMarkerAlt className="button-icon" />
              <span>Explore Campus</span>
            </Link>
          </motion.div>
        </div>
      </section>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-logo">
              <div className="footer-logo-img">
                <FaGraduationCap />
              </div>
              <h4 className="footer-title">UMN Discover</h4>
            </div>
            <p className="footer-description">
              Built by students, for students.
            </p>
            <div className="social-links">
              <a href="https://github.com/CSCI-Social-Club-UMN" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              <a href="https://discord.gg/XuCXuTsFut" target="_blank" rel="noopener noreferrer">
                <FaDiscord />
              </a>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} UMN Discover. All rights reserved.
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-links-column">
              <h5 className="footer-links-title">Quick Links</h5>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/support">Support</Link></li>
                <li><Link to="/privacy">Privacy</Link></li>
              </ul>
            </div>
            <div className="footer-links-column">
              <h5 className="footer-links-title">Resources</h5>
              <ul>
                <li><Link to="/campus-map">Campus Map</Link></li>
                <li><Link to="/calendar">Calendar</Link></li>
                <li><Link to="/student-services">Student Services</Link></li>
                <li><Link to="/help-center">Help Center</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;