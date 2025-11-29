import { API_BASE_URL } from "@/lib/constants";
import { authService } from "./auth";
import type { Appointment } from "@/types/Appointment";

class AppointmentService {
    // Simulate network latency (minimum 500ms)
    private async simulateLatency(): Promise<void> {
        const delay = Math.max(500, Math.random() * 1000 + 500);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    async createAppointment(
        appointmentData: Partial<Appointment>,
    ): Promise<Appointment> {
        await this.simulateLatency();

        const user = authService.getCurrentUser();
        if (!user) {
            throw new Error("User must be logged in to create appointments");
        }

        if (!appointmentData.date) {
            throw new Error("Appointment date is required");
        }

        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...appointmentData,
                patientId:
                    user.role === "patient"
                        ? user.id
                        : appointmentData.patientId,
                status: "pending",
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || "Failed to create appointment");
        }

        return await response.json();
    }

    async getAppointmentsByUserId(): Promise<Appointment[]> {
        await this.simulateLatency();

        const user = authService.getCurrentUser();
        if (!user) {
            throw new Error("User must be logged in to view appointments");
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/appointments?userId=${user.id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(
                    `Failed to fetch appointments: ${response.statusText}`,
                );
            }

            const appointments = await response.json();
            return Array.isArray(appointments) ? appointments : [];
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Network error while fetching appointments");
        }
    }

    async cancelAppointment(appointmentId: number): Promise<void> {
        await this.simulateLatency();

        const user = authService.getCurrentUser();
        if (!user) {
            throw new Error("User must be logged in to cancel appointments");
        }

        const existingAppointment =
            await this.getAppointmentById(appointmentId);
        if (existingAppointment.status === "cancelled") {
            throw new Error("This appointment has already been cancelled");
        }
        if (existingAppointment.status === "completed") {
            throw new Error("Cannot cancel a completed appointment");
        }

        const response = await fetch(
            `${API_BASE_URL}/appointments/${appointmentId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "cancelled" }),
            },
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || "Failed to cancel appointment");
        }
    }

    private async getAppointmentById(
        appointmentId: number,
    ): Promise<Appointment> {
        const response = await fetch(
            `${API_BASE_URL}/appointments/${appointmentId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error("Appointment not found");
        }

        return await response.json();
    }
}

export const appointmentService = new AppointmentService();
