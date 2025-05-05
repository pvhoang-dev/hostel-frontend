import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../api/notifications";
import Card from "../../components/common/Card";
import NotificationForm from "../../components/forms/NotificationForm";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import { useAuth } from "../../hooks/useAuth";

const NotificationCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, isTenant } = useAuth();

  // Tenant không được phép tạo thông báo
  if (isTenant) {
    navigate("/unauthorized");
    return null;
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await notificationService.createNotification(formData);

      if (response.success) {
        showSuccess("Tạo thông báo thành công");
        navigate("/notifications");
      } else {
        showError(response.message || "Có lỗi xảy ra khi tạo thông báo");
        if (response.errors) {
          setErrors(response.errors);
        }
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi tạo thông báo");
      console.error("Error creating notification:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <Loader />;
  }

  return (
    <div className="container-fluid py-3">
      <h3 className="mb-3">Tạo thông báo mới</h3>
      <Card>
        <NotificationForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
        />
      </Card>
    </div>
  );
};

export default NotificationCreate;
