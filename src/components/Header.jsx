import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { signOut } from '../services/dataService';

export default function Header({ currentUser, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = ['/student', '/tutor', '/admin'].some(path => location.pathname.startsWith(path));

  const handleNavClick = (sectionId) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation before scrolling
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    try {
      setMobileOpen(false);
      await signOut();
      onLogout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback logout
      onLogout();
      navigate('/login');
    }
  };

  return (
    <header>
      <nav>
        <div className="logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '310px' }} onClick={() => navigate('/')}>
          <img src="/images/logo_icon.png" alt="Foundaxia Icon" style={{ height: '56px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '240px' }}>
            <img src="/images/logo_text.png" alt="Foundaxia Brand" style={{ height: '28px', objectFit: 'contain', marginBottom: '2px' }} />
            <span className="logo-tagline" style={{ textTransform: 'capitalize', fontSize: '0.72rem', letterSpacing: '0.3px', opacity: 0.85 }}>Committed to Building Excellent Foundations</span>
          </div>
        </div>

        {/* Desktop and Mobile navigation links */}
        <ul className={`nav-links ${mobileOpen ? 'show' : ''}`}>
          {!isDashboard ? (
            <>
              {/* Grades Dropdown */}
              <li className="dropdown">
                <a style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  Grades <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>▼</span>
                </a>
                <ul className="dropdown-menu">
                  <li><a onClick={() => { setMobileOpen(false); handleNavClick('audience-section'); }}>Early Learners (K–5)</a></li>
                  <li><a onClick={() => { setMobileOpen(false); handleNavClick('audience-section'); }}>Middle School</a></li>
                  <li><a onClick={() => { setMobileOpen(false); handleNavClick('audience-section'); }}>High School</a></li>
                  <li><a onClick={() => { setMobileOpen(false); handleNavClick('audience-section'); }}>Homeschool Support</a></li>
                </ul>
              </li>

              {/* Subjects Dropdown */}
              <li className="dropdown">
                <a style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  Subjects <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>▼</span>
                </a>
                <ul className="dropdown-menu">
                  <li><a onClick={() => { setMobileOpen(false); handleNavClick('subjects-section'); }}>Math</a></li>
                  <li><a onClick={() => { setMobileOpen(false); handleNavClick('subjects-section'); }}>Reading &amp; English</a></li>
                  <li><a onClick={() => { setMobileOpen(false); handleNavClick('subjects-section'); }}>Science</a></li>
                  <li><a onClick={() => { setMobileOpen(false); handleNavClick('subjects-section'); }}>Test Prep</a></li>
                  <li><a onClick={() => { setMobileOpen(false); handleNavClick('subjects-section'); }}>World Languages</a></li>
                  <li><a onClick={() => { setMobileOpen(false); handleNavClick('subjects-section'); }}>Coding</a></li>
                </ul>
              </li>

              <li><a onClick={() => handleNavClick('how-it-works')}>How It Works</a></li>
              <li><a onClick={() => handleNavClick('why-us')}>Why FoundaXia</a></li>
              <li><a onClick={() => handleNavClick('courses')}>Pricing</a></li>
              <li><a onClick={() => { setMobileOpen(false); alert('FoundaXia Blog and parent resources coming soon!'); }}>Resources / Blog</a></li>
              
              {/* Add direct Dashboard link if already logged in */}
              {currentUser && currentUser.role !== 'guest' && (
                <li>
                  <a 
                    style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}
                    onClick={() => {
                      setMobileOpen(false);
                      navigate(`/${currentUser.role}`);
                    }}
                  >
                    Dashboard
                  </a>
                </li>
              )}
            </>
          ) : (
            <>
              {currentUser.role === 'student' && (
                <li><a className="active" onClick={() => { setMobileOpen(false); navigate('/student'); }}>Student Dashboard</a></li>
              )}
              {currentUser.role === 'tutor' && (
                <li><a className="active" onClick={() => { setMobileOpen(false); navigate('/tutor'); }}>Tutor Dashboard</a></li>
              )}
              {currentUser.role === 'admin' && (
                <li><a className="active" onClick={() => { setMobileOpen(false); navigate('/admin'); }}>Admin Control Panel</a></li>
              )}
              {currentUser.role !== 'admin' && currentUser.role !== 'tutor' && (
                <li><a onClick={() => { setMobileOpen(false); navigate('/'); }}>Public Site</a></li>
              )}
            </>
          )}

          {/* Authentication Badge & Actions */}
          <li style={{ marginLeft: '10px' }}>
            {(!currentUser || currentUser.role === 'guest') ? (
              <button 
                onClick={() => { setMobileOpen(false); navigate('/login'); }}
                className="btn-next"
                style={{ padding: '0.45rem 1.4rem', fontSize: '0.85rem' }}
              >
                Login
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', fontWeight: '600' }}>
                  👤 {currentUser.full_name || currentUser.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="btn-next"
                  style={{ 
                    padding: '0.45rem 1.1rem', 
                    fontSize: '0.85rem', 
                    background: 'var(--danger)', 
                    boxShadow: '0 4px 10px rgba(220, 53, 69, 0.25)' 
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
          </li>
        </ul>

        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </nav>
    </header>
  );
}
