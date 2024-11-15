import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import logo from '../assets/logo.png';


// Hauptkomponente für das Erstellen oder Beitreten einer WG
const CreateOrJoinWG = () => {
    // useState-Hooks zum Speichern der Eingabewerte und Nachricht
    const [wgName, setWgName] = useState(''); // Name der neuen WG
    const [joinCode, setJoinCode] = useState(''); // Einladungscode für existierende WG
    const [message, setMessage] = useState(''); // Rückmeldung zum Erfolg oder Fehler


    // Funktion zum Erstellen einer neuen WG (API-Aufruf)
    const handleCreateWG = async () => {
        try {
            const response = await fetch("http://localhost:8080/create-wg", { // Backend-API-Aufruf
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: wgName }) // WG-Name im Request-Body
            });

            if (response.ok) {
                setMessage("WG erfolgreich erstellt!");
            } else {
                setMessage("Fehler beim Erstellen der WG. Bitte versuchen Sie es erneut.");
            }
        } catch (error) {
            console.error("Fehler:", error);
            setMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
        }
    };

    // Funktion zum Beitreten einer bestehenden WG (API-Aufruf)
    const handleJoinWG = async () => {
        try {
            const response = await fetch("http://localhost:8080/join-wg", { // Backend-API-Aufruf
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ code: joinCode }) // Einladungscode im Request-Body
            });

            if (response.ok) {
                setMessage("WG erfolgreich beigetreten!");
            } else {
                setMessage("Fehler beim Beitreten der WG. Bitte überprüfen Sie den Einladungscode.");
            }
        } catch (error) {
            console.error("Fehler:", error);
            setMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
        }
    };

    return (
        <div className="container-center">
            <img src={logo} alt="FlatFlow Logo" className="logo"/>
            <h2>WG beitreten oder erstellen</h2>
            {message && <p className="message">{message}</p>}

            <div className="create-wg-section">
                <h3>Neue WG erstellen</h3>
                <Input
                    type="text"
                    placeholder="Name der WG"
                    value={wgName}
                    onChange={(e) => setWgName(e.target.value)}
                    required
                />
                <Button onClick={handleCreateWG}>Erstellen</Button>
            </div>

            <div className="join-wg-section">
                <h3>WG beitreten</h3>
                <Input
                    type="text"
                    placeholder="Einladungscode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                />
                <Button onClick={handleJoinWG}>Beitreten</Button>
            </div>
        </div>
    );
};

export default CreateOrJoinWG;

