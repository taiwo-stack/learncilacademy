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
      <div className="footer-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', maxWidth: '1200px', margin: '0 auto', padding: '3.5rem 2rem 2.5rem' }}>
        {/* Contact block */}
        <div className="footer-section">
          <div className="footer-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '8px', marginBottom: '1.2rem' }}>
            <img src="/images/logo_icon.png" alt="Foundaxia Icon" style={{ height: '35px', objectFit: 'contain' }} />
            <img src="/images/logo_text.png" alt="Foundaxia Brand" style={{ height: '25px', objectFit: 'contain' }} />
          </div>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6', marginBottom: '1.2rem' }}>
            One-on-One Tutoring That Builds Strong Foundations for Lifelong Success.
          </p>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div>✉️ support@foundaxia.com</div>
            <div>📞 +1 (555) 368-6329</div>
          </div>
          <div className="social-icons" style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
            <a href="#" className="social-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: 'white', textDecoration: 'none', fontSize: '0.85rem' }} title="Facebook">FB</a>
            <a href="#" className="social-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: 'white', textDecoration: 'none', fontSize: '0.85rem' }} title="Instagram">IG</a>
            <a href="#" className="social-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: 'white', textDecoration: 'none', fontSize: '0.85rem' }} title="LinkedIn">LN</a>
            <a href="#" className="social-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: 'white', textDecoration: 'none', fontSize: '0.85rem' }} title="YouTube">YT</a>
          </div>
        </div>

        {/* Company Column */}
        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li><a onClick={() => handleNavClick('about')}>About</a></li>
            <li><a onClick={() => alert('FoundaXia Careers - Coming Soon!')}>Careers</a></li>
            <li><a onClick={() => alert('Apply to become a tutor! Contact us at support@foundaxia.com')}>Become a Tutor</a></li>
            <li><a onClick={() => handleNavClick('contact')}>Contact</a></li>
          </ul>
        </div>

        {/* For Families Column */}
        <div className="footer-section">
          <h3>For Families</h3>
          <ul>
            <li><a onClick={() => handleNavClick('how-it-works')}>How It Works</a></li>
            <li><a onClick={() => handleNavClick('courses')}>Pricing</a></li>
            <li><a onClick={() => handleNavClick('faq')}>FAQs</a></li>
            <li><a onClick={() => alert('Parent Guides coming soon!')}>Parent Guides</a></li>
          </ul>
        </div>

        {/* Subjects Column */}
        <div className="footer-section">
          <h3>Subjects</h3>
          <ul>
            <li><a onClick={() => handleNavClick('subjects-section')}>Math</a></li>
            <li><a onClick={() => handleNavClick('subjects-section')}>English</a></li>
            <li><a onClick={() => handleNavClick('subjects-section')}>Science</a></li>
            <li><a onClick={() => handleNavClick('subjects-section')}>Test Prep</a></li>
            <li><a onClick={() => handleNavClick('subjects-section')}>World Languages</a></li>
            <li><a onClick={() => handleNavClick('subjects-section')}>Coding</a></li>
          </ul>
        </div>

        {/* Legal Column */}
        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li><a onClick={() => alert('Terms of Use')}>Terms of Use</a></li>
            <li><a onClick={() => alert('Privacy Policy')}>Privacy Policy</a></li>
            <li><a onClick={() => alert('Community Guidelines')}>Community Guidelines</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem 2rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
        <p>&copy; 2026 FoundaXia. All rights reserved.</p>
      </div>
    </footer>
  );
}
