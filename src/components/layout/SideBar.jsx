import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const SideBar = () => {
  const { isAdmin, isManager, isTenant } = useAuth();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Trang chủ",
      roles: ["admin", "manager", "tenant"],
    },
    { path: "#", label: "QL Doanh thu/Số liệu", roles: ["admin"] },
    { path: "/users", label: "QL Users", roles: ["admin", "manager"] },
    { path: "/roles", label: "QL Vai trò", roles: ["admin"] },
    {
      path: "/payment-methods",
      label: "QL PT Thanh toán",
      roles: ["admin", "manager"],
    },
    { path: "/equipments", label: "QL Thiết bị", roles: ["admin", "manager"] },
    { path: "/services", label: "QL Dịch vụ", roles: ["admin", "manager"] },
    { path: "/houses", label: "QL Nhà trọ", roles: ["admin", "manager"] },
    { path: "/storages", label: "QL Kho", roles: ["admin", "manager"] },
    { path: "/rooms", label: "QL Phòng trọ", roles: ["admin", "manager"] },
    { path: "#", label: "QL DV phòng/Tháng", roles: ["admin", "manager"] },
    { path: "/contracts", label: "QL Hợp đồng", roles: ["admin", "manager"] },
    {
      path: "/invoices",
      label: isTenant ? "Hóa đơn" : "QL Hóa đơn",
      roles: ["admin", "manager", "tenant"],
    },
    {
      path: "/requests",
      label: isTenant ? "Yêu cầu" : "QL Yêu cầu",
      roles: ["admin", "manager", "tenant"],
    },
    {
      path: "#",
      label: "QL Thông báo",
      roles: ["admin", "manager"],
    },
    { path: "/settings", label: "QL Nội quy chung", roles: ["admin"] },
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
            <img src="assets/images/logo_hostel.png" alt="" height="48" />
          </span>
          <span className="logo-sm">
            <img src="assets/images/logo_hostel_sm.png" alt="" height="48" />
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
                  <i className="dripicons-chevron-right"></i>
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
