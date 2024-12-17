import PropTypes from 'prop-types';
import '../Global.css';

const Input = ({ type, name, placeholder, value, onChange, required = true }) => (
    <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="custom-input"
        required={required}
    />
);

// Typprüfung für die Komponente
Input.propTypes = {
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool, // required als optionales Prop
};

export default Input;
