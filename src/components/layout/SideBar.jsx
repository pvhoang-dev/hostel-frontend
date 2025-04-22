import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const SideBar = () => {
  const { isAdmin, isManager } = useAuth();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Trang chủ",
      roles: ["admin", "manager", "tenant"],
    },
    { path: "/users", label: "Users", roles: ["admin"] },
    { path: "/roles", label: "Vai trò", roles: ["admin"] },
    { path: "/equipments", label: "Thiết bị", roles: ["admin", "manager"] },
    { path: "/services", label: "Dịch vụ", roles: ["admin", "manager"] },
    {
      path: "/payment-methods",
      label: "Thanh toán",
      roles: ["admin", "manager"],
    },
    { path: "/settings", label: "Nội quy chung", roles: ["admin"] },
    { path: "/houses", label: "Nhà trọ", roles: ["admin", "manager"] },
    { path: "/rooms", label: "Phòng", roles: ["admin", "manager"] },
    { path: "/contracts", label: "Hợp đồng", roles: ["admin", "manager"] },
    {
      path: "/invoices",
      label: "Hóa đơn",
      roles: ["admin", "manager", "tenant"],
    },
    {
      path: "/requests",
      label: "Yêu cầu",
      roles: ["admin", "manager", "tenant"],
    },
    {
      path: "/notifications",
      label: "Thông báo",
      roles: ["admin", "manager", "tenant"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;

    return item.roles.some(
      (role) =>
        (role === "admin" && isAdmin) ||
        (role === "manager" && isManager) ||
        role === "tenant"
    );
  });

  return (
    <>
      <div class="left-side-menu">
        <a href="/dashboard" class="logo text-center logo-light">
          <span class="logo-lg">
            <img src="assets/images/logo_hostel.png" alt="" height="48" />
          </span>
          <span class="logo-sm">
            <img src="assets/images/logo_hostel_sm.png" alt="" height="48" />
          </span>
        </a>

        <div class="h-100 mt-3" id="left-side-menu-container" data-simplebar>
          <ul class="metismenu side-nav">
            {filteredMenuItems.map((item) => (
              <li class="side-nav-item" key={item.path}>
                <NavLink
                  to={item.path}
                  className="side-nav-link"
                  activeClassName="active"
                >
                  <i className="dripicons-chevron-right"></i>
                  <span className="h4 font-weight-normal">{item.label}</span>
                </NavLink>
              </li>
            ))}
            {/* <li class="side-nav-item">
              <a href="dashboard" class="side-nav-link">
                <i class="uil-calender"></i>
                <span> Dashboard </span>
              </a>
            </li> */}
          </ul>
          <div class="clearfix"></div>
        </div>
      </div>
    </>
  );
};
export default SideBar;
