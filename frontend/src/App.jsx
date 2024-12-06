import './global.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateOrJoinWG from './components/CreateOrJoinWG';
import ForgotPassword from "./components/ForgotPassword.jsx";
import Profile from "./components/Profile.jsx";
import Logout from './components/Logout';
import {Login} from "@/components/Login.jsx";
import {ThemeProvider} from "@/components/theme-provider.jsx";
import {Homepage} from "@/components/Homepage.jsx";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create-or-join" element={<CreateOrJoinWG />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
        </Router>
        </ThemeProvider>
    );
}

export default App;


