import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

const FilterSection = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  isAdmin,
}) => (
  <Card title="Bộ lọc" className="mb-3">
    <div className="row g-3">
      <div className="col-md-6">
        <Input
          label="Tên"
          name="name"
          value={filters.name}
          onChange={onFilterChange}
        />
      </div>
      {isAdmin && (
        <div className="col-md-6">
          <Select
            label="Trạng thái"
            name="status"
            value={filters.status}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              { value: "active", label: "Hoạt động" },
              { value: "inactive", label: "Không hoạt động" },
            ]}
          />
        </div>
      )}
    </div>
    <div className="mt-3 d-flex justify-content-end">
      <Button variant="secondary" onClick={onClearFilters} className=" mr-2">
        Xóa bộ lọc
      </Button>
      <Button onClick={onApplyFilters}>Tìm</Button>
    </div>
  </Card>
);

const PaymentMethodList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "created_at";
  const sortDir = searchParams.get("sort_dir") || "desc";
  const name = searchParams.get("name") || "";
  const status = searchParams.get("status") || "";

  // API hooks
  const {
    data: paymentMethodsData,
    loading: loadingPaymentMethods,
    execute: fetchPaymentMethods,
  } = useApi(paymentMethodService.getPaymentMethods);

  const { execute: deletePaymentMethod } = useApi(
    paymentMethodService.deletePaymentMethod
  );

  // Derived state
  const paymentMethods = paymentMethodsData?.data || [];
  const pagination = paymentMethodsData
    ? {
        current_page: paymentMethodsData.meta.current_page,
        last_page: paymentMethodsData.meta.last_page,
        total: paymentMethodsData.meta.total,
        per_page: paymentMethodsData.meta.per_page,
      }
    : null;

  // Column definitions for the table
  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Tên" },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <span
          className={
            row.original.deleted_at
              ? "text-danger"
              : row.original.status === "active"
              ? "text-success"
              : "text-warning"
          }
        >
          {row.original.deleted_at ? "Đã xóa" : row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Ngày tạo",
      cell: ({ row }) => {
        return row.original.created_at;
      },
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  useEffect(() => {
    loadPaymentMethods();
  }, [currentPage, perPage, sortBy, sortDir, status, name]);

  const loadPaymentMethods = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
    };

    // Add filters if they exist
    if (name) params.name = name;
    if (status) params.status = status;

    const response = await fetchPaymentMethods(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách phương thức thanh toán");
    }
  };

  const handleDeletePaymentMethod = async (paymentMethod) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa phương thức thanh toán này?")
    ) {
      const response = await deletePaymentMethod(paymentMethod.id);

      if (response.success) {
        showSuccess("Xóa phương thức thanh toán thành công");
        loadPaymentMethods();
      } else {
        showError(response.message || "Lỗi khi xóa phương thức thanh toán");
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

    const newParams = { ...Object.fromEntries(searchParams), page: "1" };

    if (value) {
      newParams[name] = value;
    } else {
      delete newParams[name];
    }

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({
      page: "1",
      per_page: perPage.toString(),
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Phương thức thanh toán</h3>
        {isAdmin && (
          <Button as={Link} to="/payment-methods/create">
            Thêm
          </Button>
        )}
      </div>

      <FilterSection
        filters={{ name, status }}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadPaymentMethods}
        isAdmin={isAdmin}
      />

      <Card>
        {loadingPaymentMethods ? (
          <Loader />
        ) : (
          <Table
            data={paymentMethods}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            loading={loadingPaymentMethods}
            actionColumn={{
              key: "actions",
              actions: isAdmin
                ? [
                    {
                      icon: "mdi-eye",
                      handler: (paymentMethod) =>
                        navigate(`/payment-methods/${paymentMethod.id}`),
                    },
                    {
                      icon: "mdi-pencil",
                      handler: (paymentMethod) =>
                        navigate(`/payment-methods/${paymentMethod.id}/edit`),
                    },
                    {
                      icon: "mdi-delete",
                      handler: handleDeletePaymentMethod,
                    },
                  ]
                : [
                    {
                      icon: "mdi-eye",
                      handler: (paymentMethod) =>
                        navigate(`/payment-methods/${paymentMethod.id}`),
                    },
                  ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default PaymentMethodList;
