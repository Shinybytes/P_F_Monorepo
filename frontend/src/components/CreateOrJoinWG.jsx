import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Input from './Input';
import logo from '../assets/FlatFlow_Logo.png';

const CreateOrJoinWG = () => {
    const [wgName, setWgName] = useState(''); // Name der neuen WG
    const [joinName, setJoinName] = useState(''); // Name der existierenden WG
    const [message, setMessage] = useState(''); // Rückmeldung zum Erfolg oder Fehler
    const navigate = useNavigate(); // Für die Navigation

    // Funktion zum Erstellen einer neuen WG (API-Aufruf)
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
                setMessage(`WG erfolgreich erstellt! WG-ID: ${data.wgId}`);
                navigate('/'); // Weiterleitung zum Dashboard
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

    // Funktion zum Beitreten einer bestehenden WG (API-Aufruf)
    const handleJoinWG = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/wg/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: joinName }),
            });

            if (response.ok) {
                setMessage('Erfolgreich der WG beigetreten!');
                navigate('/'); // Weiterleitung zum Dashboard
            } else if (response.status === 404) {
                setMessage('WG nicht gefunden.');
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

    return (
        <div className="container-center">
            <img src={logo} alt="FlatFlow Logo" className="logo" />
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
                    placeholder="Name der WG"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    required
                />
                <Button onClick={handleJoinWG}>Beitreten</Button>
            </div>
        </div>
    );
};

export default CreateOrJoinWG;


