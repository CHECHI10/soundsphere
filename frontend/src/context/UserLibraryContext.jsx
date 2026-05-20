import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { libraryApi, playlistApi } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const UserLibraryContext = createContext(null);

export function UserLibraryProvider({ children }) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshLibrary = useCallback(async () => {
    if (!user) {
      setPlaylists([]);
      setLikedSongs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [playlistData, likedData] = await Promise.all([playlistApi.list(), libraryApi.likedSongs()]);
      setPlaylists(playlistData.playlists || []);
      setLikedSongs(likedData.musics || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshLibrary().catch(() => {
      setPlaylists([]);
      setLikedSongs([]);
    });
  }, [refreshLibrary]);

  const likedIds = useMemo(() => new Set(likedSongs.map((song) => song.id)), [likedSongs]);

  const toggleLikedSong = useCallback(
    async (musicId) => {
      const data = await libraryApi.toggleLikedSong(musicId);

      setLikedSongs((current) => {
        if (data.liked) {
          const exists = current.some((song) => song.id === data.music.id);
          return exists ? current : [data.music, ...current];
        }

        return current.filter((song) => song.id !== musicId);
      });

      return data;
    },
    []
  );

  const createPlaylist = useCallback(async (name) => {
    const data = await playlistApi.create({ name });
    setPlaylists((current) => [data.playlist, ...current]);
    return data.playlist;
  }, []);

  const addToPlaylist = useCallback(async (playlistId, musicId) => {
    const data = await playlistApi.addMusic(playlistId, musicId);
    setPlaylists((current) =>
      current.map((playlist) => (playlist.id === data.playlist.id ? data.playlist : playlist))
    );
    return data.playlist;
  }, []);

  const removeFromPlaylist = useCallback(async (playlistId, musicId) => {
    const data = await playlistApi.removeMusic(playlistId, musicId);
    setPlaylists((current) =>
      current.map((playlist) => (playlist.id === data.playlist.id ? data.playlist : playlist))
    );
    return data.playlist;
  }, []);

  const value = useMemo(
    () => ({
      addToPlaylist,
      createPlaylist,
      likedIds,
      likedSongs,
      loading,
      playlists,
      refreshLibrary,
      removeFromPlaylist,
      setPlaylists,
      toggleLikedSong,
    }),
    [
      addToPlaylist,
      createPlaylist,
      likedIds,
      likedSongs,
      loading,
      playlists,
      refreshLibrary,
      removeFromPlaylist,
      toggleLikedSong,
    ]
  );

  return <UserLibraryContext.Provider value={value}>{children}</UserLibraryContext.Provider>;
}

export function useUserLibrary() {
  const context = useContext(UserLibraryContext);

  if (!context) {
    throw new Error("useUserLibrary must be used inside UserLibraryProvider");
  }

  return context;
}
