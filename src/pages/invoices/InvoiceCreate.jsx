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

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const { houseId, roomId } = useParams();
  const [errors, setErrors] = useState({});
  const { user, isTenant } = useAuth();
  const { showSuccess, showError } = useAlert();

  const { execute: createInvoice, loading: isSubmitting } = useApi(
    invoiceService.createInvoice
  );

  useEffect(() => {
    if (user && isTenant) {
      showError("Bạn không có quyền tạo hóa đơn");
      navigate("/");
    }
  }, [user, navigate, showError]);

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
    
    const response = await createInvoice(dataToSubmit);

    if (response.success) {
      showSuccess("Tạo hóa đơn thành công");
      navigate("/invoices");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Có lỗi xảy ra khi tạo hóa đơn");
      }
    }
  };

  if (!user) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Tạo hóa đơn mới</h3>
        <Button variant="secondary" onClick={() => navigate("/invoices")}>
          Back
        </Button>
      </div>

      <Card>
        <InvoiceForm
          initialData={{
            room_id: roomId || "",
            invoice_type: "custom",
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            items: [{ source_type: "manual", amount: 0, description: "" }],
          }}
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

export default InvoiceCreate;
