export interface Appointment {
    id: number;
    patientId: number;
    doctorId: number;
    date: string;
    time?: string;
    type?: string;
    status?: "pending" | "scheduled" | "completed" | "cancelled";
}
