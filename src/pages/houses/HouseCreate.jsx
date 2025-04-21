import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { houseService } from "../../api/houses";
import HouseForm from "../../components/forms/HouseForm";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const HouseCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});

  const { execute: createHouse, loading: isSubmitting } = useApi(
    houseService.createHouse
  );

  const handleSubmit = async (formData) => {
    const response = await createHouse(formData);

    if (response.success) {
      showSuccess("Tạo nhà mới thành công");
      navigate("/houses");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi tạo nhà mới");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tạo nhà mới</h1>
        <button
          onClick={() => navigate("/houses")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back
        </button>
      </div>

      <Card>
        <HouseForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
        />
      </Card>
    </div>
  );
};

export default HouseCreate;
