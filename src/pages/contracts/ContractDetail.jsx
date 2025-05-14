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
  const { user, isAdmin, isManager } = useAuth();
  const { showError } = useAlert();
  const navigate = useNavigate();

  const { execute: fetchContract, loading } = useApi(
    contractService.getContract
  );

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
        <div className="d-flex align-items-start justify-content-between mb-4">
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
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin hợp đồng</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "40%" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Phòng:</td>
                    <td>
                      <Link
                        to={`/rooms/${contract.room?.id}`}
                        className="text-primary"
                      >
                        {contract.room?.room_number || "N/A"}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Nhà:</td>
                    <td>
                      <Link
                        to={`/houses/${contract.room?.house?.id}`}
                        className="text-primary"
                      >
                        {contract.room?.house?.name || "N/A"}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Ngày bắt đầu:</td>
                    <td>{formatDate(contract.start_date)}</td>
                  </tr>
                  <tr>
                    <td>Ngày kết thúc:</td>
                    <td>{formatDate(contract.end_date)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin hệ thống</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "40%" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ID:</td>
                    <td>{contract.id}</td>
                  </tr>
                  <tr>
                    <td>Trạng thái:</td>
                    <td>
                      <span
                        className={`badge ${getStatusClass(contract.status)}`}
                      >
                        {getStatusText(contract.status)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Ngày tạo:</td>
                    <td>{contract.created_at}</td>
                  </tr>
                  <tr>
                    <td>Ngày cập nhật:</td>
                    <td>{contract.updated_at}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContractDetail;
