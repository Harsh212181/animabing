  // ---------------------------------------------------------
// 🚀 GLOBAL: Disable console in production
// ---------------------------------------------------------
if (import.meta.env.PROD) {
  const noop = () => {};
  console.log = console.info = console.warn =
  console.error = console.debug = console.trace =
  console.table = console.group = console.groupEnd =
  console.groupCollapsed = console.time = console.timeEnd = noop;
}

// ---------------------------------------------------------
// Imports
// ---------------------------------------------------------
import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";

import Spinner from "./src/components/Spinner";
import ErrorBoundary from "./src/components/ErrorBoundary";

import type { Anime, FilterType, ContentType, ContentTypeFilter } from "./src/types";
import { getAllAnime } from "./services/animeService";

// ---------------------------------------------------------
// ⚡ LAZY LOADING — Major Performance Boost
// ---------------------------------------------------------
const Header = React.lazy(() => import("./components/Header"));
const Footer = React.lazy(() => import("./components/Footer"));
const HomePage = React.lazy(() => import("./components/HomePage"));
const AnimeListPage = React.lazy(() => import("./components/AnimeListPage"));
const AnimeDetailPage = React.lazy(() => import("./components/AnimeDetailPage"));
const DownloadRedirectPage = React.lazy(() => import("./components/DownloadRedirectPage"));
const ScrollToTopButton = React.lazy(() => import("./components/ScrollToTopButton"));

const AdminLogin = React.lazy(() => import("./src/components/admin/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./src/components/admin/AdminDashboard"));

const PrivacyPolicy = React.lazy(() => import("./components/PrivacyPolicy"));
const DMCA = React.lazy(() => import("./components/DMCA"));
const TermsAndConditions = React.lazy(() => import("./components/TermsAndConditions"));
const Contact = React.lazy(() => import("./components/Contact"));

// ---------------------------------------------------------
// DETAIL WRAPPER — optimized
// ---------------------------------------------------------
const DetailPageWrapper: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { animeId } = useParams();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!animeId) return;

    (async () => {
      setLoading(true);

      try {
        const all = await getAllAnime();
        const found = all.find(a => a.id === animeId || a._id === animeId);
        setAnime(found || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [animeId]);

  if (loading) return <Spinner size="lg" text="Loading anime..." />;

  if (!anime) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl mb-2">Anime Not Found</h2>
        <button onClick={onBack} className="bg-purple-600 px-4 py-2 rounded">Go Back</button>
      </div>
    );
  }

  return <AnimeDetailPage anime={anime} onBack={onBack} />;
};

// ---------------------------------------------------------
// MAIN APP
// ---------------------------------------------------------
const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [searchQuery, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");
  const [contentType, setContentType] = useState<ContentTypeFilter>("All");

  const [adminMode, setAdminMode] = useState<"login" | "dashboard" | null>(null);
  const [adminAuth, setAdminAuth] = useState(false);

  const [loading, setLoading] = useState(true);
  const [adminButton, setAdminButton] = useState(false);

  // ---------------------------------------------------------
  // URL Sync → optimized
  // ---------------------------------------------------------
  useEffect(() => {
    setSearch(params.get("search") || "");
    setFilter((params.get("filter") as FilterType) || "All");
    setContentType((params.get("contentType") as ContentTypeFilter) || "All");
  }, [location.search]);

  // ---------------------------------------------------------
  // Admin Token
  // ---------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUsername");
    if (token && user) setAdminAuth(true);

    setTimeout(() => setLoading(false), 1200);
  }, []);

  // ---------------------------------------------------------
  // Secret Admin Button (Ctrl + Shift + Alt)
  // ---------------------------------------------------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey) setAdminButton(p => !p);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ---------------------------------------------------------
  // Functions
  // ---------------------------------------------------------
  const updateURL = (key: string, value: string | null) => {
    const sp = new URLSearchParams(location.search);
    if (!value || value === "All") sp.delete(key);
    else sp.set(key, value);
    navigate(`/?${sp.toString()}`, { replace: true });
  };

  const handleAdminLogin = (token: string, username: string) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUsername", username);
    setAdminAuth(true);
    setAdminMode("dashboard");
  };

  const handleAdminLogout = () => {
    localStorage.clear();
    setAdminAuth(false);
    setAdminMode(null);
    navigate("/");
  };

  const selectAnime = (anime: Anime) => {
    navigate(`/detail/${anime.id}`);
    window.scrollTo(0, 0);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c1c]">
        <Spinner size="lg" text="Loading your anime world..." />
      </div>
    );

  if (adminMode === "login") return <AdminLogin onLogin={handleAdminLogin} />;
  if (adminMode === "dashboard" && adminAuth)
    return <AdminDashboard onLogout={handleAdminLogout} />;

  // ---------------------------------------------------------
  // USER APP UI
  // ---------------------------------------------------------
  return (
    <div className="bg-[#0a0c1c] text-white min-h-screen">
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearch(q);
          updateURL("search", q);
        }}
        onNavigate={(loc) => navigate(loc === "home" ? "/" : "/anime")}
        onFilterAndNavigateHome={(f) => {
          setFilter(f);
          updateURL("filter", f);
        }}
        onContentTypeNavigate={(ct) => {
          setContentType(ct);
          updateURL("contentType", ct);
        }}
      />

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                searchQuery={searchQuery}
                filter={filter}
                contentType={contentType}
                onAnimeSelect={selectAnime}
              />
            }
          />

          <Route
            path="/anime"
            element={<AnimeListPage onAnimeSelect={selectAnime} />}
          />

          <Route path="/detail/:animeId" element={<DetailPageWrapper onBack={() => navigate(-1)} />} />

          <Route path="/download" element={<DownloadRedirectPage />} />
          <Route path="/download-redirect" element={<DownloadRedirectPage />} />

          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
      <ScrollToTopButton />

      {adminButton && (
        <div className="fixed bottom-4 left-4">
          <button
            onClick={() => setAdminMode("login")}
            className="bg-purple-600 px-4 py-2 rounded"
          >
            Admin Access
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------
// EXPORT ROOT
// ---------------------------------------------------------
const App = () => (
  <Router>
    <ErrorBoundary>
      <Suspense fallback={<Spinner size="lg" text="Loading..." />}>
        <MainApp />
      </Suspense>
    </ErrorBoundary>
  </Router>
);

export default App;
