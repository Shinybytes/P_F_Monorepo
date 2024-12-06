import '../Global.css';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const AddTaskPopup = ({ onClose, onTaskAdded }) => {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        priority: 3,
        assignedTo: '',
        dueDate: '',
    });
    const [wgId, setWgId] = useState(null); // WG-ID wird automatisch ermittelt

    // WG-ID über API laden
    const fetchWgId = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/auth/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setWgId(data.wgId); // WG-ID aus Profil-Daten setzen
            } else {
                console.error('Fehler beim Laden der WG-ID:', response.statusText);
            }
        } catch (error) {
            console.error('Fehler beim Laden der WG-ID:', error);
        }
    };

    useEffect(() => {
        fetchWgId(); // WG-ID laden, sobald das Popup geöffnet wird
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData({
            ...taskData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!wgId) {
            console.error('WG-ID konnte nicht ermittelt werden.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...taskData,
                    wgId, // Automatisch ermittelte WG-ID hinzufügen
                }),
            });
            if (response.ok) {
                onTaskAdded(); // Aktualisiere Aufgaben im Dashboard
                onClose(); // Schließe das Popup
            } else {
                console.error('Fehler beim Hinzufügen der Aufgabe:', response.statusText);
            }
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Aufgabe:', error);
        }
    };

    return (
        <div className="popup-container">
            <div className="popup">
                <h3>Neue Aufgabe hinzufügen</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Aufgabenname"
                        value={taskData.title}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Beschreibung"
                        value={taskData.description}
                        onChange={handleChange}
                    />
                    <select
                        name="priority"
                        value={taskData.priority}
                        onChange={handleChange}
                    >
                        <option value={1}>Hoch</option>
                        <option value={2}>Mittel</option>
                        <option value={3}>Niedrig</option>
                    </select>
                    <input
                        type="text"
                        name="assignedTo"
                        placeholder="Zuständig"
                        value={taskData.assignedTo}
                        onChange={handleChange}
                    />
                    <input
                        type="datetime-local"
                        name="dueDate"
                        placeholder="Fälligkeitsdatum"
                        value={taskData.dueDate}
                        onChange={handleChange}
                    />
                    <button type="submit" disabled={!wgId}>
                        {wgId ? 'Hinzufügen' : 'Laden...'}
                    </button>
                </form>
                <button onClick={onClose} className="close-button">Schließen</button>
            </div>
        </div>
    );
};

AddTaskPopup.propTypes = {
    onClose: PropTypes.func.isRequired,
    onTaskAdded: PropTypes.func.isRequired,
};

export default AddTaskPopup;
