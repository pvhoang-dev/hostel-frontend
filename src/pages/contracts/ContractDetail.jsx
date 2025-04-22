import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { contractService } from "../../api/contracts";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { formatDate } from "../../utils/formatters";

const ContractDetail = () => {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const { user } = useAuth();
  const { showError } = useAlert();
  const navigate = useNavigate();

  const { execute: fetchContract, loading } = useApi(
    contractService.getContract
  );

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  useEffect(() => {
    if (user) {
      loadContract();
    }
  }, [id, user]);

  const loadContract = async () => {
    const response = await fetchContract(id);
    if (response.success) {
      setContract(response.data);
    } else {
      showError("Lỗi khi tải thông tin hợp đồng");
      navigate("/contracts");
    }
  };

  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  if (!contract) {
    return <div>Không tìm thấy hợp đồng</div>;
  }

  // Check if user is manager of this house
  const canManage = isManager && contract.room?.house?.manager_id === user?.id;

  const canEdit = isAdmin || canManage;

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "pending":
        return "Chờ duyệt";
      case "terminated":
        return "Đã chấm dứt";
      case "expired":
        return "Đã hết hạn";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "bg-success text-white";
      case "pending":
        return "bg-warning text-dark";
      case "terminated":
        return "bg-danger text-white";
      case "expired":
        return "bg-secondary text-white";
      default:
        return "bg-light text-dark";
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Chi tiết hợp đồng</h3>
        <div className="d-flex gap-2">
          <Button
            className="mr-2"
            variant="secondary"
            onClick={() => navigate("/contracts")}
          >
            Back
          </Button>
          {canEdit && (
            <Button variant="primary" as={Link} to={`/contracts/${id}/edit`}>
              Sửa
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div>
            <h4 className="mb-2">
              Hợp đồng #{contract.id} - {contract.room?.house?.name || "N/A"} -
              Phòng {contract.room?.room_number || "N/A"}
            </h4>
            <span
              className={`badge ${getStatusClass(contract.status)} px-2 py-1`}
            >
              {getStatusText(contract.status)}
            </span>
          </div>
          <div className="text-end">
            <p className="text-muted mb-1">
              Ngày tạo: {formatDate(contract.created_at)}
            </p>
            <p className="text-muted mb-0">
              Cập nhật: {formatDate(contract.updated_at)}
            </p>
          </div>
        </div>

        {/* You can add more contract details formatted with Bootstrap classes here */}
      </Card>
    </div>
  );
};

export default ContractDetail;
