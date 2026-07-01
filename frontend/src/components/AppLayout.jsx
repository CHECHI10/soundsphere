import { Clock3, Disc3, Heart, Home, ListMusic, LogOut, Music2, Search, UploadCloud } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import PlayerBar from "./PlayerBar.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

const navBase =
  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition";
const navInactive = "text-neutral-400 hover:bg-ink-800 hover:text-white";
const navActive = "bg-ink-800 text-white";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const navItems = [
    { to: "/", label: "Library", icon: Home },
    { to: "/search", label: "Search", icon: Search },
    { to: "/playlists", label: "Playlists", icon: ListMusic },
    { to: "/liked", label: "Liked", icon: Heart },
    { to: "/recent", label: "Recent", icon: Clock3 },
    ...(user?.role === "artist" ? [{ to: "/artist", label: "Artist", icon: UploadCloud }] : []),
  ];

  function openLogoutConfirm() {
    setShowLogoutConfirm(true);
  }

  async function confirmLogout() {
    setLogoutPending(true);

    try {
      const result = await logout();
      setShowLogoutConfirm(false);
      if (result?.error) {
        notify(result.error.message || "Logged out locally, but the server sign-out failed", "error");
      } else {
        notify("Logged out", "success");
      }
      navigate("/login", { replace: true });
    } finally {
      setLogoutPending(false);
    }
  }

  function cancelLogout() {
    setShowLogoutConfirm(false);
  }

  return (
    <div className="min-h-screen bg-ink-950 pb-28 text-neutral-100 md:pb-24">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink-700 bg-ink-900 p-4 md:block">
        <div className="mb-8 flex h-12 items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-black">
            <Music2 size={19} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">soundSphere</p>
            <p className="text-xs text-neutral-500">{user?.role === "artist" ? "Artist" : "Listener"}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 border-t border-ink-700 pt-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink-800 text-sm font-semibold">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
              <p className="truncate text-xs text-neutral-500">{user?.email}</p>
            </div>
          </div>
          <button className="btn-secondary w-full" type="button" onClick={openLogoutConfirm}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-ink-700 bg-ink-950/95 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-black">
              <Disc3 size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">soundSphere</p>
              <p className="text-xs text-neutral-500">{user?.username}</p>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={openLogoutConfirm} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${navBase} shrink-0 justify-center ${isActive ? navActive : navInactive}`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="px-4 py-6 md:ml-64 md:px-8 md:py-8">
        <Outlet />
      </main>

      <PlayerBar />
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Confirm logout"
        description="Are you sure you want to log out?"
        confirmLabel={logoutPending ? "Logging out..." : "Logout"}
        confirmTone="danger"
        confirmDisabled={logoutPending}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
