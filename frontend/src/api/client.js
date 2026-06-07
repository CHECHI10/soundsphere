import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

function getErrorMessage(error) {
  if (error.code === "ERR_CANCELED") {
    return "Upload cancelled";
  }

  const responseMessage = error.response?.data?.message || error.response?.data?.error;

  if (responseMessage) {
    return responseMessage;
  }

  if (typeof error.response?.data === "string") {
    return error.response.data;
  }

  return error.message || "Request failed";
}

function normalizeError(error) {
  return new Error(getErrorMessage(error));
}

async function request(path, options = {}) {
  try {
    const response = await apiClient.request({
      url: path,
      method: options.method || "GET",
      data: options.body,
      headers: options.headers,
    });

    return response.data || {};
  } catch (error) {
    throw normalizeError(error);
  }
}

function requestWithUploadProgress(path, formData, onProgress) {
  const controller = new AbortController();
  const startedAt = Date.now();

  const promise = apiClient
    .post(path, formData, {
      signal: controller.signal,
      onUploadProgress: (event) => {
        if (!event.total) {
          onProgress?.({
            percent: 0,
            loaded: event.loaded,
            total: 0,
            etaSeconds: null,
            phase: "uploading",
          });
          return;
        }

        const elapsedSeconds = Math.max((Date.now() - startedAt) / 1000, 0.1);
        const bytesPerSecond = event.loaded / elapsedSeconds;
        const remainingBytes = Math.max(event.total - event.loaded, 0);
        const etaSeconds = bytesPerSecond > 0 ? Math.ceil(remainingBytes / bytesPerSecond) : null;

        onProgress?.({
          percent: Math.round((event.loaded / event.total) * 100),
          loaded: event.loaded,
          total: event.total,
          etaSeconds,
          phase: event.loaded >= event.total ? "processing" : "uploading",
        });
      },
    })
    .then((response) => response.data || {})
    .catch((error) => {
      throw normalizeError(error);
    });

  promise.cancel = () => {
    controller.abort();
  };

  return promise;
}

export const authApi = {
  me: () => request("/auth/me"),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),
};

export const musicApi = {
  listMusics: () => request("/music"),
  listAlbums: () => request("/music/albums"),
  getAlbum: (albumId) => request(`/music/albums/${albumId}`),
  uploadMusic: (formData) => request("/music/upload", { method: "POST", body: formData }),
  uploadMusicWithProgress: (formData, onProgress) => requestWithUploadProgress("/music/upload", formData, onProgress),
  createAlbum: (payload) => request("/music/album", { method: "POST", body: payload }),
  listMyMusics: () => request("/music/mine"),
  listMyAlbums: () => request("/music/albums/mine"),
  listMyUploads: () => request("/music/uploads/mine"),
};

export const playlistApi = {
  list: () => request("/playlists"),
  create: (payload) => request("/playlists", { method: "POST", body: payload }),
  get: (playlistId) => request(`/playlists/${playlistId}`),
  rename: (playlistId, payload) => request(`/playlists/${playlistId}`, { method: "PATCH", body: payload }),
  remove: (playlistId) => request(`/playlists/${playlistId}`, { method: "DELETE" }),
  addMusic: (playlistId, musicId) =>
    request(`/playlists/${playlistId}/musics`, { method: "POST", body: { musicId } }),
  removeMusic: (playlistId, musicId) => request(`/playlists/${playlistId}/musics/${musicId}`, { method: "DELETE" }),
  reorder: (playlistId, musics) => request(`/playlists/${playlistId}/reorder`, { method: "PATCH", body: { musics } }),
};

export const libraryApi = {
  likedSongs: () => request("/library/likes"),
  toggleLikedSong: (musicId) => request(`/library/likes/${musicId}/toggle`, { method: "POST" }),
  recent: () => request("/library/recent"),
  recordRecent: (musicId) => request("/library/recent", { method: "POST", body: { musicId } }),
};

export const searchApi = {
  search: (query) => request(`/search?q=${encodeURIComponent(query)}`),
};

export const artistApi = {
  get: (artistId) => request(`/artists/${artistId}`),
};
