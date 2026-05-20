import { ArrowLeft, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { musicApi } from "../api/client.js";
import Artwork from "../components/Artwork.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";

export default function AlbumDetail() {
  const { albumId } = useParams();
  const { playTrack } = usePlayer();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadAlbum() {
      setLoading(true);
      setError("");

      try {
        const data = await musicApi.getAlbum(albumId);
        if (!ignore) {
          setAlbum(data.album);
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

    loadAlbum();

    return () => {
      ignore = true;
    };
  }, [albumId]);

  if (loading) {
    return <div className="panel mx-auto max-w-5xl p-6 text-sm text-neutral-400">Loading album</div>;
  }

  if (error) {
    return <div className="panel mx-auto max-w-5xl p-6 text-sm text-red-200">{error}</div>;
  }

  if (!album) {
    return <div className="panel mx-auto max-w-5xl p-6 text-sm text-neutral-400">Album not found.</div>;
  }

  const tracks = album.musics || [];

  return (
    <div className="mx-auto max-w-5xl">
      <Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 hover:text-white" to="/">
        <ArrowLeft size={16} />
        Library
      </Link>

      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end">
        <Artwork title={album.title} size="lg" />
        <div className="min-w-0">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Album</p>
          <h1 className="truncate text-4xl font-bold text-white sm:text-5xl">{album.title}</h1>
          <p className="mt-3 text-sm text-neutral-400">
            {album.artist?.username || "Unknown artist"} • {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
          </p>
          <button
            className="btn-primary mt-5"
            type="button"
            disabled={!tracks.length}
            onClick={() => playTrack(tracks[0], tracks)}
          >
            <Play size={16} />
            Play album
          </button>
        </div>
      </header>

      {tracks.length ? (
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} queue={tracks} index={index} />
          ))}
        </div>
      ) : (
        <div className="panel p-6 text-sm text-neutral-400">No tracks in this album.</div>
      )}
    </div>
  );
}
