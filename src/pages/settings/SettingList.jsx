import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { settingService } from "../../api/settings";
import Table from "../../components/ui/Table";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

// Filter section component
const FilterSection = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => (
  <Card title="Bộ lọc" className="mb-3">
    <div className="row g-3">
      <div className="col-md-4">
        <Input
          label="Số thứ tự"
          name="key"
          value={filters.key}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Nội dung"
          name="value"
          value={filters.value}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Mô tả"
          name="description"
          value={filters.description}
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

const SettingList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const { isTenant, isAdmin } = useAuth();

  // Xác định nếu người dùng là tenant
  const isInTenantView = isTenant;

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
      cell: ({ row }) => <div className="fw-medium">{row.original.key}</div>,
    },
    {
      accessorKey: "value",
      header: "Nội dung",
      cell: ({ row }) => <div>{row.original.value}</div>,
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => (
        <div className="text-truncate" style={{ maxWidth: "300px" }}>
          {row.original.description || "-"}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Hành động",
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

  const handleDeleteSetting = async (setting) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cài đặt này?")) {
      const response = await deleteSetting(setting.id);

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
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Nội quy chung</h3>
        {isAdmin && (
          <Button as={Link} to="/settings/create">
            Thêm
          </Button>
        )}
      </div>

      {!isInTenantView && (
        <FilterSection
          filters={{ key, value, description }}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onApplyFilters={loadSettings}
        />
      )}

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
            actionColumn={{
              key: "actions",
              actions: !isAdmin
                ? [
                    {
                      icon: "mdi-eye",
                      handler: (setting) => navigate(`/settings/${setting.id}`),
                    },
                  ]
                : [
                    {
                      icon: "mdi-eye",
                      handler: (setting) => navigate(`/settings/${setting.id}`),
                    },
                    {
                      icon: "mdi-pencil",
                      handler: (setting) =>
                        navigate(`/settings/${setting.id}/edit`),
                    },
                    {
                      icon: "mdi-delete",
                      handler: handleDeleteSetting,
                    },
                  ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default SettingList;
