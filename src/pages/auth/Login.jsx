import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useContext } from "react";
import { AlertContext } from "../../contexts/AlertContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [validated, setValidated] = useState(false);
  const [loginError, setLoginError] = useState("");

  const { login } = useAuth();
  const { showError } = useContext(AlertContext);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Vui lòng nhập tên đăng nhập";
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    setLoginError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        // Set the error message from the API
        setLoginError("Tên đăng nhập hoặc mật khẩu không đúng.");
        showError("Tên đăng nhập hoặc mật khẩu không đúng.");
      }
    } catch (error) {
      setLoginError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      showError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow p-4" style={{ maxWidth: "400px", width: "100%" }}>
          <div className="card-body">
            <h3 className="text-center mb-4">
              Đăng nhập vào H-Hostel
            </h3>

            {loginError && (
                <div className="alert alert-danger" role="alert">
                  {loginError}
                </div>
            )}

            <form onSubmit={handleSubmit} className={validated ? 'was-validated' : ''} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="username">
                  Tên đăng nhập
                </label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`form-control ${errors.username && validated ? 'is-invalid' : ''}`}
                    placeholder="Nhập tên đăng nhập"
                    required
                />
                {errors.username && validated && (
                    <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="password">
                  Mật khẩu
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`form-control ${errors.password && validated ? 'is-invalid' : ''}`}
                    placeholder="Nhập mật khẩu"
                    required
                />
                {errors.password && validated && (
                    <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>

              <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Login;