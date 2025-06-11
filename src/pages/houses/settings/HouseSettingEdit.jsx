import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { houseSettingService } from "../../../api/houseSettings";
import HouseSettingForm from "../../../components/forms/HouseSettingForm";
import Card from "../../../components/ui/Card";
import Loader from "../../../components/ui/Loader";
import useAlert from "../../../hooks/useAlert";
import useApi from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";

const HouseSettingEdit = () => {
  const { houseId, settingId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [houseSetting, setHouseSetting] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, isManager } = useAuth();

  useEffect(() => {
    loadHouseSetting();
  }, [settingId]);

  const { execute: fetchHouseSetting } = useApi(
    houseSettingService.getHouseSetting
  );
  const { execute: updateHouseSetting, loading: isSubmitting } = useApi(
    houseSettingService.updateHouseSetting
  );

  const loadHouseSetting = async () => {
    setLoading(true);
    try {
      const response = await fetchHouseSetting(settingId);
      if (response.success) {
        setHouseSetting(response.data);

        // Check if user has permission to edit
        const hasPermission =
          isAdmin ||
          (isManager && response.data.house?.manager.id === user?.id);

        if (!hasPermission) {
          showError("Bạn không có quyền chỉnh sửa nội quy này");
          navigate(`/houses/${houseId}/settings/${settingId}`);
        }
      } else {
        showError("Lỗi khi tải thông tin nội quy nhà");
        navigate(`/houses/${houseId}`);
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi tải thông tin nội quy nhà");
      console.error("Error loading house setting:", error);
      navigate(`/houses/${houseId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    const response = await updateHouseSetting(settingId, formData);

    if (response.success) {
      showSuccess("Cập nhật nội quy nhà thành công");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Lỗi khi cập nhật nội quy nhà");
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!houseSetting) {
    return <div>Không tìm thấy nội quy</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Chỉnh sửa nội quy nhà</h1>
        <button
          onClick={() => navigate(`/houses/${houseId}/settings/${settingId}`)}
          className="btn btn-light fw-semibold"
        >
          Quay lại
        </button>
      </div>

      <Card>
        <HouseSettingForm
          initialData={houseSetting}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="edit"
          houseId={houseId}
        />
      </Card>
    </div>
  );
};

export default HouseSettingEdit;
