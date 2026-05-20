const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  uri: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
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
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true })

const musicModel = mongoose.model('Music', musicSchema);

module.exports = musicModel;
