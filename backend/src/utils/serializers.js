function toId(value) {
  if (!value) {
    return value;
  }

  if (value._id) {
    return value._id.toString();
  }

  if (value.id) {
    return value.id.toString();
  }

  return value.toString();
}

function serializeArtist(artist) {
  if (!artist || typeof artist !== "object") {
    return artist;
  }

  if (!artist.username && typeof artist.toString === "function") {
    return artist.toString();
  }

  return {
    id: toId(artist),
    username: artist.username,
    email: artist.email,
    role: artist.role,
  };
}

function serializeUser(user) {
  if (!user || typeof user !== 'object') return user;

  return {
    id: toId(user),
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

function serializeMusic(music) {
  if (!music || typeof music !== "object") {
    return music;
  }

  return {
    id: toId(music),
    uri: music.uri,
    title: music.title,
    artist: serializeArtist(music.artist),
    duration: music.duration || 0,
    genre: music.genre || "",
    mood: music.mood || "",
    createdAt: music.createdAt,
  };
}

function serializeAlbum(album) {
  return {
    id: toId(album),
    title: album.title,
    artist: serializeArtist(album.artist),
    musics: Array.isArray(album.musics) ? album.musics.map(serializeMusic) : album.musics,
    createdAt: album.createdAt,
  };
}

function serializePlaylist(playlist) {
  return {
    id: toId(playlist),
    name: playlist.name,
    owner: serializeArtist(playlist.owner),
    musics: Array.isArray(playlist.musics) ? playlist.musics.map(serializeMusic) : playlist.musics,
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
  };
}

function serializeUpload(upload) {
  return {
    id: toId(upload),
    title: upload.title,
    fileName: upload.fileName,
    status: upload.status,
    errorMessage: upload.errorMessage || "",
    duration: upload.duration || 0,
    genre: upload.genre || "",
    mood: upload.mood || "",
    music: upload.music ? serializeMusic(upload.music) : null,
    createdAt: upload.createdAt,
    updatedAt: upload.updatedAt,
  };
}

module.exports = {
  serializeAlbum,
  serializeArtist,
  serializeUser,
  serializeMusic,
  serializePlaylist,
  serializeUpload,
  toId,
};
