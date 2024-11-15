import PropTypes from 'prop-types';

// Definition der Button-Komponente mit Destrukturierung der Props
const Button = ({ children, onClick, type = 'button' }) => (
    <button type={type} onClick={onClick} className="custom-button">
        {children}
    </button>
);

// Typprüfung für die Komponente
Button.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.string
};

export default Button;

