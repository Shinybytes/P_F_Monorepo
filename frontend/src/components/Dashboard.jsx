import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Global.css';
import AddTaskPopup from './AddTaskPopup';
import Header from './Header';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]); // State für Aufgaben
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    const [wg, setWg] = useState(null); // State für WG-Daten
    const [users, setUsers] = useState({}); // State für Benutzerdaten

    // Überprüft, ob der Benutzer eingeloggt ist
    const checkAuthentication = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Bitte logge dich ein, um das Dashboard zu nutzen.");
            navigate('/login');
        }
    };

    // Funktion zum Laden der Benutzerdaten
    const loadUserData = async (userId) => {
        if (users[userId]) return; // Verhindert mehrfaches Laden
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(prevUsers => ({ ...prevUsers, [userId]: data }));
            } else {
                console.error("Fehler beim Laden der Benutzerdaten:", response.statusText);
            }
        } catch (error) {
            console.error("Fehler beim Laden der Benutzerdaten:", error);
        }
    };

    // Funktion zum Laden der WG-Daten
    const loadWgData = async (wgId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/wg/${wgId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setWg(data);
            } else {
                console.error("Fehler beim Laden der WG-Daten:", response.statusText);
            }
        } catch (error) {
            console.error("Fehler beim Laden der WG-Daten:", error);
        }
    };

    // Funktion zum Laden der Aufgaben aus der Datenbank
    const loadTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:8080/todos", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
                if (data.length > 0) {
                    // Laden der WG-Daten
                    loadWgData(data[0].wgId);
                    // Laden der Benutzerdaten für "assignedTo"
                    const userIds = [...new Set(data.map(task => task.assignedTo))];
                    userIds.forEach(userId => loadUserData(userId));
                }
            } else {
                console.error("Fehler beim Laden der Aufgaben:", response.statusText);
            }
        } catch (error) {
            console.error("Fehler beim Laden der Aufgaben:", error);
        }
    };

    useEffect(() => {
        checkAuthentication();
        loadTasks();
    }, []);

    // Funktion zum Hinzufügen einer Aufgabe
    const addTask = async (newTask) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:8080/todos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newTask)
            });
            if (response.ok) {
                const result = await response.json();
                const addedTask = { ...newTask, todoId: result.todoId };
                setTasks(prevTasks => [...prevTasks, addedTask]);
                // Laden der Benutzerdaten für "assignedTo", falls noch nicht vorhanden
                if (!users[addedTask.assignedTo]) {
                    loadUserData(addedTask.assignedTo);
                }
            } else {
                console.error("Fehler beim Hinzufügen der Aufgabe:", response.statusText);
            }
        } catch (error) {
            console.error("Fehler beim Hinzufügen der Aufgabe:", error);
        }
    };

    // Hilfsfunktionen zur Statusanzeige
    const getStatusClassName = (status) => {
        return status === 'Completed' ? 'status-done' : 'status-open';
    };

    const translateStatus = (status) => {
        switch(status) {
            case 'Pending':
                return 'Offen';
            case 'Completed':
                return 'Erledigt';
            default:
                return status;
        }
    };

    return (
        <div className="dashboard-container">
            <Header />
            <h2>{wg ? wg.name : 'WG Name'}</h2>
            <table>
                <thead>
                <tr>
                    <th>ToDo</th>
                    <th>Zuständig</th>
                    <th>Priorität</th>
                    <th>Status</th>
                    <th>Fälligkeitsdatum</th>
                </tr>
                </thead>
                <tbody>
                {tasks.map(task => (
                    <tr key={task.todoId}>
                        <td>{task.title}</td>
                        <td>{task.assignedTo}</td>
                        <td>{task.priority}</td>
                        <td> {task.status}</td>
                        <td>
                            {new Date(task.dueDate).toLocaleString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={() => setShowPopup(true)} className="add-button">+</button>
            {showPopup && (
                <AddTaskPopup
                    onClose={() => setShowPopup(false)}
                    onSave={addTask}
                />
            )}
        </div>
    );
};

export default Dashboard;
