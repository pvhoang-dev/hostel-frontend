// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = () => {
  const { isAdmin, isManager } = useAuth();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      roles: ["admin", "manager", "tenant"],
    },
    { path: "/users", label: "Users", roles: ["admin"] },
    { path: "/roles", label: "Roles", roles: ["admin"] },
    { path: "/houses", label: "Houses", roles: ["admin", "manager"] },
    { path: "/rooms", label: "Rooms", roles: ["admin", "manager"] },
    { path: "/contracts", label: "Contracts", roles: ["admin", "manager"] },
    {
      path: "/invoices",
      label: "Invoices",
      roles: ["admin", "manager", "tenant"],
    },
    {
      path: "/payments",
      label: "Payments",
      roles: ["admin", "manager", "tenant"],
    },
    {
      path: "/requests",
      label: "Requests",
      roles: ["admin", "manager", "tenant"],
    },
    {
      path: "/notifications",
      label: "Notifications",
      roles: ["admin", "manager", "tenant"],
    },
    { path: "/settings", label: "Settings", roles: ["admin"] },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">H-Hostel</h2>
      </div>

      <ul>
        {menuItems.map((item) => (
          <li key={item.path} className="mb-2">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `block p-2 rounded ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
