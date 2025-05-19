import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serviceService } from "../../api/services";
import ServiceForm from "../../components/forms/ServiceForm";
import Card from "../../components/ui/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const ServiceCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});

  const { execute: createServiceApi, loading: isSubmitting } = useApi(
    serviceService.createService
  );

  const handleSubmit = async (formData) => {
    setErrors({}); // Clear previous errors
    const response = await createServiceApi(formData);

    if (response.success) {
      showSuccess("Tạo dịch vụ thành công");
      navigate("/services");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data); // Set validation errors from API
      }
      showError(response.message || "Lỗi khi tạo dịch vụ");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Tạo dịch vụ</h1>
        <button
          onClick={() => navigate("/services")}
          className="btn btn-light fw-semibold"
        >
          Back
        </button>
      </div>

      <Card>
        <ServiceForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
        />
      </Card>
    </div>
  );
};

export default ServiceCreate;
