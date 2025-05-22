import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { contractService } from "../../api/contracts";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { formatDate, formatCurrency } from "../../utils/formatters";

const ContractDetail = () => {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const { user, isAdmin, isManager, isTenant } = useAuth();
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

  // Tenant chỉ có thể xem, không thể sửa
  const canEdit = (isAdmin || canManage) && !isTenant;

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

  const getDepositStatusText = (status) => {
    switch (status) {
      case "held":
        return "Đang giữ";
      case "returned":
        return "Đã trả lại";
      case "deducted":
        return "Đã khấu trừ";
      default:
        return status;
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
                  <tr>
                    <td>Giá thuê hàng tháng:</td>
                    <td>{formatCurrency(contract.monthly_price)}</td>
                  </tr>
                  <tr>
                    <td>Tiền đặt cọc:</td>
                    <td>{formatCurrency(contract.deposit_amount)}</td>
                  </tr>
                  <tr>
                    <td>Trạng thái tiền đặt cọc:</td>
                    <td>{getDepositStatusText(contract.deposit_status)}</td>
                  </tr>
                  <tr>
                    <td>Thời gian báo trước:</td>
                    <td>{contract.notice_period} ngày</td>
                  </tr>
                  <tr>
                    <td>Tự động gia hạn:</td>
                    <td>{contract.auto_renew ? "Có" : "Không"}</td>
                  </tr>
                  {contract.auto_renew && (
                    <tr>
                      <td>Thời hạn gia hạn:</td>
                      <td>{contract.time_renew} tháng</td>
                    </tr>
                  )}
                  {contract.termination_reason && (
                    <tr>
                      <td>Lý do chấm dứt:</td>
                      <td>{contract.termination_reason}</td>
                    </tr>
                  )}
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
                    <td>Người tạo:</td>
                    <td>{contract.created_by?.name || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Người cập nhật:</td>
                    <td>{contract.updated_by?.name || "N/A"}</td>
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

        {/* Thông tin người thuê */}
        <div className="row">
          <div className="col-12 mb-4">
            <h5 className="mb-3">Thông tin người thuê</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "20%" }}>Tên</th>
                    <th style={{ width: "15%" }}>Username</th>
                    <th style={{ width: "20%" }}>Email</th>
                    <th style={{ width: "15%" }}>Số điện thoại</th>
                    <th style={{ width: "25%" }}>CCCD/CMND</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.tenants && contract.tenants.length > 0 ? (
                    contract.tenants.map((tenant, index) => (
                      <tr key={tenant.id}>
                        <td>{index + 1}</td>
                        <td>
                          <Link
                            to={`/users/${tenant.id}`}
                            className="text-primary"
                          >
                            {tenant.name}
                          </Link>
                        </td>
                        <td>{tenant.username}</td>
                        <td>{tenant.email}</td>
                        <td>{tenant.phone_number}</td>
                        <td>{tenant.identity_card}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Không có thông tin người thuê
                      </td>
                    </tr>
                  )}
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
