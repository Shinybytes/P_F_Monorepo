import './Register.css';
import logo from '../assets/logo.png';


const Register = () => (
    <div className="register-container">
        <img src={logo} alt="FlatFlow Logo" className="logo"/>
        <h2>Account anlegen</h2>
        <form>
        <input type="text" placeholder="Name" required />
            <input type="text" placeholder="Vorname" required />
            <input type="text" placeholder="Nickname" required />
            <input type="password" placeholder="Passwort" required />
            <button type="submit">registrieren</button>
        </form>
    </div>
);

export default Register;
