import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaGraduationCap,
  FaUtensils, FaStar, FaSearch, FaBook, FaMoon, FaSun,
  FaGithub, FaDiscord, FaChartBar, FaUserTie, FaCoffee
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import AuthModal from './AuthModal';
import '../styles/HomePage.css';

const HomePage = ({ darkMode, setDarkMode }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  const handleAuthSuccess = (userData, token) => {
    setShowAuthModal(false);
  };

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

  const navigationItems = [
    {
      icon: <FaChartBar />,
      title: "Grades",
      description: "Course grade distributions",
      path: "/grades",
      color: "blue"
    },
    {
      icon: <FaUsers />,
      title: "Clubs",
      description: "Student organizations",
      path: "/clubs",
      color: "green"
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Map",
      description: "Campus navigation",
      path: "/map",
      color: "orange"
    },
    {
      icon: <FaCalendarAlt />,
      title: "Calendar",
      description: "Schedule & events",
      path: "/calendar",
      color: "purple"
    },
    {
      icon: <FaUserTie />,
      title: "Professors",
      description: "Faculty reviews",
      path: "/professors",
      color: "red"
    },
    {
      icon: <FaCoffee />,
      title: "Study Spots",
      description: "Best places to study",
      path: "/studyspots",
      color: "yellow"
    }
  ];

  const quickLinks = [
    { icon: <FaUsers />, label: "Clubs", count: "0" },
    { icon: <FaUsers />, label: "Users", count: "0" },
    { icon: <FaMapMarkerAlt />, label: "Study Spots", count: "0" }
  ];

  const duplicatedFeatures = [...features, ...features, ...features];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`home-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <section className="hero-section">
        <div className="hero-content">
          <motion.h2 
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            University Of Minnesota <span className="highlight">Discover</span>
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

      <section className="navigation-section">
        <div className="section-header">
          <motion.h3 
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explore UMN
          </motion.h3>
          <motion.p 
            className="section-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Quick access to all the tools you need for university life
          </motion.p>
        </div>
        
        <div className="navigation-grid">
          {navigationItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Link to={item.path} className={`nav-item ${item.color}`}>
                <motion.div
                  className="nav-item-content"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="nav-icon-container">
                    {item.icon}
                  </div>
                  <div className="nav-text">
                    <h4 className="nav-title">{item.title}</h4>
                    <p className="nav-description">{item.description}</p>
                  </div>
                  <div className="nav-arrow">→</div>
                </motion.div>
              </Link>
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
        
        <div className="features-carousel-container">
          <div className="features-carousel">
            <div className="features-track">
              {duplicatedFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className={`feature-card ${feature.color}`}
                >
                  <div className="feature-icon-container">
                    {feature.icon}
                  </div>
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
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
            Create your profile today and start exploring.
          </motion.p>
          <motion.div 
            className="cta-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button className="primary-button" onClick={openAuthModal}>
              <FaUsers className="button-icon" />
              <span>Create Profile</span>
            </button>
            <Link to="/map" className="secondary-button">
              <FaMapMarkerAlt className="button-icon" />
              <span>Explore Campus</span>
            </Link>
          </motion.div>
        </div>
      </section>
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default HomePage;