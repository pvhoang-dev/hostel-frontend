import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { equipmentService } from "../../api/equipments";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();

  const {
    data: equipment,
    loading,
    execute: fetchEquipment,
  } = useApi(equipmentService.getEquipment);

  useEffect(() => {
    loadEquipment();
  }, [id]);

  const loadEquipment = async () => {
    const response = await fetchEquipment(id);

    if (!response.success) {
      showError("Lỗi khi tải thiết bị");
      navigate("/equipments");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!equipment) {
    return <div>Equipment not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Thông tin thiết bị</h1>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/equipments")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          <Link
            to={`/equipments/${id}/edit`}
            className="btn btn-primary fw-semibold"
          >
            Sửa
          </Link>
        </div>
      </div>

      <Card>
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <h3 className="fs-5 fw-medium mb-3">Thông tin</h3>
            <div className="d-flex flex-column gap-2">
              <div>
                <span className="text-secondary">Tên:</span>
                <span className="ms-2 fw-medium">{equipment.name}</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <h3 className="fs-5 fw-medium mb-3">Thông tin hệ thống</h3>
            <div className="d-flex flex-column gap-2">
              <div>
                <span className="text-secondary">ID:</span>
                <span className="ms-2">{equipment.id}</span>
              </div>
              <div>
                <span className="text-secondary">Tạo:</span>
                <span className="ms-2">{equipment.created_at}</span>
              </div>
              <div>
                <span className="text-secondary">Sửa lần cuối:</span>
                <span className="ms-2">{equipment.updated_at}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EquipmentDetail;
