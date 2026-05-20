require('dotenv').config();
const connectDB = require('../src/db/db');
const mongoose = require('mongoose');
const userModel = require('../src/models/user.model');
const musicModel = require('../src/models/music.model');
const uploadHistoryModel = require('../src/models/upload-history.model');
const bcrypt = require('bcryptjs');

async function run() {
  await connectDB();

  // find or create artist user
  let user = await userModel.findOne({ username: 'artist3' });
  if (!user) {
    const hash = await bcrypt.hash('Password123', 10);
    user = await userModel.create({ username: 'artist3', email: 'artist3@example.com', password: hash, role: 'artist' });
    console.log('Created artist user', user._id.toString());
  }

  const upload = await uploadHistoryModel.create({
    artist: user._id,
    title: 'Scripted Upload',
    fileName: 'script.mp3',
    status: 'processing'
  });

  const newMusic = await musicModel.create({
    uri: 'https://example.com/scripted.mp3',
    title: 'Scripted Track',
    artist: user._id,
    duration: 123
  });

  upload.status = 'completed';
  upload.music = newMusic._id;
  await upload.save();

  console.log('Created uploadHistory', upload._id.toString());
  console.log('Created music', newMusic._id.toString());

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
