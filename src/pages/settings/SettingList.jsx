import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { settingService } from "../../api/settings";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

// Action buttons component
const ActionButtons = ({ setting, onDelete }) => (
  <div className="flex space-x-2">
    <Link
      to={`/settings/${setting.id}`}
      className="text-blue-600 hover:underline"
    >
      Xem
    </Link>
    <Link
      to={`/settings/${setting.id}/edit`}
      className="text-green-600 hover:underline"
    >
      Sửa
    </Link>
    <button
      onClick={() => onDelete(setting.id)}
      className="text-red-600 hover:underline"
    >
      Xóa
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
  <Card title="Bộ lọc" className="mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input
        label="Số thứ tự"
        name="key"
        value={filters.key}
        onChange={onFilterChange}
      />

      <Input
        label="Nội dung"
        name="value"
        value={filters.value}
        onChange={onFilterChange}
      />

      <Input
        label="Mô tả"
        name="description"
        value={filters.description}
        onChange={onFilterChange}
      />
    </div>

    <div className="mt-4 flex justify-end">
      <Button variant="secondary" onClick={onClearFilters} className="mr-2">
        Xóa bộ lọc
      </Button>
      <Button onClick={onApplyFilters}>Tìm</Button>
    </div>
  </Card>
);

const SettingList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "key";
  const sortDir = searchParams.get("sort_dir") || "asc";
  const key = searchParams.get("key") || "";
  const value = searchParams.get("value") || "";
  const description = searchParams.get("description") || "";

  // API hooks
  const {
    data: settingsData,
    loading: loadingSettings,
    execute: fetchSettings,
  } = useApi(settingService.getSettings);

  const { execute: deleteSetting } = useApi(settingService.deleteSetting);

  // Derived state
  const settings = settingsData?.data || [];
  const pagination = settingsData
    ? {
        current_page: settingsData.meta.current_page,
        last_page: settingsData.meta.last_page,
        total: settingsData.meta.total,
        per_page: settingsData.meta.per_page,
      }
    : null;

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "key",
      header: "Số thứ tự",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.key}</div>
      ),
    },
    {
      accessorKey: "value",
      header: "Nội dung",
      cell: ({ row }) => (
        <div className="font-medium text-gray-600">{row.original.value}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => (
        <div className="text-gray-600 truncate max-w-xs">
          {row.original.description || "-"}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <ActionButtons setting={row.original} onDelete={handleDeleteSetting} />
      ),
    },
  ];

  useEffect(() => {
    loadSettings();
  }, [currentPage, perPage, sortBy, sortDir, key, value, description]);

  const loadSettings = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
    };

    // Add filters if they exist
    if (key) params.key = key;
    if (value) params.value = value;
    if (description) params.description = description;

    const response = await fetchSettings(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách cài đặt");
    }
  };

  const handleDeleteSetting = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cài đặt này?")) {
      const response = await deleteSetting(id);

      if (response.success) {
        showSuccess("Xóa cài đặt thành công");
        loadSettings();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa cài đặt");
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
        <h1 className="text-2xl font-semibold">Cài đặt hệ thống</h1>
        <Button as={Link} to="/settings/create">
          Thêm
        </Button>
      </div>

      <FilterSection
        filters={{ key, value, description }}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadSettings}
      />

      <Card>
        {loadingSettings ? (
          <Loader />
        ) : (
          <Table
            data={settings}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            loading={loadingSettings}
          />
        )}
      </Card>
    </div>
  );
};

export default SettingList;
