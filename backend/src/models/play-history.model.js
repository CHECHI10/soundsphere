const mongoose = require("mongoose");

const playHistorySchema = new mongoose.Schema(
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
    playCount: {
      type: Number,
      default: 1,
    },
    lastPlayedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

playHistorySchema.index({ user: 1, music: 1 }, { unique: true });
playHistorySchema.index({ user: 1, lastPlayedAt: -1 });

const playHistoryModel = mongoose.model("PlayHistory", playHistorySchema);

module.exports = playHistoryModel;
