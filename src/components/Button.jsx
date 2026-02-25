import "./Button.css";

function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${
        fullWidth ? "btn-full-width" : ""
      } ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <span className="btn-spinner" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;