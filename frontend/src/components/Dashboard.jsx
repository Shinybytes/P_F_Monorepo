import React, { useState } from 'react';
import './Dashboard.css';
import AddTaskPopup from './AddTaskPopup';
import Header from './Header';

const Dashboard = () => {
    const [showPopup, setShowPopup] = useState(false);

    const tasks = [
        { id: 1, title: 'Flur putzen', person: 'Pia', category: 'Putzdienst', status: 'erledigt' },
        { id: 2, title: 'Einkaufen', person: 'Simon', category: 'Einkäufe', status: 'offen' },
        { id: 3, title: '20 € an Pia senden', person: 'Ferdi', category: 'Finanzen', status: 'erledigt' }
    ];

    return (
        <div className="dashboard-container">
            <img src="/assets/logo.png" alt="FlatFlow Logo" className="logo" />
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
            {showPopup && <AddTaskPopup onClose={() => setShowPopup(false)} />}
        </div>
    );
};

export default Dashboard;
