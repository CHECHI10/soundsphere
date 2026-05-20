const mongoose = require("mongoose");
const playlistModel = require("../models/playlist.model");
const musicModel = require("../models/music.model");
const { serializePlaylist } = require("../utils/serializers");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function populatePlaylist(query) {
  if (!query) {
    return null;
  }

  return query
    .populate("owner", "username email role")
    .populate({
      path: "musics",
      populate: { path: "artist", select: "username email role" },
    });
}

function findOwnedPlaylist(playlistId, userId) {
  if (!isValidId(playlistId)) {
    return null;
  }

  return playlistModel.findOne({ _id: playlistId, owner: userId });
}

async function listPlaylists(req, res) {
  const playlists = await populatePlaylist(
    playlistModel.find({ owner: req.user.id }).sort({ updatedAt: -1 })
  );

  res.status(200).json({
    message: "Playlists fetched successfully",
    playlists: playlists.map(serializePlaylist),
  });
}

async function createPlaylist(req, res) {
  const name = String(req.body.name || "").trim();

  if (!name) {
    return res.status(400).json({
      message: "Playlist name is required",
    });
  }

  const playlist = await playlistModel.create({
    name,
    owner: req.user.id,
    musics: [],
  });

  await playlist.populate("owner", "username email role");

  res.status(201).json({
    message: "Playlist created successfully",
    playlist: serializePlaylist(playlist),
  });
}

async function getPlaylistById(req, res) {
  const playlist = await populatePlaylist(findOwnedPlaylist(req.params.playlistId, req.user.id));

  if (!playlist) {
    return res.status(404).json({
      message: "Playlist not found",
    });
  }

  res.status(200).json({
    message: "Playlist fetched successfully",
    playlist: serializePlaylist(playlist),
  });
}

async function renamePlaylist(req, res) {
  const name = String(req.body.name || "").trim();

  if (!name) {
    return res.status(400).json({
      message: "Playlist name is required",
    });
  }

  const playlist = await findOwnedPlaylist(req.params.playlistId, req.user.id);

  if (!playlist) {
    return res.status(404).json({
      message: "Playlist not found",
    });
  }

  playlist.name = name;
  await playlist.save();
  await playlist.populate("owner", "username email role");
  await playlist.populate({
    path: "musics",
    populate: { path: "artist", select: "username email role" },
  });

  res.status(200).json({
    message: "Playlist renamed successfully",
    playlist: serializePlaylist(playlist),
  });
}

async function deletePlaylist(req, res) {
  const playlist = await findOwnedPlaylist(req.params.playlistId, req.user.id);

  if (!playlist) {
    return res.status(404).json({
      message: "Playlist not found",
    });
  }

  await playlist.deleteOne();

  res.status(200).json({
    message: "Playlist deleted successfully",
  });
}

async function addMusicToPlaylist(req, res) {
  const musicId = req.body.musicId || req.params.musicId;

  if (!isValidId(musicId)) {
    return res.status(400).json({
      message: "Invalid music id",
    });
  }

  const [playlist, music] = await Promise.all([
    findOwnedPlaylist(req.params.playlistId, req.user.id),
    musicModel.findById(musicId),
  ]);

  if (!playlist) {
    return res.status(404).json({
      message: "Playlist not found",
    });
  }

  if (!music) {
    return res.status(404).json({
      message: "Music not found",
    });
  }

  const alreadyAdded = playlist.musics.some((item) => item.toString() === musicId);

  if (!alreadyAdded) {
    playlist.musics.push(music._id);
    await playlist.save();
  }

  await playlist.populate("owner", "username email role");
  await playlist.populate({
    path: "musics",
    populate: { path: "artist", select: "username email role" },
  });

  res.status(200).json({
    message: alreadyAdded ? "Music already in playlist" : "Music added to playlist",
    playlist: serializePlaylist(playlist),
  });
}

async function removeMusicFromPlaylist(req, res) {
  const { musicId } = req.params;

  if (!isValidId(musicId)) {
    return res.status(400).json({
      message: "Invalid music id",
    });
  }

  const playlist = await findOwnedPlaylist(req.params.playlistId, req.user.id);

  if (!playlist) {
    return res.status(404).json({
      message: "Playlist not found",
    });
  }

  playlist.musics = playlist.musics.filter((item) => item.toString() !== musicId);
  await playlist.save();
  await playlist.populate("owner", "username email role");
  await playlist.populate({
    path: "musics",
    populate: { path: "artist", select: "username email role" },
  });

  res.status(200).json({
    message: "Music removed from playlist",
    playlist: serializePlaylist(playlist),
  });
}

async function reorderPlaylist(req, res) {
  const musics = Array.isArray(req.body.musics) ? req.body.musics : [];

  if (!musics.length || musics.some((musicId) => !isValidId(musicId))) {
    return res.status(400).json({
      message: "Valid music ids are required",
    });
  }

  const playlist = await findOwnedPlaylist(req.params.playlistId, req.user.id);

  if (!playlist) {
    return res.status(404).json({
      message: "Playlist not found",
    });
  }

  const existingIds = playlist.musics.map((item) => item.toString()).sort();
  const nextIds = [...musics].map(String).sort();

  if (existingIds.length !== nextIds.length || existingIds.some((id, index) => id !== nextIds[index])) {
    return res.status(400).json({
      message: "Reorder must include the same playlist tracks",
    });
  }

  // ensure stored as ObjectId instances
  playlist.musics = musics.map((id) => mongoose.Types.ObjectId(id));
  await playlist.save();
  await playlist.populate("owner", "username email role");
  await playlist.populate({
    path: "musics",
    populate: { path: "artist", select: "username email role" },
  });

  res.status(200).json({
    message: "Playlist reordered successfully",
    playlist: serializePlaylist(playlist),
  });
}

// Async wrapper to forward errors to the centralized error handler
function wrap(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  addMusicToPlaylist: wrap(addMusicToPlaylist),
  createPlaylist: wrap(createPlaylist),
  deletePlaylist: wrap(deletePlaylist),
  getPlaylistById: wrap(getPlaylistById),
  listPlaylists: wrap(listPlaylists),
  removeMusicFromPlaylist: wrap(removeMusicFromPlaylist),
  renamePlaylist: wrap(renamePlaylist),
  reorderPlaylist: wrap(reorderPlaylist),
};
