require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  // connect mongoose
  await mongoose.connect(process.env.MONGO_URI);

  // ensure test DB is cleared before each test file
  const clearDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  };

  // expose a global helper to clear DB
  global.__clearDB = clearDB;

  // teardown after all tests
  const stop = async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  };

  process.on('SIGINT', stop);
  process.on('exit', stop);
  process.on('SIGTERM', stop);
})();
