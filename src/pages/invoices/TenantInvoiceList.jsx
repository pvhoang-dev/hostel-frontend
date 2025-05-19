import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

// Filter component for invoices (Simplified for tenants)
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

        <div className="col-md-3">
          <Select
            label="Trạng thái thanh toán"
            name="payment_status"
            value={filters.payment_status}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              { value: "pending", label: "Chờ thanh toán" },
              { value: "completed", label: "Đã thanh toán" },
              { value: "failed", label: "Thanh toán thất bại" },
              { value: "refunded", label: "Đã hoàn tiền" },
            ]}
          />
        </div>

        <div className="col-md-3">
          <Select
            label="Phương thức thanh toán"
            name="payment_method_id"
            value={filters.payment_method_id}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              ...paymentMethods.map((method) => ({
                value: method.id.toString(),
                label: method.name,
              })),
            ]}
          />
        </div>

        <div className="col-md-3">
          <Input
            label="Số tiền từ"
            name="min_amount"
            type="number"
            min="0"
            value={filters.min_amount}
            onChange={onFilterChange}
          />
        </div>

        <div className="col-md-3">
          <Input
            label="Số tiền đến"
            name="max_amount"
            type="number"
            min="0"
            value={filters.max_amount}
            onChange={onFilterChange}
          />
        </div>
      </div>

      <div className="mt-3 d-flex justify-content-end">
        <Button
          variant="secondary"
          onClick={onClearFilters}
          className=" mr-2"
        >
          Xóa bộ lọc
        </Button>
        <Button onClick={onApplyFilters}>Tìm</Button>
      </div>
    </Card>
  );
};

const TenantInvoiceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "created_at";
  const sortDir = searchParams.get("sort_dir") || "desc";

  const invoice_type = searchParams.get("invoice_type") || "";
  const payment_status = searchParams.get("payment_status") || "";
  const payment_method_id = searchParams.get("payment_method_id") || "";
  const month = searchParams.get("month") || "";
  const year = searchParams.get("year") || "";
  const min_amount = searchParams.get("min_amount") || "";
  const max_amount = searchParams.get("max_amount") || "";

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

  // Function to render payment status badge
  const getPaymentStatusBadge = (status) => {
    if (!status) return "Chưa thanh toán";
    
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
      <span className={`badge bg-${badgeColors[status]} text-white`}>
        {statusText[status] || status}
      </span>
    );
  };
  
  // Column definitions for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "room.room_number",
      header: "Phòng",
      cell: ({ row }) => `${row.original.room?.house?.name || "N/A"} - Phòng ${row.original.room?.room_number || "N/A"}`,
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
          <Link to={`/invoices/${row.original.id}`} className="btn btn-sm btn-info">
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
    payment_method_id,
    month,
    year,
    min_amount,
    max_amount,
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
        min_amount: min_amount || undefined,
        max_amount: max_amount || undefined,
        payment_status: payment_status || undefined,
        payment_method_id: payment_method_id || undefined,
      });
    } catch (error) {
      showError("Error loading invoices");
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
      params.delete("min_amount");
      params.delete("max_amount");
      params.delete("payment_status");
      params.delete("payment_method_id");
      params.set("page", "1");
      return params;
    });
  };

  const isLoading = loadingInvoices || loadingPaymentMethods;

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Hóa đơn của tôi</h3>
        <div>
          <Link to="/invoice-payment" className="btn btn-primary">
            Thanh toán hóa đơn
          </Link>
        </div>
      </div>

      <FilterSection
        filters={{
          invoice_type,
          month,
          year,
          min_amount,
          max_amount,
          payment_status,
          payment_method_id,
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

export default TenantInvoiceList; 