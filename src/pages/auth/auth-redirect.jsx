import { Navigate } from "react-router-dom";

const AuthRedirect = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? <Navigate to="/dashboard/profile" replace /> : children;
};

export default AuthRedirect;