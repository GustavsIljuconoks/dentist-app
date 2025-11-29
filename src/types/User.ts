export interface User {
    id: number;
    email: string;
    role: "doctor" | "patient";
    name: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
}
