import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../api/notifications";
import { formatNotificationTime } from "../../utils/validators";

const Header = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications(1, true);
  }, []);

  const fetchNotifications = async (pageNumber = 1, reset = false) => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await notificationService.getNotifications({
        page: pageNumber,
        per_page: 10,
      });

      if (response.success) {
        const newNotifications = response.data.data || [];
        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }

        setHasMore(
          response.data.meta.current_page < response.data.meta.last_page
        );
        setPage(pageNumber);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNotifications = (e) => {
    // Prevent the dropdown from closing
    e.preventDefault();
    e.stopPropagation();

    if (hasMore && !loading) {
      fetchNotifications(page + 1);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.id) return;

    try {
      const response = await notificationService.getNotification(
        notification.id
      );

      if (response.success) {
        fetchNotifications(1, true);

        if (response.data?.url) {
          navigate(response.data.url);
        }
      }
    } catch (error) {
      console.error("Error processing notification:", error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        fetchNotifications(1, true);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification?.is_read
  ).length;

  return (
    <>
      <div className="navbar-custom">
        <ul className="list-unstyled topbar-right-menu float-right mb-0">
          <li className="notification-list">
            <a
              className="nav-link right-bar-toggle"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <i className="dripicons-gear noti-icon"></i>
            </a>
          </li>

          <li className="dropdown notification-list">
            <a
              className="nav-link dropdown-toggle arrow-none"
              data-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <i className="dripicons-bell noti-icon"></i>
              {unreadCount > 0 && <span className="noti-icon-badge"></span>}
            </a>
            <div
              className="dropdown-menu dropdown-menu-right dropdown-menu-animated dropdown-lg"
              ref={dropdownRef}
            >
              <div className="dropdown-item noti-title">
                <h5 className="m-0">
                  {notifications.length !== 0 && unreadCount > 0 && (
                    <span className="float-right">
                      <a
                        href=""
                        className="text-dark"
                        onClick={handleMarkAllAsRead}
                      >
                        <small>Đánh dấu tất cả là đã đọc</small>
                      </a>
                    </span>
                  )}
                  <span>
                    <p className="text-white mb-0">
                      Thông báo {unreadCount > 0 && `(${unreadCount})`}
                    </p>
                  </span>
                </h5>
              </div>

              <div style={{ maxHeight: "230px", overflowY: "auto" }}>
                {loading && page === 1 && (
                  <div className="text-center p-3">
                    <small>Đang tải các thông báo...</small>
                  </div>
                )}

                {!loading && notifications.length === 0 && (
                  <div className="text-center p-3">
                    <small>Không có thông báo</small>
                  </div>
                )}

                {notifications.length > 0 &&
                  notifications.map((notification) => (
                    <a
                      key={notification.id}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNotificationClick(notification);
                      }}
                      className={`dropdown-item notify-item ${
                        !notification?.is_read ? "unread-notification" : ""
                      }`}
                    >
                      <div
                        className={`notify-icon ${
                          !notification?.is_read ? "bg-info" : "bg-primary"
                        }`}
                      >
                        <i className="mdi mdi-bell-outline"></i>
                      </div>
                      <p className="notify-details">
                        <span
                          className={
                            !notification?.is_read ? "font-weight-bold" : ""
                          }
                          style={{
                            lineHeight: "1.3",
                            marginBottom: "3px",
                            fontWeight: !notification?.is_read
                              ? "bold"
                              : "normal",
                            whiteSpace: "normal",
                          }}
                        >
                          {notification?.content || "New notification"}
                        </span>
                        <small className="text-muted">
                          {formatNotificationTime(notification.created_at)}
                        </small>
                      </p>
                    </a>
                  ))}

                {loading && page > 1 && (
                  <div className="text-center p-2">
                    <small>Đang tải thêm...</small>
                  </div>
                )}
              </div>

              {hasMore && notifications.length > 0 && (
                <a
                  href="#"
                  onClick={loadMoreNotifications}
                  className="dropdown-item text-center text-primary notify-item notify-all"
                  onMouseDown={(e) => e.preventDefault()} // Add this line to prevent dropdown closing in some browsers
                >
                  {loading && page > 1 ? "Loading..." : "Xem thêm"}
                </a>
              )}
            </div>
          </li>

          <li className="dropdown notification-list">
            <a
              className="nav-link dropdown-toggle nav-user arrow-none mr-0"
              data-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <span className="account-user-avatar">
                <img
                  src="/assets/images/users/avatar-1.jpg"
                  alt="user-image"
                  className="rounded-circle"
                />
              </span>
              <span>
                <span className="account-user-name">
                  {user?.username || user?.name}
                </span>
                <span className="account-position">{user?.role}</span>
              </span>
            </a>
            <div className="dropdown-menu dropdown-menu-right dropdown-menu-animated topbar-dropdown-menu profile-dropdown">
              <div className="dropdown-header noti-title">
                <h6 className="text-overflow m-0">Xin chào!</h6>
              </div>
              <a
                href="#"
                className="dropdown-item notify-item"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/users/${user?.id}`);
                }}
              >
                <i className="mdi mdi-account-circle mr-1"></i>
                <span>Tài khoản của bạn</span>
              </a>
              <a
                href="#"
                className="dropdown-item notify-item"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              >
                <i className="mdi mdi-logout mr-1"></i>
                <span>Đăng xuất</span>
              </a>
            </div>
          </li>
        </ul>
        <button className="button-menu-mobile open-left disable-btn">
          <i className="mdi mdi-menu"></i>
        </button>
      </div>
    </>
  );
};

export default Header;
