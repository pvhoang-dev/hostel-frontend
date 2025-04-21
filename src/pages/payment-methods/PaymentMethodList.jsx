// src/pages/payment-methods/PaymentMethodList.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { paymentMethodService } from "../../api/paymentMethods";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const ActionButtons = ({ paymentMethod, onDelete }) => (
  <div className="flex space-x-2">
    <Link
      to={`/payment-methods/${paymentMethod.id}`}
      className="text-blue-600 hover:underline"
    >
      View
    </Link>
    <Link
      to={`/payment-methods/${paymentMethod.id}/edit`}
      className="text-green-600 hover:underline"
    >
      Edit
    </Link>
    <button
      onClick={() => onDelete(paymentMethod.id)}
      className="text-red-600 hover:underline"
    >
      Delete
    </button>
  </div>
);

const FilterSection = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => (
  <Card title="Filters" className="mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input
        label="Name"
        name="name"
        value={filters.name}
        onChange={onFilterChange}
      />

      <Select
        label="Status"
        name="status"
        value={filters.status}
        onChange={onFilterChange}
        options={[
          { value: "", label: "All Statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
      />
    </div>

    <div className="mt-4 flex justify-end">
      <Button variant="secondary" onClick={onClearFilters} className="mr-2">
        Clear Filters
      </Button>
      <Button onClick={onApplyFilters}>Apply Filters</Button>
    </div>
  </Card>
);

const PaymentMethodList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

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
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.original.description;
        return desc
          ? desc.length > 100
            ? `${desc.substring(0, 100)}...`
            : desc
          : "No description";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={
            row.original.status === "active" ? "text-green-600" : "text-red-600"
          }
        >
          {row.original.status || "Unknown"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.original.created_at;
        return date ? new Date(date).toLocaleString() : "";
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionButtons
          paymentMethod={row.original}
          onDelete={handleDeletePaymentMethod}
        />
      ),
    },
  ];

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, [currentPage, perPage, sortBy, sortDir, name, status]);

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
      showError("Failed to load payment methods");
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this payment method?")
    ) {
      const response = await deletePaymentMethod(id);

      if (response.success) {
        showSuccess("Payment method deleted successfully");
        loadPaymentMethods();
      } else {
        showError(response.message || "Failed to delete payment method");
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Payment Methods</h1>
        <Button as={Link} to="/payment-methods/create">
          Add Payment Method
        </Button>
      </div>

      <FilterSection
        filters={{ name, status }}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadPaymentMethods}
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
          />
        )}
      </Card>
    </div>
  );
};

export default PaymentMethodList;
