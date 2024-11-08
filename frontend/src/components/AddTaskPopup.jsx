import './AddTaskPopup.css';

const AddTaskPopup = ({ onClose }) => (
    <div className="popup-overlay">
        <div className="popup">
            <h3>Neue Aufgabe hinzufügen</h3>
            <form>
                <input type="text" placeholder="Aufgabe" required />
                <input type="text" placeholder="Zuständig" required />
                <input type="text" placeholder="Kategorie" required />
                <button type="submit">Hinzufügen</button>
            </form>
            <button onClick={onClose} className="close-button">Schließen</button>
        </div>
    </div>
);

export default AddTaskPopup;
