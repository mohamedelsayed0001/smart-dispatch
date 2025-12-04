# Smart Dispatch System

Smart Dispatch is a comprehensive full-stack application designed for efficient dispatch operations management. It leverages a modern technology stack to provide real-time updates, secure authentication, and interactive map integration.

## 🚀 Features

*   **Real-time Dispatching**: Instant updates and communication using WebSockets.
*   **Interactive Maps**: Visual tracking and dispatching with Leaflet and Google Maps integration.
*   **Secure Authentication**: robust security with JWT (JSON Web Tokens) and Spring Security.
*   **Responsive Design**: A modern, responsive frontend built with React and Tailwind CSS.
*   **Role-Based Access**: (Implied by security setup) Secure access control for different user roles.

## 🛠️ Technology Stack

### Backend (`smart-dispatch-system`)
*   **Language**: Java 21
*   **Framework**: Spring Boot 3.3.4
*   **Database**: MySQL
*   **Security**: Spring Security, JWT
*   **Real-time**: WebSocket (STOMP)
*   **Build Tool**: Maven

### Frontend (`smart-dispatch-frontend`)
*   **Framework**: React 19 (Vite)
*   **Language**: JavaScript/TypeScript
*   **Styling**: Tailwind CSS
*   **Maps**: Leaflet, React Leaflet, Google Maps API
*   **HTTP Client**: Axios
*   **State/Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
*   **Java Development Kit (JDK) 21**
*   **Node.js** (Latest LTS recommended)
*   **MySQL Server**

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-dispatch
```

### 2. Database Setup
1.  Ensure your MySQL server is running.
2.  Create a database named `smart_dispatch` (or the application will attempt to create it if configured).
3.  Update the database credentials in `smart-dispatch-system/src/main/resources/application.properties` if your local setup differs from the defaults:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/smart_dispatch
    spring.datasource.username=your_username
    spring.datasource.password=your_password
    ```

### 3. Backend Setup
Navigate to the backend directory and run the application:
```bash
cd smart-dispatch-system
./mvnw spring-boot:run
```
The backend server will start (default port is usually 8080 or as configured).

### 4. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd smart-dispatch-frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
