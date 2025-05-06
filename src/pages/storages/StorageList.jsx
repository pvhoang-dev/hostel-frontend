import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { storageService } from "../../api/storages";
import { houseService } from "../../api/houses";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

// Component con hiển thị phần filter
const FilterSection = ({
  filters,
  houses,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  hideHouseFilter = false,
}) => (
  <Card title="Bộ lọc" className="mb-3">
    <div className="row g-3">
      {!hideHouseFilter && (
        <div className="col-md-4">
          <Select
            label="Nhà"
            name="house_id"
            value={filters.house_id}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              ...houses.map((house) => ({
                value: house.id,
                label: house.name,
              })),
            ]}
          />
        </div>
      )}

      <div className="col-md-4">
        <Input
          label="Số lượng từ"
          name="min_quantity"
          type="number"
          min="0"
          value={filters.min_quantity}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Số lượng đến"
          name="max_quantity"
          type="number"
          min="0"
          value={filters.max_quantity}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Giá từ"
          name="min_price"
          type="number"
          min="0"
          value={filters.min_price}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Giá đến"
          name="max_price"
          type="number"
          min="0"
          value={filters.max_price}
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

const StorageList = ({
  houseId,
  embedded = false,
  fromHouseDetail = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || (embedded ? 10 : 5);
  const sortBy = searchParams.get("sort_by") || "id";
  const sortDir = searchParams.get("sort_dir") || "asc";

  // If embedded and houseId is provided, use it as the filter
  const house_id = houseId || searchParams.get("house_id") || "";
  const description = searchParams.get("description") || "";
  const min_quantity = searchParams.get("min_quantity") || "";
  const max_quantity = searchParams.get("max_quantity") || "";
  const min_price = searchParams.get("min_price") || "";
  const max_price = searchParams.get("max_price") || "";

  // API hooks
  const {
    data: storagesData,
    loading: loadingStorages,
    execute: fetchStorages,
  } = useApi(storageService.getStorages);

  const {
    data: housesData,
    loading: loadingHouses,
    execute: fetchHouses,
  } = useApi(houseService.getHouses);

  const { execute: deleteStorage } = useApi(storageService.deleteStorage);

  // Derived state
  const storages = storagesData?.data || [];

  const pagination = storagesData
    ? {
        current_page: storagesData.meta.current_page,
        last_page: storagesData.meta.last_page,
        total: storagesData.meta.total,
        per_page: storagesData.meta.per_page,
      }
    : null;

  const houses = housesData?.data || [];

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    // Don't show house name when embedded in house detail
    ...(!embedded
      ? [
          {
            accessorKey: "house.name",
            header: "Nhà",
            cell: ({ row }) => row.original.house?.name || "N/A",
          },
        ]
      : []),
    {
      accessorKey: "equipment.name",
      header: "Thiết bị",
      cell: ({ row }) => row.original.equipment?.name || "N/A",
    },
    {
      accessorKey: "quantity",
      header: "Số lượng",
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) =>
        row.original.price
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(row.original.price)
          : "N/A",
    },
    // Only show created_at in standalone mode
    ...(!embedded
      ? [
          {
            accessorKey: "created_at",
            header: "Ngày tạo",
          },
        ]
      : []),
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  // Tải houses khi component được mount
  useEffect(() => {
    if (user) {
      if (!embedded) {
        loadHouses();
      }
    }
  }, [user, houseId, embedded]);

  // Xử lý thay đổi trong filters hoặc pagination
  useEffect(() => {
    if (user && (!loadingHouses || embedded) && !loadingStorages) {
      loadStorages();
    }
  }, [currentPage, perPage, sortBy, sortDir, house_id, user, houseId]);

  const loadStorages = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
      include: "house,equipment",
    };

    // When embedded, always use the provided houseId
    if (embedded && houseId) {
      params.house_id = houseId;
    } else {
      // Add filters if they exist
      if (house_id) params.house_id = house_id;
    }

    if (description) params.description = description;
    if (min_quantity) params.min_quantity = min_quantity;
    if (max_quantity) params.max_quantity = max_quantity;
    if (min_price) params.min_price = min_price;
    if (max_price) params.max_price = max_price;

    const response = await fetchStorages(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách kho thiết bị");
    }
  };

  const loadHouses = async () => {
    // For managers, only show their managed houses
    const params = isManager ? { manager_id: user.id } : {};
    await fetchHouses(params);
  };

  const handleDeleteStorage = async (storage) => {
    // Only allow admins or the manager of this house to delete
    if (!(isAdmin || (isManager && storage.house?.manager_id === user?.id))) {
      showError("Bạn không có quyền xóa thiết bị này khỏi kho");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này khỏi kho?")) {
      const response = await deleteStorage(storage.id);

      if (response.success) {
        showSuccess("Xóa thiết bị khỏi kho thành công");
        loadStorages();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa thiết bị");
      }
    }
  };

  // Custom handler for edit to check permissions
  const handleEditStorage = (storage) => {
    // Only allow admins or the manager of this house to edit
    if (!(isAdmin || (isManager && storage.house?.manager_id === user?.id))) {
      showError("Bạn không có quyền sửa thông tin kho thiết bị này");
      return;
    }

    navigate(`/storages/${storage.id}/edit`);
  };

  const handlePageChange = (page) => {
    if (embedded) {
      // When embedded, just reload with the new page
      const params = {
        page: page,
        per_page: perPage,
        house_id: houseId,
      };
      fetchStorages(params);
    } else {
      setSearchParams({
        ...Object.fromEntries(searchParams),
        page: page.toString(),
      });
    }
  };

  const handleSortingChange = (sorting) => {
    if (sorting.length > 0) {
      if (embedded) {
        // When embedded, just reload with the new sorting
        const params = {
          page: currentPage,
          per_page: perPage,
          sort_by: sorting[0].id,
          sort_dir: sorting[0].desc ? "desc" : "asc",
          house_id: houseId,
        };
        fetchStorages(params);
      } else {
        setSearchParams({
          ...Object.fromEntries(searchParams),
          sort_by: sorting[0].id,
          sort_dir: sorting[0].desc ? "desc" : "asc",
        });
      }
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
    if (embedded) {
      const params = {
        page: 1,
        per_page: perPage,
        house_id: houseId,
      };
      fetchStorages(params);
    } else {
      setSearchParams({
        page: "1",
        per_page: perPage.toString(),
      });
      loadStorages();
    }
  };

  const isLoading = loadingStorages || (loadingHouses && !embedded);

  // Nếu chưa có thông tin user, hiển thị loading
  if (!user) {
    return <Loader />;
  }

  return (
    <div className={embedded ? "" : "container-fluid"}>
      {!embedded && (
        <div className="d-flex justify-content-between align-items-center my-2">
          <h3 className="fs-2 fw-semibold">Quản lý kho thiết bị</h3>
          {(isAdmin || isManager) && (
            <Link
              to={
                houseId
                  ? `/storages/create?house_id=${houseId}`
                  : "/storages/create"
              }
              className="btn btn-primary fw-semibold"
            >
              Thêm thiết bị vào kho
            </Link>
          )}
        </div>
      )}

      {!embedded && (
        <FilterSection
          filters={{
            house_id,
            description,
            min_quantity,
            max_quantity,
            min_price,
            max_price,
          }}
          houses={houses}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onApplyFilters={loadStorages}
          hideHouseFilter={!!houseId}
        />
      )}

      <Card className={embedded ? "" : "shadow"}>
        {embedded && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fs-5 fw-semibold mb-0">Kho thiết bị</h4>
            <Link
              to={`/storages/create?house_id=${houseId}`}
              className="btn btn-sm btn-primary"
            >
              Thêm thiết bị
            </Link>
          </div>
        )}

        {isLoading ? (
          <Loader />
        ) : (
          <Table
            data={storages}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPerPageChange={(newPerPage) => {
              if (embedded) {
                const params = {
                  page: 1,
                  per_page: newPerPage,
                  house_id: houseId,
                };
                fetchStorages(params);
              } else {
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  page: "1",
                  per_page: newPerPage.toString(),
                });
              }
            }}
            onSortingChange={handleSortingChange}
            activeSort={{
              column: sortBy,
              direction: sortDir,
            }}
            actionColumn={{
              key: "actions",
              actions: [
                {
                  icon: "mdi-eye",
                  handler: (storage) => navigate(`/storages/${storage.id}`),
                },
                {
                  icon: "mdi-pencil",
                  handler: handleEditStorage,
                  visible: (storage) =>
                    isAdmin ||
                    (isManager && storage.house?.manager_id === user?.id),
                },
                {
                  icon: "mdi-delete",
                  handler: handleDeleteStorage,
                  visible: (storage) =>
                    isAdmin ||
                    (isManager && storage.house?.manager_id === user?.id),
                },
              ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default StorageList;
