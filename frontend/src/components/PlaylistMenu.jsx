import { ListPlus, Plus } from "lucide-react";
import { useState } from "react";
import { useUserLibrary } from "../context/UserLibraryContext.jsx";

export default function PlaylistMenu({ track }) {
  const { addToPlaylist, createPlaylist, playlists } = useUserLibrary();
  const [open, setOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(playlistId) {
    setSubmitting(true);
    setMessage("");

    try {
      await addToPlaylist(playlistId, track.id);
      setMessage("Added");
      setOpen(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    const name = newPlaylistName.trim();

    if (!name) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const playlist = await createPlaylist(name);
      await addToPlaylist(playlist.id, track.id);
      setNewPlaylistName("");
      setMessage("Playlist created");
      setOpen(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative">
      <button className="icon-button h-9 w-9" type="button" onClick={() => setOpen((value) => !value)} title="Add to playlist">
        <ListPlus size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-lg border border-ink-700 bg-ink-900 p-3 shadow-panel">
          <p className="mb-3 text-sm font-semibold text-white">Add to playlist</p>
          <div className="max-h-44 space-y-1 overflow-auto">
            {playlists.length ? (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  className="flex min-h-10 w-full items-center justify-between rounded-md px-2 text-left text-sm text-neutral-300 hover:bg-ink-800 hover:text-white"
                  type="button"
                  disabled={submitting}
                  onClick={() => handleAdd(playlist.id)}
                >
                  <span className="truncate">{playlist.name}</span>
                  <span className="text-xs text-neutral-600">{playlist.musics?.length || 0}</span>
                </button>
              ))
            ) : (
              <p className="rounded-md bg-ink-950 px-3 py-3 text-sm text-neutral-500">No playlists yet.</p>
            )}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={handleCreate}>
            <input
              className="field h-10"
              placeholder="New playlist"
              value={newPlaylistName}
              onChange={(event) => setNewPlaylistName(event.target.value)}
            />
            <button className="btn-secondary h-10 w-10 shrink-0 px-0" type="submit" disabled={submitting || !newPlaylistName.trim()} title="Create playlist">
              <Plus size={16} />
            </button>
          </form>
          {message ? <p className="mt-2 text-xs text-neutral-400">{message}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
