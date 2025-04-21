import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { contractService } from "../../api/contracts";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
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
  const canManage = isManager &&
    contract.room?.house?.manager_id === user?.id;

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
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Chi tiết hợp đồng</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate("/contracts")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Quay lại
          </button>
          {canEdit && (
            <Link
              to={`/contracts/${id}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Chỉnh sửa
            </Link>
          )}
        </div>
      </div>

      {/* Rest of the component remains the same */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Hợp đồng #{contract.id} - {contract.room?.house?.name || "N/A"} - Phòng {contract.room?.room_number || "N/A"}
            </h2>
            <span className={`inline-block ${getStatusClass(contract.status)} px-2 py-1 rounded text-sm mt-2`}>
              {getStatusText(contract.status)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Ngày tạo: {formatDate(contract.created_at)}</p>
            <p className="text-gray-600">Cập nhật: {formatDate(contract.updated_at)}</p>
          </div>
        </div>

        {/* Rest of the JSX remains unchanged */}
      </div>
    </div>
  );
};

export default ContractDetail;
