import { ChevronDown, ChevronUp, ListMusic, Pause, Play, SkipBack, SkipForward, Trash2, Volume2 } from "lucide-react";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext.jsx";
import { formatTime } from "../utils/format.js";
import Artwork from "./Artwork.jsx";

function PlayerControls({ compact = false }) {
  const {
    currentTrack,
    duration,
    isPlaying,
    nextTrack,
    previousTrack,
    progress,
    seek,
    togglePlay,
  } = usePlayer();

  return (
    <div className={compact ? "" : "w-full"}>
      <div className="mb-2 flex items-center justify-center gap-2">
        <button className="icon-button" type="button" onClick={previousTrack} disabled={!currentTrack} title="Previous">
          <SkipBack size={compact ? 18 : 20} />
        </button>
        <button
          className={`${compact ? "h-10 w-10" : "h-12 w-12"} inline-flex items-center justify-center rounded-full bg-white text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50`}
          type="button"
          onClick={togglePlay}
          disabled={!currentTrack}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={compact ? 18 : 21} /> : <Play size={compact ? 18 : 21} className="ml-0.5" />}
        </button>
        <button className="icon-button" type="button" onClick={nextTrack} disabled={!currentTrack} title="Next">
          <SkipForward size={compact ? 18 : 20} />
        </button>
      </div>
      <div className="grid grid-cols-[42px_minmax(0,1fr)_42px] items-center gap-2">
        <span className="text-right text-xs text-neutral-500">{formatTime(progress)}</span>
        <input
          aria-label="Seek"
          type="range"
          min="0"
          max={duration || 0}
          step="1"
          value={Math.min(progress, duration || 0)}
          onChange={(event) => seek(event.target.value)}
          disabled={!currentTrack}
          className="h-2 w-full"
        />
        <span className="text-xs text-neutral-500">{formatTime(duration)}</span>
      </div>
    </div>
  );
}

function QueuePanel({ onClose }) {
  const { currentIndex, currentTrack, moveQueueItem, playQueue, queue, removeFromQueue } = usePlayer();

  return (
    <section className="rounded-lg border border-ink-700 bg-ink-900 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Queue</h3>
          <p className="text-xs text-neutral-500">{queue.length} {queue.length === 1 ? "song" : "songs"}</p>
        </div>
        {onClose ? (
          <button className="icon-button" type="button" onClick={onClose} title="Close queue">
            <ChevronDown size={18} />
          </button>
        ) : null}
      </div>
      {queue.length ? (
        <div className="max-h-[50vh] space-y-2 overflow-auto pr-1">
          {queue.map((track, index) => {
            const active = currentTrack?.id === track.id && currentIndex === index;

            return (
              <div
                key={`${track.id}-${index}`}
                className={`grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-3 py-2 ${
                  active ? "border-accent/40 bg-accent/10" : "border-ink-700 bg-ink-950"
                }`}
              >
                <button className="min-w-0 text-left" type="button" onClick={() => playQueue(queue, index)}>
                  <p className={`truncate text-sm font-semibold ${active ? "text-accent" : "text-white"}`}>{track.title}</p>
                  <p className="truncate text-xs text-neutral-500">{track.artist?.username || "Unknown artist"}</p>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    className="icon-button h-8 w-8"
                    type="button"
                    onClick={() => moveQueueItem(index, index - 1)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    className="icon-button h-8 w-8"
                    type="button"
                    onClick={() => moveQueueItem(index, index + 1)}
                    disabled={index === queue.length - 1}
                    title="Move down"
                  >
                    <ChevronDown size={15} />
                  </button>
                  <button className="icon-button h-8 w-8" type="button" onClick={() => removeFromQueue(track.id)} title="Remove from queue">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-md border border-ink-700 bg-ink-950 p-4 text-sm text-neutral-500">Start playing songs to build a queue.</p>
      )}
    </section>
  );
}

export default function PlayerBar() {
  const { changeVolume, currentTrack, volume } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink-700 bg-ink-900 px-4 py-3 md:left-64">
        <div className="grid min-h-16 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(320px,520px)_minmax(180px,1fr)] md:items-center">
          <button className="flex min-w-0 items-center gap-3 text-left md:cursor-default" type="button" onClick={() => setExpanded(true)}>
            {currentTrack ? <Artwork title={currentTrack.title} size="sm" /> : <div className="h-12 w-12 rounded-md border border-ink-700 bg-ink-850" />}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{currentTrack?.title || "No track selected"}</p>
              <p className="truncate text-xs text-neutral-500">{currentTrack?.artist?.username || "Ready to play"}</p>
            </div>
          </button>

          <PlayerControls compact />

          <div className="hidden items-center justify-end gap-3 md:flex">
            <button className="icon-button" type="button" onClick={() => setQueueOpen((value) => !value)} title="Queue">
              <ListMusic size={18} />
            </button>
            <Volume2 size={18} className="text-neutral-500" />
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => changeVolume(event.target.value)}
              className="h-2 w-32"
            />
          </div>
        </div>
        {queueOpen ? (
          <div className="absolute bottom-full right-4 mb-3 hidden w-96 md:block">
            <QueuePanel onClose={() => setQueueOpen(false)} />
          </div>
        ) : null}
      </footer>

      {expanded ? (
        <div className="fixed inset-0 z-50 bg-ink-950 p-4 md:hidden">
          <div className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Now playing</p>
                <p className="text-xs text-neutral-500">{currentTrack?.artist?.username || "Ready"}</p>
              </div>
              <button className="icon-button" type="button" onClick={() => setExpanded(false)} title="Collapse player">
                <ChevronDown size={20} />
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-center">
              <div className="mx-auto w-full max-w-xs">
                {currentTrack ? <Artwork title={currentTrack.title} size="card" /> : <div className="aspect-square rounded-lg border border-ink-700 bg-ink-900" />}
              </div>
              <div className="mt-6 text-center">
                <h2 className="truncate text-2xl font-bold text-white">{currentTrack?.title || "No track selected"}</h2>
                <p className="mt-2 truncate text-sm text-neutral-500">{currentTrack?.artist?.username || "Choose a song to start"}</p>
              </div>
              <div className="mt-8">
                <PlayerControls />
              </div>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Volume2 size={18} className="text-neutral-500" />
                <input
                  aria-label="Volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(event) => changeVolume(event.target.value)}
                  className="h-2 w-44"
                />
                <button className="icon-button" type="button" onClick={() => setQueueOpen((value) => !value)} title="Queue">
                  <ListMusic size={18} />
                </button>
              </div>
            </div>

            {queueOpen ? <QueuePanel onClose={() => setQueueOpen(false)} /> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
