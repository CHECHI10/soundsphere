const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model");
const uploadHistoryModel = require("../models/upload-history.model");
const { uploadFile } = require("../services/storage.service");
const { serializeAlbum, serializeMusic, serializeUpload } = require("../utils/serializers");
const mongoose = require('mongoose');

async function createMusic(req, res) {
  const title = String(req.body.title || "").trim();
  const duration = Math.max(Number(req.body.duration) || 0, 0);
  const genre = String(req.body.genre || "").trim();
  const mood = String(req.body.mood || "").trim();
  const file = req.file;
  let uploadHistory = null;

  if (!title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  if (!file || !file.buffer) {
    return res.status(400).json({
      message: "Music file is required",
    });
  }

  uploadHistory = await uploadHistoryModel.create({
    title,
    artist: req.user.id,
    fileName: file.originalname || "",
    duration,
    genre,
    mood,
  });

  try {
    const result = await uploadFile(file.buffer.toString("base64"));

    const newMusic = await musicModel.create({
      uri: result.url,
      title,
      artist: req.user.id,
      duration,
      genre,
      mood,
    });

    uploadHistory.status = "completed";
    uploadHistory.music = newMusic._id;
    await uploadHistory.save();

    await newMusic.populate("artist", "username email");

    res.status(201).json({
      message: "Music created successfully",
      music: serializeMusic(newMusic),
    });
  } catch (error) {
    uploadHistory.status = "failed";
    uploadHistory.errorMessage = error.message || "Upload failed";
    await uploadHistory.save();

    res.status(500).json({
      message: "Music upload failed",
    });
  }
}

async function createAlbum(req, res) {
  const title = String(req.body.title || "").trim();
  const musics = Array.isArray(req.body.musics) ? req.body.musics : [];

  if (!title) {
    return res.status(400).json({
      message: "Album title is required",
    });
  }

  if (!musics.length) {
    return res.status(400).json({
      message: "Select at least one music track",
    });
  }

  const invalidIds = musics.filter((musicId) => !mongoose.Types.ObjectId.isValid(musicId));

  if (invalidIds.length) {
    return res.status(400).json({
      message: "Invalid music id",
    });
  }

  const ownedMusics = await musicModel.find({
    _id: { $in: musics },
    artist: req.user.id,
  });

  if (ownedMusics.length !== musics.length) {
    return res.status(400).json({
      message: "Albums can only include your uploaded tracks",
    });
  }

  const album = await albumModel.create({
    title,
    musics,
    artist: req.user.id,
  });

  await album.populate("artist", "username email");
  await album.populate({
    path: "musics",
    populate: { path: "artist", select: "username email" },
  });

  res.status(201).json({
    message: "Album created successfully",
    album: serializeAlbum(album),
  });
}

async function getAllMusics(req, res) {
  const musics = await musicModel.find().populate("artist", "username email");

  res.status(200).json({
    message: "Musics fetched successfully",
    musics: musics.map(serializeMusic),
  });
}

async function getAllAlbums(req, res) {
  const albums = await albumModel.find().populate("artist", "username email").populate({
    path: "musics",
    populate: { path: "artist", select: "username email" },
  });

  res.status(200).json({
    message: "Albums fetched successfully",
    albums: albums.map(serializeAlbum),
  });
}

async function getAlbumById(req, res) {
  const { albumId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    return res.status(400).json({
      message: "Invalid album id",
    });
  }

  const album = await albumModel.findById(albumId).populate("artist", "username email").populate({
    path: "musics",
    populate: { path: "artist", select: "username email" },
  });

  if (!album) {
    return res.status(404).json({
      message: "Album not found",
    });
  }

  res.status(200).json({
    message: "Album fetched successfully",
    album: serializeAlbum(album),
  });
}

async function getMyMusics(req, res) {
  const musics = await musicModel.find({ artist: req.user.id }).populate("artist", "username email");

  res.status(200).json({
    message: "Artist musics fetched successfully",
    musics: musics.map(serializeMusic),
  });
}

async function getMyAlbums(req, res) {
  const albums = await albumModel
    .find({ artist: req.user.id })
    .populate("artist", "username email")
    .populate({
      path: "musics",
      populate: { path: "artist", select: "username email" },
    });

  res.status(200).json({
    message: "Artist albums fetched successfully",
    albums: albums.map(serializeAlbum),
  });
}

async function getMyUploads(req, res) {
  const uploads = await uploadHistoryModel
    .find({ artist: req.user.id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate({
      path: "music",
      populate: { path: "artist", select: "username email role" },
    });

  res.status(200).json({
    message: "Upload history fetched successfully",
    uploads: uploads.map(serializeUpload),
  });
}

module.exports = {
  createMusic,
  createAlbum,
  getAllMusics,
  getAllAlbums,
  getAlbumById,
  getMyMusics,
  getMyAlbums,
  getMyUploads,
};
