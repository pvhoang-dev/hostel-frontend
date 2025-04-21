// src/pages/equipments/EquipmentDetail.jsx
import { useState, useEffect } from "react";
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Thông tin thiết bị</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate("/equipments")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Back
          </button>
          <Link
            to={`/equipments/${id}/edit`}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Sửa
          </Link>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Thông tin</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Tên:</span>
                <span className="ml-2 font-medium">{equipment.name}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Thông tin hệ thống</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">ID:</span>
                <span className="ml-2">{equipment.id}</span>
              </div>
              <div>
                <span className="text-gray-600">Tạo:</span>
                <span className="ml-2">{equipment.created_at}</span>
              </div>
              <div>
                <span className="text-gray-600">Sửa lần cuối:</span>
                <span className="ml-2">{equipment.updated_at}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EquipmentDetail;
