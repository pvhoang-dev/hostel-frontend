import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { notificationService } from "../../api/notifications";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import { useAuth } from "../../hooks/useAuth";
import useApi from "../../hooks/useApi";

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { user, isAdmin, isManager } = useAuth();

  const {
    data: notification,
    loading,
    execute: fetchNotification,
  } = useApi(notificationService.getNotification);

  const { execute: deleteNotification } = useApi(
    notificationService.deleteNotification
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

  const handleDelete = async () => {
    // Admin can delete any, Managers can delete notifications they can view,
    // Other users can only delete their own
    if (!(isAdmin || isManager || notification?.user_id === user?.id)) {
      showError("Bạn không có quyền xóa thông báo này");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      try {
        const response = await deleteNotification(id);

        if (response.success) {
          showSuccess("Xóa thông báo thành công");
          navigate("/notifications");
        } else {
          showError(response.message || "Có lỗi xảy ra khi xóa thông báo");
        }
      } catch (error) {
        showError("Có lỗi xảy ra khi xóa thông báo");
      }
    }
  };

  // Admin and Manager can edit any notification they can view,
  // Other users can only edit their own
  const canEdit =
    isAdmin || isManager || (notification && notification.user_id === user?.id);

  if (loading || !notification) {
    return <Loader />;
  }

  // Format thời gian
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("vi-VN");
  };

  // Xác định màu badge dựa trên loại thông báo
  const getBadgeClass = (type) => {
    switch (type) {
      case "info":
        return "bg-info";
      case "warning":
        return "bg-warning";
      case "success":
        return "bg-success";
      case "danger":
        return "bg-danger";
      case "request":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  // Lấy tên hiển thị cho loại thông báo
  const getTypeDisplayName = (type) => {
    switch (type) {
      case "info":
        return "Thông tin";
      case "warning":
        return "Cảnh báo";
      case "success":
        return "Thành công";
      case "danger":
        return "Nguy hiểm";
      case "request":
        return "Yêu cầu";
      default:
        return type;
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Chi tiết thông báo</h3>
        <div>
          <Button
            variant="secondary"
            as={Link}
            to="/notifications"
            className="me-2 mr-2"
          >
            Quay lại
          </Button>
          {canEdit && (
            <>
              <Button
                variant="primary"
                as={Link}
                to={`/notifications/${id}/edit`}
                className="me-2 mr-2"
              >
                Chỉnh sửa
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Xóa
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <strong>ID:</strong> {notification.id}
            </div>
            {notification.user && (
              <div className="mb-3">
                <strong>Người nhận:</strong> {notification.user.name} (
                {notification.user.email})
              </div>
            )}
            <div className="mb-3">
              <strong>Loại thông báo:</strong>{" "}
              <span
                className={`badge ${getBadgeClass(
                  notification.type
                )} text-white`}
              >
                {getTypeDisplayName(notification.type)}
              </span>
            </div>
            <div className="mb-3">
              <strong>Trạng thái:</strong>{" "}
              {notification.is_read ? (
                <span className="badge bg-success text-white">Đã đọc</span>
              ) : (
                <span className="badge bg-warning text-white">Chưa đọc</span>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <strong>Ngày tạo:</strong>{" "}
              {formatDateTime(notification.created_at)}
            </div>
            <div className="mb-3">
              <strong>Cập nhật lần cuối:</strong>{" "}
              {formatDateTime(notification.updated_at)}
            </div>
            {notification.url && (
              <div className="mb-3">
                <strong>URL:</strong>{" "}
                <a
                  href={notification.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {notification.url}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">Nội dung thông báo</h5>
              </div>
              <div className="card-body">
                <p className="mb-0">{notification.content}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationDetail;
