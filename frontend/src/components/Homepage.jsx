import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle.jsx";
import Dashboard from "@/components/Dashboard.jsx";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Homepage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Hier erfolgt die Logout-Logik
        localStorage.removeItem('token');

        navigate('/logout');
        setTimeout(() => {

            navigate('/login');
        }, 3000);
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
                    <div className="flex flex-row items-center gap-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <ModeToggle />
                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut />
                        </Button>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <Button className="text-red-600 w-2/3">Button</Button>
                    <Dashboard />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
