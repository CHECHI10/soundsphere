const mongoose = require("mongoose");

const uploadHistorySchema = new mongoose.Schema(
  {
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    music: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Music",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    errorMessage: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 0,
    },
    genre: {
      type: String,
      default: "",
      trim: true,
    },
    mood: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

uploadHistorySchema.index({ artist: 1, createdAt: -1 });

const uploadHistoryModel = mongoose.model("UploadHistory", uploadHistorySchema);

module.exports = uploadHistoryModel;
