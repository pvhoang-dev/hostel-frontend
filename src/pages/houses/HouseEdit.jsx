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
  const { user, isAdmin, isManager } = useAuth();

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
      const data = response.data;
      if (data.manager && !data.manager_id) {
        data.manager_id = data.manager.id;
      }
      setHouseData(data);

      if (user) {
        const isHouseManager = data.manager?.id === user?.id;

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
    
    if (!isAdmin && dataToSubmit.manager_id === "") {
      if (houseData && houseData.manager_id) {
        dataToSubmit.manager_id = houseData.manager_id;
      } else if (houseData && houseData.manager) {
        dataToSubmit.manager_id = houseData.manager.id;
      } else {
        delete dataToSubmit.manager_id;
      }
    }

    const response = await updateHouse(id, dataToSubmit);

    if (response.success) {
      showSuccess("Cập nhật nhà thành công");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi cập nhật nhà");
      }
    }
  };

  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Chỉnh sửa nhà</h1>
        <button
          onClick={() => navigate("/houses")}
          className="btn btn-light fw-semibold"
        >
          Back
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
