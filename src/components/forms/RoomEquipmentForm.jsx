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
  const [source, setSource] = useState(initialData.source || "storage");
  const [formData, setFormData] = useState({
    room_id: roomId || initialData.room_id || "",
    equipment_id: initialData?.equipment?.id || "",
    source: initialData.source || "storage",
    quantity: initialData.quantity || 1,
    price: initialData.price || 0,
    description: initialData.description || "",
    custom_equipment_name: "",
  });
  const [originalQuantity, setOriginalQuantity] = useState(
    initialData.quantity || 1
  );
  const [errors, setErrors] = useState({});
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [showStorageSourceModal, setShowStorageSourceModal] = useState(false);
  const [showReturnToStorageModal, setShowReturnToStorageModal] =
    useState(false);
  const [showStorageInsufficientModal, setShowStorageInsufficientModal] =
    useState(false);
  const [additionalQuantity, setAdditionalQuantity] = useState(0);
  const [returnQuantity, setReturnQuantity] = useState(0);
  const [updatedFormData, setUpdatedFormData] = useState(null);
  const [useStorage, setUseStorage] = useState(true);

  // Get equipments and storage data
  const {
    data: equipmentsData,
    loading: loadingEquipments,
    execute: fetchEquipments,
  } = useApi(equipmentService.getEquipments);

  const {
    data: storageData,
    loading: loadingStorage,
    execute: fetchStorage,
  } = useApi(storageService.getStorages);

  const { execute: createEquipment } = useApi(equipmentService.createEquipment);
  const { execute: createStorage } = useApi(storageService.createStorage);
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
    if (source === "storage" && formData.equipment_id && storageData?.data) {
      const selectedStorage = storageData.data.find(
        (storage) => storage.equipment.id === parseInt(formData.equipment_id)
      );
      setAvailableQuantity(selectedStorage ? selectedStorage.quantity : 0);
    }
  }, [formData.equipment_id, storageData, source]);

  // Save original quantity for comparison
  useEffect(() => {
    if (initialData.quantity) {
      setOriginalQuantity(parseInt(initialData.quantity));
    }
  }, [initialData]);

  // Handle modal visibility
  useEffect(() => {
    if (showStorageSourceModal) {
      window.$("#storageSourceModal").modal("show");
    } else {
      window.$("#storageSourceModal").modal("hide");
    }

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
  }, [
    showStorageSourceModal,
    showReturnToStorageModal,
    showStorageInsufficientModal,
  ]);

  // Modal event handlers for cleanup
  useEffect(() => {
    const handleStorageSourceHidden = () => setShowStorageSourceModal(false);
    const handleReturnStorageHidden = () => setShowReturnToStorageModal(false);
    const handleInsufficientHidden = () =>
      setShowStorageInsufficientModal(false);

    window
      .$("#storageSourceModal")
      .on("hidden.bs.modal", handleStorageSourceHidden);
    window
      .$("#returnToStorageModal")
      .on("hidden.bs.modal", handleReturnStorageHidden);
    window
      .$("#storageInsufficientModal")
      .on("hidden.bs.modal", handleInsufficientHidden);

    return () => {
      window
        .$("#storageSourceModal")
        .off("hidden.bs.modal", handleStorageSourceHidden);
      window
        .$("#returnToStorageModal")
        .off("hidden.bs.modal", handleReturnStorageHidden);
      window
        .$("#storageInsufficientModal")
        .off("hidden.bs.modal", handleInsufficientHidden);
    };
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for the changed field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle source change
  const handleSourceChange = (e) => {
    const newSource = e.target.value;
    setSource(newSource);
    setFormData((prev) => ({
      ...prev,
      source: newSource,
      equipment_id: "",
    }));
  };

  // Validate form
  const validateForm = async () => {
    const newErrors = {};

    if (!formData.room_id) {
      newErrors.room_id = "Vui lòng chọn phòng";
    }

    if (mode === "create") {
      if (source === "storage") {
        if (!formData.equipment_id) {
          newErrors.equipment_id = "Vui lòng chọn thiết bị";
        }

        if (parseInt(formData.quantity) > availableQuantity) {
          newErrors.quantity = `Số lượng không được vượt quá số lượng có sẵn (${availableQuantity})`;
        }
      } else {
        if (!formData.custom_equipment_name.trim()) {
          newErrors.custom_equipment_name = "Vui lòng nhập tên thiết bị";
        } else {
          // Check if equipment with same name exists
          const equipmentsResponse = await fetchEquipments({
            name: formData.custom_equipment_name,
          });
          if (
            equipmentsResponse.success &&
            equipmentsResponse.data.length > 0
          ) {
            newErrors.custom_equipment_name = "Thiết bị với tên này đã tồn tại";
          }
        }
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

    // Store the updated form data for later use in modals
    setUpdatedFormData(submitData);

    // In edit mode, check for quantity changes and handle them
    if (mode === "edit") {
      const newQuantity = parseInt(formData.quantity);

      // If quantity is increasing
      if (newQuantity > originalQuantity) {
        setAdditionalQuantity(newQuantity - originalQuantity);
        // Show modal to ask if user wants to take from storage
        if (initialData.source === "storage") {
          setShowStorageSourceModal(true);
          return; // Stop here and wait for modal response
        }
      }
      // If quantity is decreasing
      else if (newQuantity < originalQuantity) {
        setReturnQuantity(originalQuantity - newQuantity);
        // Show modal to ask if user wants to return to storage
        if (initialData.source === "storage") {
          setShowReturnToStorageModal(true);
          return; // Stop here and wait for modal response
        }
      }

      // If no quantity changes or not from storage, proceed with normal update
      handleUpdateWithStorageLogic(submitData);
    } else {
      // Create mode logic (unchanged)
      if (source === "custom") {
        try {
          // Create new equipment
          const equipmentResponse = await createEquipment({
            name: formData.custom_equipment_name,
          });

          if (equipmentResponse.success) {
            submitData.equipment_id = equipmentResponse.data.id;
          } else {
            showError(
              equipmentResponse.message || "Không thể tạo thiết bị mới"
            );
            return;
          }
        } catch (error) {
          showError("Có lỗi xảy ra khi tạo thiết bị mới");
          return;
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

    console.log("Processing with submitData:", submitData);

    // Add storage-related flags to the submit data
    if (newQuantity > originalQuantity) {
      submitData.is_quantity_increase = true;
      submitData.additional_quantity = additionalQuantity;

      // Make sure use_storage is explicitly set in the data
      // If not already set, use the component's state
      if (typeof submitData.use_storage === "undefined") {
        submitData.use_storage = useStorage;
      }

      // Check if there's enough in storage when trying to use storage
      if (submitData.use_storage && initialData.source === "storage") {
        const selectedStorage = storageData?.data?.find(
          (storage) => storage.equipment.id === parseInt(formData.equipment_id)
        );

        if (!selectedStorage || selectedStorage.quantity < additionalQuantity) {
          setShowStorageInsufficientModal(true);
          return; // Stop submission and wait for user acknowledgment
        }
      }
    } else if (newQuantity < originalQuantity) {
      submitData.is_quantity_decrease = true;
      submitData.return_quantity = returnQuantity;
      submitData.update_storage = submitData.update_storage || false;
    }

    // Remove custom equipment name as it's not needed in the final payload
    delete submitData.custom_equipment_name;
    onSubmit(submitData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Handle decision on using storage for additional quantity
  const handleStorageSourceDecision = (useStorageSource) => {
    setUseStorage(useStorageSource);
    setShowStorageSourceModal(false);

    // Create an updated data object with the user's decision
    const updatedData = {
      ...formData,
      use_storage: useStorageSource, // Explicitly set use_storage flag in the form data
    };

    // Update the form data with the new use_storage value
    setFormData(updatedData);

    // If using storage, check if enough is available
    if (useStorageSource) {
      const selectedStorage = storageData?.data?.find(
        (storage) => storage.equipment.id === parseInt(formData.equipment_id)
      );

      if (!selectedStorage || selectedStorage.quantity < additionalQuantity) {
        setShowStorageInsufficientModal(true);
        return;
      }
    }

    // Proceed with form submission using the updated data that includes use_storage flag
    handleUpdateWithStorageLogic(updatedData);
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

    // Reset quantity to original if there's not enough in storage
    if (useStorage) {
      setFormData((prev) => ({
        ...prev,
        quantity: originalQuantity,
      }));
      showInfo("Số lượng đã được đặt lại do không đủ thiết bị trong kho");
    }
  };

  // Prepare equipment options
  const equipmentOptions =
    equipmentsData?.data?.map((equipment) => ({
      value: equipment.id,
      label: equipment.name,
    })) || [];

  // Prepare storage options (only show equipment available in the house storage)
  const storageOptions =
    storageData?.data?.map((storage) => ({
      value: storage.equipment.id,
      label: `${storage.equipment.name} (${storage.quantity} có sẵn)`,
    })) || [];

  const sourceOptions = [
    { value: "storage", label: "Chọn từ kho" },
    { value: "custom", label: "Thiết bị tùy chỉnh" },
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
                {/* Source Selection - only shown in create mode */}
                {mode === "create" && (
                  <div className="col-md-12">
                    <Select
                      label="Nguồn thiết bị"
                      name="source"
                      value={formData.source}
                      options={sourceOptions}
                      onChange={handleSourceChange}
                      error={errors.source}
                    />
                  </div>
                )}

                {/* Equipment Selection - only shown for storage source in create mode */}
                {mode === "create" && source === "storage" && (
                  <div className="col-md-12">
                    <Select
                      label="Thiết bị có sẵn trong kho"
                      name="equipment_id"
                      value={formData.equipment_id}
                      options={storageOptions}
                      onChange={handleChange}
                      error={errors.equipment_id}
                    />
                    {formData.equipment_id && (
                      <small className="text-muted">
                        Số lượng có sẵn: {availableQuantity}
                      </small>
                    )}
                  </div>
                )}

                {/* Equipment Display - only shown in edit mode */}
                {mode === "edit" && (
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Thiết bị</label>
                    <div className="form-control bg-light">
                      {initialData.equipment?.name || "N/A"} - {""}
                      {initialData.source === "storage"
                        ? "Từ kho"
                        : "Tùy chỉnh"}
                    </div>
                    <small className="text-muted">
                      Không thể thay đổi thiết bị hoặc nguồn trong chế độ sửa
                    </small>
                  </div>
                )}

                {/* Custom Equipment Name - only shown for custom source in create mode */}
                {mode === "create" && source === "custom" && (
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

      {/* Modal for asking if additional quantity should come from storage */}
      <div
        id="storageSourceModal"
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
                onClick={() => handleStorageSourceDecision(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>Bạn muốn lấy thêm {additionalQuantity} thiết bị từ đâu?</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={() => handleStorageSourceDecision(false)}
              >
                Tùy chỉnh (không lấy từ kho)
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleStorageSourceDecision(true)}
              >
                Lấy từ kho
              </button>
            </div>
          </div>
        </div>
      </div>

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
              <p>
                Không đủ thiết bị trong kho để thêm {additionalQuantity} cái.
              </p>
              <p>Số lượng có sẵn: {availableQuantity || 0}</p>
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
