const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { message: text };
  }
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    headers: isFormData
      ? options.headers
      : {
          "Content-Type": "application/json",
          ...options.headers,
        },
    body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function requestWithUploadProgress(path, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startedAt = Date.now();

    xhr.open("POST", `${API_URL}${path}`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
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
    };

    xhr.onload = () => {
      let data = {};

      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch (error) {
        data = { message: xhr.responseText };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }

      reject(new Error(data.message || "Request failed"));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    xhr.send(formData);
  });
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
