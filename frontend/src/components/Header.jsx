import { useNavigate } from 'react-router-dom';
import './Header.css';
import logo from "../assets/logo.png";
import profil from "../assets/profil.png";

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Hier würde man die Logout-Logik implementieren
        console.log("User logged out");
        navigate('/login');
    };

    return (
        <header className="header">
            <img src={logo} alt="FlatFlow Logo" className="logo"/>
            <div className="profile">
            <img
                    src={profil}
                    alt="Profil"
                    onClick={handleLogout}
                    className="profil"
                />
            </div>
        </header>
    );
};

export default Header;
