import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaDatabase, FaCloud, FaUserShield, FaEnvelope, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <motion.div 
          className="privacy-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="privacy-icon">
            <FaShieldAlt />
          </div>
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        <motion.div 
          className="privacy-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <section className="privacy-section">
            <div className="section-icon">
              <FaUserShield />
            </div>
            <h2>Information We Collect</h2>
            <div className="section-content">
              <h3>University Email Authentication</h3>
              <p>
                UMN Discover requires authentication using your University of Minnesota email address. 
                We only accept email addresses from the following UMN domains:
              </p>
              <ul className="email-domains">
                <li>@umn.edu</li>
                <li>@tc.umn.edu</li>
                <li>@d.umn.edu</li>
                <li>@r.umn.edu</li>
                <li>@c.umn.edu</li>
                <li>@m.umn.edu</li>
                <li>@crk.umn.edu</li>
                <li>@morris.umn.edu</li>
                <li>@duluth.umn.edu</li>
                <li>@rochester.umn.edu</li>
              </ul>

              <h3>Profile Information</h3>
              <p>When you create a profile, we collect:</p>
              <ul>
                <li>Your UMN email address</li>
                <li>Username and display name</li>
                <li>Profile bio (optional)</li>
                <li>Profile and banner images (optional)</li>
                <li>Social media links (optional)</li>
              </ul>

              <h3>Social Features Data</h3>
              <p>If you use our social features, we collect:</p>
              <ul>
                <li>Posts and comments you create</li>
                <li>Images you upload to posts</li>
                <li>Users you follow and who follow you</li>
                <li>Likes and interactions on posts</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <div className="section-icon">
              <FaDatabase />
            </div>
            <h2>How We Store Your Data</h2>
            <div className="section-content">
              <h3>Database Storage</h3>
              <p>
                Your account information and social data are stored securely in a PostgreSQL database. 
                This includes your profile information, posts, comments, and social connections.
              </p>

              <h3>Image Storage</h3>
              <p>
                Profile pictures, banner images, and post images are stored using Cloudinary, 
                a secure cloud based image management service. Images are optimized and served 
                through Cloudinary's content delivery network.
              </p>

              <h3>Authentication</h3>
              <p>
                We use Google OAuth 2.0 for secure authentication. We do not store your password. 
                Authentication is handled through Google's secure systems, and we only receive 
                basic profile information necessary for account creation.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <div className="section-icon">
              <FaLock />
            </div>
            <h2>How We Use Your Information</h2>
            <div className="section-content">
              <p>We use your information to:</p>
              <ul>
                <li>Provide and maintain the UMN Discover platform</li>
                <li>Authenticate your access to the platform</li>
                <li>Enable social features like following other users</li>
                <li>Display your profile and posts to other UMN students</li>
                <li>Improve our services and user experience</li>
              </ul>

              <h3>Information Sharing</h3>
              <p>
                Your profile information and posts are visible to other authenticated UMN students 
                on the platform. We do not share your information with third parties except:
              </p>
              <ul>
                <li>As required by law or legal process</li>
                <li>To protect the rights and safety of our users</li>
                <li>With service providers (like Cloudinary) necessary to operate the platform</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <div className="section-icon">
              <FaEnvelope />
            </div>
            <h2>UMN Email Requirement</h2>
            <div className="section-content">
              <p>
                UMN Discover is exclusively for University of Minnesota students. 
                We verify your affiliation through your UMN email address. This ensures:
              </p>
              <ul>
                <li>A safe, university focused community</li>
                <li>Relevant content and connections</li>
                <li>Compliance with university policies</li>
                <li>Protection against unauthorized access</li>
              </ul>
              <p>
                Your email address is used solely for authentication and account management. 
                We do not send marketing emails or share your email with third parties.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <div className="section-icon">
              <FaCloud />
            </div>
            <h2>Data Security</h2>
            <div className="section-content">
              <p>We implement several security measures to protect your data:</p>
              <ul>
                <li>Secure HTTPS connections for all data transmission</li>
                <li>OAuth 2.0 authentication through Google</li>
                <li>Encrypted database storage</li>
                <li>Secure cloud image storage through Cloudinary</li>
                <li>Regular security updates and monitoring</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2>Your Rights</h2>
            <div className="section-content">
              <p>You have the right to:</p>
              <ul>
                <li>Access and update your profile information</li>
                <li>Delete your posts and comments</li>
                <li>Control your social media links and bio</li>
                <li>Delete your account and associated data</li>
                <li>Control who can see your posts and profile</li>
              </ul>
              <p>
                To exercise these rights or if you have questions about your data, 
                please contact us through our <Link to="/support">support page</Link>.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>Student Organization Notice</h2>
            <div className="section-content">
              <p className="disclaimer">
                <strong>Important:</strong> UMN Discover is developed and maintained by the 
                CSCI Social Club, a registered student organization. This platform is independent 
                from and not affiliated with or endorsed by the Regents of the University of Minnesota. 
                The university is not responsible for the content, privacy practices, or data 
                handling of this student created platform.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>Changes to This Policy</h2>
            <div className="section-content">
              <p>
                We may update this privacy policy from time to time. We will notify users of 
                any material changes by posting the new policy on this page and updating the 
                "Last updated" date above.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>Contact Us</h2>
            <div className="section-content">
              <p>
                If you have any questions about this privacy policy or our data practices, 
                please contact us:
              </p>
              <ul>
                <li>Through our <Link to="/support">support page</Link></li>
                <li>Via our <a href="https://discord.gg/XuCXuTsFut" target="_blank" rel="noopener noreferrer">Discord server</a></li>
                <li>On <a href="https://github.com/CSCI-Social-Club-UMN" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              </ul>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;