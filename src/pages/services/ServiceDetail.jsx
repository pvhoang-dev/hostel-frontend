import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { serviceService } from "../../api/services";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const { isAdmin } = useAuth();

  const {
    data: service,
    loading,
    execute: fetchService,
  } = useApi(serviceService.getService);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    const response = await fetchService(id);

    if (!response.success) {
      showError("Lỗi khi tải dịch vụ");
      navigate("/services");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!service) {
    return <div>Service not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Thông tin dịch vụ</h3>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/services")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          {isAdmin && (
            <Link
              to={`/services/${id}/edit`}
              className="btn btn-primary fw-semibold"
            >
              Sửa
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <h4 className="fs-5 fw-medium mb-3">Thông tin dịch vụ</h4>
            <div className="d-flex flex-column gap-2">
              <div>
                <span>Tên: </span>
                <span className="ms-2 fw-medium">{service.name}</span>
              </div>
              <div>
                <span>Giá mặc định: </span>
                <span className="ms-2 fw-medium">
                  {service.default_price?.toLocaleString()} VND
                </span>
              </div>
              <div>
                <span>Đơn vị: </span>
                <span className="ms-2 fw-medium">{service.unit}</span>
              </div>
              <div>
                <span>Được đo?: </span>
                <span
                  className={`ms-2 fw-medium ${
                    service.is_metered ? "text-success" : "text-danger"
                  }`}
                >
                  {service.is_metered ? "Có" : "Không"}
                </span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <h4 className="fs-5 fw-medium mb-3">Thông tin hệ thống</h4>
            <div className="d-flex flex-column gap-2">
              <div>
                <span>ID: </span>
                <span className="ms-2">{service.id}</span>
              </div>
              <div>
                <span>Tạo: </span>
                <span className="ms-2">{service.created_at}</span>
              </div>
              <div>
                <span>Sửa lần cuối: </span>
                <span className="ms-2">{service.updated_at}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ServiceDetail;
