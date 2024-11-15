import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import logo from '../assets/logo.png';

// Komponente für die Passwort-Zurücksetzung
const ForgotPassword = () => {
    // useState-Hooks zum Speichern der E-Mail und der Rückmeldung
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    // Funktion zur Verarbeitung des Formular-Submits
    const handleSubmit = async (e) => {
        e.preventDefault(); // Verhindert das automatische Neuladen der Seite beim Submit
        try {
            // Backend-API-Aufruf zum Anfordern der Passwort-Zurücksetzung
            const response = await fetch("http://localhost:8080/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email }) // Sendet die E-Mail als JSON im Request-Body
            });

            if (response.ok) {
                setMessage("Eine E-Mail zur Passwortzurücksetzung wurde gesendet.");
            } else {
                setMessage("Fehler beim Senden der E-Mail. Bitte versuchen Sie es erneut.");
            }
        } catch (error) {
            console.error("Fehler:", error);
            setMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
        }
    };

    return (
        <div className="container-center">
            <img src={logo} alt="FlatFlow Logo" className="logo"/>
            <h2>Passwort vergessen</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <Input
                    type="email"
                    name="email"
                    placeholder="E-Mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Button type="submit">Passwort zurücksetzen</Button>
            </form>
        </div>
    );
};

export default ForgotPassword;
