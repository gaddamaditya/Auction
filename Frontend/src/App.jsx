import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AuctionDetails from "./pages/AuctionDetails.jsx";
import CreateAuction from "./pages/CreateAuction.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--obsidian)' }}>
      {/* Ambient glow orbs */}
      <div className="glow-orb" style={{ width: 600, height: 600, top: -200, left: -200, background: 'rgba(201,168,76,0.06)' }} />
      <div className="glow-orb" style={{ width: 500, height: 500, bottom: -150, right: -150, background: 'rgba(100,50,200,0.05)' }} />

      <Navbar />
      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auctions/:id" element={<AuctionDetails />} />
          <Route path="/create" element={<ProtectedRoute><CreateAuction /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer style={{ borderTop: '1px solid rgba(201,168,76,0.1)', padding: '2rem 0', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--gold-dim)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          BidArena
        </span>
      </footer>
    </div>
  );
}