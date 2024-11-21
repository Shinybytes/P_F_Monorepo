import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Global.css';
import Header from './Header';
import Input from './Input';
import Button from './Button';

const Profile = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Lädt die aktuellen Benutzerdaten (Initialisierung)
    const loadUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/auth/profile', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserData({
                    username: data.username,
                    email: data.email,
                    password: '', // Passwort bleibt leer
                });
            } else {
                setMessage('Fehler beim Laden der Benutzerdaten.');
            }
        } catch (error) {
            console.error('Fehler:', error);
            setMessage('Ein Fehler ist aufgetreten.');
        }
    };

    // Wird bei der ersten Komponentendarstellung ausgeführt
    useState(() => {
        loadUserData();
    }, []);

    // Aktualisiert die Benutzerdaten
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                setMessage('Profil erfolgreich aktualisiert!');
            } else {
                setMessage('Fehler beim Aktualisieren des Profils.');
            }
        } catch (error) {
            console.error('Fehler:', error);
            setMessage('Ein Fehler ist aufgetreten.');
        }
    };

    // Löscht das Benutzerkonto
    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/auth/profile', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem('token'); // Token entfernen
                setMessage('Konto erfolgreich gelöscht. Sie werden ausgeloggt...');
                setTimeout(() => {
                    navigate('/register'); // Nach 3 Sekunden zur Registrierungsseite
                }, 3000);
            } else {
                setMessage('Fehler beim Löschen des Kontos.');
            }
        } catch (error) {
            console.error('Fehler:', error);
            setMessage('Ein Fehler ist aufgetreten.');
        }
    };

    // Handhabt die Eingaben
    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <>
            <Header />
            <div className="container-center profile-container">
                <h2>Profil bearbeiten</h2>
                {message && <p className="message">{message}</p>}
                <form onSubmit={handleUpdate} className="profile-form">
                    <Input
                        type="text"
                        name="username"
                        placeholder="Benutzername"
                        value={userData.username}
                        onChange={handleChange}
                    />
                    <Input
                        type="email"
                        name="email"
                        placeholder="E-Mail"
                        value={userData.email}
                        onChange={handleChange}
                    />
                    <Input
                        type="password"
                        name="password"
                        placeholder="Neues Passwort"
                        value={userData.password}
                        onChange={handleChange}
                    />
                    <Button type="submit">Speichern</Button>
                    <Button onClick={handleDeleteAccount} className="delete-button">
                        Konto löschen
                    </Button>
                </form>

            </div>
        </>
    );
};

export default Profile;
