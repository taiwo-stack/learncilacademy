import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../services/dataService';
import { hasSupabaseConfig } from '../supabaseClient';
import '../styles/Login.css';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await signIn(email, password);
      onLoginSuccess(user);
      
      // Route dynamically to the correct dashboard based on detected role
      if (user.role === 'student') {
        navigate('/student');
      } else if (user.role === 'tutor') {
        navigate('/tutor');
      } else if (user.role === 'admin') {
        navigate('/admin');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img src="/images/logo_icon.png" alt="Foundaxia Icon" className="login-logo-icon" />
            <img src="/images/logo_text.png" alt="Foundaxia Brand" className="login-logo-text" />
          </div>
          
          <h2>Sign In to Foundaxia</h2>
          <p className="login-subtitle">Access your personal learning portal</p>
          
          {error && <div className="login-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          

        </div>
      </div>
    </div>
  );
}
