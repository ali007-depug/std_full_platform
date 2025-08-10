import { lazy, Suspense } from "react";
// React Router Dom
import { Routes, Route } from "react-router-dom";
// components
import Platform from "./layout/Platform";
const StudentsUI = lazy(() => import("./pages/StudentsUI"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
// const Dashboard = lazy(()=>import("./pages/Dashboard"));
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "./components/Loading";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      {/* Routes */}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Platform />}></Route>

          <Route path="/std-UI" element={<StudentsUI />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          ></Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
