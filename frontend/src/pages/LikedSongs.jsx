import { Heart, Play } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import { useUserLibrary } from "../context/UserLibraryContext.jsx";

export default function LikedSongs() {
  const { playQueue } = usePlayer();
  const { likedSongs, loading } = useUserLibrary();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Saved</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Liked Songs</h1>
        </div>
        <button className="btn-primary" type="button" disabled={!likedSongs.length} onClick={() => playQueue(likedSongs)}>
          <Play size={16} />
          Play all
        </button>
      </div>

      {loading ? (
        <div className="panel p-6 text-sm text-neutral-400">Loading liked songs</div>
      ) : likedSongs.length ? (
        <div className="space-y-1">
          {likedSongs.map((track, index) => (
            <TrackRow key={track.id} track={track} queue={likedSongs} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No liked songs yet"
          description="Tap the heart on any song to save it here."
          action={<Heart size={22} className="text-accent" />}
        />
      )}
    </div>
  );
}
