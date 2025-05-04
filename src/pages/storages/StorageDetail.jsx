import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { storageService } from "../../api/storages";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const StorageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  const {
    data: storage,
    loading,
    execute: fetchStorage,
  } = useApi(storageService.getStorage);

  useEffect(() => {
    loadStorage();
  }, [id]);

  const loadStorage = async () => {
    const response = await fetchStorage(id);

    if (!response.success) {
      showError("Lỗi khi tải thông tin kho thiết bị");
      navigate("/storages");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!storage) {
    return <div>Không tìm thấy thông tin kho thiết bị</div>;
  }

  const canEdit =
    isAdmin || (isManager && storage.house?.manager_id === user?.id);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Chi tiết kho thiết bị</h3>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light fw-semibold mr-2"
          >
            Quay lại
          </button>
          {canEdit && (
            <Link
              to={`/storages/${id}/edit`}
              className="btn btn-primary fw-semibold"
            >
              Sửa
            </Link>
          )}
        </div>
      </div>

      <div className="p-4 rounded shadow">
        <div className="d-flex align-items-start">
          <div className="flex-grow-1">
            <h4 className="fs-4 fw-semibold">
              {storage.equipment?.name || "Thiết bị chưa xác định"} -{" "}
              {storage.house?.name || "Nhà chưa xác định"}
            </h4>
          </div>
        </div>

        <hr className="my-4" />

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <h4 className="fs-5 fw-medium mb-2">Thông tin cơ bản</h4>
            <div className="d-flex flex-column gap-2">
              <div>
                <span>Số lượng: </span>
                <span className="ms-2 fw-medium">{storage.quantity}</span>
              </div>
              <div>
                <span>Giá: </span>
                <span className="ms-2 fw-medium">
                  {storage.price
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(storage.price)
                    : "Không có"}
                </span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <h4 className="fs-5 fw-medium mb-2">Thông tin nhà</h4>
            <div className="d-flex flex-column gap-2">
              <div>
                <span>Nhà: </span>
                <span className="ms-2">
                  {storage.house?.name ? (
                    <Link to={`/houses/${storage.house.id}`}>
                      {storage.house.name}
                    </Link>
                  ) : (
                    "Không có"
                  )}
                </span>
              </div>
              <div>
                <span>Địa chỉ: </span>
                <span className="ms-2">
                  {storage.house?.address || "Không có"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {storage.description && (
          <>
            <hr className="my-4" />
            <div>
              <h4 className="fs-5 fw-medium mb-2">Mô tả</h4>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {storage.description || "Không có mô tả"}
              </p>
            </div>
          </>
        )}

        <hr className="my-4" />

        <div>
          <h4 className="fs-5 fw-medium mb-2">Thông tin hệ thống</h4>
          <div className="d-flex flex-column gap-2">
            <div>
              <span>ID: </span>
              <span className="ms-2">{storage.id}</span>
            </div>
            <div>
              <span>Tạo: </span>
              <span className="ms-2">{storage.created_at}</span>
            </div>
            <div>
              <span>Lần cuối cập nhật: </span>
              <span className="ms-2">{storage.updated_at}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDetail;
