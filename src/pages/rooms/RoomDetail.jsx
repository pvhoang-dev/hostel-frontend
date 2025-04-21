import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { roomService } from "../../api/rooms";
import { useContext } from "react";
import { AlertContext } from "../../contexts/AlertContext";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const { showError } = useContext(AlertContext);
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  useEffect(() => {
    if (user) {
      loadRoom();
    }
  }, [id, user]);

  const loadRoom = async () => {
    setLoading(true);
    try {
      const response = await roomService.getRoom(id);
      if (response.success) {
        setRoom(response.data);
      } else {
        showError("Lỗi khi tải thông tin phòng");
        navigate("/rooms");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi tải thông tin phòng");
      console.error("Error loading room:", error);
      navigate("/rooms");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  if (!room) {
    return <div>Không tìm thấy phòng</div>;
  }

  const canEdit = isAdmin || (isManager && room.house?.manager_id === user.id);

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Có sẵn";
      case "occupied":
        return "Đã thuê";
      case "maintenance":
        return "Bảo trì";
      case "unavailable":
        return "Không khả dụng";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Chi tiết phòng</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate("/rooms")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Quay lại
          </button>
          {canEdit && (
            <Link
              to={`/rooms/${id}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Chỉnh sửa
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-start">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Phòng {room.room_number}</h2>
            <p className="text-gray-600">
              Thuộc nhà: {room.house?.name || "Không xác định"}
            </p>

            <span className={`inline-block ${getStatusClass(room.status)} px-2 py-1 rounded text-sm mt-2`}>
              {getStatusText(room.status)}
            </span>
          </div>
        </div>

        <hr className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Thông tin phòng</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Sức chứa:</span>
                <span className="ml-2">{room.capacity} người</span>
              </div>
              <div>
                <span className="text-gray-600">Giá cơ bản:</span>
                <span className="ml-2">{formatCurrency(room.base_price)}</span>
              </div>
              <div>
                <span className="text-gray-600">Địa chỉ:</span>
                <span className="ml-2">{room.house?.address || "Không có thông tin"}</span>
              </div>
              {room.house && (
                <div className="mt-2">
                  <Link 
                    to={`/houses/${room.house.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Xem chi tiết nhà
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Thông tin mô tả</h3>
            <p className="whitespace-pre-wrap">{room.description || "Không có mô tả"}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Thông tin hệ thống</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">ID phòng:</span>
              <span className="ml-2">{room.id}</span>
            </div>
            <div>
              <span className="text-gray-600">Tạo:</span>
              <span className="ml-2">{room.created_at}</span>
            </div>
            <div>
              <span className="text-gray-600">Lần cuối cập nhật:</span>
              <span className="ml-2">{room.updated_at}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
