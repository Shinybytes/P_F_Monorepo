import './Login.css'
import logo from '../assets/logo.png';


const Login = () => (
    <div className="login-container">
        <img src={logo} alt="FlatFlow Logo" className="logo" />
        <h2>Login</h2>
        <form>
            <input type="email" placeholder="E-Mail" required />
            <input type="password" placeholder="Passwort" required />
            <button type="submit">Login</button>
        </form>
    </div>
);

export default Login;

