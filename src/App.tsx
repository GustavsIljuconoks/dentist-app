import { BrowserRouter, Routes, Route } from "react-router";
import LoginPage from "./pages/LoginPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}
