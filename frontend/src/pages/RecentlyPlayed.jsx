import { Clock3, Play, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { libraryApi } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";

export default function RecentlyPlayed() {
  const { playQueue } = usePlayer();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    setLoading(true);
    setError("");

    try {
      const data = await libraryApi.recent();
      setHistory(data.history || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const tracks = history.map((item) => item.music).filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">History</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Recently Played</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" type="button" disabled={!tracks.length} onClick={() => playQueue(tracks)}>
            <Play size={16} />
            Play all
          </button>
          <button className="btn-secondary" type="button" onClick={loadHistory}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error ? <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

      {loading ? (
        <div className="panel p-6 text-sm text-neutral-400">Loading recent plays</div>
      ) : tracks.length ? (
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <TrackRow key={`${track.id}-${index}`} track={track} queue={tracks} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing played yet"
          description="Songs appear here after they play for at least 10 seconds."
          action={<Clock3 size={22} className="text-accent" />}
        />
      )}
    </div>
  );
}
