import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notificationService } from "../../api/notifications";
import Card from "../../components/ui/Card";
import NotificationForm from "../../components/forms/NotificationForm";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import { useAuth } from "../../hooks/useAuth";
import useApi from "../../hooks/useApi";

const NotificationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, isAdmin, isManager } = useAuth();

  const {
    data: notification,
    loading,
    execute: fetchNotification,
  } = useApi(notificationService.getNotification);

  const { execute: updateNotification } = useApi(
    notificationService.updateNotification
  );

  useEffect(() => {
    if (id && user) {
      loadNotification();
    }
  }, [id, user]);

  const loadNotification = async () => {
    try {
      await fetchNotification(id);
    } catch (error) {
      showError("Không thể tải thông tin thông báo");
      navigate("/notifications");
    }
  };

  const handleSubmit = async (formData) => {
    // Admin can edit any notification, Managers can edit any notification they can view,
    // Other users can only edit their own
    if (
      !(
        isAdmin ||
        isManager ||
        (notification && notification.user_id === user?.id)
      )
    ) {
      showError("Bạn không có quyền sửa thông báo này");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await updateNotification(id, formData);

      if (response.success) {
        showSuccess("Cập nhật thông báo thành công");
      } else {
        showError(response.message || "Có lỗi xảy ra khi cập nhật thông báo");
        if (response.errors) {
          setErrors(response.errors);
        }
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi cập nhật thông báo");
      console.error("Error updating notification:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading || !notification) {
    return <Loader />;
  }

  // Check permissions - let backend handle specific tenant permissions for managers
  const canEdit =
    isAdmin || isManager || (notification && notification.user_id === user?.id);
  if (!canEdit) {
    navigate("/unauthorized");
    return null;
  }

  return (
    <div className="container-fluid py-3">
      <h3 className="mb-3">Chỉnh sửa thông báo</h3>
      <Card>
        <NotificationForm
          initialData={notification}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="edit"
        />
      </Card>
    </div>
  );
};

export default NotificationEdit;
