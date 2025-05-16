import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serviceService } from "../../api/services";
import ServiceForm from "../../components/forms/ServiceForm";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const ServiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  const [serviceData, setServiceData] = useState(null);
  const [errors, setErrors] = useState({});

  const { execute: updateServiceApi, loading: isSubmitting } = useApi(
    serviceService.updateService
  );
  const { execute: fetchServiceApi, loading: isLoading } = useApi(
    serviceService.getService
  );

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    const response = await fetchServiceApi(id);
    if (response.success) {
      setServiceData(response.data);
    } else {
      showError(response.message || "Lỗi khi tải dịch vụ");
      navigate("/services");
    }
  };

  const handleSubmit = async (formData) => {
    setErrors({}); // Clear previous errors
    const response = await updateServiceApi(id, formData);

    if (response.success) {
      showSuccess("Cập nhật dịch vụ thành công");
      navigate("/services");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data); // Set validation errors from API
      }
      showError(response.message || "Lỗi khi cập nhật dịch vụ");
    }
  };

  if (isLoading || !serviceData) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Sửa dịch vụ</h1>
        <button
          onClick={() => navigate("/services")}
          className="btn btn-light fw-semibold"
        >
          Back
        </button>
      </div>

      <Card>
        <ServiceForm
          initialData={serviceData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="edit"
        />
      </Card>
    </div>
  );
};

export default ServiceEdit;
