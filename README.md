# Dentist app

This repo showcases a demo app for dentist appointment dashboard. This dashboard includes separate doctor / patient views. Option to book and cancel appointments.

## Technical Overview

App uses React as the main source for powered with TS magic. As the project has an API side aswell it uses [OpenAPI](https://swagger.io/) for API documentation.

## Getting started

```bash
git clone git@github.com:GustavsIljuconoks/dentist-app.git project
```

#### Open your project directory

```bash
cd project
```

#### Install node dependencies

```bash
npm install
```

#### Run vite server

```bash
npm run dev
```

#### Run node server

```bash
npm run api
```

### Initial login details

#### For doctor

"email": "doctor@dentalcare.com",
"password": "doctor123",

#### For patient

"email": "bob.doe@email.com",
"password": "patient123",

## Mock Data Service

The project uses **json-server** as a mock REST API with custom middleware extensions:

**Data Layer:**

- `db.json` - flat-file database with 3 collections: `users`, `appointments`, and `appointmentTypes`
- Contains seed data for 1 doctor and 2 patients, sample appointments, and 4 appointment types (Cleaning, Check-up, Filling, Root Canal)

**Server Implementation (`server.ts`):**

- Built on `json-server` with custom routes layered on top
- Custom endpoints include:
    - `GET /appointments?userId=X` - filters appointments by patient/doctor ID and enriches with nested user/type data
    - `DELETE /appointments/:id` - cancels appointments
    - `POST /appointments/check-conflict` - validates scheduling conflicts, business hours (9AM-3PM), and weekdays only
    - `POST /login` - simple authentication (returns mock tokens)
    - `GET /users/:id` - user lookup (strips passwords)
    - `GET /types` - appointment types list

**Documentation:**

- OpenAPI spec (`openapi.yaml`) served via Swagger UI at `/api-docs`

The architecture allows json-server to auto-generate basic CRUD while custom routes handle business logic like conflict checking and data enrichment.
