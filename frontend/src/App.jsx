import './global.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateOrJoinWG from './components/CreateOrJoinWG';
import ForgotPassword from "./components/ForgotPassword.jsx";
import AddTaskPopup from "./components/AddTaskPopup.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create-or-join" element={<CreateOrJoinWG />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/add-task" element={<AddTaskPopup />} />
            </Routes>
        </Router>
    );
}

export default App;


