import { Navigate, Route, Routes } from "react-router-dom";
import AdminAccountsPage from "./pages/AdminAccountsPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import YouTubePage from "./pages/YouTubePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SiteTutorial from "./components/SiteTutorial.jsx";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/youtube" element={<YouTubePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute>
              <AdminAccountsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SiteTutorial />
    </>
  );
}
