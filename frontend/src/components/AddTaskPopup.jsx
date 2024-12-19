import '../Global.css';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const AddTaskPopup = ({ onClose, onTaskAdded, existingTask }) => {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        priority: 4, // Standardwert für "Keine Angabe"
        assignedTo: null, // Standardwert für "Keine Angabe"
        dueDate: '',
        status: 'Unerledigt', // Standardstatus
    });
    const [wgId, setWgId] = useState(null); // WG-ID wird automatisch ermittelt
    const [members, setMembers] = useState([]); // WG-Mitglieder

    // WG-ID über API laden
    const fetchWgId = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setWgId(data.wgId);
                fetchWgMembers(data.wgId); // Lade WG-Mitglieder
            } else {
                console.error('Fehler beim Laden der WG-ID:', response.statusText);
            }
        } catch (error) {
            console.error('Fehler beim Laden der WG-ID:', error);
        }
    };

    // WG-Mitglieder laden
    const fetchWgMembers = async (wgId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/wg/${wgId}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            } else {
                console.error('Fehler beim Laden der Mitglieder:', response.statusText);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Mitglieder:', error);
        }
    };

    useEffect(() => {
        fetchWgId(); // WG-ID und Mitglieder laden
        if (existingTask) {
            setTaskData({
                title: existingTask.title || '',
                description: existingTask.description || '',
                priority: existingTask.priority || 4, // Standard auf 4 für "Keine Angabe"
                assignedTo: existingTask.assignedTo || null, // Standard auf null für "Keine Angabe"
                dueDate: existingTask.dueDate || '',
            });
        }
    }, [existingTask]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData({
            ...taskData,
            [name]: name === 'priority' ? parseInt(value) || 4 : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!wgId) {
            console.error('WG-ID konnte nicht ermittelt werden.');
            return;
        }

        // Optional-Felder korrekt setzen (null oder Standardwert senden)
        const payload = {
            title: taskData.title,
            description: taskData.description || null,
            priority: taskData.priority || 4, // Standardwert für "Keine Angabe"
            assignedTo: taskData.assignedTo || null,
            dueDate: taskData.dueDate || null,
            status: taskData.status || "Unerledigt",
            wgId,
        };

        try {
            const token = localStorage.getItem('token');
            const method = existingTask ? 'PUT' : 'POST';
            const url = existingTask
                ? `http://localhost:8080/todos/${existingTask.todoId}`
                : 'http://localhost:8080/todos';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                onTaskAdded(); // Aktualisiere Aufgaben im Dashboard
                onClose(); // Schließe das Popup
            } else {
                console.error('Fehler beim Speichern der Aufgabe:', response.statusText);
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Aufgabe:', error);
        }
    };

    return (
        <div className="popup-container">
            <div className="popup">
                <h3>{existingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe hinzufügen'}</h3>
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
                        placeholder="Beschreibung (optional)"
                        value={taskData.description}
                        onChange={handleChange}
                    />
                    <select
                        name="priority"
                        value={taskData.priority}
                        onChange={handleChange}
                    >
                        <option value="4">Keine Angabe</option>
                        <option value="1">Hoch</option>
                        <option value="2">Mittel</option>
                        <option value="3">Niedrig</option>
                    </select>
                    <select
                        name="assignedTo"
                        value={taskData.assignedTo || ''}
                        onChange={handleChange}
                    >
                        <option value="">Keine Angabe</option>
                        {members.map((member) => (
                            <option key={member.userId} value={member.username}>
                                {member.username}
                            </option>
                        ))}
                    </select>
                    <select
                        name="status"
                        value={taskData.status || "Unerledigt"}
                        onChange={handleChange}
                    >
                        <option value="Unerledigt">Unerledigt</option>
                        <option value="In Bearbeitung">In Bearbeitung</option>
                        <option value="Erledigt">Erledigt</option>
                    </select>

                    <input
                        type="date"
                        name="dueDate"
                        placeholder="Fälligkeitsdatum (optional)"
                        value={taskData.dueDate}
                        onChange={handleChange}
                    />
                    <button type="submit">
                        {existingTask ? 'Speichern' : 'Hinzufügen'}
                    </button>
                </form>
                <button onClick={onClose} className="close-button">
                    Abbrechen
                </button>
            </div>
        </div>
    );
};

AddTaskPopup.propTypes = {
    onClose: PropTypes.func.isRequired,
    onTaskAdded: PropTypes.func.isRequired,
    existingTask: PropTypes.object,
};

export default AddTaskPopup;
