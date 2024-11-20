import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Global.css';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Automatische Weiterleitung nach 3 Sekunden
        const timer = setTimeout(() => {
            navigate('/login');
        }, 3000);

        return () => clearTimeout(timer); // Timer bereinigen, falls die Komponente entladen wird
    }, [navigate]);

    return (
        <div className="logout-message">
            <h1>Du wurdest erfolgreich ausgeloggt!</h1>
        </div>
    );
};

export default Logout;
