import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }) {
  const token    = useAuthStore((s) => s.token);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function AdminRoute({ children }) {
  const user  = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  if (!token)                    return <Navigate to="/login" replace />;
  if (user?.role !== 'admin')   return <Navigate to="/"      replace />;
  return children;
}
