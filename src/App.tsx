import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { authService } from "./services/auth";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        authService.isAuthenticated(),
    );

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Dashboard />
                        ) : (
                            <LoginPage onLoginSuccess={handleLoginSuccess} />
                        )
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
