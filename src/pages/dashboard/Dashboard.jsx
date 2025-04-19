// src/pages/dashboard/Dashboard.jsx
import { useAuth } from "../../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-medium mb-4">Welcome, {user?.username}!</h2>
        <p className="text-gray-600">
          This is the admin dashboard for the H-Hostel Management System. Use
          the sidebar navigation to access different sections of the
          application.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-blue-50 p-4 rounded border border-blue-100">
            <h3 className="text-lg font-medium text-blue-700">
              User Management
            </h3>
            <p className="mt-2 text-sm text-blue-600">
              Manage users, assign roles, and update account information.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded border border-green-100">
            <h3 className="text-lg font-medium text-green-700">
              House Management
            </h3>
            <p className="mt-2 text-sm text-green-600">
              Manage houses, rooms, and assign managers to properties.
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded border border-purple-100">
            <h3 className="text-lg font-medium text-purple-700">
              Financial Management
            </h3>
            <p className="mt-2 text-sm text-purple-600">
              Manage invoices, payments, and financial records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
