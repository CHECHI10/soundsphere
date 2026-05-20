import { ListMusic, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import { useUserLibrary } from "../context/UserLibraryContext.jsx";

export default function Playlists() {
  const { createPlaylist, loading, playlists, refreshLibrary } = useUserLibrary();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await createPlaylist(name);
      setName("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Your music</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Playlists</h1>
        </div>
        <button className="btn-secondary" type="button" onClick={refreshLibrary}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <form className="panel mb-8 flex flex-col gap-3 p-4 sm:flex-row" onSubmit={handleCreate}>
        <input
          className="field"
          placeholder="Playlist name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button className="btn-primary shrink-0" type="submit" disabled={submitting || !name.trim()}>
          <Plus size={16} />
          Create playlist
        </button>
      </form>

      {error ? <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

      {loading ? (
        <div className="panel p-6 text-sm text-neutral-400">Loading playlists</div>
      ) : playlists.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map((playlist) => (
            <Link key={playlist.id} className="rounded-lg border border-ink-700 bg-ink-900 p-4 transition hover:bg-ink-850" to={`/playlists/${playlist.id}`}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-ink-800 text-accent">
                <ListMusic size={24} />
              </div>
              <h2 className="truncate text-base font-semibold text-white">{playlist.name}</h2>
              <p className="mt-1 text-sm text-neutral-500">{playlist.musics?.length || 0} {(playlist.musics?.length || 0) === 1 ? "song" : "songs"}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No playlists yet" description="Create a playlist, then add songs from the library or search." />
      )}
    </div>
  );
}
