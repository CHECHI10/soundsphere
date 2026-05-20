const mongoose = require("mongoose");

const likedSongSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    music: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Music",
      required: true,
    },
  },
  { timestamps: true }
);

likedSongSchema.index({ user: 1, music: 1 }, { unique: true });

const likedSongModel = mongoose.model("LikedSong", likedSongSchema);

module.exports = likedSongModel;
