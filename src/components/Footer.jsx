import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const handleNavClick = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '8px', marginBottom: '1.2rem' }}>
            <img src="/images/logo_icon.png" alt="Foundaxia Icon" style={{ height: '35px', objectFit: 'contain' }} />
            <img src="/images/logo_text.png" alt="Foundaxia Brand" style={{ height: '25px', objectFit: 'contain' }} />
          </div>
          <p>
            One-on-One focus on your children's development through innovative 
            educational programs, dedicated care, and personalized tutoring in a 
            nurturing environment.
          </p>
          <div className="social-icons">
            <a href="#" className="social-icon">f</a>
            <a href="#" className="social-icon">t</a>
            <a href="#" className="social-icon">in</a>
            <a href="#" className="social-icon">ig</a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a onClick={() => handleNavClick('home')}>Home</a></li>
            <li><a onClick={() => handleNavClick('about')}>About</a></li>
            <li><a onClick={() => handleNavClick('courses')}>Courses</a></li>
            <li><a onClick={() => handleNavClick('teachers')}>Teachers</a></li>
            <li><a onClick={() => handleNavClick('register')}>Register</a></li>
            <li><a onClick={() => handleNavClick('contact')}>Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Programs</h3>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/student'); }}>Student Portal</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/tutor'); }}>Tutor Portal</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>Admin Dashboard</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Academic Calendar</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Parent Resources</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>School Policies</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Find Us</h3>
          <ul>
            <li>📍 123 Education Street</li>
            <li>📍 Learning City, LC 12345</li>
            <li>📞 +1 (555) 123-4567</li>
            <li>✉️ info@foundaxia.com</li>
            <li>🌐 www.foundaxia.com</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Foundaxia. All rights reserved. | Privacy Policy | Terms of Service</p>
      </div>
    </footer>
  );
}
