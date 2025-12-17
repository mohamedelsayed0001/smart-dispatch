import Login from './registration/Login';
import Signup from './registration/Signup';
import Testing from './testing/Testing';
import AdminPage from './admin/AdminPage.jsx';
import DispatcherDashboard from './dispatcher/DispatcherDashboard';
import EmergencyReportForm from './report/Report.jsx';
import ResponderDashboard from './emergency-responder/ResponderDashboard';
import { ProtectedRoute, PublicRoute } from "./components/Routing.jsx";
import { Navigate } from 'react-router-dom';

export const routes = [
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: "/test",
    element: <Testing />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dispatcher/*",
    element: (
      <ProtectedRoute>
        <DispatcherDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reportform",
    element: (
      <ProtectedRoute>
        <EmergencyReportForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/responder/*",
    element: (
      <ProtectedRoute>
        <ResponderDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "*",
    element: <h1>Are you lost?</h1>,
  },
];
