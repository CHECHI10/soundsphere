import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AlbumDetail from "./pages/AlbumDetail.jsx";
import ArtistProfile from "./pages/ArtistProfile.jsx";
import ArtistDashboard from "./pages/ArtistDashboard.jsx";
import LikedSongs from "./pages/LikedSongs.jsx";
import Library from "./pages/Library.jsx";
import Login from "./pages/Login.jsx";
import PlaylistDetail from "./pages/PlaylistDetail.jsx";
import Playlists from "./pages/Playlists.jsx";
import RecentlyPlayed from "./pages/RecentlyPlayed.jsx";
import Register from "./pages/Register.jsx";
import Search from "./pages/Search.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Library />} />
          <Route path="/albums/:albumId" element={<AlbumDetail />} />
          <Route path="/artists/:artistId" element={<ArtistProfile />} />
          <Route path="/artist" element={<ArtistDashboard />} />
          <Route path="/liked" element={<LikedSongs />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
          <Route path="/recent" element={<RecentlyPlayed />} />
          <Route path="/search" element={<Search />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
