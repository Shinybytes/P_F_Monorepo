import { useState, useEffect } from 'react';
import '../Global.css';
import AddTaskPopup from './AddTaskPopup';
import Header from './Header';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]); // State für Aufgaben
    const [showPopup, setShowPopup] = useState(false);

    // Funktion zum Laden der Aufgaben aus der Datenbank
    const loadTasks = async () => {
        try {
            const response = await fetch("http://localhost:8080/tasks");
            const data = await response.json();
            setTasks(data); // Aufgaben in den State setzen
        } catch (error) {
            console.error("Fehler beim Laden der Aufgaben:", error);
        }
    };

    useEffect(() => {
        loadTasks(); // Aufgaben beim ersten Laden der Komponente holen
    }, []);

    // Funktion zum Hinzufügen einer Aufgabe
    const addTask = async (newTask) => {
        try {
            const response = await fetch("http://localhost:8080/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newTask)
            });
            if (response.ok) {
                loadTasks(); // Aufgaben neu laden, um die aktuelle Liste zu sehen
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
