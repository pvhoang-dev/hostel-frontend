import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Input from "../common/Input";
import Button from "../common/Button";
import Card from "../common/Card";
import Select from "../common/Select";
import TextArea from "../common/TextArea";
import useApi from "../../hooks/useApi";
import useAlert from "../../hooks/useAlert";
import { equipmentService } from "../../api/equipments";
import { storageService } from "../../api/storages";
import Loader from "../common/Loader";

const RoomEquipmentForm = ({
  roomId,
  houseId,
  initialData = {},
  onSubmit,
  submitButtonText = "Lưu",
  mode = "create",
}) => {
  const navigate = useNavigate();
  const { showError, showInfo } = useAlert();
  const [formData, setFormData] = useState({
    room_id: roomId || initialData.room_id || "",
    equipment_id: initialData?.equipment?.id || "",
    quantity: initialData.quantity || 1,
    price: initialData.price || 0,
    description: initialData.description || "",
    custom_equipment_name: "",
  });
  const [isCustomEquipment, setIsCustomEquipment] = useState(false);
  const [showOtherEquipments, setShowOtherEquipments] = useState(false);
  const [originalQuantity, setOriginalQuantity] = useState(
    initialData.quantity || 1
  );
  const [errors, setErrors] = useState({});
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [showReturnToStorageModal, setShowReturnToStorageModal] =
    useState(false);
  const [showStorageInsufficientModal, setShowStorageInsufficientModal] =
    useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [additionalQuantity, setAdditionalQuantity] = useState(0);
  const [returnQuantity, setReturnQuantity] = useState(0);

  // Get equipments and storage data
  const {
    data: equipmentsData,
    loading: loadingEquipments,
    execute: fetchEquipments,
  } = useApi(equipmentService.getEquipments);

  const { execute: getEquipmentByExactName } = useApi(
    equipmentService.getEquipmentByExactName
  );

  const {
    data: storageData,
    loading: loadingStorage,
    execute: fetchStorage,
  } = useApi(storageService.getStorages);

  const { execute: createEquipment } = useApi(equipmentService.createEquipment);
  const { execute: updateStorage } = useApi(storageService.updateStorage);

  // Load equipments and storage data on component mount
  useEffect(() => {
    fetchEquipments();
    if (houseId) {
      fetchStorage({ house_id: houseId });
    }
  }, [houseId]);

  // Update available quantity when equipment selection changes
  useEffect(() => {
    if (formData.equipment_id && storageData?.data) {
      const selectedStorage = storageData.data.find(
        (storage) => storage.equipment.id === parseInt(formData.equipment_id)
      );
      setAvailableQuantity(selectedStorage ? selectedStorage.quantity : 0);
    }
  }, [formData.equipment_id, storageData]);

  // Save original quantity for comparison
  useEffect(() => {
    if (initialData.quantity) {
      setOriginalQuantity(parseInt(initialData.quantity));
    }
  }, [initialData]);

  // Handle modal visibility
  useEffect(() => {
    if (showReturnToStorageModal) {
      window.$("#returnToStorageModal").modal("show");
    } else {
      window.$("#returnToStorageModal").modal("hide");
    }

    if (showStorageInsufficientModal) {
      window.$("#storageInsufficientModal").modal("show");
    } else {
      window.$("#storageInsufficientModal").modal("hide");
    }

    if (showSourceModal) {
      window.$("#sourceModal").modal("show");
    } else {
      window.$("#sourceModal").modal("hide");
    }
  }, [showReturnToStorageModal, showStorageInsufficientModal, showSourceModal]);

  // Modal event handlers for cleanup
  useEffect(() => {
    const handleReturnStorageHidden = () => setShowReturnToStorageModal(false);
    const handleInsufficientHidden = () =>
      setShowStorageInsufficientModal(false);
    const handleSourceModalHidden = () => setShowSourceModal(false);

    window
      .$("#returnToStorageModal")
      .on("hidden.bs.modal", handleReturnStorageHidden);
    window
      .$("#storageInsufficientModal")
      .on("hidden.bs.modal", handleInsufficientHidden);
    window.$("#sourceModal").on("hidden.bs.modal", handleSourceModalHidden);

    return () => {
      window
        .$("#returnToStorageModal")
        .off("hidden.bs.modal", handleReturnStorageHidden);
      window
        .$("#storageInsufficientModal")
        .off("hidden.bs.modal", handleInsufficientHidden);
      window.$("#sourceModal").off("hidden.bs.modal", handleSourceModalHidden);
    };
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "equipment_id") {
      // Reset the other states when the equipment changes
      if (value === "other") {
        setShowOtherEquipments(true);
        setIsCustomEquipment(false);
        // Don't update the formData.equipment_id yet, wait for the second dropdown selection
      } else if (value === "custom") {
        setIsCustomEquipment(true);
        setShowOtherEquipments(false);
      } else {
        setIsCustomEquipment(false);
        setShowOtherEquipments(false);
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear errors for the changed field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = async () => {
    const newErrors = {};

    if (!formData.room_id) {
      newErrors.room_id = "Vui lòng chọn phòng";
    }

    if (mode === "create") {
      if (!isCustomEquipment && !formData.equipment_id) {
        newErrors.equipment_id = "Vui lòng chọn thiết bị";
      }

      // Only validate quantity against storage if not custom equipment
      // We'll handle insufficient quantity through the source selection modal
      // So we don't need to validate it here

      if (isCustomEquipment && !formData.custom_equipment_name.trim()) {
        newErrors.custom_equipment_name = "Vui lòng nhập tên thiết bị";
      }
    }

    if (parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    }

    if (parseInt(formData.price) < 0) {
      newErrors.price = "Giá không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    let submitData = { ...formData };

    // In edit mode, check for quantity changes and handle them
    if (mode === "edit") {
      const newQuantity = parseInt(formData.quantity);

      // If quantity is increasing
      if (newQuantity > originalQuantity) {
        setAdditionalQuantity(newQuantity - originalQuantity);

        // Show modal to ask if user wants to take from storage or custom source
        setShowSourceModal(true);
        return; // Stop here and wait for modal response
      }
      // If quantity is decreasing
      else if (newQuantity < originalQuantity) {
        setReturnQuantity(originalQuantity - newQuantity);
        // Show modal to ask if user wants to return to storage
        setShowReturnToStorageModal(true);
        return; // Stop here and wait for modal response
      }

      // If no quantity changes, proceed with normal update
      handleUpdateWithStorageLogic(submitData);
    } else {
      // Create mode logic
      if (isCustomEquipment) {
        try {
          // Check if equipment with same name exists
          const equipmentsResponse = await getEquipmentByExactName(
            formData.custom_equipment_name.trim()
          );

          if (
            equipmentsResponse.success &&
            equipmentsResponse.data.data.length > 0
          ) {
            // If equipment with the same name exists, use its ID
            submitData.equipment_id = equipmentsResponse.data.data[0].id;
          } else {
            // Create new equipment
            const equipmentResponse = await createEquipment({
              name: formData.custom_equipment_name.trim(),
            });

            if (equipmentResponse.success) {
              submitData.equipment_id = equipmentResponse.data.id;
            } else {
              showError(
                equipmentResponse.message || "Không thể tạo thiết bị mới"
              );
              return;
            }
          }
        } catch (error) {
          console.error("Error handling custom equipment:", error);
          showError("Có lỗi xảy ra khi tạo thiết bị mới");
          return;
        }
      }

      // Kiểm tra nếu thiết bị từ kho và số lượng vượt quá số lượng có sẵn
      if (!isCustomEquipment && formData.equipment_id && formData.equipment_id !== "custom" && formData.equipment_id !== "other") {
        if (parseInt(formData.quantity) > availableQuantity) {
          setAdditionalQuantity(parseInt(formData.quantity));
          // Hiển thị modal để hỏi nguồn thiết bị
          setShowSourceModal(true);
          return; // Dừng ở đây và chờ phản hồi từ modal
        } else {
          // Số lượng đủ trong kho, trực tiếp cập nhật kho
          const selectedStorage = storageData?.data?.find(
            (storage) => storage.equipment.id === parseInt(formData.equipment_id)
          );

          if (selectedStorage) {
            const newQuantity = Math.max(
              0,
              selectedStorage.quantity - parseInt(formData.quantity)
            );

            // Update storage quantity
            const updateResponse = await updateStorage(selectedStorage.id, {
              quantity: newQuantity,
            });

            if (!updateResponse.success) {
              showError("Có lỗi xảy ra khi cập nhật kho");
              return;
            }
          }
        }
      }

      // Remove custom equipment name as it's not needed in the final payload
      delete submitData.custom_equipment_name;
      onSubmit(submitData);
    }
  };

  const handleUpdateWithStorageLogic = async (submitData) => {
    const newQuantity = parseInt(submitData.quantity);
    submitData.update_storage = submitData.update_storage || false; // Default

    // Add storage-related flags to the submit data
    if (newQuantity > originalQuantity) {
      submitData.is_quantity_increase = true;
      submitData.additional_quantity = additionalQuantity;
      submitData.use_storage = submitData.use_storage || false; // Default to false if not specified

      // Only update storage quantity if using storage source
      if (submitData.use_storage) {
        const selectedStorage = storageData?.data?.find(
          (storage) => storage.equipment.id === parseInt(formData.equipment_id)
        );

        if (selectedStorage) {
          const newStorageQuantity = Math.max(
            0,
            selectedStorage.quantity - additionalQuantity
          );
          await updateStorage(selectedStorage.id, {
            quantity: newStorageQuantity,
          });
        }
      }
    } else if (newQuantity < originalQuantity) {
      submitData.is_quantity_decrease = true;
      submitData.return_quantity = returnQuantity;

      // If returning to storage, update storage quantity
      if (submitData.update_storage) {
        const selectedStorage = storageData?.data?.find(
          (storage) => storage.equipment.id === parseInt(formData.equipment_id)
        );

        if (selectedStorage) {
          const newStorageQuantity = selectedStorage.quantity + returnQuantity;
          await updateStorage(selectedStorage.id, {
            quantity: newStorageQuantity,
          });
        }
      }
    }

    // Remove custom equipment name as it's not needed in the final payload
    delete submitData.custom_equipment_name;
    onSubmit(submitData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Handle decision on returning to storage
  const handleReturnToStorageDecision = (returnToStorage) => {
    setShowReturnToStorageModal(false);

    // Update form data with user's decision
    const updatedData = {
      ...formData,
      update_storage: returnToStorage,
    };

    setFormData(updatedData);

    // Proceed with form submission
    handleUpdateWithStorageLogic(updatedData);
  };

  // Close the insufficient storage modal
  const handleCloseInsufficientModal = () => {
    setShowStorageInsufficientModal(false);

    // Reset quantity to original
    setFormData((prev) => ({
      ...prev,
      quantity: originalQuantity,
    }));
    showInfo("Số lượng đã được đặt lại do không đủ thiết bị trong kho");
  };

  // Handle source selection for additional quantity
  const handleSourceSelection = (useStorage) => {
    setShowSourceModal(false);

    // Nếu sử dụng nguồn từ kho, kiểm tra xem có đủ số lượng không
    if (useStorage) {
      const selectedStorage = storageData?.data?.find(
        (storage) => storage.equipment.id === parseInt(formData.equipment_id)
      );

      console.log(selectedStorage);
      console.log(additionalQuantity);

      // Kiểm tra xem có đủ thiết bị trong kho không
      if (
        !selectedStorage || 
        selectedStorage.quantity < additionalQuantity
      ) {
        // Hiển thị thông báo không đủ thiết bị trong kho
        setShowStorageInsufficientModal(true);
        return;
      }
    }

    const submitData = { ...formData };
    submitData.use_storage = useStorage;
    submitData.additional_quantity = additionalQuantity;

    // Trong chế độ tạo mới, cập nhật số lượng kho ngay lập tức nếu sử dụng kho
    if (mode === "create") {
      if (useStorage) {
        const selectedStorage = storageData?.data?.find(
          (storage) => storage.equipment.id === parseInt(formData.equipment_id)
        );

        updateStorage(selectedStorage.id, {
          quantity: selectedStorage.quantity - formData.quantity,
        }).then((response) => {
          if (!response.success) {
            showError("Có lỗi xảy ra khi cập nhật kho");
            return;
          }

          // Tiếp tục với việc gửi form
          delete submitData.custom_equipment_name;
          onSubmit(submitData);
        });
      } else {
        // Không lấy từ kho, chỉ cần gửi form
        delete submitData.custom_equipment_name;
        onSubmit(submitData);
      }
    } else {
      // Chế độ chỉnh sửa - xử lý cập nhật
      handleUpdateWithStorageLogic(submitData);
    }
  };

  // Update equipment options to include all equipment plus "Other" option
  const equipmentOptions =
    equipmentsData?.data?.map((equipment) => ({
      value: equipment.id,
      label: equipment.name,
    })) || [];

  // Add "Other" option at the end for custom input
  const allEquipmentOptions = [
    ...equipmentOptions,
    { value: "custom", label: "Thiết bị khác (tùy chỉnh)" },
  ];

  // Prepare storage options (only show equipment with quantity > 0)
  const storageOptions =
    storageData?.data
      ?.filter((storage) => storage.quantity > 0)
      .map((storage) => ({
        value: storage.equipment.id,
        label: `${storage.equipment.name} (${storage.quantity} có sẵn)`,
      })) || [];

  // Add "Other equipment" option to the storage options
  const storageWithOtherOptions = [
    ...storageOptions,
    { value: "other", label: "Thiết bị khác" },
  ];

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card
          title={
            mode === "create"
              ? "Thêm thiết bị vào phòng"
              : "Cập nhật thiết bị phòng"
          }
        >
          {loadingEquipments || loadingStorage ? (
            <Loader />
          ) : (
            <>
              <div className="row g-3">
                {/* Equipment Selection - only shown in create mode */}
                {mode === "create" && (
                  <div className="col-md-12">
                    <Select
                      label="Thiết bị từ kho"
                      name="equipment_id"
                      value={
                        !showOtherEquipments ? formData.equipment_id : "other"
                      }
                      options={storageWithOtherOptions}
                      onChange={handleChange}
                      error={errors.equipment_id}
                    />
                    {formData.equipment_id &&
                      !showOtherEquipments &&
                      !isCustomEquipment && (
                        <small className="text-muted">
                          Số lượng có sẵn: {availableQuantity}
                        </small>
                      )}

                    {/* Show all equipment dropdown when "Other" is selected */}
                    {showOtherEquipments && (
                      <div className="mt-3">
                        <Select
                          label="Chọn thiết bị khác"
                          name="equipment_id"
                          value={
                            isCustomEquipment ? "custom" : formData.equipment_id
                          }
                          options={allEquipmentOptions}
                          onChange={handleChange}
                          error={errors.equipment_id}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Equipment Name - only shown when custom is selected in create mode */}
                {mode === "create" && isCustomEquipment && (
                  <div className="col-md-12">
                    <Input
                      label="Tên thiết bị tùy chỉnh"
                      name="custom_equipment_name"
                      value={formData.custom_equipment_name}
                      onChange={handleChange}
                      error={errors.custom_equipment_name}
                    />
                  </div>
                )}

                {/* Equipment Display - only shown in edit mode */}
                {mode === "edit" && (
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Thiết bị</label>
                    <div className="form-control bg-light">
                      {initialData.equipment?.name || "N/A"}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="col-md-6">
                  <Input
                    label="Số lượng"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    error={errors.quantity}
                    min={1}
                  />
                  {mode === "edit" && (
                    <small className="text-muted">
                      Số lượng ban đầu: {originalQuantity}
                    </small>
                  )}
                </div>

                {/* Price */}
                <div className="col-md-6">
                  <Input
                    label="Giá (VND)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    error={errors.price}
                    min={0}
                  />
                </div>

                {/* Description */}
                <div className="col-md-12">
                  <TextArea
                    label="Mô tả"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                  />
                </div>
              </div>

              <div className="mt-4 d-flex justify-content-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  className="mr-2"
                >
                  Hủy
                </Button>
                <Button type="submit">{submitButtonText}</Button>
              </div>
            </>
          )}
        </Card>
      </form>

      {/* Modal for asking if decreased quantity should return to storage */}
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
              <p>Bạn muốn trả {returnQuantity} thiết bị về kho không?</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={() => handleReturnToStorageDecision(false)}
              >
                Không
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

      {/* Modal for notifying insufficient storage */}
      <div
        id="storageInsufficientModal"
        className="modal fade"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Thiếu thiết bị trong kho</h5>
              <button
                type="button"
                className="btn-close"
                data-dismiss="modal"
                aria-hidden="true"
                onClick={handleCloseInsufficientModal}
              ></button>
            </div>
            <div className="modal-body">
              <p className="text-danger fw-bold">
                Không đủ thiết bị trong kho để thêm {additionalQuantity} cái.
              </p>
              <p>Số lượng có sẵn trong kho: {availableQuantity || 0}</p>
              <p>Số lượng cần thêm: {additionalQuantity}</p>
              <p>Vui lòng giảm số lượng hoặc chọn nguồn thiết bị khác.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={handleCloseInsufficientModal}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for asking about source of additional equipment */}
      <div
        id="sourceModal"
        className="modal fade"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nguồn thiết bị</h5>
              <button
                type="button"
                className="btn-close"
                data-dismiss="modal"
                aria-hidden="true"
                onClick={() => handleSourceSelection(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>Bạn muốn lấy thêm {additionalQuantity} thiết bị từ đâu?</p>
              {availableQuantity > 0 && (
                <p className="text-info">
                  Hiện có {availableQuantity} thiết bị trong kho. 
                  {availableQuantity < additionalQuantity && 
                    ` (Không đủ để đáp ứng nhu cầu ${additionalQuantity} thiết bị)`
                  }
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={() => handleSourceSelection(false)}
              >
                Nguồn khác (không lấy từ kho)
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSourceSelection(true)}
              >
                Lấy từ kho
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

RoomEquipmentForm.propTypes = {
  roomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  houseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string,
  mode: PropTypes.oneOf(["create", "edit"]),
};

export default RoomEquipmentForm;
