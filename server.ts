import jsonServer from "json-server";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import type { User } from "./src/types/User";

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
            };
        })
        .value();

    res.json(userAppointments);
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
