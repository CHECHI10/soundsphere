import { ArrowLeft, Play, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { artistApi } from "../api/client.js";
import Artwork from "../components/Artwork.jsx";
import EmptyState from "../components/EmptyState.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";

export default function ArtistProfile() {
  const { artistId } = useParams();
  const { playTrack, playQueue } = usePlayer();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadArtist() {
      setLoading(true);
      setError("");

      try {
        const data = await artistApi.get(artistId);

        if (!ignore) {
          setArtist(data.artist);
          setSongs(data.songs || []);
          setAlbums(data.albums || []);
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

    loadArtist();

    return () => {
      ignore = true;
    };
  }, [artistId]);

  if (loading) {
    return <div className="panel mx-auto max-w-5xl p-6 text-sm text-neutral-400">Loading artist</div>;
  }

  if (error) {
    return <div className="panel mx-auto max-w-5xl p-6 text-sm text-red-200">{error}</div>;
  }

  if (!artist) {
    return <EmptyState title="Artist not found" />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 hover:text-white" to="/">
        <ArrowLeft size={16} />
        Library
      </Link>

      <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-md border border-ink-700 bg-ink-900 text-accent">
          <UserRound size={44} />
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Artist</p>
          <h1 className="truncate text-4xl font-bold text-white sm:text-5xl">{artist.username}</h1>
          <p className="mt-3 text-sm text-neutral-400">
            {songs.length} {songs.length === 1 ? "song" : "songs"} • {albums.length} {albums.length === 1 ? "album" : "albums"}
          </p>
          <button className="btn-primary mt-5" type="button" disabled={!songs.length} onClick={() => playQueue(songs)}>
            <Play size={16} />
            Play songs
          </button>
        </div>
      </header>

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">Songs</h2>
          {songs.length ? (
            <div className="space-y-1">
              {songs.map((track, index) => (
                <TrackRow key={track.id} track={track} queue={songs} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState title="No songs yet" />
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">Albums</h2>
          {albums.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {albums.map((album) => (
                <article key={album.id} className="rounded-lg border border-ink-700 bg-ink-900 p-3">
                  <Link to={`/albums/${album.id}`}>
                    <Artwork title={album.title} size="card" />
                    <h3 className="mt-3 truncate text-sm font-semibold text-white">{album.title}</h3>
                    <p className="truncate text-xs text-neutral-500">{album.musics?.length || 0} tracks</p>
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
            <EmptyState title="No albums yet" />
          )}
        </section>
      </div>
    </div>
  );
}
