import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Hier würde man die Logout-Logik implementieren
        console.log("User logged out");
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="logo">FlatFlow</div>
            <div className="profile">
                <img
                    src="/path/to/profile-icon.png"
                    alt="Profil"
                    onClick={handleLogout}
                    className="profile-icon"
                />
            </div>
        </header>
    );
};

export default Header;
