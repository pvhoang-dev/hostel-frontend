import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { serviceService } from "../../api/services";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

// Action buttons component
const ActionButtons = ({ service, onDelete }) => (
  <div className="flex space-x-2">
    <Link
      to={`/services/${service.id}`}
      className="text-blue-600 hover:underline"
    >
      View
    </Link>
    <Link
      to={`/services/${service.id}/edit`}
      className="text-green-600 hover:underline"
    >
      Edit
    </Link>
    <button
      onClick={() => onDelete(service.id)}
      className="text-red-600 hover:underline"
    >
      Delete
    </button>
  </div>
);

// Filter section component
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
      <Input
        label="Unit"
        name="unit"
        value={filters.unit}
        onChange={onFilterChange}
      />
      <Select
        label="Is Metered?"
        name="is_metered"
        value={filters.is_metered}
        onChange={onFilterChange}
        options={[
          { value: "", label: "All" },
          { value: "1", label: "Yes" },
          { value: "0", label: "No" },
        ]}
      />
      {/* Add price range filters if needed */}
      {/*
       <Input label="Min Price" name="min_price" type="number" value={filters.min_price} onChange={onFilterChange} />
       <Input label="Max Price" name="max_price" type="number" value={filters.max_price} onChange={onFilterChange} />
       */}
    </div>

    <div className="mt-4 flex justify-end">
      <Button variant="secondary" onClick={onClearFilters} className="mr-2">
        Clear Filters
      </Button>
      <Button onClick={onApplyFilters}>Apply Filters</Button>
    </div>
  </Card>
);

const ServiceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  // Get current state from URL params
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "name";
  const sortDir = searchParams.get("sort_dir") || "asc";
  const name = searchParams.get("name") || "";
  const unit = searchParams.get("unit") || "";
  const isMetered = searchParams.get("is_metered") || "";
  // Add other filters like min_price, max_price if implemented

  // API hooks
  const {
    data: servicesData,
    loading: loadingServices,
    execute: fetchServices,
  } = useApi(serviceService.getServices);

  const { execute: deleteServiceApi } = useApi(serviceService.deleteService);

  // Derived state
  const services = servicesData?.data || [];
  const pagination = servicesData
    ? {
        current_page: servicesData.meta.current_page,
        last_page: servicesData.meta.last_page,
        total: servicesData.meta.total,
        per_page: servicesData.meta.per_page,
      }
    : null;

  // Table columns definition
  const columns = [
    { accessorKey: "id", header: "ID", enableSorting: true },
    { accessorKey: "name", header: "Name", enableSorting: true },
    {
      accessorKey: "default_price",
      header: "Default Price",
      cell: ({ row }) => row.original.default_price?.toLocaleString(),
      enableSorting: true,
    },
    { accessorKey: "unit", header: "Unit", enableSorting: true },
    {
      accessorKey: "is_metered",
      header: "Metered",
      cell: ({ row }) => (row.original.is_metered ? "Yes" : "No"),
      enableSorting: true,
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
      enableSorting: true,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionButtons service={row.original} onDelete={handleDeleteService} />
      ),
      enableSorting: false,
    },
  ];

  // Fetch data on initial load and when params change
  useEffect(() => {
    loadServices();
  }, [currentPage, perPage, sortBy, sortDir, name, unit, isMetered]); // Add other filters to dependency array

  const loadServices = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
    };

    // Add filters if they exist
    if (name) params.name = name;
    if (unit) params.unit = unit;
    if (isMetered !== "") params.is_metered = isMetered; // Pass filter value if selected
    // Add other filters like min_price, max_price

    const response = await fetchServices(params);
    if (!response.success) {
      showError(response.message || "Failed to load services");
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      const response = await deleteServiceApi(id);
      if (response.success) {
        showSuccess("Service deleted successfully");
        // Reload data, potentially checking if current page becomes empty
        const newTotal = pagination.total - 1;
        const newLastPage = Math.ceil(newTotal / perPage);
        if (currentPage > newLastPage && newLastPage > 0) {
          handlePageChange(newLastPage); // Go to the new last page
        } else {
          loadServices(); // Reload current page
        }
      } else {
        showError(response.message || "Failed to delete service");
      }
    }
  };

  // Update URL search params
  const updateSearchParams = (newParams) => {
    const currentParams = Object.fromEntries(searchParams);
    const updatedParams = { ...currentParams, ...newParams };

    // Remove empty params
    Object.keys(updatedParams).forEach((key) => {
      if (!updatedParams[key] && key !== "page") {
        // Keep page=1 even if it's the only param
        delete updatedParams[key];
      }
    });
    // Reset page to 1 when filters change
    if (newParams.page === undefined) {
      updatedParams.page = "1";
    }

    setSearchParams(updatedParams);
  };

  const handlePageChange = (page) => {
    updateSearchParams({ page: page.toString() });
  };

  const handleSortingChange = (newSorting) => {
    if (newSorting?.length > 0) {
      const sort = newSorting[0];
      updateSearchParams({
        sort_by: sort.id,
        sort_dir: sort.desc ? "desc" : "asc",
      });
    } else {
      // Reset to default sorting if needed
      updateSearchParams({ sort_by: "name", sort_dir: "asc" });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    updateSearchParams({ [name]: value });
  };

  const clearFilters = () => {
    // Reset only filter params, keep sorting and per_page
    const paramsToKeep = {
      page: "1",
      per_page: perPage.toString(),
      sort_by: sortBy,
      sort_dir: sortDir,
    };
    setSearchParams(paramsToKeep);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Services</h1>
        <Button as={Link} to="/services/create">
          Add Service
        </Button>
      </div>

      <FilterSection
        filters={{ name, unit, is_metered: isMetered }}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadServices} // Apply filters triggers reload
      />

      <Card>
        {loadingServices ? (
          <Loader />
        ) : (
          <Table
            data={services}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            // Pass sorting state expected by your Table component
            manualSorting={true} // Indicate server-side sorting
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange} // Function to handle sorting changes
            loading={loadingServices}
          />
        )}
      </Card>
    </div>
  );
};

export default ServiceList;
