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
        const isHouseManager =
          response.data.room?.house?.manager_id === user?.id;

        if (!isAdmin && !(isManager && isHouseManager)) {
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
    const response = await updateInvoice(id, formData);

    if (response.success) {
      showSuccess("Cập nhật hóa đơn thành công");
      navigate(`/invoices/${id}`);
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
        <Button variant="secondary" onClick={() => navigate(`/invoices/${id}`)}>
          Hủy
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
