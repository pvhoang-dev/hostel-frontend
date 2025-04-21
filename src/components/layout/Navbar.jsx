import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Menu, Bell, Loader } from "react-feather";
import Button from "../common/Button.jsx";
import DropdownIcon from "../icons/DropdownIcon.jsx";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../api/notifications";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Refs để kiểm soát việc gọi API và các hành vi khác
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const isLoadingRef = useRef(false);
  const checkingUnreadRef = useRef(false);
  const notificationFetchedRef = useRef(false);
  const intervalIdRef = useRef(null);

  const navigate = useNavigate();

  // Tránh re-render khi toggle menu
  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
    if (isNotificationMenuOpen) setIsNotificationMenuOpen(false);
  }, [isNotificationMenuOpen]);

  const toggleNotificationMenu = useCallback(() => {
    const newMenuState = !isNotificationMenuOpen;
    setIsNotificationMenuOpen(newMenuState);

    // Chỉ tải thông báo khi mở menu VÀ chưa tải lần nào
    if (newMenuState && !notificationFetchedRef.current) {
      fetchNotifications();
      notificationFetchedRef.current = true;
    }

    if (isUserMenuOpen) setIsUserMenuOpen(false);
  }, [isUserMenuOpen, isNotificationMenuOpen]);

  // Hàm riêng để kiểm tra số lượng thông báo chưa đọc
  const fetchTotalUnreadCount = useCallback(async () => {
    if (checkingUnreadRef.current || !user) return;

    try {
      checkingUnreadRef.current = true;

      const response = await notificationService.getNotifications({
        is_read: false,
        per_page: 1, // Chỉ cần số lượng, không cần dữ liệu
      });

      if (response && response.success && response.data && response.data.meta) {
        setUnreadCount(response.data.meta.total);
      }
    } catch (error) {
      console.error("Error checking unread notifications:", error);
    } finally {
      checkingUnreadRef.current = false;
    }
  }, [user]);

  // Memoize fetchNotifications để tránh tạo mới function trong mỗi render
  const fetchNotifications = useCallback(
    async (pageNum = 1, append = false) => {
      // Sử dụng ref để ngăn gọi API khi đang loading
      if (isLoadingRef.current) return;

      try {
        isLoadingRef.current = true;
        setLoading(true);

        const response = await notificationService.getNotifications({
          per_page: 5,
          page: pageNum,
          sort_by: "created_at",
          sort_dir: "desc",
        });

        if (response && response.success) {
          const responseData = response.data;
          const notificationItems = responseData.data || [];

          if (append) {
            setNotifications((prev) => [...prev, ...notificationItems]);
          } else {
            setNotifications(notificationItems);
          }

          // Cập nhật thông tin phân trang từ meta
          const meta = responseData.meta;
          setTotalPages(meta.last_page);
          setPage(meta.current_page);

          // Luôn cập nhật tổng số thông báo chưa đọc từ API riêng biệt
          // để đảm bảo số liệu chính xác
          fetchTotalUnreadCount();
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    },
    [fetchTotalUnreadCount]
  );

  const checkUnreadNotifications = useCallback(async () => {
    // Sử dụng API riêng để lấy tổng số thông báo chưa đọc
    await fetchTotalUnreadCount();
  }, [fetchTotalUnreadCount]);

  const loadMoreNotifications = useCallback(() => {
    if (page < totalPages && !isLoadingRef.current) {
      fetchNotifications(page + 1, true);
    }
  }, [fetchNotifications, page, totalPages]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.getNotification(id);

      // Cập nhật UI ngay lập tức - Sử dụng functional update để tránh closure stale
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Giảm số lượng thông báo chưa đọc - Sử dụng functional update
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async (e) => {
    if (e) e.stopPropagation();

    try {
      await notificationService.markAllAsRead();

      // Cập nhật UI ngay lập tức - Sử dụng functional update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  const handleNotificationClick = useCallback(
    (notification) => {
      // Sử dụng anonymous function để tránh re-create trong mỗi render
      return async () => {
        // Đánh dấu là đã đọc
        if (!notification.is_read) {
          await markAsRead(notification.id);
        }

        // Xử lý chuyển hướng nếu có URL
        if (notification.url) {
          if (notification.url.startsWith("http")) {
            window.open(notification.url, "_blank");
          } else {
            navigate(notification.url);
          }
        }
      };
    },
    [markAsRead, navigate]
  );

  // Xử lý sự kiện click bên ngoài để đóng menu - Chỉ tạo handler một lần
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationMenuOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Chỉ kiểm tra thông báo mới khi component mount và sau đó định kỳ
  useEffect(() => {
    if (user) {
      // Kiểm tra khi component mount
      fetchTotalUnreadCount();

      // Thiết lập kiểm tra định kỳ
      intervalIdRef.current = setInterval(fetchTotalUnreadCount, 60000);

      return () => {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
      };
    }
  }, [user, fetchTotalUnreadCount]);

  // Reset state khi component unmount
  useEffect(() => {
    return () => {
      // Reset tất cả refs khi unmount
      notificationFetchedRef.current = false;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  // Tránh re-render không cần thiết bằng cách memoize phần này
  const renderNotificationItem = useCallback(
    (notification) => (
      <div
        key={notification.id}
        className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
        onClick={handleNotificationClick(notification)}
      >
        <div className="flex items-start">
          <div
            className={`w-2 h-2 mt-1 rounded-full mr-2 ${
              notification.is_read ? "bg-gray-300" : "bg-green-500"
            }`}
          ></div>
          <div>
            <p className="text-sm">{notification.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(notification.created_at).toLocaleString()}
            </p>
            {notification.url && (
              <p className="text-xs text-green-600 mt-1">
                Nhấp để xem chi tiết
              </p>
            )}
          </div>
        </div>
      </div>
    ),
    [handleNotificationClick]
  );

  // Render UI
  return (
    <nav className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <button
            className="md:hidden mr-4"
            onClick={onMenuToggle}
            aria-label="Toggle Menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 flex items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">H-Hostel</h1>
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                {/* Notifications Menu */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={toggleNotificationMenu}
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-50 max-h-[80vh] flex flex-col overflow-hidden">
                      <div className="px-4 py-2 border-b flex justify-between items-center">
                        <h3 className="text-sm font-medium">Thông báo</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            Đánh dấu tất cả đã đọc
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto flex-grow">
                        {loading && notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
                            <p className="text-gray-500">
                              Đang tải thông báo...
                            </p>
                          </div>
                        ) : notifications.length > 0 ? (
                          <div>{notifications.map(renderNotificationItem)}</div>
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500">
                            Không có thông báo
                          </div>
                        )}
                      </div>

                      {page < totalPages && (
                        <div className="px-4 py-2 border-t">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              loadMoreNotifications();
                            }}
                            className="text-sm text-green-600 hover:text-green-800 flex items-center justify-center w-full"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader className="h-3 w-3 mr-2 animate-spin" />
                                Đang tải...
                              </>
                            ) : (
                              "Xem thêm thông báo"
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <Button
                    type="button"
                    variant="success"
                    onClick={toggleUserMenu}
                    className="flex items-center group"
                  >
                    <span className="mr-2 hidden sm:block">
                      {user.username}
                    </span>
                    <DropdownIcon
                      className={`transform ${
                        isUserMenuOpen ? "rotate-180" : ""
                      } 
                      group-hover:text-green-700`}
                    />
                  </Button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <span className="block px-4 py-2 text-sm text-gray-700 sm:hidden">
                          {user.username}
                        </span>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
