import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { CircularProgress, Box } from "@mui/material";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (location.pathname === "/reportform") {
    return children;
  }

  switch (user.role) {
    case 'CITIZEN':
      return <Navigate to="/reportform" replace />;

    case 'OPERATOR':
      if (location.pathname.startsWith('/responder')) return children;
      return <Navigate to="/responder" replace />;

    case 'DISPATCHER':
      if (location.pathname.startsWith('/dispatcher')) return children;
      return <Navigate to="/dispatcher" replace />;

    case 'ADMIN':
      if (location.pathname.startsWith('/admin')) return children;
      return <Navigate to="/admin" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    if (user.role === 'OPERATOR') {
      return <Navigate to="/responder" replace />;

    } else if (user.role === 'DISPATCHER') {
      return <Navigate to="/dispatcher" replace />;

    } else if (user.role === 'CITIZEN') {
      return <Navigate to="/reportform" replace />;

    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;

    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
