import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { invoiceService } from "../../api/invoices";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { formatDate, formatCurrency } from "../../utils/formatters";

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const { user, isAdmin, isManager, isTenant } = useAuth();
  const { showError, showSuccess } = useAlert();
  const navigate = useNavigate();

  const { execute: fetchInvoice, loading } = useApi(invoiceService.getInvoice);
  const { execute: updatePaymentStatus, loading: updatingPayment } = useApi(
    invoiceService.updatePaymentStatus
  );

  useEffect(() => {
    if (user) {
      loadInvoice();
    }
  }, [id, user]);

  const loadInvoice = async () => {
    const response = await fetchInvoice(id);
    if (response.success) {
      setInvoice(response.data);
    } else {
      showError("Lỗi khi tải thông tin hóa đơn");
      navigate("/invoices");
    }
  };

  const getPaymentStatusBadge = (status) => {
    if (!status) return null;
    
    const badgeColors = {
      pending: "warning",
      completed: "success",
      failed: "danger",
      refunded: "info"
    };
    
    const statusText = {
      pending: "Chờ thanh toán",
      completed: "Đã thanh toán",
      failed: "Thanh toán thất bại",
      refunded: "Đã hoàn tiền"
    };
    
    return (
      <span className={`badge bg-${badgeColors[status]} text-white p-1`}>
        {statusText[status] || status}
      </span>
    );
  };

  const handleMarkAsPaid = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đánh dấu hóa đơn này là đã thanh toán?")) {
      return;
    }
    
    const paymentData = {
      payment_method_id: invoice.payment_method?.id || 1,
      payment_status: "completed",
      payment_date: new Date().toISOString().split("T")[0]
    };
    
    const response = await updatePaymentStatus(id, paymentData);
    if (response.success) {
      showSuccess("Đã cập nhật trạng thái thanh toán thành công");
      setInvoice(response.data);
    } else {
      showError("Lỗi khi cập nhật trạng thái thanh toán");
    }
  };

  if (!user || loading) {
    return <Loader />;
  }

  if (!invoice) {
    return <div>Không tìm thấy hóa đơn</div>;
  }

  // Check if user is manager of this house
  const canEdit = isAdmin || isManager;

  const getInvoiceTypeText = (type) => {
    switch (type) {
      case "custom":
        return "Tùy chỉnh";
      case "service_usage":
        return "Dịch vụ / Tháng";
      default:
        return type;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Chi tiết hóa đơn</h3>
        <div className="d-flex gap-2">
          <Button
            className="mr-2"
            variant="secondary"
            onClick={() => navigate("/invoices")}
          >
            Back
          </Button>
          {canEdit && invoice.payment_status !== "completed" && (
            <Button 
              variant="success" 
              onClick={handleMarkAsPaid}
              disabled={updatingPayment}
              className="mr-2"
            >
              {updatingPayment ? "Đang xử lý..." : "Đánh dấu đã thanh toán"}
            </Button>
          )}
          {canEdit && (
            <Button variant="primary" as={Link} to={`/invoices/${id}/edit`}>
              Sửa
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="d-flex align-items-start justify-content-between mb-4">
          <div>
            <h4 className="mb-2">
              Hóa đơn #{invoice.id} - {invoice.room?.house?.name || "N/A"} -
              Phòng {invoice.room?.room_number || "N/A"}
            </h4>
            <div>
              <span className="badge bg-info text-white mr-2 p-1">
                Loại: {getInvoiceTypeText(invoice.invoice_type)}
              </span>
              <span className="badge bg-primary text-white p-1 mr-2">
                Tháng {invoice.month}/{invoice.year}
              </span>
              {getPaymentStatusBadge(invoice.payment_status)}
            </div>
          </div>
          <div className="text-end">
            <h4 className="mb-0">{formatCurrency(invoice.total_amount)}</h4>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin cơ bản</h5>
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
                        to={`/rooms/${invoice.room?.id}`}
                        className="text-info"
                      >
                        {invoice.room?.room_number || "N/A"}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Nhà:</td>
                    <td>
                      <Link
                        to={`/houses/${invoice.room?.house?.id}`}
                        className="text-info"
                      >
                        {invoice.room?.house?.name || "N/A"}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Loại hóa đơn:</td>
                    <td>
                      <span className="badge bg-info text-white">
                        {getInvoiceTypeText(invoice.invoice_type)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Thời gian:</td>
                    <td>
                      <span className="badge bg-primary text-white">
                        Tháng {invoice.month}/{invoice.year}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin thanh toán</h5>
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
                    <td>Trạng thái:</td>
                    <td>{getPaymentStatusBadge(invoice.payment_status)}</td>
                  </tr>
                  <tr>
                    <td>Mã giao dịch:</td>
                    <td>{invoice.transaction_code || "Chưa có"}</td>
                  </tr>
                  <tr>
                    <td>Phương thức:</td>
                    <td>{invoice.payment_method?.name || "Chưa thiết lập"}</td>
                  </tr>
                  <tr>
                    <td>Ngày thanh toán:</td>
                    <td>{invoice.payment_date ? formatDate(new Date(invoice.payment_date)) : "Chưa thanh toán"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {invoice.description && (
            <div className="col-md-12 mb-4">
              <h5 className="mb-3">Mô tả</h5>
              <div className="p-3 border rounded">
                <p className="mb-0">{invoice.description}</p>
              </div>
            </div>
          )}

          <div className="col-md-12 mb-4">
            <h5 className="mb-3">Chi tiết hóa đơn</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "15%" }}>Loại</th>
                    <th style={{ width: "65%" }}>Mô tả</th>
                    <th style={{ width: "15%" }}>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items &&
                    invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          {item.source_type === "manual"
                            ? "Nhập tay"
                            : "Dịch vụ"}
                        </td>
                        <td>{item.description}</td>
                        <td className="text-end">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  <tr className="table-active fw-bold">
                    <td colSpan="3" className="text-end">
                      Tổng cộng:
                    </td>
                    <td className="text-end">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {!isTenant && (
            <div className="col-md-12 mb-4">
              <h5 className="mb-3">Thông tin hệ thống</h5>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                    <tr>
                      <th style={{ width: "200px" }}>Thông tin</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Người tạo:</td>
                      <td>{invoice.creator?.username || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>Ngày tạo:</td>
                      <td>{invoice.created_at}</td>
                    </tr>
                    <tr>
                      <td>Người cập nhật:</td>
                      <td>{invoice.updater?.username || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>Ngày cập nhật:</td>
                      <td>{invoice.updated_at}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetail;
