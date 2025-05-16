import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Table from "../../../components/common/Table";
import Card from "../../../components/common/Card";
import Loader from "../../../components/common/Loader";
import useApi from "../../../hooks/useApi";
import useAlert from "../../../hooks/useAlert";
import { useAuth } from "../../../hooks/useAuth";
import { roomEquipmentService } from "../../../api/roomEquipments";
import { storageService } from "../../../api/storages";

const RoomEquipmentList = ({ roomId, houseId, embedded = false, tenantView = false }) => {
  const { showSuccess, showError } = useAlert();
  const { user, isAdmin, isManager, isTenant } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReturnToStorageModal, setShowReturnToStorageModal] =
    useState(false);

  // API hooks
  const {
    data: roomEquipmentsData,
    loading: loadingRoomEquipments,
    execute: fetchRoomEquipments,
  } = useApi(roomEquipmentService.getRoomEquipments);

  const { execute: deleteRoomEquipment } = useApi(
    roomEquipmentService.deleteRoomEquipment
  );

  const { execute: getStorages } = useApi(storageService.getStorages);
  const { execute: createStorage } = useApi(storageService.createStorage);
  const { execute: updateStorage } = useApi(storageService.updateStorage);

  // Handle modal visibility
  useEffect(() => {
    if (showDeleteModal) {
      window.$("#deleteConfirmModal").modal("show");
    } else {
      window.$("#deleteConfirmModal").modal("hide");
    }

    if (showReturnToStorageModal) {
      window.$("#returnToStorageModal").modal("show");
    } else {
      window.$("#returnToStorageModal").modal("hide");
    }
  }, [showDeleteModal, showReturnToStorageModal]);

  // Modal event handlers for cleanup
  useEffect(() => {
    const handleDeleteHidden = () => setShowDeleteModal(false);
    const handleReturnStorageHidden = () => setShowReturnToStorageModal(false);

    window.$("#deleteConfirmModal").on("hidden.bs.modal", handleDeleteHidden);
    window
      .$("#returnToStorageModal")
      .on("hidden.bs.modal", handleReturnStorageHidden);

    return () => {
      window
        .$("#deleteConfirmModal")
        .off("hidden.bs.modal", handleDeleteHidden);
      window
        .$("#returnToStorageModal")
        .off("hidden.bs.modal", handleReturnStorageHidden);
    };
  }, []);

  // Derived state
  const roomEquipments = roomEquipmentsData?.data || [];
  const pagination = roomEquipmentsData
    ? {
        current_page: roomEquipmentsData.meta.current_page,
        last_page: roomEquipmentsData.meta.last_page,
        total: roomEquipmentsData.meta.total,
        per_page: roomEquipmentsData.meta.per_page,
      }
    : null;

  // Column definitions for the table
  const columns = [
    {
      accessorKey: "equipment",
      header: "Thiết bị",
      cell: ({ row }) => (
        <div className="fw-medium">{row.original.equipment?.name || "-"}</div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Số lượng",
      cell: ({ row }) => <div>{row.original.quantity}</div>,
    },
    {
      accessorKey: "price",
      header: "Giá (VND)",
      cell: ({ row }) => (
        <div>{row.original.price.toLocaleString("vi-VN")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => (
        <div className="text-truncate" style={{ maxWidth: "200px" }}>
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
    loadRoomEquipments();
  }, [roomId, currentPage, sortBy, sortDir]);

  const loadRoomEquipments = async () => {
    if (!roomId) return;

    const params = {
      page: currentPage,
      per_page: 10,
      sort_by: sortBy,
      sort_dir: sortDir,
      room_id: roomId,
      include: "equipment",
    };

    const response = await fetchRoomEquipments(params);

    if (!response.success) {
      showError("Lỗi khi tải danh sách thiết bị phòng");
    }
  };

  const handleDeleteClick = (equipment) => {
    setEquipmentToDelete(equipment);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    // Always ask if user wants to return to storage, regardless of source
    setShowReturnToStorageModal(true);
  };

  const handleReturnToStorageDecision = (returnToStorage) => {
    setShowReturnToStorageModal(false);
    performDelete(returnToStorage);
  };

  const performDelete = async (returnToStorage = false) => {
    if (!equipmentToDelete) return;

    try {
      // If returning to storage, we need to check if storage exists and update/create it
      if (returnToStorage && equipmentToDelete) {
        // Find if storage exists for this equipment in this house
        const storageResponse = await getStorages({
          equipment_id: equipmentToDelete.equipment.id,
          house_id: houseId,
        });

        if (storageResponse.success) {
          if (storageResponse.data.data.length > 0) {
            // Storage exists, update it
            const existingStorage = storageResponse.data.data[0];
            const newQuantity =
              existingStorage.quantity + parseInt(equipmentToDelete.quantity);

            const updateResponse = await updateStorage(existingStorage.id, {
              quantity: newQuantity,
            });

            if (!updateResponse.success) {
              showError("Có lỗi xảy ra khi cập nhật kho");
              return;
            }

            showSuccess(
              `Đã cập nhật số lượng trong kho (+${equipmentToDelete.quantity})`
            );
          } else {
            // Storage doesn't exist, create it
            const createResponse = await createStorage({
              equipment_id: equipmentToDelete.equipment.id,
              house_id: houseId,
              quantity: equipmentToDelete.quantity,
              price: equipmentToDelete.price,
            });

            if (!createResponse.success) {
              showError("Có lỗi xảy ra khi tạo kho mới");
              return;
            }

            showSuccess(
              `Đã thêm thiết bị vào kho (${equipmentToDelete.quantity})`
            );
          }
        } else {
          showError("Có lỗi xảy ra khi kiểm tra kho");
          return;
        }
      }

      // Delete the room equipment
      const response = await deleteRoomEquipment(equipmentToDelete.id);

      if (response.success) {
        showSuccess("Xóa thiết bị phòng thành công");
        loadRoomEquipments();
      } else {
        showError(response.message || "Có lỗi xảy ra khi xóa thiết bị phòng");
      }

      // Clear the equipment to delete
      setEquipmentToDelete(null);
    } catch (error) {
      console.error("Error deleting room equipment:", error);
      showError("Có lỗi xảy ra khi xóa thiết bị phòng");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEquipmentToDelete(null);
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

  // Only admin and managers of this house can manage equipment
  const canManageEquipments =
    isAdmin ||
    (isManager &&
      houseId &&
      user?.managed_house_ids?.includes(parseInt(houseId)));

  // Tìm phần khai báo component
  const canAdd = !tenantView && (isAdmin || (isManager && room?.house?.manager_id === user?.id));

  return (
    <>
      <Card>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fs-5 fw-semibold">Thiết bị trong phòng</h4>
          {canAdd && (
            <Link
              to={`/rooms/${roomId}/equipments/create${houseId ? `?house_id=${houseId}` : ""}`}
              className="btn btn-primary"
            >
              Thêm thiết bị
            </Link>
          )}
        </div>

        {loadingRoomEquipments ? (
          <Loader />
        ) : (
          <Table
            data={roomEquipments}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            sortingState={[{ id: sortBy, desc: sortDir === "desc" }]}
            onSortingChange={handleSortingChange}
            actionColumn={
              isTenant
                ? {
                    key: "actions",
                    actions: [
                      {
                        icon: "mdi-eye",
                        handler: (equipment) =>
                          (window.location.href = `/rooms/${roomId}/equipments/${equipment.id}`),
                      },
                    ],
                  }
                : canManageEquipments
                ? {
                    key: "actions",
                    actions: [
                      {
                        icon: "mdi-eye",
                        handler: (equipment) =>
                          (window.location.href = `/rooms/${roomId}/equipments/${equipment.id}`),
                      },
                      {
                        icon: "mdi-pencil",
                        handler: (equipment) =>
                          (window.location.href = `/rooms/${roomId}/equipments/${equipment.id}/edit?house_id=${houseId}`),
                      },
                      {
                        icon: "mdi-delete",
                        handler: handleDeleteClick,
                      },
                    ],
                  }
                : undefined
            }
          />
        )}
      </Card>

      {/* Delete confirmation modal */}
      <div
        id="deleteConfirmModal"
        className="modal fade"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Xác nhận xóa</h5>
              <button
                type="button"
                className="btn-close"
                data-dismiss="modal"
                aria-hidden="true"
                onClick={cancelDelete}
              ></button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa thiết bị này khỏi phòng?</p>
              {equipmentToDelete && (
                <>
                  <p>
                    Thiết bị:{" "}
                    <strong>{equipmentToDelete.equipment?.name}</strong>
                  </p>
                  <p>
                    Số lượng: <strong>{equipmentToDelete.quantity}</strong>
                  </p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
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

      {/* Modal for asking if equipment should be returned to storage */}
      <div
        id="returnToStorageModal"
        className="modal fade"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cập nhật kho</h5>
              <button
                type="button"
                className="btn-close"
                data-dismiss="modal"
                aria-hidden="true"
                onClick={() => handleReturnToStorageDecision(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có muốn trả {equipmentToDelete?.quantity || 0}{" "}
                {equipmentToDelete?.equipment?.name || "thiết bị"} về kho không?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={() => handleReturnToStorageDecision(false)}
              >
                Không, chỉ xóa
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleReturnToStorageDecision(true)}
              >
                Có, trả về kho
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

RoomEquipmentList.propTypes = {
  roomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  houseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  embedded: PropTypes.bool,
  tenantView: PropTypes.bool,
};

export default RoomEquipmentList;
