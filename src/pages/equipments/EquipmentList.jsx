import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { equipmentService } from "../../api/equipments";
import Table from "../../components/common/Table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
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
      <div className="col-md-6">
        <Input
          label="Tên"
          name="name"
          value={filters.name}
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

const EquipmentList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 5;
  const sortBy = searchParams.get("sort_by") || "name";
  const sortDir = searchParams.get("sort_dir") || "asc";
  const name = searchParams.get("name") || "";

  // API hooks
  const {
    data: equipmentsData,
    loading: loadingEquipments,
    execute: fetchEquipments,
  } = useApi(equipmentService.getEquipments);

  const { execute: deleteEquipment } = useApi(equipmentService.deleteEquipment);

  // Derived state
  const equipments = equipmentsData?.data || [];
  const pagination = equipmentsData
    ? {
        current_page: equipmentsData.meta.current_page,
        last_page: equipmentsData.meta.last_page,
        total: equipmentsData.meta.total,
        per_page: equipmentsData.meta.per_page,
      }
    : null;

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  useEffect(() => {
    loadEquipments();
  }, [currentPage, perPage, sortBy, sortDir]);

  const loadEquipments = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
    };

    // Add filters if they exist
    if (name) params.name = name;

    const response = await fetchEquipments(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách thiết bị");
    }
  };

  const handleDeleteEquipment = async (equipment) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      const response = await deleteEquipment(equipment.id);

      if (response.success) {
        showSuccess("Xóa thiết bị thành công");
        loadEquipments();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa thiết bị");
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
    loadEquipments();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Thiết bị</h3>
        {isAdmin && (
          <Button as={Link} to="/equipments/create">
            Thêm
          </Button>
        )}
      </div>

      <FilterSection
        filters={{ name }}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={loadEquipments}
      />

      <Card>
        {loadingEquipments ? (
          <Loader />
        ) : (
          <Table
            data={equipments}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            loading={loadingEquipments}
            actionColumn={{
              key: "actions",
              actions: isAdmin
                ? [
                    {
                      icon: "mdi-eye",
                      handler: (equipment) =>
                        navigate(`/equipments/${equipment.id}`),
                    },
                    {
                      icon: "mdi-pencil",
                      handler: (equipment) =>
                        navigate(`/equipments/${equipment.id}/edit`),
                    },
                    {
                      icon: "mdi-delete",
                      handler: handleDeleteEquipment,
                    },
                  ]
                : [
                    {
                      icon: "mdi-eye",
                      handler: (equipment) =>
                        navigate(`/equipments/${equipment.id}`),
                    },
                  ],
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default EquipmentList;
