import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { storageService } from "../../api/storages";
import StorageForm from "../../components/forms/StorageForm";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

const StorageEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  // Đảm bảo hooks luôn ở cấp cao nhất
  const {
    data: storage,
    loading: loadingStorage,
    execute: fetchStorage,
  } = useApi(storageService.getStorage);

  const { execute: updateStorage, loading: isSubmitting } = useApi(
    storageService.updateStorage
  );

  useEffect(() => {
    loadStorage();
  }, [id]);

  const loadStorage = async () => {
    const response = await fetchStorage(id);

    if (response.success) {
      checkPermission(response.data);
    } else {
      showError("Lỗi khi tải thông tin kho thiết bị");
      navigate("/storages");
    }
  };

  const checkPermission = (storageData) => {
    try {
      const isAdmin = user?.role === "admin";
      const isManager = user?.role === "manager";

      if (isAdmin) {
        setCanEdit(true);
      } else if (
        isManager &&
        storageData.house &&
        storageData.house.manager_id === user.id
      ) {
        setCanEdit(true);
      } else {
        showError("Bạn không có quyền chỉnh sửa thiết bị này");
        navigate(`/storages/${id}`);
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi kiểm tra quyền");
      navigate(`/storages/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    const response = await updateStorage(id, formData);

    if (response.success) {
      showSuccess("Cập nhật thông tin kho thiết bị thành công");
      navigate(`/storages/${id}`);
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(
          response.message || "Lỗi khi cập nhật thông tin kho thiết bị"
        );
      }
    }
  };

  if (loadingStorage || loading) {
    return <Loader />;
  }

  if (!storage) {
    return <div>Không tìm thấy thông tin kho thiết bị</div>;
  }

  if (!canEdit) {
    return null;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Chỉnh sửa thông tin kho thiết bị</h1>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-light fw-semibold"
        >
          Quay lại
        </button>
      </div>

      <Card>
        <StorageForm
          initialData={storage}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="edit"
        />
      </Card>
    </div>
  );
};

export default StorageEdit;
