# Smart Dispatch System

This project is a comprehensive Emergency Response System designed to manage incidents, dispatch vehicles, and coordinate emergency responders. This documentation primarily focuses on the **backend architecture**, **database schema**, and **data access patterns**.

## 🛠️ Tech Stack

- **Language**: Java 21
- **Framework**: Spring Boot 3.3.4
- **Database**: MySQL
- **Security**: Spring Security, JWT (JSON Web Tokens)
- **Real-time**: WebSocket (Spring Boot Starter WebSocket)
- **Build Tool**: Maven

## 📂 Project Structure

The backend code is located in `smart-dispatch-system`. It follows a layered architecture with feature-based packaging:

- **`com.smartdispatch`**
    - **`authentication`**: Handles user login and JWT generation.
    - **`dispatcher`**: Core logic for managing incidents, vehicles, and assignments.
    - **`emergency_responder`**: Logic specific to responders.
    - **`vehiclemanagement`**: Vehicle tracking and management.
    - **`report`**: Reporting functionality.
    - **`security`**: Security configuration and filters.

## 🗄️ Database Schema

The database is designed to handle users, incidents, vehicles, and the assignments linking them.

### Key Tables

1.  **`User`**
    -   Stores system users (Admins, Dispatchers, Operators, Citizens).
    -   **Key Columns**: `id`, `email`, `password`, `role` (ENUM).

2.  **`Incident`**
    -   Represents an emergency event.
    -   **Key Columns**: `type` (FIRE, MEDICAL, CRIME), `level` (HIGH, MEDIUM, LOW), `status` (PENDING, ASSIGNED, RESOLVED), `latitude`, `longitude`.

3.  **`Vehicle`**
    -   Emergency vehicles available for dispatch.
    -   **Key Columns**: `type` (AMBULANCE, FIRETRUCK, POLICE), `status` (AVAILABLE, ONROUTE, RESOLVING), `capacity`.

4.  **`Assignment`**
    -   Links a **Dispatcher**, an **Incident**, and a **Vehicle**.
    -   **Key Columns**: `dispatcher_id`, `incident_id`, `vehicle_id`, `status`, `time_assigned`.

5.  **`vehicle_location`**
    -   Tracks historical and current location of vehicles.
    -   **Key Columns**: `vehicle_id`, `latitude`, `longitude`, `time_stamp`.

6.  **`Notification`**
    -   System notifications for users.
    -   **Key Columns**: `notified_id`, `notification_type`, `content`.

### Data Access (DAO Layer)

The application uses **Spring JDBC (`JdbcTemplate`)** for direct control over SQL queries, rather than a high-level ORM like Hibernate. This allows for optimized queries and explicit data mapping.

-   **DAOs**: Located in `daos` packages (e.g., `AssignmentDaoImp`, `IncidentDaoImp`).
-   **RowMappers**: Custom inner classes map `ResultSet` rows to Entity objects.

**Example Query (Assignment Creation):**
```sql
INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, status, time_assigned)
VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
```

## 🚀 Setup & Configuration

### Prerequisites
-   Java 21 SDK
-   MySQL Server

### Database Setup
1.  Create a MySQL database named `smart_dispatch`.
2.  The application is configured to initialize the schema automatically using `schema.sql` and `data.sql` in `src/main/resources`.
3.  **Configuration**: Check `src/main/resources/application.properties`.
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/smart_dispatch?createDatabaseIfNotExist=true...
    spring.datasource.username=root  # Default, update if needed
    spring.datasource.password=      # Default, update if needed
    ```

### Running the Application
Navigate to the `smart-dispatch-system` directory and run:

```bash
./mvnw spring-boot:run
```

The server will start on port **7070** (defined in `application.properties`).

## 🔌 API & General Flow

### Authentication Flow
1.  **Login**: `POST /auth/login` (handled by `LoginController`).
    -   Accepts credentials.
    -   Returns a **JWT** if valid.
2.  **Protected Routes**: Subsequent requests must include the JWT in the `Authorization` header (`Bearer <token>`).

### Dispatcher Flow
The `DispatcherController` (`/api/dispatcher`) manages the core workflow:
1.  **View Incidents**: `GET /api/dispatcher/incidents/pending` fetches incidents needing attention.
2.  **Find Vehicles**: `GET /api/dispatcher/vehicles/available/{type}` finds appropriate vehicles.
3.  **Assign**: `POST /api/dispatcher/assignments/create` creates a new assignment, linking vehicle to incident.
    -   Updates `Assignment` table.
    -   Updates `Vehicle` status to `ONROUTE`.
    -   Updates `Incident` status to `ASSIGNED`.

### Emergency Responder Flow
The `ResponderController` (`/api/responder`) handles actions for the personnel on the ground:
1.  **View Assignments**: `GET /api/responder/assignments` lists assigned incidents.
2.  **Respond**: `POST /api/responder/assignments/{id}/respond` to accept or reject an assignment.
3.  **Update Status**: `PUT /api/responder/assignments/{id}/status` updates the status (e.g., ONROUTE, RESOLVING).
4.  **Mark Arrival**: `POST /api/responder/assignments/{id}/arrive` signals arrival at the scene.
5.  **Complete**: `POST /api/responder/assignments/{id}/complete` marks the assignment as finished.
6.  **Location Updates**: `POST /api/responder/location` updates the vehicle's current coordinates.

### Admin Flow
The `AdminUserController` (`/api/admin/users`) allows administrators to manage system users:
1.  **List Users**: `GET /api/admin/users` fetches users with pagination and filtering (by role or search term).
2.  **Promote/Demote**: `PUT /api/admin/users/{id}/role` updates a user's role (e.g., promoting a Citizen to Operator).
