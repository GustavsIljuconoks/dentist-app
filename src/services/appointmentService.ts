import { API_BASE_URL } from "@/lib/constants";
import { authService } from "./auth";
import type { Appointment } from "@/types/Appointment";
import type { AppointmentType } from "@/types/AppointmentType";

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

        if (!appointmentData.type) {
            throw new Error("Appointment type is required");
        }

        if (!appointmentData.doctorId) {
            throw new Error("Doctor is required");
        }

        const conflictCheck = await fetch(`${API_BASE_URL}/appointments/check-conflict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                doctorId: appointmentData.doctorId,
                date: appointmentData.date,
                typeId: appointmentData.type,
            }),
        });

        if (!conflictCheck.ok) {
            if (conflictCheck.status === 409) {
                throw new Error("This time slot is not available. Please choose a different time.");
            }
            const error = await conflictCheck.json().catch(() => ({}));
            throw new Error(error.error || "Failed to check availability");
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
        if (existingAppointment.status === "completed") {
            throw new Error("Cannot cancel a completed appointment");
        }

        const response = await fetch(
            `${API_BASE_URL}/appointments/${appointmentId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
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

    async getAppointmentTypes(): Promise<AppointmentType[]> {
        await this.simulateLatency();

        const response = await fetch(`${API_BASE_URL}/types`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch appointment types");
        }

        const types = await response.json();
        return Array.isArray(types) ? types : [];
    }

    async checkAvailability(
        doctorId: number,
        date: string,
        typeId: number,
    ): Promise<{ available: boolean; error?: string }> {
        const response = await fetch(`${API_BASE_URL}/appointments/check-conflict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                doctorId,
                date,
                typeId,
            }),
        });

        if (response.ok) {
            return { available: true };
        }

        if (response.status === 409) {
            const data = await response.json();
            return { available: false, error: data.error };
        }

        return { available: false, error: "Failed to check availability" };
    }
}

export const appointmentService = new AppointmentService();
