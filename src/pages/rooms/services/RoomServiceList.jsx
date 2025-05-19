import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Table from "../../../components/ui/Table";
import Card from "../../../components/ui/Card";
import Loader from "../../../components/ui/Loader";
import useApi from "../../../hooks/useApi";
import useAlert from "../../../hooks/useAlert";
import { useAuth } from "../../../hooks/useAuth";
import { roomServiceService } from "../../../api/roomServices";
import { useNavigate } from "react-router-dom";

const DeleteConfirmModal = ({ show, service, onCancel, onConfirm }) => {
  if (!show) return null;

  return (
    <div 
      className="modal fade show" 
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Xác nhận xóa</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            Bạn có chắc chắn muốn xóa dịch vụ{" "}
            <strong>{service?.service?.name}</strong> khỏi phòng này?
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  service: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

const RoomServiceList = ({ roomId, houseId, embedded = false, tenantView = false }) => {
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

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDeleteModal]);

  // Fetch room services
  useEffect(() => {
    loadRoomServices();
  }, [roomId, currentPage, sortBy, sortDir]);

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
      cell: ({ row }) => (
        <div className="d-flex gap-2">
          <Link
            to={`/room-services/${row.original.id}`}
            className="btn btn-sm btn-info"
          >
            Chi tiết
          </Link>
          {canEdit && (
            <Link
              to={`/room-services/${row.original.id}/edit`}
              className="btn btn-sm btn-primary"
            >
              Sửa
            </Link>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row.original.id)}
              className="btn btn-sm btn-danger"
            >
              Xóa
            </button>
          )}
        </div>
      ),
    },
  ];

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
    console.log("Attempting to delete service:", service);
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    console.log("Cancel delete");
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  const handleConfirmDelete = async () => {
    console.log("Confirm delete for service:", serviceToDelete);
    
    if (!serviceToDelete) {
      console.error("No service selected for deletion");
      return;
    }

    try {
      // Đóng modal và reset state
      setShowDeleteModal(false);
      
      const response = await deleteRoomService(serviceToDelete.id);

      if (response.success) {
        showSuccess("Xóa dịch vụ phòng thành công");
        loadRoomServices();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa dịch vụ phòng");
      }
    } catch (error) {
      console.error("Error deleting room service:", error);
      showError("Có lỗi xảy ra khi xóa dịch vụ phòng");
    } finally {
      setServiceToDelete(null);
    }
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

  // Thêm logic để kiểm tra xem có thể thêm/sửa/xóa dịch vụ không
  const canAdd = !tenantView && (isAdmin || (isManager && user?.managed_houses?.includes(parseInt(houseId))));
  const canEdit = !tenantView && (isAdmin || (isManager && user?.managed_houses?.includes(parseInt(houseId))));
  const canDelete = !tenantView && (isAdmin || (isManager && user?.managed_houses?.includes(parseInt(houseId))));

  const handleViewClick = (service) => {
    navigate(`/room-services/${service.id}`);
  };
  
  const handleEditClick = (service) => {
    navigate(`/room-services/${service.id}/edit`);
  };

  return (
    <>
      <Card>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="card-title mb-0">
            {embedded ? "Dịch vụ phòng" : `Dịch vụ phòng - ${roomId}`}
          </h4>
          {canAdd && (
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
                      handler: handleViewClick,
                    },
                    {
                      icon: "mdi-pencil",
                      handler: handleEditClick,
                    },
                    {
                      icon: "mdi-delete",
                      handler: handleDeleteClick,
                    },
                  ]
                : [
                    {
                      icon: "mdi-eye",
                      handler: handleViewClick,
                    },
                  ],
            }}
          />
        )}
      </Card>

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal 
        show={showDeleteModal}
        service={serviceToDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

RoomServiceList.propTypes = {
  roomId: PropTypes.string.isRequired,
  houseId: PropTypes.number,
  embedded: PropTypes.bool,
  tenantView: PropTypes.bool,
};

export default RoomServiceList;
