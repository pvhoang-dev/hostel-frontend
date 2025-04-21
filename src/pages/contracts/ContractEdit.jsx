import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contractService } from "../../api/contracts";
import ContractForm from "../../components/forms/ContractForm";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const ContractEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  const { execute: updateContract, loading: isSubmitting } = useApi(
    contractService.updateContract
  );

  const { execute: fetchContract, loading } = useApi(
    contractService.getContract
  );

  useEffect(() => {
    if (user) {
      loadContract();
    }
  }, [user, id]);

  const loadContract = async () => {
    const response = await fetchContract(id);
    if (response.success) {
      setContract(response.data);

      // Check permissions
      if (user) {
        const isAdmin = user?.role === "admin";
        const isManager = user?.role === "manager";
        const isHouseManager = response.data.room?.house?.manager_id === user?.id;

        if (!isAdmin && !(isManager && isHouseManager)) {
          showError("Bạn không có quyền chỉnh sửa hợp đồng này");
          navigate(`/contracts/${id}`);
          return;
        }
      }
    } else {
      showError(response.message || "Không thể tải thông tin hợp đồng");
      navigate("/contracts");
    }
  };

  const handleSubmit = async (formData) => {
    const response = await updateContract(id, formData);

    if (response.success) {
      showSuccess("Cập nhật hợp đồng thành công");
      navigate(`/contracts/${id}`);
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi cập nhật hợp đồng");
      }
    }
  };

  if (!user || !contract) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Sửa hợp đồng</h1>
        <button
          onClick={() => navigate(`/contracts/${id}`)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Hủy
        </button>
      </div>

      <Card>
        <ContractForm
          initialData={contract}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="edit"
        />
      </Card>
    </div>
  );
};

export default ContractEdit;
