const Loader = ({
  size = "md",
  fullScreen = false,
  text = "Loading...",
  showText = false,
  color = "primary",
}) => {
  // Size mapping for spinner
  const sizeClasses = {
    xs: "spinner-border-sm",
    sm: "spinner-border-sm",
    md: "",
    lg: "spinner-grow-lg",
    xl: "spinner-grow-lg",
  };

  // Get the appropriate spinner class based on size
  const spinnerSizeClass = sizeClasses[size] || "";

  // Create the spinner element
  const spinner = (
    <div className="d-flex align-items-center justify-content-center flex-column">
      <div
        className={`spinner-border text-${color} ${spinnerSizeClass}`}
        role="status"
        style={{ opacity: 0.85 }}
      >
        {/*<span className="visually-hidden">Loading...</span>*/}
      </div>

      {showText && (
        <div className="mt-2 text-center text-secondary">{text}</div>
      )}
    </div>
  );

  // For full screen overlay
  if (fullScreen) {
    return (
      <div
        className="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
        style={{
          zIndex: 1050,
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(2px)",
        }}
      >
        {spinner}
      </div>
    );
  }

  // For inline/component loading
  return <div className="d-flex justify-content-center py-4">{spinner}</div>;
};

export default Loader;
