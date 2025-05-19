import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { settingService } from "../../api/settings";
import SettingForm from "../../components/forms/SettingForm";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const SettingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  const [settingData, setSettingData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const { execute: updateSetting, loading: isSubmitting } = useApi(
    settingService.updateSetting
  );

  // Gọi API trực tiếp không qua useApi hook để xử lý dữ liệu thô
  const loadSetting = async () => {
    setLoading(true);
    try {
      const response = await settingService.getSetting(id);

      // Kiểm tra và log dữ liệu để debug
      console.log("Setting data loaded:", response);

      if (response.success) {
        // Đảm bảo settingData có cấu trúc đúng cho form
        setSettingData({
          key: response.data.key || "",
          value: response.data.value || "",
          description: response.data.description || "",
        });
      } else {
        showError("Lỗi khi tải thông tin cài đặt");
        navigate("/settings");
      }
    } catch (error) {
      console.error("Error loading setting:", error);
      showError("Đã xảy ra lỗi khi tải dữ liệu");
      navigate("/settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      const response = await updateSetting(id, formData);

      if (response.success) {
        showSuccess("Cập nhật cài đặt thành công");
      } else {
        if (response.data && typeof response.data === "object") {
          setErrors(response.data);
        } else {
          showError(response.message || "Cập nhật cài đặt thất bại");
        }
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      showError("Đã xảy ra lỗi khi cập nhật cài đặt");
    }
  };

  if (loading) {
    return <Loader />;
  }

  // Kiểm tra dữ liệu trước khi render form
  if (!settingData) {
    return (
      <div className="text-center py-4">
        <p className="text-danger">
          Không thể tải dữ liệu cài đặt. Vui lòng thử lại.
        </p>
        <button
          onClick={() => navigate("/settings")}
          className="mt-3 btn btn-light fw-semibold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Chỉnh sửa cài đặt</h1>
        <button
          onClick={() => navigate("/settings")}
          className="btn btn-light fw-semibold"
        >
          Back
        </button>
      </div>

      <Card>
        <SettingForm
          initialData={settingData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="edit"
        />
      </Card>
    </div>
  );
};

export default SettingEdit;
