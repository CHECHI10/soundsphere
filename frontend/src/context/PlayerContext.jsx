import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { libraryApi } from "../api/client.js";

const PlayerContext = createContext(null);
const PLAYER_STORAGE_KEY = "soundSphere-player-state";

function loadStoredPlayer() {
  try {
    const stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) || "{}");

    return {
      currentIndex: Number.isInteger(stored.currentIndex) ? stored.currentIndex : -1,
      currentTrack: stored.currentTrack || null,
      queue: Array.isArray(stored.queue) ? stored.queue : [],
      volume: typeof stored.volume === "number" ? stored.volume : 0.8,
    };
  } catch (error) {
    return {
      currentIndex: -1,
      currentTrack: null,
      queue: [],
      volume: 0.8,
    };
  }
}

function moveItem(items, fromIndex, toIndex) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

export function PlayerProvider({ children }) {
  const storedPlayer = useMemo(loadStoredPlayer, []);
  const audioRef = useRef(null);
  const recordedTrackIdRef = useRef(null);
  const [queue, setQueue] = useState(storedPlayer.queue);
  const [currentIndex, setCurrentIndex] = useState(storedPlayer.currentIndex);
  const [currentTrack, setCurrentTrack] = useState(storedPlayer.currentTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(storedPlayer.volume);

  if (!audioRef.current && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
  }

  useEffect(() => {
    localStorage.setItem(
      PLAYER_STORAGE_KEY,
      JSON.stringify({
        currentIndex,
        currentTrack,
        queue,
        volume,
      })
    );
  }, [currentIndex, currentTrack, queue, volume]);

  const playTrack = useCallback((track, nextQueue = []) => {
    const resolvedQueue = nextQueue.length ? nextQueue : [track];
    const index = Math.max(
      resolvedQueue.findIndex((item) => item.id === track.id),
      0
    );

    setQueue(resolvedQueue);
    setCurrentIndex(index);
    setCurrentTrack(resolvedQueue[index] || track);
    setIsPlaying(true);
  }, []);

  const playQueue = useCallback((nextQueue, index = 0) => {
    if (!nextQueue.length) {
      return;
    }

    const safeIndex = Math.min(Math.max(index, 0), nextQueue.length - 1);
    setQueue(nextQueue);
    setCurrentIndex(safeIndex);
    setCurrentTrack(nextQueue[safeIndex]);
    setIsPlaying(true);
  }, []);

  const nextTrack = useCallback(() => {
    if (!queue.length) {
      setIsPlaying(false);
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      setIsPlaying(false);
      return;
    }

    setCurrentIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
    setIsPlaying(true);
  }, [currentIndex, queue]);

  const previousTrack = useCallback(() => {
    if (!queue.length) {
      return;
    }

    const audio = audioRef.current;

    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }

    const previousIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(previousIndex);
    setCurrentTrack(queue[previousIndex]);
    setIsPlaying(true);
  }, [currentIndex, queue]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      return;
    }

    setIsPlaying((value) => !value);
  }, [currentTrack]);

  const seek = useCallback((value) => {
    const nextTime = Number(value);
    const audio = audioRef.current;

    if (!Number.isFinite(nextTime) || !audio) {
      return;
    }

    audio.currentTime = nextTime;
    setProgress(nextTime);
  }, []);

  const changeVolume = useCallback((value) => {
    const nextVolume = Number(value);

    if (!Number.isFinite(nextVolume)) {
      return;
    }

    const clampedVolume = Math.min(1, Math.max(0, nextVolume));
    const audio = audioRef.current;

    if (audio) {
      audio.volume = clampedVolume;
    }

    setVolume(clampedVolume);
  }, []);

  const removeFromQueue = useCallback(
    (trackId) => {
      setQueue((currentQueue) => {
        const removedIndex = currentQueue.findIndex((track) => track.id === trackId);

        if (removedIndex === -1) {
          return currentQueue;
        }

        const nextQueue = currentQueue.filter((track) => track.id !== trackId);

        setCurrentIndex((index) => {
          if (removedIndex < index) {
            return index - 1;
          }

          if (removedIndex > index) {
            return index;
          }

          if (!nextQueue.length) {
            setCurrentTrack(null);
            setIsPlaying(false);
            return -1;
          }

          const nextIndex = Math.min(index, nextQueue.length - 1);
          setCurrentTrack(nextQueue[nextIndex]);
          return nextIndex;
        });

        return nextQueue;
      });
    },
    []
  );

  const moveQueueItem = useCallback((fromIndex, toIndex) => {
    setQueue((currentQueue) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= currentQueue.length ||
        toIndex >= currentQueue.length
      ) {
        return currentQueue;
      }

      setCurrentIndex((index) => {
        if (index === fromIndex) {
          return toIndex;
        }

        if (fromIndex < index && index <= toIndex) {
          return index - 1;
        }

        if (toIndex <= index && index < fromIndex) {
          return index + 1;
        }

        return index;
      });

      return moveItem(currentQueue, fromIndex, toIndex);
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const handleTimeUpdate = () => setProgress(audio.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => nextTrack();

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [nextTrack]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack?.uri) {
      return;
    }

    if (audio.src !== currentTrack.uri) {
      audio.src = currentTrack.uri;
      audio.load();
      setProgress(0);
      setDuration(currentTrack.duration || 0);
      recordedTrackIdRef.current = null;
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (!currentTrack || !isPlaying || progress < 10 || recordedTrackIdRef.current === currentTrack.id) {
      return;
    }

    recordedTrackIdRef.current = currentTrack.id;
    libraryApi.recordRecent(currentTrack.id).catch(() => {});
  }, [currentTrack, isPlaying, progress]);

  const value = useMemo(
    () => ({
      changeVolume,
      currentIndex,
      currentTrack,
      duration,
      isPlaying,
      moveQueueItem,
      nextTrack,
      playQueue,
      playTrack,
      previousTrack,
      progress,
      queue,
      removeFromQueue,
      seek,
      togglePlay,
      volume,
    }),
    [
      changeVolume,
      currentIndex,
      currentTrack,
      duration,
      isPlaying,
      moveQueueItem,
      nextTrack,
      playQueue,
      playTrack,
      previousTrack,
      progress,
      queue,
      removeFromQueue,
      seek,
      togglePlay,
      volume,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used inside PlayerProvider");
  }

  return context;
}
