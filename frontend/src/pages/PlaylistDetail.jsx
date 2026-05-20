import { ArrowLeft, GripVertical, Pencil, Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { playlistApi } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import { useUserLibrary } from "../context/UserLibraryContext.jsx";

function moveItem(items, fromIndex, toIndex) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const { refreshLibrary, setPlaylists } = useUserLibrary();
  const [playlist, setPlaylist] = useState(null);
  const [name, setName] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPlaylist() {
      setLoading(true);
      setError("");

      try {
        const data = await playlistApi.get(playlistId);
        if (!ignore) {
          setPlaylist(data.playlist);
          setName(data.playlist.name);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPlaylist();

    return () => {
      ignore = true;
    };
  }, [playlistId]);

  async function handleRename(event) {
    event.preventDefault();
    const data = await playlistApi.rename(playlistId, { name });
    setPlaylist(data.playlist);
    setPlaylists((current) => current.map((item) => (item.id === data.playlist.id ? data.playlist : item)));
  }

  async function handleDelete() {
    await playlistApi.remove(playlistId);
    await refreshLibrary();
    navigate("/playlists", { replace: true });
  }

  async function handleRemove(trackId) {
    const data = await playlistApi.removeMusic(playlistId, trackId);
    setPlaylist(data.playlist);
    setPlaylists((current) => current.map((item) => (item.id === data.playlist.id ? data.playlist : item)));
  }

  async function handleDrop(dropIndex) {
    if (dragIndex === null || dragIndex === dropIndex || !playlist) {
      setDragIndex(null);
      return;
    }

    const nextMusics = moveItem(playlist.musics, dragIndex, dropIndex);
    setPlaylist((current) => ({ ...current, musics: nextMusics }));
    setDragIndex(null);

    const data = await playlistApi.reorder(
      playlistId,
      nextMusics.map((music) => music.id)
    );
    setPlaylist(data.playlist);
    setPlaylists((current) => current.map((item) => (item.id === data.playlist.id ? data.playlist : item)));
  }

  if (loading) {
    return <div className="panel mx-auto max-w-5xl p-6 text-sm text-neutral-400">Loading playlist</div>;
  }

  if (error) {
    return <div className="panel mx-auto max-w-5xl p-6 text-sm text-red-200">{error}</div>;
  }

  if (!playlist) {
    return <EmptyState title="Playlist not found" />;
  }

  const tracks = playlist.musics || [];

  return (
    <div className="mx-auto max-w-5xl">
      <Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 hover:text-white" to="/playlists">
        <ArrowLeft size={16} />
        Playlists
      </Link>

      <header className="mb-8 rounded-lg border border-ink-700 bg-ink-900 p-5">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Playlist</p>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleRename}>
          <input className="field text-lg font-semibold" value={name} onChange={(event) => setName(event.target.value)} />
          <button className="btn-secondary shrink-0" type="submit" disabled={!name.trim() || name === playlist.name}>
            <Pencil size={16} />
            Rename
          </button>
          <button className="btn-secondary shrink-0" type="button" onClick={handleDelete}>
            <Trash2 size={16} />
            Delete
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-neutral-500">{tracks.length} {tracks.length === 1 ? "song" : "songs"}</p>
          <button className="btn-primary" type="button" disabled={!tracks.length} onClick={() => playQueue(tracks)}>
            <Play size={16} />
            Play playlist
          </button>
        </div>
      </header>

      {tracks.length ? (
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <div key={track.id} className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-2">
              <div
                className="flex h-12 cursor-grab items-center justify-center rounded-md text-neutral-600 hover:bg-ink-900 hover:text-neutral-400"
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(index)}
                title="Drag to reorder"
              >
                <GripVertical size={16} />
              </div>
              <TrackRow track={track} queue={tracks} index={index} showRemove onRemove={() => handleRemove(track.id)} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="This playlist is empty" description="Use the playlist button on any song to start building it." />
      )}
    </div>
  );
}
