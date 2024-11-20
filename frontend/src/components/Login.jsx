import '../Global.css';
import './Login.css'; // form bei register und login verändert sich aktuell noch wenn login.css fehlt, fehler muss noch behoben werden
import logo from '../assets/logo.png';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import Input from './Input';

const Login = () => {
    // State zur Speicherung der Formular-Daten
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    // State für die Fehlermeldung bei fehlgeschlagenem Login
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // Hook zur Navigation nach erfolgreichem Login

    // Funktion zur Aktualisierung des Formular-States bei Eingabeänderungen
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value // Wert des geänderten Eingabefelds aktualisieren
        });
    };

    // Funktion zur Verarbeitung des Formular-Submits
    const handleSubmit = async (e) => {
        e.preventDefault(); // Verhindert das automatische Neuladen der Seite
        setErrorMessage(''); // Setzt die Fehlermeldung zurück
        try {
            // API-Aufruf zum Login mit den Formular-Daten
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData) // Konvertiert den State in JSON-Format
            });

            if (response.ok) {
                // Erfolgreicher Login, Token speichern und Weiterleitung
                const data = await response.json();
                const token = data.token; // Token aus der API-Antwort

                // Speichern des Tokens in localStorage (für nachfolgende API-Requests)
                localStorage.setItem('token', token);

                // Weiterleitung zum Dashboard
                navigate("/");
            }
            else {
                // Fehlerbehandlung bei fehlgeschlagenem Login
                const data = await response.json();
                setErrorMessage(data.message || "Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.");
            }
        } catch (error) {
            console.error("Fehler:", error);
            setErrorMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
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
            <Link to="/forgot-password" className="forgot-password">Passwort vergessen?</Link>
            <div className="register-redirect">
                <p>Noch kein Mitglied?</p>
                <Link to="/register" className="register-link">Neues Konto erstellen</Link>
            </div>
        </div>
    );
};

export default Login;
