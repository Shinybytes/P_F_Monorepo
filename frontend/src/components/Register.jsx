import logo from '../assets/logo.png';
import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.jsx";
import {Label} from "@/components/ui/label.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            // POST-Anfrage zur Registrierung
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Nach erfolgreicher Registrierung zur Login-Seite navigieren
                navigate('/login');
            } else {
                // Fehlernachricht anzeigen, falls die Registrierung fehlschlägt
                const data = await response.json();
                setErrorMessage(data.message || 'Fehler bei der Registrierung. Bitte versuchen Sie es erneut.');
            }
        } catch (error) {
            console.error('Fehler:', error);
            setErrorMessage('Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        }
    };

    return (
    <div className="flex h-screen w-full items-center justify-center px-4">
        <Card className="mx-auto max-w-sm">
            <div className="flex justify-center items-center h-24">
                <img
                    src={logo}
                    alt="FlatFlow Logo"
                    className="h-2/3 object-contain"
                />
            </div>
            <CardHeader>
                <CardTitle className="text-2xl">Registrieren</CardTitle>
                <CardDescription>
                    Geben Sie Ihre E-Mail-Adresse, einen Usernamen und ein Passwort ein, um sich zu registrieren
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="username">Username</Label>
                            </div>
                            <Input
                                id="username"
                                name="username"
                                type="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Passwort</Label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <Button type="submit" className="w-full">
                            Registrieren
                        </Button>
                    </div>
                </form>
                <div className="mt-4 text-center text-sm">
                    Doch schon ein Konto?{' '}
                    <Link to="/login" className="underline">
                        Login
                    </Link>
                </div>
            </CardContent>
        </Card>
        </div>
    );
};

export default Register;
