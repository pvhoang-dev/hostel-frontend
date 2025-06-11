import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { houseService } from "../../api/houses";
import { userService } from "../../api/users";
import Table from "../../components/ui/Table";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

// Component con hiển thị phần filter
const FilterSection = ({
  filters,
  managers,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  isAdmin,
}) => (
  <Card title="Bộ lọc" className="mb-3">
    <div className="row g-3">
      <div className="col-md-4">
        <Input
          label="Tên nhà"
          name="name"
          value={filters.name}
          onChange={onFilterChange}
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Địa chỉ"
          name="address"
          value={filters.address}
          onChange={onFilterChange}
        />
      </div>

      {isAdmin && (
        <div className="col-md-4">
          <Select
            label="Quản lý"
            name="manager_id"
            value={filters.manager_id}
            onChange={onFilterChange}
            options={[
              { value: "", label: "Tất cả" },
              ...managers.map((user) => ({ value: user.id, label: user.name })),
            ]}
          />
        </div>
      )}

      <div className="col-md-4">
        <Select
          label="Trạng thái"
          name="status"
          value={filters.status}
          onChange={onFilterChange}
          options={[
            { value: "", label: "Tất cả" },
            { value: "active", label: "Hoạt động" },
            { value: "inactive", label: "Không hoạt động" },
            { value: "maintenance", label: "Bảo trì" },
          ]}
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

const HouseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  // Get current filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 10;
  const sortBy = searchParams.get("sort_by") || "id";
  const sortDir = searchParams.get("sort_dir") || "asc";
  const name = searchParams.get("name") || "";
  const address = searchParams.get("address") || "";
  const manager_id = searchParams.get("manager_id") || "";
  const status = searchParams.get("status") || "";

  // API hooks
  const {
    data: housesData,
    loading: loadingHouses,
    execute: fetchHouses,
  } = useApi(houseService.getHouses);

  const {
    data: managersData,
    loading: loadingManagers,
    execute: fetchManagers,
  } = useApi(userService.getUsers);

  const { execute: deleteHouse } = useApi(houseService.deleteHouse);

  // Derived state
  const houses = housesData?.data || [];
  const pagination = housesData
    ? {
        current_page: housesData.meta.current_page,
        last_page: housesData.meta.last_page,
        total: housesData.meta.total,
        per_page: housesData.meta.per_page,
      }
    : null;

  const managers = managersData?.data || [];

  const { isAdmin, isTenant, isManager } = useAuth();

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Tên nhà",
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
    },
    {
      accessorKey: "manager.name",
      header: "Quản lý",
      cell: ({ row }) => row.original.manager?.name || "Chưa có quản lý",
    },
    {
      accessorKey: "status",
      header: "T.Thái",
      cell: ({ row }) => {
        const status = row.original.status;
        let statusClass;

        switch (status) {
          case "active":
            statusClass = "text-success";
            return <span className={statusClass}>Hoạt động</span>;
          case "maintain":
            statusClass = "text-warning";
            return <span className={statusClass}>Bảo trì</span>;
          default:
            statusClass = "text-danger";
            return <span className={statusClass}>Không hoạt động</span>;
        }
      },
    },
    {
      accessorKey: "created_at",
      header: "Ngày tạo",
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  // Khởi tạo xử lý nút Hủy trong modal
  useEffect(() => {
    // Khởi tạo nút hủy trong modal
    $("#deleteHouseModal .btn-close, #deleteHouseModal .btn-secondary").on(
      "click",
      function () {
        $("#deleteHouseModal").modal("hide");
      }
    );

    // Cleanup khi component unmount
    return () => {
      $("#deleteHouseModal .btn-close, #deleteHouseModal .btn-secondary").off(
        "click"
      );
      $("#deleteHouseModal #confirmDeleteBtn").off("click");
    };
  }, []);

  useEffect(() => {
    loadHouses();
    loadManagers();
  }, []);

  useEffect(() => {
    if (!loadingManagers && !loadingHouses) {
      loadHouses();
    }
  }, [
    currentPage,
    perPage,
    sortBy,
    sortDir,
    manager_id,
    status,
    name,
    address,
  ]);

  const loadHouses = async () => {
    const params = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
      include: "manager",
    };

    // Add filters if they exist
    if (name) params.name = name;
    if (address) params.address = address;
    if (manager_id) params.manager_id = manager_id;
    if (status) params.status = status;

    const response = await fetchHouses(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách nhà");
    }
  };

  const loadManagers = async () => {
    await fetchManagers({ role: "admin,manager" });
  };

  const handleDeleteHouse = async (house) => {
    // Hiển thị modal xác nhận
    const $deleteModal = $("#deleteHouseModal");

    // Xóa event handlers cũ (nếu có)
    $deleteModal.find("#confirmDeleteBtn").off("click");

    // Đăng ký event handler mới cho nút xác nhận
    $deleteModal.find("#confirmDeleteBtn").on("click", async function () {
      // Ẩn modal
      $deleteModal.modal("hide");

      // Gọi API xóa nhà
      const response = await deleteHouse(house.id);

      if (response.success) {
        showSuccess("Xóa nhà thành công");
        loadHouses();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa nhà");
      }
    });

    // Hiển thị modal
    $deleteModal.modal("show");
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

  const isLoading = loadingHouses || loadingManagers;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3>Nhà</h3>
        {isAdmin && (
          <Button as={Link} to="/houses/create">
            Thêm
          </Button>
        )}
      </div>

      {!isTenant && (
        <FilterSection
          filters={{ name, address, manager_id, status }}
          managers={managers}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onApplyFilters={loadHouses}
          isAdmin={isAdmin}
        />
      )}

      <Card>
        {isLoading ? (
          <Loader />
        ) : (
          <Table
            data={houses}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            loading={isLoading}
            actionColumn={{
              key: "actions",
              actions: [
                {
                  icon: "mdi-eye",
                  handler: (house) => navigate(`/houses/${house.id}`),
                },
                ...(isAdmin || isManager
                  ? [
                      {
                        icon: "mdi-pencil",
                        handler: (house) =>
                          navigate(`/houses/${house.id}/edit`),
                      },
                    ]
                  : []),
                ...(isAdmin
                  ? [
                      {
                        icon: "mdi-delete",
                        handler: handleDeleteHouse,
                      },
                    ]
                  : []),
              ],
            }}
          />
        )}
      </Card>

      {/* Modal xác nhận xóa nhà (HTML cứng, không truyền dữ liệu động) */}
      <div
        className="modal fade"
        id="deleteHouseModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Xác nhận xóa nhà</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <h5 className="alert-heading fw-bold">Cảnh báo!</h5>
                <p>Bạn đang xóa nhà này.</p>
                <p>Hành động này sẽ xóa các dữ liệu liên quan, bao gồm:</p>
                <ul>
                  <li>Tất cả các phòng trong nhà</li>
                  <li>Tất cả hợp đồng thuê liên quan đến các phòng</li>
                  <li>Tất cả thiết bị của phòng</li>
                  <li>Tất cả dịch vụ của phòng</li>
                  <li>Tất cả yêu cầu và phản hồi liên quan</li>
                  <li>Tất cả cài đặt của nhà</li>
                  <li>Tất cả thiết bị trong kho của nhà</li>
                </ul>
                <div className="alert alert-success">
                  <p className="mb-0">
                    <i className="mdi mdi-information-outline me-1"></i> Hóa đơn
                    và giao dịch thanh toán sẽ được giữ lại để phục vụ mục đích
                    thống kê doanh thu.
                  </p>
                </div>
                <p className="mt-3 text-danger fw-bold">
                  Hành động xóa nhà không thể hoàn tác!
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary">
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-danger"
                id="confirmDeleteBtn"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseList;
