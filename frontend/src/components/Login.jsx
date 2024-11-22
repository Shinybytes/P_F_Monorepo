import '../Global.css';
import './Login.css'; // CSS-Fehler
import logo from '../assets/logo.png';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import Input from './Input';
import { fetchWithToken } from '../fetchConfig';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Standardverhalten verhindern
        setErrorMessage(''); // Fehlermeldung zurücksetzen

        try {
            // API-Aufruf für Login mit fetchWithToken
            const data = await fetchWithToken('/auth/login', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            const token = data.token;

            if (token) {
                // Token im localStorage speichern
                localStorage.setItem('token', token);
                console.log('Token gespeichert:', token);

                // Profil prüfen
                const profile = await fetchWithToken('/auth/profile');
                console.log('Profil-Daten:', profile);

                // Logik für die Navigation basierend auf der WG-Zugehörigkeit
                if (profile.wgId) {
                    console.log('Benutzer gehört zu einer WG. Weiterleitung zum Dashboard.');
                    navigate('/'); // Dashboard
                } else {
                    console.log('Benutzer gehört keiner WG. Weiterleitung zu create-or-join.');
                    navigate('/create-or-join'); // WG erstellen oder beitreten
                }
            } else {
                console.error('Kein Token in der API-Antwort enthalten.');
                setErrorMessage('Login fehlgeschlagen.');
            }
        } catch (error) {
            console.error('Fehler beim Login:', error.message);
            setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
    };

    return (
        <div className="container-center">
            <img src={logo} alt="FlatFlow Logo" className="logo" />
            <h2>Login</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <Input
                    type="email"
                    name="email"
                    placeholder="E-Mail"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <Input
                    type="password"
                    name="password"
                    placeholder="Passwort"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <Button type="submit">Login</Button>
            </form>
            <Link to="/forgot-password" className="forgot-password">
                Passwort vergessen?
            </Link>
            <div className="register-redirect">
                <p>Noch kein Mitglied?</p>
                <Link to="/register" className="register-link">Neues Konto erstellen</Link>
            </div>
        </div>
    );
};

export default Login;
