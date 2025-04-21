import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { houseService } from "../../api/houses";
import { useContext } from "react";
import { AlertContext } from "../../contexts/AlertContext";

const HouseDetail = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showError } = useContext(AlertContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadHouse();
  }, [id]);

  const loadHouse = async () => {
    setLoading(true);
    try {
      const response = await houseService.getHouse(id);
      if (response.success) {
        setHouse(response.data);
      } else {
        showError("Lỗi khi tải thông tin nhà");
        navigate("/houses");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi tải thông tin nhà");
      console.error("Error loading house:", error);
      navigate("/houses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading house data...</div>;
  }

  if (!house) {
    return <div>House not found</div>;
  }

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "maintenance":
        return "Bảo trì";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Chi tiết nhà</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate("/houses")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Back
          </button>
          <Link
            to={`/houses/${id}/edit`}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Chỉnh sửa
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-start">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{house.name}</h2>
            <p className="text-gray-600">{house.address}</p>

            <span className={`inline-block ${getStatusClass(house.status)} px-2 py-1 rounded text-sm mt-2`}>
              {getStatusText(house.status)}
            </span>
          </div>
        </div>

        <hr className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Thông tin quản lý</h3>
            {house.manager ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  {house.manager.avatar_url ? (
                    <img
                      src={house.manager.avatar_url}
                      alt={house.manager.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      {house.manager.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{house.manager.name}</p>
                    <p className="text-gray-600 text-sm">{house.manager.email}</p>
                  </div>
                </div>
                {house.manager.phone_number && (
                  <div>
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="ml-2">{house.manager.phone_number}</span>
                  </div>
                )}
                <div className="mt-2">
                  <Link 
                    to={`/users/${house.manager.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Xem chi tiết quản lý
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Chưa có quản lý</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Thông tin mô tả</h3>
            <p className="whitespace-pre-wrap">{house.description || "Không có mô tả"}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Thông tin hệ thống</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">ID nhà:</span>
              <span className="ml-2">{house.id}</span>
            </div>
            <div>
              <span className="text-gray-600">Tạo:</span>
              <span className="ml-2">{house.created_at}</span>
            </div>
            <div>
              <span className="text-gray-600">Lần cuối cập nhật:</span>
              <span className="ml-2">{house.updated_at}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseDetail;
