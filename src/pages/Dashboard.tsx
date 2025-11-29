import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authService } from "@/services/auth";
import type { User } from "@/types/User";
import AppointmentList from "@/components/appointments/appointment";

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(authService.getCurrentUser());
    }, []);

    const handleLogout = () => {
        authService.logout();
        window.location.reload(); // Simple way to reset app state
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full">
            <div className="mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome, {user.name}
                        </h1>
                        <p className="text-gray-600 capitalize text-left">
                            {user.role} Dashboard
                        </p>
                    </div>
                    <Button onClick={handleLogout} variant="outline">
                        Logout
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Your account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <strong>Email:</strong> {user.email}
                            </div>
                            <div>
                                <strong>Role:</strong>{" "}
                                <span className="capitalize">{user.role}</span>
                            </div>
                            {user.phone && (
                                <div>
                                    <strong>Phone:</strong> {user.phone}
                                </div>
                            )}
                            {user.dateOfBirth && (
                                <div>
                                    <strong>Date of Birth:</strong>{" "}
                                    {user.dateOfBirth}
                                </div>
                            )}
                            {user.address && (
                                <div>
                                    <strong>Address:</strong> {user.address}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {user.role === "doctor"
                                    ? "Appointments"
                                    : "My Appointments"}
                            </CardTitle>
                            <CardDescription>
                                {user.role === "doctor"
                                    ? "Manage patient appointments"
                                    : "View your scheduled appointments"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AppointmentList />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common tasks and shortcuts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {user.role === "doctor" ? (
                                <>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                    >
                                        View All Patients
                                    </Button>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                    >
                                        Patient Records
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                    >
                                        Book Appointment
                                    </Button>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                    >
                                        View Medical History
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
