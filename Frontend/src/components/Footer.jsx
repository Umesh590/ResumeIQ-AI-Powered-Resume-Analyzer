
import React from "react";
import { Link } from "react-router";
import "../style/footer.scss";

const Footer = () => {
  return (
    <footer className="main-footer" id="about">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            ✦ Interview<span>AI</span>
          </Link>

          <p>
            Prepare smarter, practice better, and approach
            every interview with confidence.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/">My Reports</Link>
          <Link to="/login">Login</Link>
        </div>

        <div className="footer-links">
          <h3>Support</h3>
          <a href="mailto:umeshjha7890@gmail.com">Contact Us</a>
          <a href="#about">About Us</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} InterviewAI.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
