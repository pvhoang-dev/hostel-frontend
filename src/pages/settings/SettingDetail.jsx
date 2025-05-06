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

  const renderUserInfo = (user) => {
    if (!user) return "-";

    if (typeof user === "object") {
      return user.name || user.username || `ID: ${user.id}`;
    }

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
          <h4 className="fs-4 fw-semibold mb-3">
            {setting.key}: {setting.value}
          </h4>
        </div>

        <div className="row">
          {setting.description && (
            <div className="col-md-12 mb-4">
              <h5 className="mb-3">Mô tả</h5>
              <div className="p-3 border rounded">
                <p className="mb-0">
                  {setting.description || "Không có mô tả"}
                </p>
              </div>
            </div>
          )}

          <div className="col-md-12 mb-4">
            <h5 className="mb-3">Thông tin cài đặt</h5>
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
                    <td>Key:</td>
                    <td>{setting.key}</td>
                  </tr>
                  <tr>
                    <td>Value:</td>
                    <td>{setting.value}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

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
                    <td>{setting.id}</td>
                  </tr>
                  <tr>
                    <td>Người tạo:</td>
                    <td>{renderUserInfo(setting.created_by)}</td>
                  </tr>
                  <tr>
                    <td>Ngày tạo:</td>
                    <td>{setting.created_at}</td>
                  </tr>
                  <tr>
                    <td>Người cập nhật:</td>
                    <td>{renderUserInfo(setting.updated_by)}</td>
                  </tr>
                  <tr>
                    <td>Cập nhật lần cuối:</td>
                    <td>{setting.updated_at}</td>
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

export default SettingDetail;
