import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { houseSettingService } from "../../../api/houseSettings";
import Card from "../../../components/common/Card";
import Loader from "../../../components/common/Loader";
import useAlert from "../../../hooks/useAlert";
import { useAuth } from "../../../hooks/useAuth";

const HouseSettingDetail = () => {
  const { houseId, settingId } = useParams();
  const [houseSetting, setHouseSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useAlert();
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();

  useEffect(() => {
    loadHouseSetting();
  }, [settingId]);

  const loadHouseSetting = async () => {
    setLoading(true);
    try {
      const response = await houseSettingService.getHouseSetting(settingId);
      if (response.success) {
        setHouseSetting(response.data);
      } else {
        showError("Lỗi khi tải thông tin nội quy nhà");
        navigate(`/houses/${houseId}`);
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi tải thông tin nội quy nhà");
      console.error("Error loading house setting:", error);
      navigate(`/houses/${houseId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!houseSetting) {
    return <div>Không tìm thấy nội quy</div>;
  }

  const canEdit =
    isAdmin || (isManager && houseSetting.house?.manager_id === user?.id);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Chi tiết nội quy nhà</h1>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate(`/houses/${houseId}`)}
            className="btn btn-light fw-semibold mr-2"
          >
            Quay lại
          </button>
          {canEdit && (
            <Link
              to={`/houses/${houseId}/settings/${settingId}/edit`}
              className="btn btn-primary fw-semibold"
            >
              Sửa
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="d-flex flex-column gap-4">
          <div>
            <h2 className="fs-5 fw-semibold">Thông tin chung</h2>
            <div className="row g-3">
              <div className="col-md-6">
                <p className="mb-1 text-muted">Số thứ tự</p>
                <p className="fw-medium">{houseSetting.key}</p>
              </div>

              <div className="col-md-6">
                <p className="mb-1 text-muted">Nhà</p>
                <p className="fw-medium">{houseSetting.house?.name || "N/A"}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="fs-5 fw-semibold">Nội dung</h2>
            <p>{houseSetting.value}</p>
          </div>

          {houseSetting.description && (
            <div>
              <h2 className="fs-5 fw-semibold">Mô tả</h2>
              <p>{houseSetting.description}</p>
            </div>
          )}

          <div>
            <h2 className="fs-5 fw-semibold">Thông tin hệ thống</h2>
            <div className="row g-3">
              <div className="col-md-6">
                <p className="mb-1 text-muted">ID</p>
                <p>{houseSetting.id}</p>
              </div>

              <div className="col-md-6">
                <p className="mb-1 text-muted">Ngày tạo</p>
                <p>{houseSetting.created_at}</p>
              </div>

              <div className="col-md-6">
                <p className="mb-1 text-muted">Lần cuối cập nhật</p>
                <p>{houseSetting.updated_at}</p>
              </div>

              {houseSetting.creator && (
                <div className="col-md-6">
                  <p className="mb-1 text-muted">Người tạo</p>
                  <p>{houseSetting.creator.name}</p>
                </div>
              )}

              {houseSetting.updater && (
                <div className="col-md-6">
                  <p className="mb-1 text-muted">Người cập nhật</p>
                  <p>{houseSetting.updater.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HouseSettingDetail;
