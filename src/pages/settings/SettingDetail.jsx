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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Chi tiết cài đặt</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate("/settings")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Quay lại
          </button>
          <Link
            to={`/settings/${id}/edit`}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Chỉnh sửa
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {setting.key}. {setting.value}
          </h2>
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Mô tả</h3>
            <p className="text-gray-700">
              {setting.description || "Không có mô tả"}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-medium mb-2">Thông tin hệ thống</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">ID:</span>
              <span className="ml-2">{setting.id}</span>
            </div>
            <div>
              <span className="text-gray-600">Người tạo:</span>
              <span className="ml-2">{renderUserInfo(setting.created_by)}</span>
            </div>
            <div>
              <span className="text-gray-600">Ngày tạo:</span>
              <span className="ml-2">{setting.created_at}</span>
            </div>
            <div>
              <span className="text-gray-600">Người cập nhật:</span>
              <span className="ml-2">{renderUserInfo(setting.updated_by)}</span>
            </div>
            <div>
              <span className="text-gray-600">Cập nhật lần cuối:</span>
              <span className="ml-2">{setting.updated_at}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingDetail;
