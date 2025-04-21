import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serviceService } from "../../api/services";
import ServiceForm from "../../components/forms/ServiceForm";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Sửa dịch vụ</h1>
        <Button variant="secondary" onClick={() => navigate("/services")}>
          Back
        </Button>
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
