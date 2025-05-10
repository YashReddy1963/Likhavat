import { Navigate } from "react-router-dom";

const AuthRedirect = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? <Navigate to="/dashboard/home" replace /> : children;
};

export default AuthRedirect;