import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contractService } from "../../api/contracts";
import ContractForm from "../../components/forms/ContractForm";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const ContractCreate = () => {
  const navigate = useNavigate();
  const { houseId, roomId } = useParams();
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  const { execute: createContract, loading: isSubmitting } = useApi(
    contractService.createContract
  );

  useEffect(() => {
    if (user && !["admin", "manager"].includes(user.role)) {
      showError("Bạn không có quyền tạo hợp đồng");
      navigate("/");
    }
  }, [user, navigate, showError]);

  const handleSubmit = async (formData) => {
    const response = await createContract(formData);

    if (response.success) {
      showSuccess("Tạo hợp đồng thành công");
      navigate("/contracts");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi tạo hợp đồng");
      }
    }
  };

  if (!user) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tạo hợp đồng mới</h1>
        <button
          onClick={() => navigate("/contracts")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Quay lại
        </button>
      </div>

      <Card>
        <ContractForm
          initialData={{ room_id: roomId, status: "pending", payment_day: 1 }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
          roomId={roomId}
          houseId={houseId}
        />
      </Card>
    </div>
  );
};

export default ContractCreate;
