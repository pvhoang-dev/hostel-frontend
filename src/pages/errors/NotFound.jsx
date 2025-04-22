import { Link } from "react-router-dom";
import Button from "../../components/common/Button.jsx";

const NotFound = () => {
  return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light p-4">
        <div className="text-center w-100" style={{ maxWidth: "400px" }}>
          {/* SVG illustration */}
          <div className="mx-auto mb-4" style={{ maxWidth: "280px" }}>
            <svg
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-100 h-auto"
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
          <h1 className="fw-bold text-dark mb-4 fs-1">
            Trang không tồn tại
          </h1>

          {/* Action buttons */}
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <Button
                as={Link}
                to="/"
                className="btn btn-secondary d-flex align-items-center justify-content-center mr-3"
            >
              <i className="mdi mdi-home me-2"></i>
              Về trang chủ
            </Button>
            <Button
                as={Link}
                onClick={() => window.history.back()}
                className="btn btn-primary d-flex align-items-center justify-content-center"
            >
              <i className="mdi mdi-arrow-left me-2"></i>
              Quay lại trang trước
            </Button>
          </div>
        </div>
      </div>
  );
};

export default NotFound;