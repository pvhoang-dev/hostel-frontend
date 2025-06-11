import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { invoiceService } from "../../api/invoices";
import { houseService } from "../../api/houses";
import { roomService } from "../../api/rooms";
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

// Filter component for invoices
const FilterSection = ({
  filters,
  houses,
  rooms,
  paymentMethods,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  onHouseChange,
}) => {
  const handleHouseChange = (e) => {
    const { value } = e.target;
    onHouseChange(value);
    onFilterChange(e);
  };

  return (
    <Card title="Bộ lọc" className="mb-3">
      <div className="row g-3">
        <div className="col-md-4">
          <Select
            label="Nhà"
            name="house_id"
            value={filters.house_id}
            onChange={handleHouseChange}
            options={[
              { value: "", label: "Tất cả" },
              ...houses.map((house) => ({
                value: house.id.toString(),
                label: house.name,
              })),
            ]}
          />
        </div>

        <div className="col-md-4">
          <Select
            label="Phòng"
            name="room_id"
            value={filters.room_id}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              ...rooms.map((room) => ({
                value: room.id.toString(),
                label: `Phòng ${room.room_number}`,
              })),
            ]}
          />
        </div>

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
              { value: "waiting", label: "Chờ xác nhận" },
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
        <Button variant="secondary" onClick={onClearFilters} className=" mr-2">
          Xóa bộ lọc
        </Button>
        <Button onClick={onApplyFilters}>Tìm</Button>
      </div>
    </Card>
  );
};

const InvoiceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const { user, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "created_at";
  const sortDir = searchParams.get("sort_dir") || "desc";

  const house_id = searchParams.get("house_id") || "";
  const room_id = searchParams.get("room_id") || "";
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
    data: housesData,
    loading: loadingHouses,
    execute: fetchHouses,
  } = useApi(houseService.getHouses);

  const {
    data: roomsData,
    loading: loadingRooms,
    execute: fetchRooms,
  } = useApi(roomService.getRooms);

  const {
    data: paymentMethodsData,
    loading: loadingPaymentMethods,
    execute: fetchPaymentMethods,
  } = useApi(paymentMethodService.getPaymentMethods);

  const { execute: deleteInvoice } = useApi(invoiceService.deleteInvoice);

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

  const houses = housesData?.data || [];
  const rooms = roomsData?.data || [];
  const paymentMethods = paymentMethodsData?.data || [];

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

  // Render the actions cell for each row
  const ActionsCell = ({ row }) => {
    const invoice = row.original;
    const canEdit =
      isAdmin || isManager;

    return (
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-link p-0 mx-1 action-icon"
          style={{ border: "none", background: "none", cursor: "pointer" }}
          onClick={() => navigate(`/invoices/${invoice.id}`)}
          title="Chi tiết"
        >
          <i className="mdi mdi-eye"></i>
        </button>

        {canEdit && (
          <>
            <button
              type="button"
              className="btn btn-link p-0 mx-1 action-icon"
              style={{ border: "none", background: "none", cursor: "pointer" }}
              onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
              title="Sửa"
            >
              <i className="mdi mdi-pencil"></i>
            </button>

            <button
              type="button"
              className="btn btn-link p-0 mx-1 action-icon"
              style={{ border: "none", background: "none", cursor: "pointer" }}
              onClick={() => handleDeleteInvoice(invoice)}
              title="Xóa"
            >
              <i className="mdi mdi-delete"></i>
            </button>
          </>
        )}

        {canEdit && invoice.payment_status !== "completed" && (
          <button
            onClick={() => handleMarkAsPaid(invoice)}
            className="btn btn-sm btn-success"
            title="Đánh dấu đã thanh toán"
          >
            Thanh toán
          </button>
        )}
      </div>
    );
  };

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "room.house.name",
      header: "Nhà",
      cell: ({ row }) => (
        <Link to={`/houses/${row.original.room.house.id}`}>
          {row.original.room.house.name}
        </Link>
      ),
    },
    {
      accessorKey: "room.room_number",
      header: "Phòng",
      cell: ({ row }) => (
        <Link to={`/rooms/${row.original.room.id}`}>
          {row.original.room.room_number}
        </Link>
      ),
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
      accessorKey: "payment_method.name",
      header: "Phương thức thanh toán",
      cell: ({ row }) => row.original.payment_method?.name || "N/A",
    },
    {
      accessorKey: "payment_date",
      header: "Ngày thanh toán",
      cell: ({ row }) =>
        row.original.payment_date
          ? new Date(row.original.payment_date).toLocaleDateString("vi-VN")
          : "Chưa thanh toán",
    },
    {
      accessorKey: "actions",
      header: "Hành động",
      cell: ActionsCell,
    },
  ];

  useEffect(() => {
    loadHouses();
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
    house_id,
    room_id,
    invoice_type,
    user,
    month,
    year,
    min_amount,
    max_amount,
    payment_status,
    payment_method_id,
  ]);

  useEffect(() => {
    if (house_id) {
      loadRoomsByHouse(house_id);
    } else {
      setSearchParams((prev) => {
        const newParams = { ...Object.fromEntries(prev) };
        newParams.room_id = "";
        return newParams;
      });
    }
  }, [house_id]);

  const loadInvoices = async () => {
    try {
      const result = await fetchInvoices({
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_dir: sortDir,
        include: "room.house,items,paymentMethod",
        house_id: house_id || undefined,
        room_id: room_id || undefined,
        invoice_type: invoice_type || undefined,
        month: month || undefined,
        year: year || undefined,
        min_amount: min_amount || undefined,
        max_amount: max_amount || undefined,
        payment_status: payment_status || undefined,
        payment_method_id: payment_method_id || undefined,
      });

      if (isManager && !isAdmin) {
        if (houses.length === 0) {
          await loadHouses();
        }
      }
    } catch (error) {
      showError("Error loading invoices");
    }
  };

  const loadHouses = async () => {
    // For managers, only show their managed houses
    const params = isManager ? { manager_id: user.id } : {};
    await fetchHouses(params);
  };

  const loadRoomsByHouse = async (houseId) => {
    if (!houseId) return;

    const response = await fetchRooms({ house_id: houseId });
    if (!response.success) {
      showError("Lỗi khi tải danh sách phòng");
    }
  };

  const loadPaymentMethods = async () => {
    try {
      await fetchPaymentMethods({});
    } catch (error) {
      showError("Lỗi khi tải danh sách phương thức thanh toán");
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này không?")) {
      const response = await deleteInvoice(invoice.id);
      if (response.success) {
        showSuccess("Xóa hóa đơn thành công");
        loadInvoices();
      } else {
        showError(response.message || "Không thể xóa hóa đơn");
      }
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

  const handleHouseChange = (houseId) => {
    // When house changes, we need to load rooms for that house
    loadRoomsByHouse(houseId);
  };

  const clearFilters = () => {
    setSearchParams((params) => {
      params.delete("house_id");
      params.delete("room_id");
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

  const isLoading =
    loadingInvoices || loadingHouses || loadingRooms || loadingPaymentMethods;

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  const canManageInvoices = isAdmin || isManager;

  // Handle marking an invoice as paid
  const handleMarkAsPaid = async (invoice) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn đánh dấu hóa đơn này là đã thanh toán?"
      )
    ) {
      return;
    }

    const paymentData = {
      payment_method_id: invoice.payment_method?.id || 1, // Mặc định phương thức thanh toán tiền mặt
      payment_status: "completed",
      payment_date: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await invoiceService.updatePaymentStatus(
        invoice.id,
        paymentData
      );
      if (response.success) {
        showSuccess("Đã cập nhật trạng thái thanh toán thành công");
        loadInvoices(); // Tải lại danh sách
      } else {
        showError("Lỗi khi cập nhật trạng thái thanh toán");
      }
    } catch (error) {
      showError("Lỗi khi cập nhật trạng thái thanh toán");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Hóa đơn</h3>
        {canManageInvoices && (
          <Button as={Link} to="/invoices/create">
            Thêm
          </Button>
        )}
      </div>

      <FilterSection
        filters={{
          house_id,
          room_id,
          invoice_type,
          month,
          year,
          min_amount,
          max_amount,
          payment_status,
          payment_method_id,
        }}
        houses={houses}
        rooms={rooms}
        paymentMethods={paymentMethods}
        onFilterChange={handleFilterChange}
        onHouseChange={handleHouseChange}
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

export default InvoiceList;
