import type { User } from "@/types/User";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export interface LoginResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

class AuthService {
    private token: string | null = null;
    private currentUser: User | null = null;

    constructor() {
        this.token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        // Simulate network latency (minimum 500ms)
        const delay = Math.max(500, Math.random() * 1000 + 500);
        await new Promise(resolve => setTimeout(resolve, delay));

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            let errorMessage = "Login failed";

            try {
                const error = await response.json();
                errorMessage = error.error || errorMessage;
            } catch {
                errorMessage = "Network error. Please check your connection.";
            }

            throw new Error(errorMessage);
        }

        const loginResponse: LoginResponse = await response.json();

        // Save token and user to localStorage and memory
        this.token = loginResponse.token;
        this.currentUser = loginResponse.user;
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.currentUser));

        return loginResponse;
    }

    logout(): void {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    getToken(): string | null {
        return this.token;
    }

    isAuthenticated(): boolean {
        return this.token !== null && this.currentUser !== null;
    }

    isDoctor(): boolean {
        return this.currentUser?.role === "doctor";
    }

    isPatient(): boolean {
        return this.currentUser?.role === "patient";
    }
}

export const authService = new AuthService();
