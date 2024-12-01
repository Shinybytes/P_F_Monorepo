import logo from '../assets/FlatFlow_Logo.png';
import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Button from './Button';
import Input from './Input';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            // POST-Anfrage zur Registrierung
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Nach erfolgreicher Registrierung zur Login-Seite navigieren
                navigate('/login');
            } else {
                // Fehlernachricht anzeigen, falls die Registrierung fehlschlägt
                const data = await response.json();
                setErrorMessage(data.message || 'Fehler bei der Registrierung. Bitte versuchen Sie es erneut.');
            }
        } catch (error) {
            console.error('Fehler:', error);
            setErrorMessage('Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        }
    };

    return (
        <div className="container-center">
            <img src={logo} alt="FlatFlow Logo" className="logo"/>
            <h2>Account anlegen</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    name="username"
                    placeholder="Benutzername"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
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
                <Button type="submit">Registrieren</Button>
            </form>
            <div className="login-redirect">
                <p>Du bist schon Mitglied?</p>
                <Link to="/login" className="login-link">Hier geht es zum Login</Link>
            </div>
        </div>
    );
};

export default Register;
