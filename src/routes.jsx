// src/routes.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import UserList from "./pages/users/UserList";
import UserCreate from "./pages/users/UserCreate";
import UserEdit from "./pages/users/UserEdit";
import UserDetail from "./pages/users/UserDetail";
import { useAuth } from "./hooks/useAuth";

// Protected route wrapper component
const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

// Public route wrapper component
const PublicRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

// Router configuration
const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: "/login",
      element: <PublicRoute element={<Login />} />,
    },
    {
      path: "/",
      element: <ProtectedRoute element={<Layout />} />,
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "users",
          element: (
            <ProtectedRoute element={<UserList />} allowedRoles={["admin"]} />
          ),
        },
        {
          path: "users/create",
          element: (
            <ProtectedRoute element={<UserCreate />} allowedRoles={["admin"]} />
          ),
        },
        {
          path: "users/:id",
          element: (
            <ProtectedRoute element={<UserDetail />} allowedRoles={["admin"]} />
          ),
        },
        {
          path: "users/:id/edit",
          element: (
            <ProtectedRoute element={<UserEdit />} allowedRoles={["admin"]} />
          ),
        },
        // Add more routes for other pages here
      ],
    },
    {
      path: "*",
      element: <div>404 Not Found</div>,
    },
  ]);

  return router;
};

export default Routes;
