import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import PaymentMethods from "./pages/PaymentMethods";
import Invoices from "./pages/Invoices";

// Protected route component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { currentUser, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (
    requiredRoles.length > 0 &&
    !requiredRoles.includes(currentUser.role?.code)
  ) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="app-container">
                    <Navbar />
                    <div className="content-container">
                      <Sidebar />
                      <main className="main-content">
                        <Routes>
                          <Route
                            path="/"
                            element={<Navigate to="/dashboard" />}
                          />
                          <Route path="/dashboard" element={<Dashboard />} />

                          <Route
                            path="/users"
                            element={
                              <ProtectedRoute requiredRoles={["admin"]}>
                                <Users />
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/roles"
                            element={
                              <ProtectedRoute requiredRoles={["admin"]}>
                                <Roles />
                              </ProtectedRoute>
                            }
                          />

                          <Route path="/invoices" element={<Invoices />} />
                          <Route
                            path="/payment-methods"
                            element={<PaymentMethods />}
                          />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
