import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Table from "../../../components/common/Table";
import Card from "../../../components/common/Card";
import Loader from "../../../components/common/Loader";
import useApi from "../../../hooks/useApi";
import useAlert from "../../../hooks/useAlert";
import { useAuth } from "../../../hooks/useAuth";
import { roomServiceService } from "../../../api/roomServices";
import { useNavigate } from "react-router-dom";

const RoomServiceList = ({ roomId, houseId, embedded = false }) => {
  const { showSuccess, showError } = useAlert();
  const { user, isAdmin, isManager, isTenant } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  // API hooks
  const {
    data: roomServicesData,
    loading: loadingRoomServices,
    execute: fetchRoomServices,
  } = useApi(roomServiceService.getRoomServices);

  const { execute: deleteRoomService } = useApi(
    roomServiceService.deleteRoomService
  );

  // Handle modal visibility
  useEffect(() => {
    if (showDeleteModal) {
      window.$("#deleteConfirmModal").modal("show");
    } else {
      window.$("#deleteConfirmModal").modal("hide");
    }
  }, [showDeleteModal]);

  // Modal event handlers for cleanup
  useEffect(() => {
    const handleDeleteHidden = () => setShowDeleteModal(false);

    window.$("#deleteConfirmModal").on("hidden.bs.modal", handleDeleteHidden);

    return () => {
      window
        .$("#deleteConfirmModal")
        .off("hidden.bs.modal", handleDeleteHidden);
    };
  }, []);

  // Derived state
  const roomServices = roomServicesData?.data || [];
  const pagination = roomServicesData
    ? {
        current_page: roomServicesData.meta.current_page,
        last_page: roomServicesData.meta.last_page,
        total: roomServicesData.meta.total,
        per_page: roomServicesData.meta.per_page,
      }
    : null;

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "service",
      header: "Dịch vụ",
      cell: ({ row }) => (
        <div className="font-weight-bold">
          <Link to={`/services/${row.original.service?.id}`}>
            {row.original.service?.name || "-"}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Giá (VND)",
      cell: ({ row }) => (
        <div>{row.original.price.toLocaleString("vi-VN")}</div>
      ),
    },
    {
      accessorKey: "is_fixed",
      header: "Loại phí",
      cell: ({ row }) => (
        <div>{row.original.is_fixed ? "Cố định" : "Theo lượng sử dụng"}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => <div>{row.original.status}</div>,
    },
    {
      accessorKey: "actions",
      header: "Hành động",
    },
  ];

  useEffect(() => {
    loadRoomServices();
  }, [roomId, currentPage, sortBy, sortDir]);

  const loadRoomServices = async () => {
    if (!roomId) return;

    const params = {
      page: currentPage,
      per_page: 10,
      sort_by: sortBy,
      sort_dir: sortDir,
      room_id: roomId,
      include: "service",
    };

    const response = await fetchRoomServices(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách dịch vụ phòng");
    }
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);

    if (!serviceToDelete) return;

    try {
      const response = await deleteRoomService(serviceToDelete.id);

      if (response.success) {
        showSuccess("Xóa dịch vụ phòng thành công");
        loadRoomServices();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa dịch vụ phòng");
      }

      setServiceToDelete(null);
    } catch (error) {
      console.error("Error deleting room service:", error);
      showError("Có lỗi xảy ra khi xóa dịch vụ phòng");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortingChange = (sorting) => {
    if (sorting.length > 0) {
      setSortBy(sorting[0].id);
      setSortDir(sorting[0].desc ? "desc" : "asc");
    }
  };

  // Only admin and managers of this house can manage services
  const canManageServices =
    isAdmin || (isManager && user?.managed_houses?.includes(parseInt(houseId)));

  return (
    <>
      <Card>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="card-title mb-0">
            {embedded ? "Dịch vụ phòng" : `Dịch vụ phòng - ${roomId}`}
          </h4>
          {canManageServices && (
            <Link
              to={`/rooms/${roomId}/services/create`}
              className="btn btn-primary btn-sm"
            >
              <i className="bi bi-plus-lg me-1"></i>
              Thêm dịch vụ
            </Link>
          )}
        </div>

        {loadingRoomServices ? (
          <Loader />
        ) : (
          <Table
            data={roomServices}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSortingChange={handleSortingChange}
            sortable={true}
            actionColumn={{
              key: "actions",
              actions: canManageServices
                ? [
                    {
                      icon: "mdi-eye",
                      handler: (service) =>
                        navigate(`/room-services/${service.id}`),
                    },
                    {
                      icon: "mdi-pencil",
                      handler: (service) =>
                        navigate(`/room-services/${service.id}/edit`),
                    },
                    {
                      icon: "mdi-delete",
                      handler: handleDeleteClick,
                    },
                  ]
                : [
                    {
                      icon: "mdi-eye",
                      handler: (service) =>
                        navigate(`/room-services/${service.id}`),
                    },
                  ],
            }}
          />
        )}
      </Card>

      {/* Confirm Delete Modal */}
      <div
        className="modal fade"
        id="deleteConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Xác nhận xóa</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Bạn có chắc chắn muốn xóa dịch vụ{" "}
              <strong>{serviceToDelete?.service?.name}</strong> khỏi phòng này?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelDelete}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

RoomServiceList.propTypes = {
  roomId: PropTypes.string.isRequired,
  houseId: PropTypes.number,
  embedded: PropTypes.bool,
};

export default RoomServiceList;
