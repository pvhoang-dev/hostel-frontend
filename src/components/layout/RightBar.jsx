import { useState } from "react";

const RightBar = () => {
  // State for each settings group
  const [colorScheme, setColorScheme] = useState("light");
  const [width, setWidth] = useState("fluid");
  const [theme, setTheme] = useState("default");
  const [compact, setCompact] = useState("fixed");

  // Handle reset
  const handleReset = () => {
    setColorScheme("light");
    setWidth("fluid");
    setTheme("default");
    setCompact("fixed");
  };

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
                checked={colorScheme === "light"}
                onChange={() => setColorScheme("light")}
              />
              <label
                className="custom-control-label"
                htmlFor="light-mode-check"
              >
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
                checked={colorScheme === "dark"}
                onChange={() => setColorScheme("dark")}
              />
              <label className="custom-control-label" htmlFor="dark-mode-check">
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
                checked={width === "fluid"}
                onChange={() => setWidth("fluid")}
              />
              <label className="custom-control-label" htmlFor="fluid-check">
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
                checked={width === "boxed"}
                onChange={() => setWidth("boxed")}
              />
              <label className="custom-control-label" htmlFor="boxed-check">
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
                checked={theme === "default"}
                onChange={() => setTheme("default")}
              />
              <label className="custom-control-label" htmlFor="default-check">
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
                checked={theme === "light"}
                onChange={() => setTheme("light")}
              />
              <label className="custom-control-label" htmlFor="light-check">
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
                checked={theme === "dark"}
                onChange={() => setTheme("dark")}
              />
              <label className="custom-control-label" htmlFor="dark-check">
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
                checked={compact === "fixed"}
                onChange={() => setCompact("fixed")}
              />
              <label className="custom-control-label" htmlFor="fixed-check">
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
                checked={compact === "condensed"}
                onChange={() => setCompact("condensed")}
              />
              <label className="custom-control-label" htmlFor="condensed-check">
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
                checked={compact === "scrollable"}
                onChange={() => setCompact("scrollable")}
              />
              <label
                className="custom-control-label"
                htmlFor="scrollable-check"
              >
                Scrollable
              </label>
            </div>

            <button
              className="btn btn-primary btn-block mt-4"
              id="resetBtn"
              onClick={handleReset}
            >
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
