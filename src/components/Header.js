import React from 'react';
import './Header.css';
import logo from '../assets/logo.png'; // adjust path as needed


const Header = ({ userType, user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {/* <div className="logo"> */}
            {/* <div className="logo-icon"> */}
              <img
                src={logo}
                alt="Jasmine Logo"
                style={{ height: '40px', width: 'auto' }}
              />
            {/* </div> */}
          {/* </div> */}
        </div>

        <div className="header-right">
          <div className="user-info">
            <span className="user-type">{userType === 'admin' ? 'Admin' : 'Customer'}</span>
            <span className="user-type">
              {user?.email || user?.username || (userType === 'admin' ? 'admin@gmail.com' : 'customer@gmail.com')}
            </span>
            <div className="user-avatar">
              {userType === 'admin' ? 'A' : (user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'C')}
            </div>
          </div>

          <button
            className="btn logout-btn"
            onClick={onLogout}
          >
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;