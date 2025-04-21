const SideBar = () => {
  return (
    <>
      <div class="left-side-menu">
        <a href="/dashboard" class="logo text-center logo-light">
          <span class="logo-lg">
            <img src="assets/images/logo.png" alt="" height="16" />
          </span>
          <span class="logo-sm">
            <img src="assets/images/logo_sm.png" alt="" height="16" />
          </span>
        </a>
        <a href="/dashboard" class="logo text-center logo-dark">
          <span class="logo-lg">
            <img src="assets/images/logo-dark.png" alt="" height="16" />
          </span>
          <span class="logo-sm">
            <img src="assets/images/logo_sm_dark.png" alt="" height="16" />
          </span>
        </a>
        <div class="h-100" id="left-side-menu-container" data-simplebar>
          <ul class="metismenu side-nav">
            <li class="side-nav-item">
              <a href="dashboard" class="side-nav-link">
                <i class="uil-calender"></i>
                <span> Dashboard </span>
              </a>
            </li>
            <li class="side-nav-item">
              <a href="users" class="side-nav-link">
                <i class="dripicons-chevron-right"></i>
                <span> Users </span>
              </a>
            </li>
            <li class="side-nav-item">
              <a href="equipments" class="side-nav-link">
                <i class="dripicons-chevron-right"></i>
                <span> Equipments </span>
              </a>
            </li>
            <li class="side-nav-item">
              <a href="services" class="side-nav-link">
                <i class="dripicons-chevron-right"></i>
                <span> Services </span>
              </a>
            </li>
            <li class="side-nav-item">
              <a href="branches" class="side-nav-link">
                <i class="dripicons-chevron-right"></i>
                <span> Branches </span>
              </a>
            </li>
            <li class="side-nav-item">
              <a href="rooms" class="side-nav-link">
                <i class="dripicons-chevron-right"></i>
                <span> Rooms </span>
              </a>
            </li>
            <li class="side-nav-item">
              <a href="tenants" class="side-nav-link">
                <i class="dripicons-chevron-right"></i>
                <span> Tenants </span>
              </a>
            </li>
            <li class="side-nav-item">
              <a href="invoices" class="side-nav-link">
                <i class="dripicons-chevron-right"></i>
                <span> Invoices </span>
              </a>
            </li>
            <li class="side-nav-item">
              <a href="contracts" class="side-nav-link">
                <i class="dripicons-chevron-right"></i>
                <span> Contracts </span>
              </a>
            </li>
          </ul>
          <div class="clearfix"></div>
        </div>
      </div>
    </>
  );
};
export default SideBar;
