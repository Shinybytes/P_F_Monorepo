import logo from '../assets/logo.png';
import { useState } from 'react';
import Button from './Button';
import Input from './Input';

const Register = () => {
    // Initialisiert den State für die Formulardaten
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

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
        try {
            // Sendet eine POST-Anfrage an die Backend-API zur Benutzerregistrierung
            const response = await fetch("http://localhost:8080/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData) // Sendet die Formulardaten im JSON-Format
            });

            if (response.ok) {
                alert("Registrierung erfolgreich!");
            } else {
                alert("Fehler bei der Registrierung.");
            }
        } catch (error) {
            console.error("Fehler:", error);
            alert("Fehler bei der Registrierung.");
        }
    };

    return (
        <div className="container-center">
            <img src={logo} alt="FlatFlow Logo" className="logo"/>
            <h2>Account anlegen</h2>
            <form onSubmit={handleSubmit}>
                <Input type="text" name="firstName" placeholder="Vorname" value={formData.firstName} onChange={handleChange} required />
                <Input type="text" name="lastName" placeholder="Name" value={formData.lastName} onChange={handleChange} required />
                <Input type="email" name="email" placeholder="E-Mail" value={formData.email} onChange={handleChange} required />
                <Input type="password" name="password" placeholder="Passwort" value={formData.password} onChange={handleChange} required />
                <Button type="submit">Registrieren</Button>
            </form>
        </div>
    );
};

export default Register;
