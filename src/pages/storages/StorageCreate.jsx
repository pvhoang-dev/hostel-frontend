import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { storageService } from "../../api/storages";
import { houseService } from "../../api/houses";
import StorageForm from "../../components/forms/StorageForm";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

const StorageCreate = () => {
  const [searchParams] = useSearchParams();
  const houseId = searchParams.get("house_id");
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);

  // Hooks luôn phải được khai báo ở cấp cao nhất, không trong điều kiện
  const { execute: createStorage, loading: isSubmitting } = useApi(
    storageService.createStorage
  );

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const isAdmin = user?.role === "admin";
      const isManager = user?.role === "manager";

      if (isAdmin) {
        setCanCreate(true);
        setLoading(false);
        return;
      }

      if (isManager && houseId) {
        // Kiểm tra xem manager có quản lý nhà này không
        const response = await houseService.getHouse(houseId);
        if (response.success) {
          if (response.data.manager_id === user.id) {
            setCanCreate(true);
          } else {
            showError("Bạn không có quyền thêm thiết bị vào kho của nhà này");
            navigate(houseId ? `/houses/${houseId}` : "/storages");
          }
        } else {
          showError("Không thể xác minh quyền truy cập");
          navigate(houseId ? `/houses/${houseId}` : "/storages");
        }
      } else if (isManager) {
        // Manager có thể tạo storage nếu họ có quản lý nhà nào đó
        setCanCreate(true);
      } else {
        showError("Bạn không có quyền thêm thiết bị vào kho");
        navigate(houseId ? `/houses/${houseId}` : "/storages");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi kiểm tra quyền");
      navigate(houseId ? `/houses/${houseId}` : "/storages");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    // Đảm bảo luôn sử dụng house_id từ URL nếu có
    const dataToSubmit = {
      ...formData,
      house_id: houseId || formData.house_id,
    };

    const response = await createStorage(dataToSubmit);

    if (response.success) {
      showSuccess("Thêm thiết bị vào kho thành công");
      navigate(houseId ? `/houses/${houseId}` : "/storages");
    } else {
      if (response.data && typeof response.data === "object") {
        setErrors(response.data);
      } else {
        showError(response.message || "Lỗi khi thêm thiết bị vào kho");
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!canCreate) {
    return null;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Thêm thiết bị vào kho</h1>
        <button
          onClick={() => navigate(houseId ? `/houses/${houseId}` : "/storages")}
          className="btn btn-light fw-semibold"
        >
          Quay lại
        </button>
      </div>

      <Card>
        <StorageForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          mode="create"
          houseId={houseId}
        />
      </Card>
    </div>
  );
};

export default StorageCreate;
