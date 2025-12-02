import jsonServer from "json-server";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import type { User } from "./src/types/User";
import type { Appointment } from "./src/types/Appointment";
import type { AppointmentType } from "./src/types/AppointmentType";

export interface UserCredentials extends User {
    email: string;
    password: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: Omit<UserCredentials, "password">;
}

interface ErrorResponse {
    error: string;
}

interface AppointmentRequest {
    patientId: number;
    status: string;
}

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Load OpenAPI specification
const openApiSpec = load(readFileSync("./openapi.yaml", "utf8")) as any;
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

server.get("/appointments", (req, res) => {
    const userId = Number(req.query.userId);

    if (!userId) {
        return res
            .status(400)
            .json({ error: "userId query parameter is required" });
    }

    const db = router.db;
    const appointments = db.get("appointments") as any;
    const users = db.get("users") as any;
    const appointmentTypes = db.get("appointmentTypes") as any;

    // Filter appointments where user is either patient or doctor
    const userAppointments = appointments
        .filter(
            (appointment: any) =>
                appointment.patientId === userId ||
                appointment.doctorId === userId,
        )
        .map((appointment: any) => {
            const doctor = users
                .find((u: any) => u.id === appointment.doctorId)
                .value();
            const patient = users
                .find((u: any) => u.id === appointment.patientId)
                .value();
            const appointmentType = appointmentTypes
                .find((t: any) => t.id === appointment.type)
                .value();

            const doctorData = doctor
                ? {
                    id: doctor.id,
                    name: doctor.name,
                    email: doctor.email,
                    role: doctor.role,
                }
                : null;

            const patientData = patient
                ? {
                    id: patient.id,
                    name: patient.name,
                    email: patient.email,
                    role: patient.role,
                    phone: patient.phone,
                    dateOfBirth: patient.dateOfBirth,
                    address: patient.address,
                }
                : null;

            return {
                ...appointment,
                doctor: doctorData,
                patient: patientData,
                typeName: appointmentType ? appointmentType.name : null,
            };
        })
        .value();

    res.json(userAppointments);
});

server.get("/types", (req, res) => {
    const db = router.db;
    const types = db.get("appointmentTypes") as any;
    res.json(types);
});

server.post("/appointments/check-conflict", (req, res) => {
    const { doctorId, date, typeId } = req.body;

    if (!doctorId || !date || !typeId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const appointmentDate = new Date(date);

    // validate business hours (9:00 - 15:00)
    const hours = appointmentDate.getHours();
    const minutes = appointmentDate.getMinutes();
    const time = hours * 60 + minutes; // in minutes since midnight

    if (time < 9 * 60 || time >= 15 * 60) {
        return res.status(400).json({ error: "Appointments are only available between 9:00 AM and 3:00 PM" });
    }

    // validate weekdays only
    const dayOfWeek = appointmentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return res.status(400).json({ error: "Appointments are only available Monday through Friday" });
    }

    const db = router.db;
    const appointments = (db.get("appointments") as any).value();
    const appointmentTypes = (db.get("appointmentTypes") as any).value();

    const newAppointmentType = appointmentTypes.find((t: any) => t.id === typeId);
    if (!newAppointmentType) {
        return res.status(400).json({ error: "Invalid appointment type" });
    }

    const newStart = new Date(date);
    const newEnd = new Date(newStart.getTime() + newAppointmentType.durationMinutes * 60000);

    // Check for conflicts with existing appointments for the same doctor
    const conflicts = appointments.filter((apt: Appointment) => {
        if (apt.doctorId !== doctorId || apt.status === "cancelled") {
            return false;
        }

        const existingType = appointmentTypes.find((t: AppointmentType) => t.id === apt.type);
        const existingStart = new Date(apt.date);
        const existingEnd = new Date(existingStart.getTime() + (existingType?.durationMinutes || 30) * 60000);

        // Check if times overlap
        return (newStart < existingEnd && newEnd > existingStart);
    });

    if (conflicts.length > 0) {
        return res.status(409).json({
            error: "Time slot not available",
            conflicts: conflicts.map((c: any) => ({
                date: c.date,
                type: c.type,
            }))
        });
    }

    res.json({ available: true });
});

server.get("/users/:id", (req, res) => {
    const userId = Number(req.params.id);
    const db = router.db;
    const users: UserCredentials[] = (db.get("users") as any).value();
    const user = users.find(u => u.id === userId);

    if (user) {
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

server.post(
    "/login",
    (
        req: { body: LoginRequest },
        res: {
            status: (code: number) => {
                json: (data: ErrorResponse | LoginResponse) => void;
            };
            json: (data: LoginResponse) => void;
        },
    ) => {
        const { email, password }: LoginRequest = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }

        const db = router.db;
        const users: UserCredentials[] = (db.get("users") as any).value();
        const user = users.find(
            u => u.email === email && u.password === password,
        );

        if (user) {
            const { password: _, ...userWithoutPassword } = user;

            // Generate a simple token (in prod probably would use JWT or similar)
            const token: string = `token_${user.id}_${Date.now()}`;

            res.json({
                token,
                user: userWithoutPassword,
            });
        } else {
            res.status(401).json({
                error: "Invalid email or password",
            });
        }
    },
);

server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Mock JSON Server is running on http://localhost:${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`👩‍⚕️ Test Credentials:`);
    console.log(`   Doctor: doctor@dentalcare.com / doctor123`);
    console.log(`   Patient 1: bob.doe@email.com / patient123`);
    console.log(`   Patient 2: alex.smith@email.com / patient123`);
});
