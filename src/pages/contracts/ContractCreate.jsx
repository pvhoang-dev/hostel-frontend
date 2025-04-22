import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contractService } from "../../api/contracts";
import ContractForm from "../../components/forms/ContractForm";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
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
      <div className="d-flex justify-content-between align-items-center my-3">
        <h3>Tạo hợp đồng mới</h3>
        <Button variant="secondary" onClick={() => navigate("/contracts")}>
          <i className="mdi mdi-arrow-left me-1"></i> Quay lại
        </Button>
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
