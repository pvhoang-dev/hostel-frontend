import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestService } from "../../api/requests";
import RequestForm from "../../components/forms/RequestForm";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const RequestCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { execute: createRequest, loading: isSubmittingRequest } = useApi(
    requestService.createRequest
  );

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await createRequest(formData);

      if (response.success) {
        showSuccess("Yêu cầu đã được tạo thành công!");
        navigate(`/requests/${response.data.id}`);
      } else {
        showError(response.message || "Đã xảy ra lỗi khi tạo yêu cầu");

        if (response.errors) {
          setErrors(response.errors);
        }
      }
    } catch (error) {
      console.error("Error creating request:", error);

      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }

      showError("Đã xảy ra lỗi khi tạo yêu cầu!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Tạo yêu cầu mới</h1>
        <button
          onClick={() => navigate("/requests")}
          className="btn btn-light fw-semibold"
        >
          Quay lại
        </button>
      </div>

      <Card>
        <RequestForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
        />
      </Card>
    </div>
  );
};

export default RequestCreate;
