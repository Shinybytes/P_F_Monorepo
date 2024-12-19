import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Global.css';
import Header from './Header';
import Input from './Input';
import Button from './Button';

const CreateOrJoinWG = () => {
    const [wgName, setWgName] = useState(''); // Name der neuen WG
    const [joinCode, setJoinCode] = useState(''); // Join-Code der erstellten WG
    const [joinInput, setJoinInput] = useState(''); // Eingabefeld für den Beitritt
    const [message, setMessage] = useState(''); // Erfolg- oder Fehlermeldung
    const navigate = useNavigate();

    // Funktion zum Erstellen einer neuen WG
    const handleCreateWG = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/wg', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: wgName }),
            });

            if (response.ok) {
                const data = await response.json();
                setJoinCode(data.joinCode); // Join-Code speichern
                setMessage('WG erfolgreich erstellt! Kopiere den Code, um ihn mit anderen zu teilen.');
            } else if (response.status === 409) {
                setMessage('WG-Name bereits vergeben.');
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Fehler beim Erstellen der WG. Bitte versuchen Sie es erneut.');
            }
        } catch (error) {
            console.error('Fehler:', error);
            setMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        }
    };

    // Funktion zum Beitreten einer bestehenden WG
    const handleJoinWG = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/wg/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ joinCode: joinInput }),
            });

            if (response.ok) {
                setMessage('Erfolgreich der WG beigetreten!');
                navigate('/'); // Weiterleitung zum Dashboard
            } else if (response.status === 404) {
                setMessage('WG mit diesem Code nicht gefunden.');
            } else if (response.status === 409) {
                setMessage('Benutzer ist bereits Mitglied in dieser WG.');
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Fehler beim Beitreten der WG. Bitte versuchen Sie es erneut.');
            }
        } catch (error) {
            console.error('Fehler:', error);
            setMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        }
    };

    const copyToClipboard = () => {
        if (joinCode) {
            navigator.clipboard.writeText(joinCode);
            alert('Join-Code kopiert!');
        }
    };

    return (
        <div className="container-center">
            <Header />
            <h2>WG beitreten oder erstellen</h2>
            {message && <p className="message">{message}</p>}

            {/* Bereich zum Erstellen einer WG */}
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

                {/* Anzeige des Join-Codes nach erfolgreicher Erstellung */}
                {joinCode && (
                    <div className="wg-info">
                        <p><strong>Join-Code:</strong> {joinCode}</p>
                        <Button onClick={copyToClipboard}>Code kopieren</Button>
                        <Button onClick={() => navigate('/')}>Zum Dashboard</Button> {/* Button erscheint nur bei WG-Erstellung */}
                    </div>
                )}
            </div>

            {/* Bereich zum Beitreten einer WG */}
            <div className="join-wg-section">
                <h3>WG beitreten</h3>
                <Input
                    type="text"
                    placeholder="Join-Code eingeben"
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value)}
                    required
                />
                <Button onClick={handleJoinWG}>Beitreten</Button>
            </div>
        </div>
    );
};

export default CreateOrJoinWG;
