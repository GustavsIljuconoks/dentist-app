export interface Appointment {
    id: number;
    patientId: number;
    doctorId: number;
    date: string;
    type?: number;
    typeName?: string; // populated from appointment types
    status?: "pending" | "scheduled" | "completed" | "cancelled";
}
