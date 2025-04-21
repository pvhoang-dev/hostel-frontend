import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serviceService } from "../../api/services";
import ServiceForm from "../../components/forms/ServiceForm";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
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
      showSuccess("Service created successfully");
      navigate("/services");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data); // Set validation errors from API
      }
      showError(response.message || "Failed to create service");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Create Service</h1>
        <Button variant="secondary" onClick={() => navigate("/services")}>
          Back to Services
        </Button>
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
