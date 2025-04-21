import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { serviceService } from "../../api/services";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();

  const {
    data: service,
    loading: isLoading,
    execute: fetchServiceApi,
  } = useApi(serviceService.getService, null, false); // Don't execute immediately

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    const response = await fetchServiceApi(id);
    if (!response.success) {
      showError(response.message || "Failed to load service details");
      navigate("/services");
    }
  };

  if (isLoading || !service) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Service Details</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => navigate("/services")}>
            Back to Services
          </Button>
          <Button
            as={Link}
            to={`/services/${id}/edit`}
            variant="primary" // Assuming Button has variant prop
          >
            Edit Service
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">ID</p>
            <p className="mt-1 text-lg text-gray-900">{service.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="mt-1 text-lg text-gray-900">{service.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Default Price</p>
            <p className="mt-1 text-lg text-gray-900">
              {service.default_price?.toLocaleString()} VND
            </p>{" "}
            {/* Format price */}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Unit</p>
            <p className="mt-1 text-lg text-gray-900">{service.unit}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Is Metered?</p>
            <p
              className={`mt-1 text-lg ${
                service.is_metered ? "text-green-600" : "text-red-600"
              }`}
            >
              {service.is_metered ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Created At</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(service.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Last Updated At</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(service.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
        {/* Add section for related data like RoomServices if needed */}
        {/* service.roomServices && service.roomServices.length > 0 && (...) */}
      </Card>
    </div>
  );
};

export default ServiceDetail;
