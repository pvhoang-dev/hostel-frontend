const RightBar = () => {
  return (
    <>
      <div className="right-bar">
        <div className="rightbar-title">
          <a
            href="javascript:void(0);"
            className="right-bar-toggle float-right"
          >
            <i className="dripicons-cross noti-icon"></i>
          </a>
          <h5 className="m-0">Settings</h5>
        </div>

        <div className="rightbar-content h-100" data-simplebar>
          <div className="p-3">
            <div className="alert alert-warning" role="alert">
              <strong>Customize </strong> the overall color scheme, sidebar
              menu, etc.
            </div>
            <h5 className="mt-3">Color Scheme</h5>
            <hr className="mt-1" />

            <div className="custom-control custom-switch mb-1">
              <input
                type="radio"
                className="custom-control-input"
                name="color-scheme-mode"
                value="light"
                id="light-mode-check"
                checked
              />
              <label className="custom-control-label" for="light-mode-check">
                Light Mode
              </label>
            </div>

            <div className="custom-control custom-switch mb-1">
              <input
                type="radio"
                className="custom-control-input"
                name="color-scheme-mode"
                value="dark"
                id="dark-mode-check"
              />
              <label className="custom-control-label" for="dark-mode-check">
                Dark Mode
              </label>
            </div>
            <h5 className="mt-4">Width</h5>
            <hr className="mt-1" />
            <div className="custom-control custom-switch mb-1">
              <input
                type="radio"
                className="custom-control-input"
                name="width"
                value="fluid"
                id="fluid-check"
                checked
              />
              <label className="custom-control-label" for="fluid-check">
                Fluid
              </label>
            </div>
            <div className="custom-control custom-switch mb-1">
              <input
                type="radio"
                className="custom-control-input"
                name="width"
                value="boxed"
                id="boxed-check"
              />
              <label className="custom-control-label" for="boxed-check">
                Boxed
              </label>
            </div>

            <h5 className="mt-4">Left Sidebar</h5>
            <hr className="mt-1" />
            <div className="custom-control custom-switch mb-1">
              <input
                type="radio"
                className="custom-control-input"
                name="theme"
                value="default"
                id="default-check"
                checked
              />
              <label className="custom-control-label" for="default-check">
                Default
              </label>
            </div>

            <div className="custom-control custom-switch mb-1">
              <input
                type="radio"
                className="custom-control-input"
                name="theme"
                value="light"
                id="light-check"
              />
              <label className="custom-control-label" for="light-check">
                Light
              </label>
            </div>

            <div className="custom-control custom-switch mb-3">
              <input
                type="radio"
                className="custom-control-input"
                name="theme"
                value="dark"
                id="dark-check"
              />
              <label className="custom-control-label" for="dark-check">
                Dark
              </label>
            </div>

            <div className="custom-control custom-switch mb-1">
              <input
                type="radio"
                className="custom-control-input"
                name="compact"
                value="fixed"
                id="fixed-check"
                checked
              />
              <label className="custom-control-label" for="fixed-check">
                Fixed
              </label>
            </div>

            <div className="custom-control custom-switch mb-1">
              <input
                type="radio"
                className="custom-control-input"
                name="compact"
                value="condensed"
                id="condensed-check"
              />
              <label className="custom-control-label" for="condensed-check">
                Condensed
              </label>
            </div>

            <div className="custom-control custom-switch mb-1">
              <input
                type="radio"
                className="custom-control-input"
                name="compact"
                value="scrollable"
                id="scrollable-check"
              />
              <label className="custom-control-label" for="scrollable-check">
                Scrollable
              </label>
            </div>

            <button className="btn btn-primary btn-block mt-4" id="resetBtn">
              Reset to Default
            </button>
          </div>
        </div>
      </div>
      <div className="rightbar-overlay"></div>
    </>
  );
};
export default RightBar;
