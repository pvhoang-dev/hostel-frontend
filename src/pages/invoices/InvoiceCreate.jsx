import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceService } from "../../api/invoices";
import InvoiceForm from "../../components/forms/InvoiceForm";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
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
    const response = await createInvoice(formData);

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
