import PropTypes from 'prop-types';
import '../Global.css';


// Definition der Button-Komponente mit Destrukturierung der Props
const Input = ({ type, name, placeholder, value, onChange }) => (
    <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="custom-input"
        required
    />
);

// Typprüfung für die Komponente
Input.propTypes = {
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default Input;
