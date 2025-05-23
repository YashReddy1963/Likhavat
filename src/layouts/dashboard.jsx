import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import {
  Sidenav,
  DashboardNavbar,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController } from "@/context";
import { useEffect } from "react";

export function Dashboard() {
  const navigate = useNavigate()
  const [controller, dispatch] = useMaterialTailwindController()
  const { sidenavType } = controller

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if(!token){
      navigate("/auth/sign-in")
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}

          <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
        </Routes>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
