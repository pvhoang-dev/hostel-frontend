import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceService } from "../../api/invoices";
import InvoiceForm from "../../components/forms/InvoiceForm";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../hooks/useAuth";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const InvoiceEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [errors, setErrors] = useState({});
  const { user, isAdmin, isManager } = useAuth();
  const { showSuccess, showError } = useAlert();

  const { execute: updateInvoice, loading: isSubmitting } = useApi(
    invoiceService.updateInvoice
  );

  const { execute: fetchInvoice, loading } = useApi(invoiceService.getInvoice);

  useEffect(() => {
    if (user) {
      loadInvoice();
    }
  }, [user, id]);

  const loadInvoice = async () => {
    const response = await fetchInvoice(id);
    if (response.success) {
      setInvoice(response.data);

      // Check permissions
      if (user) {
        if (!isAdmin && !isManager) {
          showError("Bạn không có quyền chỉnh sửa hóa đơn này");
          navigate(`/invoices/${id}`);
          return;
        }
      }
    } else {
      showError(response.message || "Không thể tải thông tin hóa đơn");
      navigate("/invoices");
    }
  };

  const handleSubmit = async (formData) => {
    // Chỉ gửi các trường payment nếu được chọn thanh toán ngay
    const dataToSubmit = { ...formData };
    
    // Nếu payment_method_id trống, có nghĩa là không chọn thanh toán ngay
    if (!dataToSubmit.payment_method_id) {
      delete dataToSubmit.payment_method_id;
      delete dataToSubmit.payment_status;
      delete dataToSubmit.payment_date;
      delete dataToSubmit.transaction_code;
    } else if (dataToSubmit.payment_status !== 'completed') {
      // Nếu trạng thái không phải là completed, đặt ngày thanh toán thành null
      dataToSubmit.payment_date = null;
    }
    
    const response = await updateInvoice(id, dataToSubmit);

    if (response.success) {
      // Nếu không có dữ liệu trả về, có nghĩa là hóa đơn đã bị xóa do không còn mục nào
      if (!response.data || Object.keys(response.data).length === 0) {
        showSuccess("Hóa đơn đã bị xóa do không còn mục nào");
        navigate("/invoices");
      } else {
        showSuccess("Cập nhật hóa đơn thành công");
      }
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi cập nhật hóa đơn");
      }
    }
  };

  if (!user || !invoice) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Sửa hóa đơn</h3>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <Card>
        <InvoiceForm
          initialData={invoice}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="edit"
        />
      </Card>
    </div>
  );
};

export default InvoiceEdit;
