import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { invoiceService } from "../../api/invoices";
import { paymentMethodService } from "../../api/paymentMethods";
import Table from "../../components/ui/Table";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../utils/formatters";

// Component con cho phần tính tổng tiền
const PaymentSummary = ({
  selectedInvoices,
  onPaymentSubmit,
  paymentMethods,
  isProcessing,
}) => {
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const totalAmount = selectedInvoices.reduce(
    (sum, invoice) => sum + (invoice.total_amount || 0),
    0
  );

  const handleSubmit = () => {
    if (!paymentMethodId) {
      return alert("Vui lòng chọn phương thức thanh toán");
    }

    onPaymentSubmit({
      payment_method_id: paymentMethodId,
      note: paymentNote,
    });
  };

  return (
    <Card title="Thanh toán hóa đơn đã chọn" className="mb-3">
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <strong>Số lượng hóa đơn đã chọn:</strong> {selectedInvoices.length}
          </div>
          <div className="mb-3">
            <strong>Tổng số tiền cần thanh toán:</strong>{" "}
            {formatCurrency(totalAmount)}
          </div>
        </div>
        <div className="col-md-6">
          <Select
            label="Phương thức thanh toán"
            name="payment_method_id"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
            options={[
              { value: "", label: "-- Chọn phương thức --" },
              ...paymentMethods.map((method) => ({
                value: method.id.toString(),
                label: method.name,
              })),
            ]}
            required
          />
          <Input
            label="Ghi chú thanh toán"
            name="note"
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            placeholder="Ghi chú thêm về việc thanh toán (không bắt buộc)"
          />
        </div>
      </div>
      <div className="mt-3 d-flex justify-content-end">
        <Button
          onClick={handleSubmit}
          disabled={selectedInvoices.length === 0 || isProcessing}
        >
          {isProcessing ? "Đang xử lý..." : "Thanh toán hóa đơn đã chọn"}
        </Button>
      </div>
    </Card>
  );
};

// Filter component cho hóa đơn
const FilterSection = ({
  filters,
  paymentMethods,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => {
  return (
    <Card title="Bộ lọc" className="mb-3">
      <div className="row g-3">
        <div className="col-md-4">
          <Select
            label="Loại hóa đơn"
            name="invoice_type"
            value={filters.invoice_type}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              { value: "custom", label: "Tùy chỉnh" },
              { value: "service_usage", label: "Dịch vụ / Tháng" },
            ]}
          />
        </div>

        <div className="col-md-3">
          <Input
            label="Tháng"
            name="month"
            type="number"
            min="1"
            max="12"
            value={filters.month}
            onChange={onFilterChange}
          />
        </div>

        <div className="col-md-3">
          <Input
            label="Năm"
            name="year"
            type="number"
            min="2000"
            value={filters.year}
            onChange={onFilterChange}
          />
        </div>
      </div>

      <div className="mt-3 d-flex justify-content-end">
        <Button variant="secondary" onClick={onClearFilters} className="mr-2">
          Xóa bộ lọc
        </Button>
        <Button onClick={onApplyFilters}>Tìm</Button>
      </div>
    </Card>
  );
};

const TenantPaymentList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const { user } = useAuth();

  // State để lưu các invoice được chọn
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "created_at";
  const sortDir = searchParams.get("sort_dir") || "desc";

  const invoice_type = searchParams.get("invoice_type") || "";
  const payment_status = searchParams.get("payment_status") || "pending"; // Mặc định chỉ hiển thị các hóa đơn chưa thanh toán
  const month = searchParams.get("month") || "";
  const year = searchParams.get("year") || "";

  // API hooks
  const {
    data: invoicesData,
    loading: loadingInvoices,
    execute: fetchInvoices,
  } = useApi(invoiceService.getInvoices);

  const {
    data: paymentMethodsData,
    loading: loadingPaymentMethods,
    execute: fetchPaymentMethods,
  } = useApi(paymentMethodService.getPaymentMethods);

  // Thêm API hook cho Payos
  const { loading: processingPayosPayment, execute: executePayosPayment } =
    useApi(invoiceService.createPayosPayment);

  // Derived state
  const invoices = invoicesData?.data || [];
  const pagination = invoicesData
    ? {
        current_page: invoicesData.meta.current_page,
        last_page: invoicesData.meta.last_page,
        total: invoicesData.meta.total,
        per_page: invoicesData.meta.per_page,
      }
    : null;

  const paymentMethods = paymentMethodsData?.data || [];

  // Reset selectedInvoices khi danh sách invoices thay đổi
  useEffect(() => {
    setSelectedInvoices([]);
    setSelectAll(false);
  }, [invoices]);

  // Function to render payment status badge
  const getPaymentStatusBadge = (status) => {
    if (!status) return "Chưa thanh toán";

    const badgeColors = {
      pending: "warning",
      completed: "success",
      failed: "danger",
      refunded: "info",
    };

    const statusText = {
      pending: "Chờ thanh toán",
      completed: "Đã thanh toán",
      failed: "Thanh toán thất bại",
      refunded: "Đã hoàn tiền",
    };

    return (
      <span className={`badge bg-${badgeColors[status]} text-white`}>
        {statusText[status] || status}
      </span>
    );
  };

  // Hàm xử lý chọn/bỏ chọn tất cả
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices([]);
    } else {
      // Chỉ chọn các hóa đơn có trạng thái pending
      const pendingInvoices = invoices.filter(
        (invoice) =>
          invoice.payment_status === "pending" || !invoice.payment_status
      );
      setSelectedInvoices(pendingInvoices);
    }
    setSelectAll(!selectAll);
  };

  // Hàm xử lý chọn/bỏ chọn một hóa đơn
  const handleSelectInvoice = (invoice) => {
    if (selectedInvoices.some((item) => item.id === invoice.id)) {
      setSelectedInvoices(
        selectedInvoices.filter((item) => item.id !== invoice.id)
      );
      setSelectAll(false);
    } else {
      setSelectedInvoices([...selectedInvoices, invoice]);
      // Kiểm tra nếu đã chọn tất cả các hóa đơn pending
      const pendingInvoices = invoices.filter(
        (inv) => inv.payment_status === "pending" || !inv.payment_status
      );
      if (pendingInvoices.length === selectedInvoices.length + 1) {
        setSelectAll(true);
      }
    }
  };

  // Hàm xử lý thanh toán nhiều hóa đơn qua Payos
  const handleBatchPayment = async (paymentData) => {
    if (selectedInvoices.length === 0) {
      showError("Vui lòng chọn ít nhất một hóa đơn để thanh toán");
      return;
    }

    const invoiceIds = selectedInvoices.map((invoice) => invoice.id);
    const totalAmount = selectedInvoices.reduce(
      (sum, invoice) => sum + (invoice.total_amount || 0),
      0
    );

    try {
      setIsProcessingPayment(true);

      // Tạo thanh toán trên Payos
      const response = await executePayosPayment(invoiceIds, {
        amount: totalAmount,
        description: `Thanh toán HĐ`,
        ...paymentData,
      });

      // Xử lý kết quả từ API
      if (response.success && response.data && response.data.checkoutUrl) {
        // Chuyển hướng trực tiếp đến trang thanh toán
        window.location.href = response.data.checkoutUrl;
      } else {
        showError(response.message || "Không thể tạo liên kết thanh toán");
        console.error("API error:", response);
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi xử lý thanh toán");
      console.error("Payment error:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Column definitions for the table
  const columns = [
    {
      id: "selection",
      header: (
        <div className="d-flex justify-content-center align-items-center h-100">
          <input
            type="checkbox"
            className="form-check-input"
            checked={selectAll}
            onChange={handleSelectAll}
          />
        </div>
      ),
      cell: ({ row }) => {
        // Chỉ cho phép chọn các hóa đơn có trạng thái pending hoặc null
        const isPending =
          row.original.payment_status === "pending" ||
          !row.original.payment_status;
        const isSelected = selectedInvoices.some(
          (item) => item.id === row.original.id
        );

        return (
          <div className="d-flex justify-content-center align-items-center h-100">
            <input
              type="checkbox"
              className="form-check-input"
              checked={isSelected}
              disabled={!isPending}
              onChange={() => isPending && handleSelectInvoice(row.original)}
            />
          </div>
        );
      },
      size: 50,
    },
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "room.room_number",
      header: "Phòng",
      cell: ({ row }) =>
        `${row.original.room?.house?.name || "N/A"} - Phòng ${
          row.original.room?.room_number || "N/A"
        }`,
    },
    {
      accessorKey: "month",
      header: "Tháng/Năm",
      cell: ({ row }) => `${row.original.month}/${row.original.year}`,
    },
    {
      accessorKey: "invoice_type",
      header: "Loại",
      cell: ({ row }) =>
        row.original.invoice_type === "custom"
          ? "Tùy chỉnh"
          : "Dịch vụ / Tháng",
    },
    {
      accessorKey: "total_amount",
      header: "Tổng tiền",
      cell: ({ row }) => formatCurrency(row.original.total_amount),
    },
    {
      accessorKey: "payment_status",
      header: "Trạng thái",
      cell: ({ row }) => getPaymentStatusBadge(row.original.payment_status),
    },
    {
      accessorKey: "created_at",
      header: "Ngày tạo",
      cell: ({ row }) => row.original.created_at,
    },
    {
      accessorKey: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <div className="d-flex gap-2">
          <Link
            to={`/invoices/${row.original.id}`}
            className="btn btn-sm btn-info"
          >
            Chi tiết
          </Link>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [
    currentPage,
    perPage,
    sortBy,
    sortDir,
    invoice_type,
    payment_status,
    month,
    year,
    user,
  ]);

  const loadInvoices = async () => {
    try {
      await fetchInvoices({
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_dir: sortDir,
        include: "room.house,items,paymentMethod",
        invoice_type: invoice_type || undefined,
        month: month || undefined,
        year: year || undefined,
        payment_status: payment_status || undefined,
      });
    } catch (error) {
      showError("Lỗi khi tải danh sách hóa đơn");
    }
  };

  const loadPaymentMethods = async () => {
    try {
      await fetchPaymentMethods({});
    } catch (error) {
      showError("Lỗi khi tải danh sách phương thức thanh toán");
    }
  };

  const handlePageChange = (page) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: page.toString(),
    });
  };

  const handleSortingChange = (sorting) => {
    if (sorting.length > 0) {
      setSearchParams({
        ...Object.fromEntries(searchParams),
        sort_by: sorting[0].id,
        sort_dir: sorting[0].desc ? "desc" : "asc",
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => {
      if (value === "") {
        prev.delete(name);
      } else {
        prev.set(name, value);
      }
      // Reset to first page when filters change
      prev.set("page", "1");
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchParams((params) => {
      params.delete("invoice_type");
      params.delete("month");
      params.delete("year");
      params.set("payment_status", "pending");
      params.set("page", "1");
      return params;
    });
  };

  const isLoading = loadingInvoices || loadingPaymentMethods;

  // Kiểm tra trạng thái thanh toán khi người dùng quay lại từ cổng thanh toán
  useEffect(() => {
    const success = searchParams.get("success");
    const cancel = searchParams.get("cancel");
    const orderCode = searchParams.get("orderCode");
    const invoiceIds = searchParams.get("invoice_ids");

    // Chỉ xử lý khi có đầy đủ các tham số cần thiết
    if (!orderCode || (!success && !cancel) || !user) {
      return; // Không làm gì nếu không đủ tham số
    }

    const checkPaymentStatus = async () => {
      try {
        // Gọi API để xác nhận trạng thái thanh toán
        const response = await invoiceService.verifyPayment({
          orderCode: orderCode,
          success: success === "true",
          cancel: cancel === "true",
          invoice_ids: invoiceIds,
        });

        if (response.success) {
          if (success === "true") {
            showSuccess("Thanh toán thành công!");
          } else if (cancel === "true") {
            showError("Bạn đã hủy thanh toán", "info");
          }

          // Tải lại danh sách hóa đơn
          loadInvoices();
        } else {
          showError("Không thể xác thực trạng thái thanh toán");
        }

        // Xóa query params để tránh xử lý lại khi refresh trang
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("success");
        newSearchParams.delete("cancel");
        newSearchParams.delete("orderCode");
        newSearchParams.delete("invoice_ids");
        setSearchParams(newSearchParams);
      } catch (error) {
        showError("Lỗi khi cập nhật trạng thái thanh toán");
        console.error(error);
      }
    };

    checkPaymentStatus();

    // Chỉ chạy khi searchParams hoặc user thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchParams]);

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Thanh toán hóa đơn</h3>
        <div>
          <Link to="/invoices" className="btn btn-secondary">
            Xem tất cả hóa đơn
          </Link>
        </div>
      </div>

      {selectedInvoices.length > 0 && (
        <PaymentSummary
          selectedInvoices={selectedInvoices}
          onPaymentSubmit={handleBatchPayment}
          paymentMethods={paymentMethods}
          isProcessing={isProcessingPayment}
        />
      )}

      <FilterSection
        filters={{
          invoice_type,
          month,
          year,
          payment_status,
        }}
        paymentMethods={paymentMethods}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadInvoices}
      />

      <Card>
        {isLoading ? (
          <Loader />
        ) : (
          <Table
            data={invoices}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            loading={isLoading}
          />
        )}
      </Card>
    </div>
  );
};

export default TenantPaymentList;
