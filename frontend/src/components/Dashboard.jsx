import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Global.css';
import AddTaskPopup from './AddTaskPopup';
import Header from './Header';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [sortOption, setSortOption] = useState(''); // State für Sortieroptionen
    const [filterOptions, setFilterOptions] = useState({ creator: '', status: '', priority: '' }); // Filteroptionen
    const navigate = useNavigate();
    const [wg, setWg] = useState(null);

    const checkAuthentication = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Bitte logge dich ein, um das Dashboard zu nutzen.");
            navigate('/login');
        }
    };

    const loadWgData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                const wgId = data.wgId;
                if (wgId) {
                    const wgResponse = await fetch(`http://localhost:8080/wg/${wgId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (wgResponse.ok) {
                        const wgData = await wgResponse.json();
                        setWg(wgData);
                    }
                }
            }
        } catch (error) {
            console.error("Fehler beim Laden der WG-Daten:", error);
        }
    };

    const loadTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:8080/todos", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            } else {
                console.error("Fehler beim Laden der Aufgaben:", response.statusText);
            }
        } catch (error) {
            console.error("Fehler beim Laden der Aufgaben:", error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/todos/${taskId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                loadTasks();
            } else {
                console.error("Fehler beim Löschen der Aufgabe:", response.statusText);
            }
        } catch (error) {
            console.error("Fehler beim Löschen der Aufgabe:", error);
        }
    };

    useEffect(() => {
        checkAuthentication();
        loadWgData();
        loadTasks();
    }, []);

    // Sortierfunktion
    const sortTasks = (option) => {
        setSortOption(option);
        const sortedTasks = [...tasks].sort((a, b) => {
            if (option === 'dueDate') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (option === 'createdAt') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (option === 'priority') {
                return a.priority - b.priority;
            } else {
                return 0;
            }
        });
        setTasks(sortedTasks);
    };

    // Filterfunktion
    const filterTasks = (task) => {
        const { creator, status, priority } = filterOptions;
        return (
            (creator ? task.assignedTo?.toLowerCase().includes(creator.toLowerCase()) : true) &&
            (status ? task.status?.toLowerCase() === status.toLowerCase() : true) &&
            (priority ? task.priority === parseInt(priority) : true)
        );
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterOptions({ ...filterOptions, [name]: value });
    };

    const translatePriority = (priority) => {
        switch (priority) {
            case 1: return 'Hoch';
            case 2: return 'Mittel';
            case 3: return 'Niedrig';
            default: return 'Keine';
        }
    };

    return (
        <div className="dashboard-container">
            <Header />
            <h2>{wg ? wg.name : 'WG Name wird geladen...'}</h2>

            {/* Sortieroptionen */}
            <div className="sort-options">
                <label>Sortieren nach:</label>
                <select onChange={(e) => sortTasks(e.target.value)} value={sortOption}>
                    <option value="">Wähle eine Option</option>
                    <option value="dueDate">Fälligkeitsdatum</option>
                    <option value="createdAt">Erstellungsdatum</option>
                    <option value="priority">Priorität</option>
                </select>
            </div>

            {/* Filteroptionen */}
            <div className="filter-options">
                <label>Filter nach Ersteller:</label>
                <input name="creator" onChange={handleFilterChange} placeholder="Ersteller" />
                <label>Status:</label>
                <select name="status" onChange={handleFilterChange}>
                    <option value="">Alle</option>
                    <option value="offen">Offen</option>
                    <option value="in Bearbeitung">In Bearbeitung</option>
                    <option value="erledigt">Erledigt</option>
                </select>
                <label>Priorität:</label>
                <select name="priority" onChange={handleFilterChange}>
                    <option value="">Alle</option>
                    <option value="1">Hoch</option>
                    <option value="2">Mittel</option>
                    <option value="3">Niedrig</option>
                </select>
            </div>

            <table>
                <thead>
                <tr>
                    <th>ToDo</th>
                    <th>Beschreibung</th>
                    <th>Priorität</th>
                    <th>Zuständig</th>
                    <th>Status</th>
                    <th>Fälligkeitsdatum</th>
                    <th>Erstellungsdatum</th>
                    <th>Aktionen</th>
                </tr>
                </thead>
                <tbody>
                {tasks.filter(filterTasks).length > 0 ? (
                    tasks.filter(filterTasks).map(task => (
                        <tr key={task.todoId}>
                            <td>{task.title}</td>
                            <td>{task.description || 'Keine Beschreibung'}</td>
                            <td>{translatePriority(task.priority)}</td>
                            <td>{task.assignedTo || 'Keine Zuweisung'}</td>
                            <td>{task.status || 'Unbekannt'}</td>
                            <td>
                                {task.dueDate
                                    ? new Date(task.dueDate).toLocaleString('de-DE', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : 'Kein Datum'}
                            </td>
                            <td>
                                {task.createdAt
                                    ? new Date(task.createdAt).toLocaleString('de-DE', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : 'Kein Datum'}
                            </td>
                            <td>
                                <button onClick={() => setEditTask(task)}>Bearbeiten</button>
                                <button onClick={() => deleteTask(task.todoId)}>Löschen</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="8" style={{ textAlign: 'center' }}>Keine Aufgaben vorhanden</td>
                    </tr>
                )}
                </tbody>
            </table>

            <button onClick={() => setShowAddPopup(true)} className="add-button">+</button>

            {showAddPopup && (
                <AddTaskPopup
                    onClose={() => setShowAddPopup(false)}
                    onTaskAdded={() => {
                        setShowAddPopup(false);
                        loadTasks();
                    }}
                />
            )}

            {editTask && (
                <AddTaskPopup
                    onClose={() => setEditTask(null)}
                    onTaskAdded={() => {
                        setEditTask(null);
                        loadTasks();
                    }}
                    existingTask={editTask}
                />
            )}
        </div>
    );
};

export default Dashboard;
