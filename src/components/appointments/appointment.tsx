import { useState, useEffect } from "react";
import { appointmentService } from "@/services/appointmentService";
import type { Appointment } from "@/types/Appointment";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "../ui/spinner";
import { authService } from "@/services/auth";

interface AppointmentUI extends Appointment {
    doctorName?: string;
    patientName?: string;
}

export default function AppointmentList() {
    const [appointments, setAppointments] = useState<AppointmentUI[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(
        "Loading appointments...",
    );
    const currentUser = authService.getCurrentUser();

    const formatDateTime = (dateString: string, timeString?: string) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString("lv-LV", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });

        if (timeString) {
            return { date: formattedDate, time: timeString };
        }

        // Otherwise extract time from ISO date
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

        return { date: formattedDate, time: formattedTime };
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setLoadingMessage("Fetching your appointments...");

            const fetchedAppointments =
                await appointmentService.getAppointmentsByUserId();

            // User data is now included in the appointments response - no N+1 queries needed!
            const appointmentsWithUserData: AppointmentUI[] =
                fetchedAppointments.map(
                    (appointment: Appointment): AppointmentUI => ({
                        ...appointment,
                        doctorName:
                            appointment.doctor?.name ?? "Unknown Doctor",
                        patientName:
                            appointment.patient?.name ?? "Unknown Patient",
                    }),
                );

            setAppointments(appointmentsWithUserData);
            setLoadingMessage("Appointments loaded successfully!");

            // Brief delay to show success message
            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to load appointments";
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        loadAppointments();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center space-x-3">
                <Spinner />
                <span className="text-gray-600">{loadingMessage}</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center space-x-2 text-red-600">
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>Error loading appointments</span>
                        </div>
                        <p className="text-gray-600">{error}</p>
                        <Button onClick={handleRetry} variant="outline">
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div>
            {appointments.length > 0 ? (
                <div className="space-y-6">
                    {appointments.map(appointment => (
                        <div
                            key={appointment.id}
                            className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 flex flex-col justify-start gap-2"
                        >
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Status:
                                </h3>
                                <span
                                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                                        appointment.status === "scheduled"
                                            ? "bg-green-100 text-green-800 border border-green-200"
                                            : appointment.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                              : appointment.status ===
                                                  "completed"
                                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                                : appointment.status ===
                                                    "cancelled"
                                                  ? "bg-red-100 text-red-800 border border-red-200"
                                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                                    }`}
                                >
                                    {appointment.status === "scheduled" && (
                                        <div className="flex items-center gap-1">
                                            <svg
                                                className="w-3 h-3"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Scheduled
                                        </div>
                                    )}
                                    {appointment.status === "pending" && (
                                        <div className="flex items-center gap-1">
                                            <svg
                                                className="w-3 h-3"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Pending
                                        </div>
                                    )}
                                    {appointment.status === "completed" && (
                                        <div className="flex items-center gap-1">
                                            <svg
                                                className="w-3 h-3"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.259.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Completed
                                        </div>
                                    )}
                                    {appointment.status === "cancelled" && (
                                        <div className="flex items-center gap-1">
                                            <svg
                                                className="w-3 h-3"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Cancelled
                                        </div>
                                    )}
                                    {!appointment.status && "Scheduled"}
                                </span>
                            </div>

                            {currentUser?.role === "patient" ? (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <span className="font-medium">Doctor:</span>
                                    <span>{appointment.doctorName}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <span className="font-medium">
                                        Patient:
                                    </span>
                                    <span>{appointment.patientName}</span>
                                </div>
                            )}

                            {appointment.typeName && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <span className="font-medium">Type:</span>
                                    <span>{appointment.typeName}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <div className=" flex flex-row w-full bg-gray-100 p-2 rounded">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="48"
                                        height="48"
                                        fill="none"
                                        stroke="#000000"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ opacity: 1 }}
                                    >
                                        <path d="M8 2v4m8-4v4" />
                                        <rect
                                            width="18"
                                            height="18"
                                            x="3"
                                            y="4"
                                            rx="2"
                                        />
                                        <path d="M3 10h18" />
                                    </svg>

                                    <div className="flex flex-col justify-start gap-0.5">
                                        <p className="text-gray-500">
                                            Date & time
                                        </p>

                                        <div>
                                            <p className="text-gray-900">
                                                {(() => {
                                                    const { date, time } =
                                                        formatDateTime(
                                                            appointment.date,
                                                        );
                                                    return `${date} • ${time}`;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">No appointments found</p>
                    <p className="text-sm text-gray-400">
                        You don't have any upcoming appointments
                    </p>
                </div>
            )}
        </div>
    );
}
