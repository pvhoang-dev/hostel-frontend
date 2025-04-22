import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { userService } from "../../api/users";
import { useAuth } from "../../hooks/useAuth";

const UserChangePassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isOwnAccount = user?.id === parseInt(id);

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const { execute: changePassword, loading: isSubmitting } = useApi(
    userService.changePassword
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const validate = () => {
    let tempErrors = {};

    if (!isAdmin && !formData.current_password && !isOwnAccount) {
      tempErrors.current_password = "Mật khẩu hiện tại là bắt buộc";
    }

    if (!formData.new_password) {
      tempErrors.new_password = "Mật khẩu mới là bắt buộc";
    } else if (formData.new_password.length < 6) {
      tempErrors.new_password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.new_password_confirmation) {
      tempErrors.new_password_confirmation = "Xác nhận mật khẩu là bắt buộc";
    } else if (formData.new_password !== formData.new_password_confirmation) {
      tempErrors.new_password_confirmation = "Mật khẩu xác nhận không khớp";
    }

    setValidationErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const response = await changePassword(id, formData);

    if (response.success) {
      showSuccess("Đổi mật khẩu thành công");
      navigate(`/users/${id}`);
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi đổi mật khẩu");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Đổi mật khẩu người dùng</h3>
        <button
          onClick={() => navigate(`/users/${id}`)}
          className="btn btn-light fw-semibold"
        >
          Back
        </button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          {!isAdmin && (
            <div className="mb-3">
              <label htmlFor="current_password" className="form-label">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                name="current_password"
                id="current_password"
                value={formData.current_password}
                onChange={handleChange}
                className={`form-control ${
                  validationErrors.current_password || errors.current_password
                    ? "is-invalid"
                    : ""
                }`}
              />
              {validationErrors.current_password && (
                <div className="invalid-feedback">
                  {validationErrors.current_password}
                </div>
              )}
              {errors.current_password && (
                <div className="invalid-feedback">
                  {errors.current_password}
                </div>
              )}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="new_password" className="form-label">
              Mật khẩu mới
            </label>
            <input
              type="password"
              name="new_password"
              id="new_password"
              value={formData.new_password}
              onChange={handleChange}
              className={`form-control ${
                validationErrors.new_password || errors.new_password
                  ? "is-invalid"
                  : ""
              }`}
            />
            {validationErrors.new_password && (
              <div className="invalid-feedback">
                {validationErrors.new_password}
              </div>
            )}
            {errors.new_password && (
              <div className="invalid-feedback">{errors.new_password}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="new_password_confirmation" className="form-label">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              name="new_password_confirmation"
              id="new_password_confirmation"
              value={formData.new_password_confirmation}
              onChange={handleChange}
              className={`form-control ${
                validationErrors.new_password_confirmation ||
                errors.new_password_confirmation
                  ? "is-invalid"
                  : ""
              }`}
            />
            {validationErrors.new_password_confirmation && (
              <div className="invalid-feedback">
                {validationErrors.new_password_confirmation}
              </div>
            )}
            {errors.new_password_confirmation && (
              <div className="invalid-feedback">
                {errors.new_password_confirmation}
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                  ></span>
                  Đang xử lý...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserChangePassword;
