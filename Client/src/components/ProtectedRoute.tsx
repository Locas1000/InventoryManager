import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;

    // 1. If they aren't logged in at all, kick them to the login page
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // 2. If the route requires an Admin, check their role
    if (requireAdmin) {
        const isAdmin = currentUser.role === "Admin" || currentUser.Role === "Admin";
        if (!isAdmin) {
            // If they are logged in but NOT an admin, kick them back to the dashboard
            return <Navigate to="/" replace />;
        }
    }

    // 3. If they pass the checks, let them in! (<Outlet /> renders the nested route)
    return <Outlet />;
}