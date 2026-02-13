# Smart Dispatch System

Smart Dispatch is an end-to-end emergency response platform that turns incidents into coordinated, real-time dispatch decisions. It connects dispatchers, responders, and administrators with live vehicle tracking, secure workflows, and a simulation layer for realistic routing tests.

Last updated: Feb 13, 2026

## Highlights

- Live incident lifecycle from report to resolution
- Vehicle availability, assignment, and tracking in one workflow
- Role-based access with JWT-secured APIs
- Real-time updates over WebSocket
- Simulation tools with Egypt-scale routing data

## Tech Stack

- Backend: Java 21, Spring Boot 3.3.4, Maven
- Database: MySQL
- Security: Spring Security, JWT
- Real-time: WebSocket
- Frontend: Vite + React (see [smart-dispatch-frontend](smart-dispatch-frontend))

## Repo Map

- Backend service: [smart-dispatch-system](smart-dispatch-system)
- Frontend app: [smart-dispatch-frontend](smart-dispatch-frontend)
- Simulation and routing assets: [simulation](simulation)
- Runner scripts: [runner.bat](runner.bat)

## Quick Start

### Backend (API)

Prereqs: Java 21, MySQL

1. Create a database named `smart_dispatch`.
2. Review configuration in [smart-dispatch-system/src/main/resources/application.properties](smart-dispatch-system/src/main/resources/application.properties).
3. Start the API:

```bash
./mvnw spring-boot:run
```

The API runs on port 7070 by default.

### Frontend (Web App)

Prereqs: Node.js 18+

```bash
cd smart-dispatch-frontend
npm install
npm run dev
```

The frontend uses the API base URL defined in its environment/config. Update it to match your backend host.

## Simulation and Routing

Routing data and simulation assets live in [simulation](simulation) and [simulation/egypt_map](simulation/egypt_map).

Local dev note (important): I started using a local OSRM server for routing paths in the simulation, but that update has not been pushed yet. If you are working from the current repo state, the simulation will still use the older path setup unless you apply the local-server changes.

## Data Model Snapshot

Core entities: `User`, `Incident`, `Vehicle`, `Assignment`, `vehicle_location`, `Notification`.

The backend uses Spring JDBC (`JdbcTemplate`) for explicit, optimized SQL control instead of a full ORM.

## API Flow Summary

- Auth: `POST /auth/login` returns a JWT.
- Dispatcher: view incidents, find vehicles, create assignments.
- Responder: accept assignments, update status, stream location.
- Admin: manage users and roles.

## Database Bootstrapping

Schema and seed data are initialized from:

- [smart-dispatch-system/src/main/resources/schema.sql](smart-dispatch-system/src/main/resources/schema.sql)
- [smart-dispatch-system/src/main/resources/data.sql](smart-dispatch-system/src/main/resources/data.sql)

## Notes

- If you change ports or hosts, update both backend and frontend configs.
- For load testing scenarios, see [simulation/jmeter](simulation/jmeter).
