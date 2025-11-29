import { useState } from "react";
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
import { authService, type LoginCredentials } from "@/services/auth";
import { Spinner } from "@/components/ui/spinner";

interface LoginPageProps {
    onLoginSuccess?: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.target as HTMLFormElement);
        const credentials: LoginCredentials = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        };

        // Client-side validation
        if (!credentials.email || !credentials.password) {
            setError("Please fill in all fields");
            setIsLoading(false);
            setTimeout(() => setError(null), 5000);
            return;
        }

        try {
            await authService.login(credentials);

            // Small delay to show success message
            setTimeout(() => {
                onLoginSuccess?.();
            }, 500);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Login failed. Please try again.";
            setError(errorMessage);

            setTimeout(() => {
                setError(null);
            }, 5000);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-xl font-semibold text-center text-gray-800">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-center text-gray-600">
                            Sign in to access your patient appointments and
                            records
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                                <svg
                                    className="w-4 h-4 shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="doctor@dentalcare.com"
                                    autoComplete="email"
                                    required
                                    disabled={isLoading}
                                    className="h-11 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </Label>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    disabled={isLoading}
                                    className="h-11 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-whitedisabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Spinner />
                                        Signing in...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
