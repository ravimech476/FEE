import React, { useState } from 'react';
import './LoginPage.css';
import apiService from '../services/apiService';
import logo from '../assets/logo.png'; // adjust path as needed


const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.login({ username, password });
      
      if (response.success && response.data) {
        const user = response.data.user;
        onLogin({ 
          ...user,
          type: user.role, // Map role to type for compatibility
          token: response.data.token
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Branding */}
      <div className="login-left">
        <div className="login-content">
          {/* Jasmine Logo */}
          <div className="jasmine-logo">
            <img
                src={logo}
                alt="Jasmine Logo"
                style={{ height: '40px', width: 'auto' }}
/>

            {/* <span className="logo-text">Jasmine</span> */}
          </div>
          
          {/* Tagline */}
          <div className="tagline">
            <h2>Your Partner in</h2>
            <h2>Sustainable Innovation</h2>
          </div>
          
          {/* Copyright */}
          <div className="copyright">
            <p>© copyright Jasmine All Rights Reserved</p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="floral-background">
          {/* Decorative flowers */}
          <div className="flower flower-1">🌸</div>
          <div className="flower flower-2">🌺</div>
          <div className="flower flower-3">🌼</div>
          <div className="flower flower-4">🌻</div>
          
          <div className="login-form-container">
            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Sam@gmail.com"
                    className="form-control"
                    required
                    disabled={isLoading}
                  />
                  {username && (
                    <div className="input-icon success">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="@1234"
                    className="form-control"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="input-icon password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="forgot-password">
                <a href="#forgot">Forgot Password</a>
              </div>
              
              <button 
                type="submit" 
                className="sign-in-btn"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              <div className="demo-accounts">
                <p><strong>Demo Accounts:</strong></p>
                <p>Admin: admin / admin123</p>
                <p>Customer: demo_customer / demo123</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;