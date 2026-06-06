import { Navigate, Route, Routes } from "react-router-dom";
import AdminAccountsPage from "./pages/AdminAccountsPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AdminTikTokPage from "./pages/AdminTikTokPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TikTokPage from "./pages/TikTokPage.jsx";
import YouTubePage from "./pages/YouTubePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SiteTutorial from "./components/SiteTutorial.jsx";
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext.jsx";

export default function App() {
  return (
    <SiteSettingsProvider>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/foto" element={<GalleryPage mediaType="image" />} />
        <Route path="/video" element={<GalleryPage mediaType="video" />} />
        <Route path="/youtube" element={<YouTubePage />} />
        <Route path="/tiktok" element={<TikTokPage />} />
        <Route path="/tentang" element={<AboutPage />} />
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
          path="/admin/tiktok"
          element={
            <ProtectedRoute>
              <AdminTikTokPage />
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
    </SiteSettingsProvider>
  );
}
