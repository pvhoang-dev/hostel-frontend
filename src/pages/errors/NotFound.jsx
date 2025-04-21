import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "react-feather";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md w-full">
        {/* SVG illustration */}
        <div className="w-full max-w-xs mx-auto mb-8">
          <svg
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M404.9 109.1C366.4 70.6 315.2 48 256 48C141.1 48 48 141.1 48 256c0 114.9 93.1 208 208 208s208-93.1 208-208c0-59.2-22.6-110.4-59.1-146.9z"
              stroke="#1F2937"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#F3F4F6"
            />
            <path
              d="M128 192a16 16 0 1 1 0-32 16 16 0 0 1 0 32zm256 0a16 16 0 1 1 0-32 16 16 0 0 1 0 32z"
              fill="#1F2937"
            />
            <path
              d="M192 352h128M176 288s16 32 80 32 80-32 80-32"
              stroke="#1F2937"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M404.9 109.1l-42.4 42.4m-255-42.4l42.4 42.4"
              stroke="#4F46E5"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="256"
              y="440"
              fontSize="120"
              fontWeight="bold"
              textAnchor="middle"
              fill="#4F46E5"
            >
              404
            </text>
          </svg>
        </div>

        {/* Error content */}
        <h1 className="text-4xl font-bold text-gray-800 mb-10">
          Trang không tồn tại
        </h1>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link
            to="/"
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Về trang chủ
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
