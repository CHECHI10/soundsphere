const mongoose = require("mongoose");
const albumModel = require("../models/album.model");
const musicModel = require("../models/music.model");
const userModel = require("../models/user.model");
const { serializeAlbum, serializeArtist, serializeMusic } = require("../utils/serializers");

async function getArtistProfile(req, res) {
  const { artistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    return res.status(400).json({
      message: "Invalid artist id",
    });
  }

  const artist = await userModel.findOne({ _id: artistId, role: "artist" }).select("username email role");

  if (!artist) {
    return res.status(404).json({
      message: "Artist not found",
    });
  }

  const [songs, albums] = await Promise.all([
    musicModel.find({ artist: artistId }).populate("artist", "username email role"),
    albumModel
      .find({ artist: artistId })
      .populate("artist", "username email role")
      .populate({
        path: "musics",
        populate: { path: "artist", select: "username email role" },
      }),
  ]);

  res.status(200).json({
    message: "Artist fetched successfully",
    artist: serializeArtist(artist),
    songs: songs.map(serializeMusic),
    albums: albums.map(serializeAlbum),
  });
}

function wrap(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { getArtistProfile: wrap(getArtistProfile) };
