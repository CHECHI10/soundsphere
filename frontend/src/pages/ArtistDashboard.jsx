import { Check, Clock3, Plus, RefreshCw, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { musicApi } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatTime } from "../utils/format.js";

function formatEta(seconds) {
  if (!Number.isFinite(seconds) || seconds < 1) {
    return "less than 1s";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function readAudioDuration(file) {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(0);
    };
    audio.src = objectUrl;
  });
}

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [musicFile, setMusicFile] = useState(null);
  const [uploadDuration, setUploadDuration] = useState(0);
  const [uploadGenre, setUploadGenre] = useState("");
  const [uploadMood, setUploadMood] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [submittingUpload, setSubmittingUpload] = useState(false);
  const [submittingAlbum, setSubmittingAlbum] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(null);

  const loadArtistData = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const [trackData, albumData, uploadData] = await Promise.all([
        musicApi.listMyMusics(),
        musicApi.listMyAlbums(),
        musicApi.listMyUploads(),
      ]);
      setTracks(trackData.musics || []);
      setAlbums(albumData.albums || []);
      setUploads(uploadData.uploads || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "artist") {
      loadArtistData();
    }
  }, [loadArtistData, user?.role]);

  if (user?.role !== "artist") {
    return (
      <div className="mx-auto max-w-3xl panel p-6">
        <h1 className="text-2xl font-bold text-white">Artist access required</h1>
        <p className="mt-2 text-sm text-neutral-400">This area is available for artist accounts.</p>
      </div>
    );
  }

  async function handleFileChange(file) {
    setMusicFile(file);
    setUploadDuration(0);

    if (file) {
      const duration = await readAudioDuration(file);
      setUploadDuration(duration);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmittingUpload(true);
    setUploadProgress({
      percent: 0,
      etaSeconds: null,
      phase: "uploading",
    });

    try {
      if (!musicFile) {
        throw new Error("Audio file is required");
      }

      const formData = new FormData();
      formData.append("title", uploadTitle);
      formData.append("music", musicFile);
      formData.append("duration", String(uploadDuration));
      formData.append("genre", uploadGenre);
      formData.append("mood", uploadMood);
      await musicApi.uploadMusicWithProgress(formData, setUploadProgress);
      setUploadTitle("");
      setMusicFile(null);
      setUploadDuration(0);
      setUploadGenre("");
      setUploadMood("");
      setFileInputKey((value) => value + 1);
      setMessage("Track uploaded.");
      await loadArtistData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmittingUpload(false);
      setUploadProgress(null);
    }
  }

  async function handleCreateAlbum(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmittingAlbum(true);

    try {
      await musicApi.createAlbum({
        title: albumTitle,
        musics: selectedTracks,
      });
      setAlbumTitle("");
      setSelectedTracks([]);
      setMessage("Album created.");
      await loadArtistData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmittingAlbum(false);
    }
  }

  function toggleTrack(trackId) {
    setSelectedTracks((current) =>
      current.includes(trackId) ? current.filter((id) => id !== trackId) : [...current, trackId]
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Artist</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Dashboard</h1>
        </div>
        <button className="btn-secondary" type="button" onClick={loadArtistData}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error ? <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
      {message ? <p className="mb-6 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-[#c9f7db]">{message}</p> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="panel p-5">
          <div className="mb-5 flex items-center gap-2">
            <UploadCloud size={19} className="text-neutral-500" />
            <h2 className="text-lg font-semibold text-white">Upload track</h2>
          </div>
          <form className="space-y-4" onSubmit={handleUpload}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-300">Track title</span>
              <input className="field" value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-300">Audio file</span>
              <input
                key={fileInputKey}
                className="block w-full rounded-md border border-ink-700 bg-ink-950 text-sm text-neutral-300 file:mr-4 file:h-11 file:border-0 file:bg-ink-800 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-ink-700"
                type="file"
                accept="audio/*"
                onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
                required
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-300">Genre</span>
                <input className="field" value={uploadGenre} onChange={(event) => setUploadGenre(event.target.value)} placeholder="Optional" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-300">Mood</span>
                <input className="field" value={uploadMood} onChange={(event) => setUploadMood(event.target.value)} placeholder="Optional" />
              </label>
            </div>
            {musicFile ? (
              <p className="rounded-md border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-neutral-400">
                Detected duration: <span className="font-semibold text-white">{formatTime(uploadDuration)}</span>
              </p>
            ) : null}
            {submittingUpload && uploadProgress ? (
              <div className="rounded-md border border-ink-700 bg-ink-950 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-white">
                    {uploadProgress.phase === "processing" ? "Processing upload" : "Please wait, song is uploading"}
                  </span>
                  <span className="text-neutral-400">{uploadProgress.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${Math.min(uploadProgress.percent, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  {uploadProgress.phase === "processing"
                    ? "File sent. Waiting for the server to finish saving it."
                    : uploadProgress.etaSeconds !== null
                      ? `Estimated time remaining: ${formatEta(uploadProgress.etaSeconds)}`
                      : "Estimating time remaining"}
                </p>
              </div>
            ) : null}
            <button className="btn-primary w-full" type="submit" disabled={submittingUpload}>
              <UploadCloud size={16} />
              {submittingUpload ? "Uploading" : "Upload"}
            </button>
          </form>
        </section>

        <section className="panel p-5">
          <div className="mb-5 flex items-center gap-2">
            <Plus size={19} className="text-neutral-500" />
            <h2 className="text-lg font-semibold text-white">Create album</h2>
          </div>
          <form className="space-y-4" onSubmit={handleCreateAlbum}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-300">Album title</span>
              <input className="field" value={albumTitle} onChange={(event) => setAlbumTitle(event.target.value)} required />
            </label>
            <div>
              <span className="mb-2 block text-sm font-medium text-neutral-300">Tracks</span>
              <div className="max-h-60 space-y-2 overflow-auto rounded-md border border-ink-700 bg-ink-950 p-2">
                {tracks.length ? (
                  tracks.map((track) => (
                    <label
                      key={track.id}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm text-neutral-300 hover:bg-ink-800"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTracks.includes(track.id)}
                        onChange={() => toggleTrack(track.id)}
                        className="h-4 w-4 accent-accent"
                      />
                      <span className="min-w-0 flex-1 truncate">{track.title}</span>
                      {selectedTracks.includes(track.id) ? <Check size={15} className="text-accent" /> : null}
                    </label>
                  ))
                ) : (
                  <p className="px-2 py-4 text-sm text-neutral-500">No uploaded tracks yet.</p>
                )}
              </div>
            </div>
            <button className="btn-primary w-full" type="submit" disabled={submittingAlbum || !selectedTracks.length}>
              <Plus size={16} />
              {submittingAlbum ? "Creating" : "Create album"}
            </button>
          </form>
        </section>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">Your tracks</h2>
          {loading ? (
            <div className="panel p-6 text-sm text-neutral-400">Loading tracks</div>
          ) : tracks.length ? (
            <div className="space-y-1">
              {tracks.map((track, index) => (
                <TrackRow key={track.id} track={track} queue={tracks} index={index} />
              ))}
            </div>
          ) : (
            <div className="panel p-6 text-sm text-neutral-400">No tracks uploaded.</div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">Your albums</h2>
          {loading ? (
            <div className="panel p-6 text-sm text-neutral-400">Loading albums</div>
          ) : albums.length ? (
            <div className="space-y-3">
              {albums.map((album) => (
                <article key={album.id} className="rounded-lg border border-ink-700 bg-ink-900 p-4">
                  <h3 className="truncate text-sm font-semibold text-white">{album.title}</h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    {(album.musics || []).length} {(album.musics || []).length === 1 ? "track" : "tracks"}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="panel p-6 text-sm text-neutral-400">No albums created.</div>
          )}
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 size={19} className="text-neutral-500" />
          <h2 className="text-xl font-semibold text-white">Upload history</h2>
        </div>
        {loading ? (
          <div className="panel p-6 text-sm text-neutral-400">Loading uploads</div>
        ) : uploads.length ? (
          <div className="space-y-3">
            {uploads.map((upload) => (
              <article key={upload.id} className="grid gap-3 rounded-lg border border-ink-700 bg-ink-900 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-white">{upload.title}</h3>
                  <p className="mt-1 truncate text-xs text-neutral-500">
                    {[upload.fileName, upload.genre, upload.mood, upload.duration ? formatTime(upload.duration) : ""]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                  {upload.errorMessage ? <p className="mt-2 text-xs text-red-200">{upload.errorMessage}</p> : null}
                </div>
                <span
                  className={`inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-semibold ${
                    upload.status === "completed"
                      ? "border-accent/30 bg-accent/10 text-[#c9f7db]"
                      : upload.status === "failed"
                        ? "border-red-500/30 bg-red-500/10 text-red-200"
                        : "border-ink-700 bg-ink-950 text-neutral-300"
                  }`}
                >
                  {upload.status}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No upload history yet" description="Uploaded tracks and failed attempts will appear here." />
        )}
      </section>
    </div>
  );
}
