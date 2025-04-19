// src/components/layout/Footer.jsx
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <span className="text-gray-600 text-sm">
              &copy; {currentYear} H-Hostel Management System. All rights
              reserved.
            </span>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
