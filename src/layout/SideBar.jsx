import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const SideBar = () => {
  const { isAdmin, isManager, isTenant } = useAuth();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Trang chủ",
      roles: ["admin", "manager", "tenant"],
      icon: "dripicons-information",
    },
    {
      path: "/statistics",
      label: "QL Doanh thu/Số liệu",
      roles: ["admin"],
      icon: "dripicons-document",
    },
    {
      path: "/users",
      label: "QL Users",
      roles: ["admin", "manager"],
      icon: "dripicons-user",
    },
    {
      path: "/roles",
      label: "QL Vai trò",
      roles: ["admin"],
      icon: "dripicons-user-group",
    },
    {
      path: "/payment-methods",
      label: "QL PT Thanh toán",
      roles: ["admin", "manager"],
      icon: "dripicons-swap",
    },
    {
      path: "/equipments",
      label: "QL Thiết bị",
      roles: ["admin", "manager"],
      icon: "uil-bed",
    },
    {
      path: "/services",
      label: "QL Dịch vụ",
      roles: ["admin", "manager"],
      icon: "uil-wrench",
    },
    {
      path: "/houses",
      label: isTenant ? "Nhà trọ" : "QL Nhà trọ",
      roles: ["admin", "manager", "tenant"],
      icon: "dripicons-home",
    },
    {
      path: "/storages",
      label: "QL Kho",
      roles: ["admin", "manager"],
      icon: "dripicons-box",
    },
    {
      path: "/rooms",
      label: isTenant ? "Phòng trọ" : "QL Phòng trọ",
      roles: ["admin", "manager", "tenant"],
      icon: "mdi mdi-home-edit-outline",
    },
    {
      path: "/monthly-service-management",
      label: "QL DV Tháng/Phòng",
      roles: ["admin", "manager"],
      icon: "dripicons-calendar",
    },
    {
      path: "/contracts",
      label: isTenant ? "Hợp đồng" : "QL Hợp đồng",
      roles: ["admin", "manager", "tenant"],
      icon: "dripicons-to-do",
    },
    {
      path: "/invoices",
      label: isTenant ? "Hóa đơn" : "QL Hóa đơn",
      roles: ["admin", "manager", "tenant"],
      icon: "uil-bill",
    },
    {
      path: "/invoice-payment",
      label: "Thanh toán hóa đơn",
      roles: ["tenant"],
      icon: "dripicons-card",
    },
    {
      path: "/requests",
      label: isTenant ? "Yêu cầu" : "QL Yêu cầu",
      roles: ["admin", "manager", "tenant"],
      icon: "dripicons-message",
    },
    {
      path: "/notifications",
      label: isTenant ? "Thông báo" : "QL Thông báo",
      roles: ["admin", "manager", "tenant"],
      icon: "dripicons-bell",
    },
    {
      path: "/settings",
      label: isTenant ? "Nội quy chung" : "QL Nội quy chung",
      roles: ["admin", "manager", "tenant"],
      icon: "dripicons-gear",
    },
    {
      path: "/settings/payos",
      label: "Cài đặt PayOS",
      roles: ["admin"],
      icon: "dripicons-web",
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;

    return item.roles.some(
      (role) =>
        (role === "admin" && isAdmin) ||
        (role === "manager" && isManager) ||
        (role === "tenant" && isTenant)
    );
  });

  return (
    <>
      <div className="left-side-menu">
        <a href="/dashboard" className="logo text-center logo-light">
          <span className="logo-lg">
            <img src="/assets/images/logo_hostel.png" alt="" height="48" />
          </span>
          <span className="logo-sm">
            <img src="/assets/images/logo_hostel_sm.png" alt="" height="48" />
          </span>
        </a>

        <div
          className="h-100 mt-3"
          id="left-side-menu-container"
          data-simplebar
        >
          <ul className="metismenu side-nav">
            {filteredMenuItems.map((item) => (
              <li className="side-nav-item" key={item.path}>
                <NavLink
                  to={item.path}
                  className="side-nav-link"
                  style={{ padding: "10px 20px" }}
                >
                  <i className={item.icon}></i>
                  <span className="h4 font-weight-normal">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="clearfix"></div>
        </div>
      </div>
    </>
  );
};
export default SideBar;
