const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports.setupDB = () => {
  // Start in-memory MongoDB before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // Clear all collections between tests
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  // Stop in-memory MongoDB and disconnect after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
};
