import { useState, useEffect } from "react";
import Card from "../../components/common/Card";
import { useNavigate, useParams } from "react-router-dom";
import { requestService } from "../../api/requests";
import useAlert from "../../hooks/useAlert";
import { useAuth } from "../../hooks/useAuth";
import RequestForm from "../../components/forms/RequestForm";
import Loader from "../../components/common/Loader";

const RequestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState(null);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const response = await requestService.getRequest(id);
      setRequestData(response);

      // Kiểm tra quyền chỉnh sửa
      const hasPermission =
        user.role === "admin" ||
        (user.role === "manager" &&
          (response.creator_id === user.id ||
            response.assignee_id === user.id)) ||
        (user.role === "tenant" &&
          response.creator_id === user.id &&
          response.status === "pending");

      if (!hasPermission) {
        setPermissionError(true);
        showAlert("Bạn không có quyền chỉnh sửa yêu cầu này", "danger");
      }
    } catch (error) {
      showAlert("Đã xảy ra lỗi khi tải thông tin yêu cầu", "danger");
      console.error("Error fetching request:", error);
      navigate("/requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrors({});

    try {
      await requestService.updateRequest(id, formData);
      showAlert("Yêu cầu đã được cập nhật thành công!", "success");
      navigate(`/requests/${id}`);
    } catch (error) {
      showAlert("Đã xảy ra lỗi khi cập nhật yêu cầu", "danger");
      console.error("Error updating request:", error);

      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (permissionError) {
    return (
      <div className="container-fluid">
        <Card>
          <Card.Body className="text-center">
            <h5 className="text-danger">
              Bạn không có quyền chỉnh sửa yêu cầu này
            </h5>
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate("/requests")}
            >
              Quay lại danh sách yêu cầu
            </button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Card>
        <Card.Header>
          <h5 className="mb-0">Chỉnh sửa yêu cầu #{id}</h5>
        </Card.Header>
        <Card.Body>
          {requestData && (
            <RequestForm
              initialData={requestData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              errors={errors}
              mode="edit"
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default RequestEdit;
