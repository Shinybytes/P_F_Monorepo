import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import für Navigation
import '../Global.css';
import AddTaskPopup from './AddTaskPopup';
import Header from './Header';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]); // State für Aufgaben
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate(); // Hook zur Navigation

    // Überprüft, ob der Benutzer eingeloggt ist
    const checkAuthentication = () => {
        const token = localStorage.getItem('token'); // Token aus localStorage abrufen
        if (!token) {
            // Wenn kein Token vorhanden ist, Benutzer zur Login-Seite weiterleiten
            alert("Bitte logge dich ein, um das Dashboard zu nutzen.");
            navigate('/login');
        }
    };

    // Funktion zum Laden der Aufgaben aus der Datenbank
    const loadTasks = async () => {
        try {
            const token = localStorage.getItem('token'); // Token für den API-Call abrufen
            const response = await fetch("http://localhost:8080/todos", {
                headers: {
                    Authorization: `Bearer ${token}` // Token im Authorization-Header senden
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data); // Aufgaben in den State setzen
            } else {
                console.error("Fehler beim Laden der Aufgaben:", response.statusText);
            }
        } catch (error) {
            console.error("Fehler beim Laden der Aufgaben:", error);
        }
    };

    useEffect(() => {
        checkAuthentication(); // Authentifizierung prüfen
        loadTasks(); // Aufgaben laden
    }, []);

    // Funktion zum Hinzufügen einer Aufgabe
    const addTask = async (newTask) => {
        try {
            const token = localStorage.getItem('token'); // Token für den API-Call abrufen
            const response = await fetch("http://localhost:8080/todos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` // Token im Authorization-Header senden
                },
                body: JSON.stringify(newTask)
            });
            if (response.ok) {
                loadTasks(); // Aufgaben neu laden, um die aktuelle Liste zu sehen
            } else {
                console.error("Fehler beim Hinzufügen der Aufgabe:", response.statusText);
            }
        } catch (error) {
            console.error("Fehler beim Hinzufügen der Aufgabe:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <Header />
            <h2>WG Name</h2>
            <table>
                <thead>
                <tr>
                    <th>ToDo</th>
                    <th>Zuständig</th>
                    <th>Kategorie</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {tasks.map(task => (
                    <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>{task.person}</td>
                        <td>{task.category}</td>
                        <td className={task.status === 'erledigt' ? 'status-done' : 'status-open'}>
                            {task.status}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={() => setShowPopup(true)} className="add-button">+</button>
            {showPopup && (
                <AddTaskPopup
                    onClose={() => setShowPopup(false)}
                    onSave={addTask} // addTask als onSave-Funktion übergeben
                />
            )}
        </div>
    );
};

export default Dashboard;