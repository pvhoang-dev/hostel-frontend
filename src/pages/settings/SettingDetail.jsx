import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { settingService } from "../../api/settings";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const SettingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();

  const {
    data: setting,
    loading,
    execute: fetchSetting,
  } = useApi(settingService.getSetting);

  useEffect(() => {
    loadSetting();
  }, [id]);

  const loadSetting = async () => {
    const response = await fetchSetting(id);

    if (!response.success) {
      showError("Lỗi khi tải thông tin cài đặt");
      navigate("/settings");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!setting) {
    return <div>Không tìm thấy cài đặt</div>;
  }

  // Xử lý hiển thị thông tin người tạo/cập nhật
  const renderUserInfo = (user) => {
    if (!user) return "-";

    // Nếu user là một đối tượng, hiển thị tên hoặc username
    if (typeof user === "object") {
      return user.name || user.username || `ID: ${user.id}`;
    }

    // Nếu user là một chuỗi hoặc số, hiển thị trực tiếp
    return user;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Chi tiết cài đặt</h1>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/settings")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          <Link
            to={`/settings/${id}/edit`}
            className="btn btn-primary fw-semibold"
          >
            Sửa
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <h2 className="fs-4 fw-semibold mb-3">
            {setting.key}. {setting.value}
          </h2>
          <div className="mt-3">
            <h3 className="fs-5 fw-medium mb-2">Mô tả</h3>
            <p className="text-secondary">
              {setting.description || "Không có mô tả"}
            </p>
          </div>
        </div>

        <div className="mt-4 border-top pt-3">
          <h3 className="fs-5 fw-medium mb-2">Thông tin hệ thống</h3>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <span className="text-secondary">ID:</span>
              <span className="ms-2">{setting.id}</span>
            </div>
            <div className="col-12 col-md-6">
              <span className="text-secondary">Người tạo:</span>
              <span className="ms-2">{renderUserInfo(setting.created_by)}</span>
            </div>
            <div className="col-12 col-md-6">
              <span className="text-secondary">Ngày tạo:</span>
              <span className="ms-2">{setting.created_at}</span>
            </div>
            <div className="col-12 col-md-6">
              <span className="text-secondary">Người cập nhật:</span>
              <span className="ms-2">{renderUserInfo(setting.updated_by)}</span>
            </div>
            <div className="col-12 col-md-6">
              <span className="text-secondary">Cập nhật lần cuối:</span>
              <span className="ms-2">{setting.updated_at}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingDetail;
