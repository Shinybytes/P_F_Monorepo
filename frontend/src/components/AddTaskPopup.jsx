import '../Global.css';
import PropTypes from 'prop-types';

const AddTaskPopup = ({ onClose }) => (
    <div className="popup-container">
        <div className="popup">
            <h3>Neue Aufgabe hinzufügen</h3>
            <form>
                <input type="text" placeholder="Aufgabenname" />
                <input type="date" placeholder="Fälligkeitsdatum" />
                <input type="text" placeholder="Beschreibung" />
                <button type="submit">Hinzufügen</button>
            </form>
            <button onClick={onClose} className="close-button">Schließen</button>
        </div>
    </div>
);

// Typprüfung für die Komponente, stellt sicher, dass onClose als Funktion übergeben wird
AddTaskPopup.propTypes = {
    onClose: PropTypes.func.isRequired
};

export default AddTaskPopup;
