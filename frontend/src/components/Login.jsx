import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../fetchConfig';

export function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Standardverhalten verhindern
        setErrorMessage(''); // Fehlermeldung zurücksetzen

        try {
            // API-Aufruf für Login mit fetchWithToken
            const data = await fetchWithToken('/auth/login', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            const token = data.token;

            if (token) {
                // Token im localStorage speichern
                localStorage.setItem('token', token);
                console.log('Token gespeichert:', token);

                // Profil prüfen
                const profile = await fetchWithToken('/auth/profile');
                console.log('Profil-Daten:', profile);

                // Navigation basierend auf der WG-Zugehörigkeit
                if (profile.wgId) {
                    console.log('Benutzer gehört zu einer WG. Weiterleitung zum Dashboard.');
                    navigate('/'); // Dashboard
                } else {
                    console.log('Benutzer gehört keiner WG. Weiterleitung zu create-or-join.');
                    navigate('/create-or-join'); // WG erstellen oder beitreten
                }
            } else {
                console.error('Kein Token in der API-Antwort enthalten.');
                setErrorMessage('Login fehlgeschlagen.');
            }
        } catch (error) {
            console.error('Fehler beim Login:', error.message);
            setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
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
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Geben Sie Ihre E-Mail-Adresse ein, um sich anzumelden
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
                                    <Label htmlFor="password">Passwort</Label>
                                    <Link to="/forgot-password" className="ml-auto inline-block text-sm underline">
                                        Passwort vergessen?
                                    </Link>
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
                                Login
                            </Button>
                        </div>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Noch kein Konto?{' '}
                        <Link to="/register" className="underline">
                            Registrieren
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
