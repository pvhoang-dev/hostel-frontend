import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { settingService } from "../../api/settings";
import SettingForm from "../../components/forms/SettingForm";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const SettingCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});

  const { execute: createSetting, loading: isSubmitting } = useApi(
    settingService.createSetting
  );

  const handleSubmit = async (formData) => {
    const response = await createSetting(formData);

    if (response.success) {
      showSuccess("Tạo cài đặt thành công");
      navigate("/settings");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Lỗi khi tạo cài đặt");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Tạo cài đặt mới</h1>
        <button
          onClick={() => navigate("/settings")}
          className="btn btn-light fw-semibold"
        >
          Back
        </button>
      </div>

      <Card>
        <SettingForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
        />
      </Card>
    </div>
  );
};

export default SettingCreate;
