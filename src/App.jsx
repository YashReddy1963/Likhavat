import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth, Landing, Story } from "@/layouts";
import { SignIn, SignUp, OTP } from "@/pages/auth";
import AuthRedirect from "./pages/auth/auth-redirect";

function App() {
  return (
    <Routes>
      {/* Landing page paths */}
      <Route path="/" element={<Landing />} />
      <Route path="/ourstory" element={<Story />} />

      {/* Dashboard paths */}
      <Route path="/dashboard/*" element={<Dashboard />}>
        <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      </Route>

      {/* Authentication paths */}
      <Route path="/auth/*" element={<Auth />}>
        <Route
          path="sign-in"
          element={
            <AuthRedirect>
              <SignIn />
            </AuthRedirect>
          }
        />
        <Route
          path="sign-up"
          element={
            <AuthRedirect>
              <SignUp />
            </AuthRedirect>
          }
        />
        <Route path="otp" element={<OTP />} />
        <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}

export default App;
