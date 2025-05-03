import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { houseSettingService } from "../../../api/houseSettings";
import { houseService } from "../../../api/houses";
import HouseSettingForm from "../../../components/forms/HouseSettingForm";
import Card from "../../../components/common/Card";
import useAlert from "../../../hooks/useAlert";
import useApi from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import Loader from "../../../components/common/Loader";

const HouseSettingCreate = () => {
  const { houseId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});
  const { user, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);

  // Hooks MUST be declared at the top level, not inside conditions
  const { execute: createHouseSetting, loading: isSubmitting } = useApi(
    houseSettingService.createHouseSetting
  );

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      if (isAdmin) {
        setCanCreate(true);
        setLoading(false);
        return;
      }

      if (isManager) {
        // For managers, verify they manage this house
        const response = await houseService.getHouse(houseId);
        if (response.success) {
          if (response.data.manager.id === user.id) {
            setCanCreate(true);
          } else {
            showError("Bạn không có quyền tạo nội quy cho nhà này");
            navigate(`/houses/${houseId}`);
          }
        } else {
          showError("Không thể xác minh quyền truy cập");
          navigate(`/houses/${houseId}`);
        }
      } else {
        showError("Bạn không có quyền tạo nội quy nhà");
        navigate(`/houses/${houseId}`);
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi kiểm tra quyền");
      navigate(`/houses/${houseId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    // Ensure we always use the house ID from the URL if available
    const dataToSubmit = {
      ...formData,
      house_id: houseId || formData.house_id,
    };

    const response = await createHouseSetting(dataToSubmit);

    if (response.success) {
      showSuccess("Tạo nội quy nhà thành công");
      navigate(`/houses/${houseId}`);
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Lỗi khi tạo nội quy nhà");
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!canCreate) {
    return null;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Tạo nội quy nhà mới</h1>
        <button
          onClick={() => navigate(`/houses/${houseId}`)}
          className="btn btn-light fw-semibold"
        >
          Quay lại
        </button>
      </div>

      <Card>
        <HouseSettingForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
          houseId={houseId}
        />
      </Card>
    </div>
  );
};

export default HouseSettingCreate;
