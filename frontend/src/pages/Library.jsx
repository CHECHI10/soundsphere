import { Disc3, Play, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { musicApi } from "../api/client.js";
import Artwork from "../components/Artwork.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";

export default function Library() {
  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTracks = normalizedSearch
    ? tracks.filter((track) => {
        const title = track.title?.toLowerCase() || "";
        const artist = track.artist?.username?.toLowerCase() || "";

        return title.includes(normalizedSearch) || artist.includes(normalizedSearch);
      })
    : tracks;

  async function loadLibrary() {
    setError("");
    setLoading(true);

    try {
      const [musicData, albumData] = await Promise.all([musicApi.listMusics(), musicApi.listAlbums()]);
      setTracks(musicData.musics || []);
      setAlbums(albumData.albums || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLibrary();
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Library</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Music</h1>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[420px] sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              className="field pl-10"
              type="search"
              placeholder="Search songs"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <button className="btn-secondary shrink-0" type="button" onClick={loadLibrary}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error ? <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

      {loading ? (
        <div className="panel p-6 text-sm text-neutral-400">Loading library</div>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Disc3 size={19} className="text-neutral-500" />
              <h2 className="text-xl font-semibold text-white">Albums</h2>
            </div>
            {albums.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {albums.map((album) => (
                  <article key={album.id} className="group rounded-lg border border-ink-700 bg-ink-900 p-3 transition hover:bg-ink-850">
                    <Link to={`/albums/${album.id}`} className="block">
                      <Artwork title={album.title} size="card" />
                      <h3 className="mt-3 truncate text-sm font-semibold text-white">{album.title}</h3>
                      <p className="truncate text-xs text-neutral-500">{album.artist?.username || "Unknown artist"}</p>
                    </Link>
                    <button
                      className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-white text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      disabled={!album.musics?.length}
                      onClick={() => playTrack(album.musics[0], album.musics)}
                    >
                      <Play size={15} />
                      Play
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="panel p-6 text-sm text-neutral-400">No albums yet.</div>
            )}
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Tracks</h2>
              {normalizedSearch ? (
                <p className="text-sm text-neutral-500">
                  {filteredTracks.length} {filteredTracks.length === 1 ? "song" : "songs"} found
                </p>
              ) : null}
            </div>
            {tracks.length ? (
              <div className="space-y-1">
                {filteredTracks.length ? (
                  filteredTracks.map((track, index) => (
                    <TrackRow key={track.id} track={track} queue={filteredTracks} index={index} />
                  ))
                ) : (
                  <div className="panel p-6 text-sm text-neutral-400">No songs match your search.</div>
                )}
              </div>
            ) : (
              <div className="panel p-6 text-sm text-neutral-400">No tracks yet.</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
