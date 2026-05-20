const mongoose = require("mongoose");
const likedSongModel = require("../models/liked-song.model");
const musicModel = require("../models/music.model");
const playHistoryModel = require("../models/play-history.model");
const { serializeMusic } = require("../utils/serializers");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function populateMusic(query) {
  return query.populate({
    path: "music",
    populate: { path: "artist", select: "username email role" },
  });
}

async function getLikedSongs(req, res) {
  const likedSongs = await populateMusic(
    likedSongModel.find({ user: req.user.id }).sort({ createdAt: -1 })
  );

  res.status(200).json({
    message: "Liked songs fetched successfully",
    musics: likedSongs.filter((item) => item.music).map((item) => serializeMusic(item.music)),
  });
}

async function toggleLikedSong(req, res) {
  const { musicId } = req.params;

  if (!isValidId(musicId)) {
    return res.status(400).json({
      message: "Invalid music id",
    });
  }

  const music = await musicModel.findById(musicId).populate("artist", "username email role");

  if (!music) {
    return res.status(404).json({
      message: "Music not found",
    });
  }

  const existingLike = await likedSongModel.findOne({ user: req.user.id, music: musicId });

  if (existingLike) {
    await existingLike.deleteOne();

    return res.status(200).json({
      message: "Song removed from liked songs",
      liked: false,
      music: serializeMusic(music),
    });
  }

  await likedSongModel.create({
    user: req.user.id,
    music: musicId,
  });

  res.status(201).json({
    message: "Song added to liked songs",
    liked: true,
    music: serializeMusic(music),
  });
}

async function getRecentPlays(req, res) {
  const recent = await populateMusic(
    playHistoryModel.find({ user: req.user.id }).sort({ lastPlayedAt: -1 }).limit(30)
  );

  res.status(200).json({
    message: "Recently played fetched successfully",
    history: recent
      .filter((item) => item.music)
      .map((item) => ({
        id: item._id,
        music: serializeMusic(item.music),
        playCount: item.playCount,
        lastPlayedAt: item.lastPlayedAt,
      })),
  });
}

async function recordRecentPlay(req, res) {
  const { musicId } = req.body;

  if (!isValidId(musicId)) {
    return res.status(400).json({
      message: "Invalid music id",
    });
  }

  const music = await musicModel.findById(musicId);

  if (!music) {
    return res.status(404).json({
      message: "Music not found",
    });
  }

  const now = new Date();
  const history = await playHistoryModel.findOneAndUpdate(
    { user: req.user.id, music: musicId },
    {
      $set: { lastPlayedAt: now },
      $inc: { playCount: 1 },
      $setOnInsert: { user: req.user.id, music: musicId },
    },
    { upsert: true, new: true }
  );

  res.status(200).json({
    message: "Play recorded successfully",
    history: {
      id: history._id,
      playCount: history.playCount,
      lastPlayedAt: history.lastPlayedAt,
    },
  });
}

module.exports = {
  getLikedSongs,
  getRecentPlays,
  recordRecentPlay,
  toggleLikedSong,
};
