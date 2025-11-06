// components/LoadingSpinner.js
import { BiLoader } from "react-icons/bi";

const LoadingSpinner = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="loader-load-spinner">
      <div className="div67">
        <BiLoader className="loader-rotate-loader loader-icon" />
      </div>
    </div>
  );
};

export default LoadingSpinner;