import { useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Menu } from "react-feather";
import Button from "../common/Button.jsx";
import DropdownIcon from "../icons/DropdownIcon.jsx";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen(prev => !prev);
  }, []);

  return (
      <nav className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
                className="md:hidden mr-4"
                onClick={onMenuToggle}
                aria-label="Toggle Menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 flex items-center justify-between">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">H-Hostel</h1>
              </div>

              {user && (
                <div className="relative">
                  <Button
                    type="button"
                    variant="success"
                    onClick={toggleUserMenu}
                    className="flex items-center group"
                  >
                    <span className="mr-2 hidden sm:block">{user.username}</span>
                    <DropdownIcon
                      className={`transform ${isUserMenuOpen ? 'rotate-180' : ''} 
                      group-hover:text-green-700`}
                    />
                  </Button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                      <div className="py-1">
                    <span className="block px-4 py-2 text-sm text-gray-700 sm:hidden">
                      {user.username}
                    </span>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;