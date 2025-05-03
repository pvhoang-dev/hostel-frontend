import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { houseSettingService } from "../../../api/houseSettings";
import Table from "../../../components/common/Table";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Loader from "../../../components/common/Loader";
import useAlert from "../../../hooks/useAlert";
import useApi from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";

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
    </div>

    <div className="mt-3 d-flex justify-content-end">
      <Button
        variant="secondary"
        onClick={onClearFilters}
        className="me-2 mr-2"
      >
        Xóa bộ lọc
      </Button>
      <Button onClick={onApplyFilters}>Tìm</Button>
    </div>
  </Card>
);

const HouseSettingList = ({ houseId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "key";
  const sortDir = searchParams.get("sort_dir") || "asc";
  const key = searchParams.get("key") || "";
  const value = searchParams.get("value") || "";

  // API hooks
  const {
    data: houseSettingsData,
    loading: loadingHouseSettings,
    execute: fetchHouseSettings,
  } = useApi(houseSettingService.getHouseSettings);

  const { execute: deleteHouseSetting } = useApi(
    houseSettingService.deleteHouseSetting
  );

  // Derived state
  const houseSettings = houseSettingsData?.data || [];
  const pagination = houseSettingsData
    ? {
        current_page: houseSettingsData.meta.current_page,
        last_page: houseSettingsData.meta.last_page,
        total: houseSettingsData.meta.total,
        per_page: houseSettingsData.meta.per_page,
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
    loadHouseSettings();
  }, [currentPage, perPage, sortBy, sortDir, houseId]);

  const loadHouseSettings = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
      house_id: houseId,
    };

    // Add filters if they exist
    if (key) params.key = key;
    if (value) params.value = value;

    const response = await fetchHouseSettings(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách cài đặt nhà");
    }
  };

  const handleDeleteHouseSetting = async (houseSetting) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nội quy này?")) {
      const response = await deleteHouseSetting(houseSetting.id);

      if (response.success) {
        showSuccess("Xóa nội quy nhà thành công");
        loadHouseSettings();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa nội quy nhà");
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
      key: "",
      value: "",
    });
    loadHouseSettings();
  };

  const canManageSettings = isAdmin || isManager;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fs-5 fw-semibold">Nội quy nhà</h3>
        {canManageSettings && (
          <Link
            to={`/houses/${houseId}/settings/create`}
            className="btn btn-primary btn-sm"
          >
            Thêm nội quy
          </Link>
        )}
      </div>

      <FilterSection
        filters={{ key, value }}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadHouseSettings}
      />

      <Card>
        {loadingHouseSettings ? (
          <Loader />
        ) : (
          <Table
            data={houseSettings}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            actionColumn={{
              key: "actions",
              actions: [
                {
                  icon: "mdi-eye",
                  handler: (setting) =>
                    navigate(`/houses/${houseId}/settings/${setting.id}`),
                },
                {
                  icon: "mdi-pencil",
                  handler: (setting) =>
                    navigate(`/houses/${houseId}/settings/${setting.id}/edit`),
                },
                {
                  icon: "mdi-delete",
                  handler: handleDeleteHouseSetting,
                },
              ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default HouseSettingList;
