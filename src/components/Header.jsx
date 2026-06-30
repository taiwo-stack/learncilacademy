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
            <span className="logo-tagline">committed to building Excellent foundation</span>
          </div>
        </div>

        {/* Desktop and Mobile navigation links */}
        <ul className={`nav-links ${mobileOpen ? 'show' : ''}`}>
          {!isDashboard ? (
            <>
              <li><a onClick={() => handleNavClick('home')}>Home</a></li>
              <li><a onClick={() => handleNavClick('about')}>About</a></li>
              <li><a onClick={() => handleNavClick('courses')}>Courses</a></li>
              <li><a onClick={() => handleNavClick('teachers')}>Teachers</a></li>
              <li><a onClick={() => handleNavClick('register')}>Register</a></li>
              <li><a onClick={() => handleNavClick('contact')}>Contact</a></li>
              
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
                Sign In
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
