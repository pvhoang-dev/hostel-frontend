import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { X } from "react-feather";

const Sidebar = ({ isMobile = false, isOpen = true, onClose }) => {
  const { isAdmin, isManager } = useAuth();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      roles: ["admin", "manager", "tenant"],
    },
    { path: "/users", label: "Users", roles: ["admin"] },
    { path: "/roles", label: "Roles", roles: ["admin"] },
    { path: "/equipments", label: "Equipments", roles: ["admin", "manager"] },
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

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles || item.roles.length === 0) return true;

    return item.roles.some(role =>
        (role === "admin" && isAdmin) ||
        (role === "manager" && isManager)
    );
  });


  return (
      <>
        {isMobile && (
          <div
            className={`
              fixed top-0 left-0 w-64 h-full bg-gray-800 text-white 
              transform transition-transform duration-300 z-50
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}
              md:hidden
            `}
          >
            <button
                onClick={onClose}
                className="absolute top-4 right-4"
                aria-label="Close Menu"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            <div className="p-4 mt-12">
              <h2 className="text-2xl font-semibold mb-8">Management</h2>
              <ul>
                {filteredMenuItems.map((item) => (
                  <li key={item.path} className="mb-2">
                    <NavLink
                      to={item.path}
                      onClick={onClose}
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
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:block bg-gray-800 text-white w-64 min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">Management</h2>
          </div>

          <ul>
            {filteredMenuItems.map((item) => (
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
      </>
  );
};

export default Sidebar;
