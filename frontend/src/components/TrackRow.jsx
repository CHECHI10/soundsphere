import { Heart, Pause, Play, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext.jsx";
import { useUserLibrary } from "../context/UserLibraryContext.jsx";
import { formatTime } from "../utils/format.js";
import Artwork from "./Artwork.jsx";
import PlaylistMenu from "./PlaylistMenu.jsx";

export default function TrackRow({
  draggableProps,
  index,
  onRemove,
  queue = [],
  showPlaylistAction = true,
  showRemove = false,
  track,
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const { likedIds, toggleLikedSong } = useUserLibrary();
  const [liking, setLiking] = useState(false);
  const active = currentTrack?.id === track.id;
  const liked = likedIds.has(track.id);
  const artist = track.artist?.username || "Unknown artist";

  function handlePlay() {
    if (active) {
      togglePlay();
      return;
    }

    playTrack(track, queue.length ? queue : [track]);
  }

  async function handleLike() {
    setLiking(true);

    try {
      await toggleLikedSong(track.id);
    } finally {
      setLiking(false);
    }
  }

  return (
    <div
      className="grid min-h-16 grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-transparent px-3 py-2 transition hover:border-ink-700 hover:bg-ink-900"
      {...draggableProps}
    >
      <button className="icon-button h-9 w-9" type="button" onClick={handlePlay} title={active && isPlaying ? "Pause" : "Play"}>
        {active && isPlaying ? <Pause size={17} /> : <Play size={17} />}
      </button>
      <div className="flex min-w-0 items-center gap-3">
        <Artwork title={track.title} size="sm" />
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${active ? "text-accent" : "text-white"}`}>
            {track.title}
          </p>
          {track.artist?.id ? (
            <Link className="truncate text-xs text-neutral-500 hover:text-neutral-300" to={`/artists/${track.artist.id}`}>
              {artist}
            </Link>
          ) : (
            <p className="truncate text-xs text-neutral-500">{artist}</p>
          )}
          <p className="mt-0.5 truncate text-xs text-neutral-600">
            {[track.genre, track.mood].filter(Boolean).join(" • ")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {track.duration ? <span className="hidden min-w-10 text-right text-xs text-neutral-600 sm:block">{formatTime(track.duration)}</span> : null}
        <button
          className={`icon-button h-9 w-9 ${liked ? "text-accent hover:text-accent" : ""}`}
          type="button"
          onClick={handleLike}
          disabled={liking}
          title={liked ? "Remove from liked songs" : "Add to liked songs"}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>
        {showPlaylistAction ? <PlaylistMenu track={track} /> : null}
        {showRemove ? (
          <button className="icon-button h-9 w-9" type="button" onClick={onRemove} title="Remove">
            <X size={16} />
          </button>
        ) : null}
        <span className="hidden min-w-5 text-right text-xs text-neutral-600 sm:block">{String(index + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
