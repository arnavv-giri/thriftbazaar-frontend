import "./LoadingSpinner.css";

function LoadingSpinner({ size = "md", fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`spinner spinner-${size}`} />
      </div>
    );
  }

  return <div className={`spinner spinner-${size}`} />;
}

export default LoadingSpinner;