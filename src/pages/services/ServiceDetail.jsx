import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { serviceService } from "../../api/services";
import Card from "../../components/common/Card";
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
      showError(response.message || "Lỗi khi tải dịch vụ");
      navigate("/services");
    }
  };

  if (isLoading || !service) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Thông tin dịch vụ</h1>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/services")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          <Link
            to={`/services/${id}/edit`}
            className="btn btn-primary fw-semibold"
          >
            Sửa
          </Link>
        </div>
      </div>

      <Card>
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <p className="small fw-medium text-secondary">ID</p>
            <p className="mt-1 fs-5">{service.id}</p>
          </div>
          <div className="col-12 col-md-6">
            <p className="small fw-medium text-secondary">Tên</p>
            <p className="mt-1 fs-5">{service.name}</p>
          </div>
          <div className="col-12 col-md-6">
            <p className="small fw-medium text-secondary">Giá mặc định</p>
            <p className="mt-1 fs-5">
              {service.default_price?.toLocaleString()} VND
            </p>
          </div>
          <div className="col-12 col-md-6">
            <p className="small fw-medium text-secondary">Đơn vị</p>
            <p className="mt-1 fs-5">{service.unit}</p>
          </div>
          <div className="col-12 col-md-6">
            <p className="small fw-medium text-secondary">Được đo?</p>
            <p
              className={`mt-1 fs-5 ${
                service.is_metered ? "text-success" : "text-danger"
              }`}
            >
              {service.is_metered ? "Có" : "Không"}
            </p>
          </div>
          <div className="col-12 col-md-6">
            <p className="small fw-medium text-secondary">Tạo</p>
            <p className="mt-1 fs-5">{service.created_at}</p>
          </div>
          <div className="col-12 col-md-6">
            <p className="small fw-medium text-secondary">Cập nhật lần cuối</p>
            <p className="mt-1 fs-5">{service.updated_at}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ServiceDetail;
