import logo from '../assets/logo.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import für Navigation
import Button from './Button';
import Input from './Input';

const Register = () => {
    // Initialisiert den State für die Formulardaten
    const [formData, setFormData] = useState({
        username: '', // Username wird verwendet
        email: '',
        password: ''
    });

    // State für Fehlermeldungen oder Feedback
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate(); // Hook zur Navigation

    // Aktualisiert den State, wenn der Benutzer Eingaben macht
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Verarbeitet das Formular beim Absenden
    const handleSubmit = async (e) => {
        e.preventDefault(); // Verhindert das Neuladen der Seite beim Absenden des Formulars
        setErrorMessage(''); // Fehler zurücksetzen

        try {
            // Sendet eine POST-Anfrage an die Backend-API zur Benutzerregistrierung
            const response = await fetch("/auth/register", { // Relativer API-Endpunkt
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData) // Sendet die Formulardaten im JSON-Format
            });

            if (response.ok) {
                navigate("/create-or-join"); // Nach erfolgreicher Registrierung zur Login-Seite navigieren
            } else {
                // Falls die Registrierung fehlschlägt, Fehlernachricht auslesen
                const data = await response.json();
                setErrorMessage(data.message || "Fehler bei der Registrierung. Bitte versuchen Sie es erneut.");
            }
        } catch (error) {
            console.error("Fehler:", error);
            setErrorMessage("Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
        }
    };

    return (
        <div className="container-center">
            <img src={logo} alt="FlatFlow Logo" className="logo" />
            <h2>Account anlegen</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Fehlermeldungen anzeigen */}
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
        </div>
    );
};

export default Register;
