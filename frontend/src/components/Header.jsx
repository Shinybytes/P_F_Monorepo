import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../Global.css';
import logo from "../assets/FlatFlow_Logo.png";
import profil from "../assets/profil.png";

const Header = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false); // State für das Burger-Menü

    const handleLogout = () => {
        // Hier erfolgt die Logout-Logik
        localStorage.removeItem('token');
        console.log("User logged out");

        // Zeige die Logout-Meldung
        navigate('/logout'); // Gehe auf die Logout-Meldeseite
        setTimeout(() => {
            // Nach 3 Sekunden zur Login-Seite leiten
            navigate('/login');
        }, 3000);
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu); // Menü ein-/ausklappen
    };

    const goToDashboard = () => {
        navigate('/'); // Weiterleitung zum Dashboard
    };

    const goToProfile = () => {
        navigate('/profile'); // Weiterleitung zur Profilseite
    };

    return (
        <header className="header">
            {/* Klick auf das Logo leitet zum Dashboard */}
            <img src={logo} alt="FlatFlow_Logo" className="logo" onClick={goToDashboard} style={{ cursor: 'pointer' }} />
            <div className="profile">
                <img
                    src={profil}
                    alt="Profil"
                    onClick={toggleMenu} // Klick, um das Menü zu zeigen
                    className="profil"
                />
                {showMenu && (
                    <div className="dropdown-menu"> {/* Dropdown-Menü */}
                        <button onClick={goToProfile} className="dropdown-item">Profil</button>
                        <button onClick={handleLogout} className="dropdown-item">Logout</button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
