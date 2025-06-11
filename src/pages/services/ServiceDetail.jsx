import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { serviceService } from "../../api/services";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
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
          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin dịch vụ</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "40%" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tên:</td>
                    <td>{service.name}</td>
                  </tr>
                  <tr>
                    <td>Giá mặc định:</td>
                    <td>{service.default_price?.toLocaleString()} VND</td>
                  </tr>
                  <tr>
                    <td>Đơn vị:</td>
                    <td>{service.unit}</td>
                  </tr>
                  <tr>
                    <td>Được đo?:</td>
                    <td
                      className={
                        service.is_metered ? "text-success" : "text-danger"
                      }
                    >
                      {service.is_metered ? "Có" : "Không"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin hệ thống</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "40%" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ID:</td>
                    <td>{service.id}</td>
                  </tr>
                  <tr>
                    <td>Tạo:</td>
                    <td>{service.created_at}</td>
                  </tr>
                  <tr>
                    <td>Sửa lần cuối:</td>
                    <td>{service.updated_at}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ServiceDetail;
