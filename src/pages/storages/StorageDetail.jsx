import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { storageService } from "../../api/storages";
import Loader from "../../components/common/Loader";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const StorageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const { user, isAdmin, isManager } = useAuth();

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

      <Card>
        <div className="d-flex align-items-start mb-4">
          <div className="flex-grow-1">
            <h4 className="fs-4 fw-semibold">
              {storage.equipment?.name || "Thiết bị chưa xác định"} -{" "}
              {storage.house?.name || "Nhà chưa xác định"}
            </h4>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin cơ bản</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "40%" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Số lượng:</td>
                    <td>{storage.quantity}</td>
                  </tr>
                  <tr>
                    <td>Giá:</td>
                    <td className="text-primary">
                      {storage.price
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(storage.price)
                        : "Không có"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Thông tin nhà</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "40%" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nhà:</td>
                    <td>
                      {storage.house?.name ? (
                        <Link
                          to={`/houses/${storage.house.id}`}
                          className="text-info"
                        >
                          {storage.house.name}
                        </Link>
                      ) : (
                        "Không có"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Địa chỉ:</td>
                    <td>{storage.house?.address || "Không có"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {storage.description && (
            <div className="col-md-12 mb-4">
              <h5 className="mb-3">Mô tả</h5>
              <div className="p-3 border rounded">
                <p style={{ whiteSpace: "pre-wrap" }} className="mb-0">
                  {storage.description || "Không có mô tả"}
                </p>
              </div>
            </div>
          )}

          <div className="col-md-12 mb-4">
            <h5 className="mb-3">Thông tin hệ thống</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead style={{ backgroundColor: "rgba(0, 0, 0, .075)" }}>
                  <tr>
                    <th style={{ width: "200px" }}>Thông tin</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ID:</td>
                    <td>{storage.id}</td>
                  </tr>
                  <tr>
                    <td>Tạo:</td>
                    <td>{storage.created_at}</td>
                  </tr>
                  <tr>
                    <td>Lần cuối cập nhật:</td>
                    <td>{storage.updated_at}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StorageDetail;
