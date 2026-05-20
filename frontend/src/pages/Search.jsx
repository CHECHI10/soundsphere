import { Disc3, Search as SearchIcon, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchApi } from "../api/client.js";
import Artwork from "../components/Artwork.jsx";
import EmptyState from "../components/EmptyState.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";

export default function Search() {
  const { playTrack } = usePlayer();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ songs: [], albums: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults({ songs: [], albums: [], artists: [] });
      setSearchParams({});
      return undefined;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError("");
      setSearchParams({ q: trimmedQuery });

      try {
        const data = await searchApi.search(trimmedQuery);
        setResults(data.results || { songs: [], albums: [], artists: [] });
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, setSearchParams]);

  const hasResults = results.songs.length || results.albums.length || results.artists.length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Search</p>
        <h1 className="mb-5 text-3xl font-bold text-white sm:text-4xl">Find music</h1>
        <label className="relative block max-w-2xl">
          <SearchIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            className="field pl-10"
            type="search"
            placeholder="Search songs, albums, artists"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </label>
      </div>

      {error ? <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

      {!query.trim() ? (
        <EmptyState title="Search your library" description="Search by song, album, or artist name." />
      ) : loading ? (
        <div className="panel p-6 text-sm text-neutral-400">Searching</div>
      ) : hasResults ? (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Songs</h2>
            {results.songs.length ? (
              <div className="space-y-1">
                {results.songs.map((track, index) => (
                  <TrackRow key={track.id} track={track} queue={results.songs} index={index} />
                ))}
              </div>
            ) : (
              <EmptyState title="No songs found" />
            )}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Albums</h2>
            {results.albums.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {results.albums.map((album) => (
                  <article key={album.id} className="rounded-lg border border-ink-700 bg-ink-900 p-3">
                    <Link to={`/albums/${album.id}`}>
                      <Artwork title={album.title} size="card" />
                      <h3 className="mt-3 truncate text-sm font-semibold text-white">{album.title}</h3>
                      <p className="truncate text-xs text-neutral-500">{album.artist?.username || "Unknown artist"}</p>
                    </Link>
                    <button
                      className="btn-secondary mt-3 w-full"
                      type="button"
                      disabled={!album.musics?.length}
                      onClick={() => playTrack(album.musics[0], album.musics)}
                    >
                      Play
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="No albums found" />
            )}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Artists</h2>
            {results.artists.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {results.artists.map((artist) => (
                  <Link key={artist.id} className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-900 p-4 hover:bg-ink-850" to={`/artists/${artist.id}`}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink-800 text-accent">
                      <UserRound size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{artist.username}</p>
                      <p className="text-xs text-neutral-500">Artist</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No artists found" action={<Disc3 size={22} className="text-accent" />} />
            )}
          </section>
        </div>
      ) : (
        <EmptyState title="No results" description="Try a different song, album, or artist name." />
      )}
    </div>
  );
}
