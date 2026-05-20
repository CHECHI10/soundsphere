const albumModel = require("../models/album.model");
const musicModel = require("../models/music.model");
const userModel = require("../models/user.model");
const { serializeAlbum, serializeArtist, serializeMusic } = require("../utils/serializers");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function search(req, res) {
  const q = String(req.query.q || "").trim();

  if (!q) {
    return res.status(200).json({
      message: "Search results fetched successfully",
      results: {
        songs: [],
        albums: [],
        artists: [],
      },
    });
  }

  const regex = new RegExp(escapeRegex(q), "i");
  const [songs, albums, artists] = await Promise.all([
    musicModel.find({ title: regex }).limit(20).populate("artist", "username email role"),
    albumModel
      .find({ title: regex })
      .limit(20)
      .populate("artist", "username email role")
      .populate({
        path: "musics",
        populate: { path: "artist", select: "username email role" },
      }),
    userModel.find({ role: "artist", username: regex }).limit(20).select("username email role"),
  ]);

  res.status(200).json({
    message: "Search results fetched successfully",
    results: {
      songs: songs.map(serializeMusic),
      albums: albums.map(serializeAlbum),
      artists: artists.map(serializeArtist),
    },
  });
}

function wrap(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { search: wrap(search) };
