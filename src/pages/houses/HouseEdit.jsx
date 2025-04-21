import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { houseService } from "../../api/houses";
import HouseForm from "../../components/forms/HouseForm";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const HouseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { user } = useAuth();

  const [houseData, setHouseData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const { execute: updateHouse, loading: isSubmitting } = useApi(
    houseService.updateHouse
  );
  const { execute: fetchHouse } = useApi(houseService.getHouse);

  useEffect(() => {
    if (user) {
      loadHouse();
    }
  }, [id, user]);

  const loadHouse = async () => {
    setLoading(true);
    const response = await fetchHouse(id);

    if (response.success) {
      setHouseData(response.data);

      if (user) {
        const isAdmin = user?.role === "admin";
        const isManager = user?.role === "manager";
        const isHouseManager = response.data.manager?.id === user?.id;

        if (!isAdmin && !(isManager && isHouseManager)) {
          showError("Bạn không có quyền chỉnh sửa nhà này");
          navigate(`/houses/${id}`);
          return;
        }
      }
    } else {
      showError("Lỗi khi tải thông tin nhà");
      navigate("/houses");
    }
    setLoading(false);
  };

  const handleSubmit = async (formData) => {
    const dataToSubmit = { ...formData };
    if (dataToSubmit.manager_id === "") {
      dataToSubmit.manager_id = null;
    }

    const response = await updateHouse(id, dataToSubmit);

    if (response.success) {
      showSuccess("Cập nhật nhà thành công");
      navigate("/houses");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi cập nhật nhà");
      }
    }
  };

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Chỉnh sửa nhà</h1>
        <button
          onClick={() => navigate("/houses")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Quay lại
        </button>
      </div>

      <Card>
        {houseData && (
          <HouseForm
            initialData={houseData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errors={errors}
            mode="edit"
          />
        )}
      </Card>
    </div>
  );
};

export default HouseEdit;
