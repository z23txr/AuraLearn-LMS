import React from 'react';
import { FiBell, FiSearch, FiMessageSquare } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
    // LocalStorage se user ka data nikalna
    const user = JSON.parse(localStorage.getItem('auraUser'));

    return (
        <header className="aura-header">
            {/* Search Section */}
            <div className="header-search">
                <FiSearch className="search-icon" />
                <input type="text" placeholder="Search for courses, lessons..." />
            </div>
            
            {/* Right Side Actions */}
            <div className="header-actions">
                {/* AI Chat Notification (Aapke AI idea ke liye) */}
                <div className="action-icon-wrapper">
                    <FiMessageSquare className="action-icon" />
                    <span className="dot-badge purple"></span>
                </div>

                {/* General Notification Bell */}
                <div className="action-icon-wrapper">
                    <FiBell className="action-icon" />
                    <span className="dot-badge blue"></span>
                </div>

                {/* User Info Section */}
                <div className="header-user-profile">
                    <div className="user-text">
                        <p className="welcome-msg">Welcome back,</p>
                        <p className="user-name">{user?.name || 'Scholar'}</p>
                    </div>
                    <div className="user-avatar-small">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;