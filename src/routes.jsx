// src/routes.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import UserList from "./pages/users/UserList";
import UserCreate from "./pages/users/UserCreate";
import UserEdit from "./pages/users/UserEdit";
import UserDetail from "./pages/users/UserDetail";
import RoleList from "./pages/roles/RoleList";
import RoleCreate from "./pages/roles/RoleCreate";
import RoleEdit from "./pages/roles/RoleEdit";
import RoleDetail from "./pages/roles/RoleDetail";
import EquipmentList from "./pages/equipments/EquipmentList";
import EquipmentCreate from "./pages/equipments/EquipmentCreate";
import EquipmentEdit from "./pages/equipments/EquipmentEdit";
import EquipmentDetail from "./pages/equipments/EquipmentDetail";
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
        // User routes
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
        // Roles routes
        {
          path: "roles",
          element: (
              <ProtectedRoute element={<RoleList/>} allowedRoles={["admin"]}/>
          ),
        },
        {
          path: "roles/create",
          element: (
              <ProtectedRoute element={<RoleCreate/>} allowedRoles={["admin"]}/>
          ),
        },
        {
          path: "roles/:id",
          element: (
              <ProtectedRoute element={<RoleDetail/>} allowedRoles={["admin"]}/>
          ),
        },
        {
          path: "roles/:id/edit",
          element: (
              <ProtectedRoute element={<RoleEdit/>} allowedRoles={["admin"]}/>
          ),
        },
        // Equipments routes
        {
          path: "equipments",
          element: (
            <ProtectedRoute element={<EquipmentList />} allowedRoles={["admin"]} />
          ),
        },
        {
          path: "equipments/create",
          element: (
            <ProtectedRoute element={<EquipmentCreate />} allowedRoles={["admin"]} />
          ),
        },
        {
          path: "equipments/:id",
          element: (
              <ProtectedRoute element={<EquipmentDetail/>} allowedRoles={["admin"]}/>
          ),
        },
        {
          path: "equipments/:id/edit",
          element: (
              <ProtectedRoute element={<EquipmentEdit/>} allowedRoles={["admin"]}/>
          ),
        },
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
