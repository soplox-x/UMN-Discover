import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaGithub, FaDiscord } from 'react-icons/fa';

const Footer = () => {
  return (
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
              <li><Link to="/clubs">clubs</Link></li>
              <li><Link to="/map">Map</Link></li>
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
  );
};

export default Footer;
