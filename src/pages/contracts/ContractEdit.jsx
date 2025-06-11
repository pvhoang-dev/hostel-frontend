import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contractService } from "../../api/contracts";
import ContractForm from "../../components/forms/ContractForm";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../hooks/useAuth";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const ContractEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [errors, setErrors] = useState({});
  const { user, isAdmin, isManager } = useAuth();
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
      // Chuyển đổi dữ liệu tenants thành users cho ContractForm
      const contractData = {...response.data};
      
      // Kiểm tra nếu có tenants trong response, đưa vào users
      if (contractData.tenants && contractData.tenants.length > 0) {
        contractData.users = contractData.tenants;
        
        // Chuyển đổi mảng users thành mảng user_ids cho form
        contractData.user_ids = contractData.tenants.map(tenant => tenant.id);
      }
      
      setContract(contractData);

      // Check permissions
      if (user) {
        const isHouseManager =
          response.data.room?.house?.manager_id === user?.id;

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
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Sửa hợp đồng</h3>
        <Button
          variant="secondary"
          onClick={() => navigate(`/contracts/${id}`)}
        >
          Hủy
        </Button>
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
