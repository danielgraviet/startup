const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const config = require('./mongoConfig.json');

const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
let db;

async function initializeDb() {
  try {
    await client.connect();
    db = client.db('startup');
    console.log('Connected to database');
    return db;
  } catch (ex) {
    console.error(`Unable to connect to database with ${url} because ${ex.message}`);
    throw ex; // Let the caller handle the error
  }
}

const DBPromise = (async () => {
  await initializeDb(); // Wait for db to be ready

  const userCollection = () => {
    if (!db) throw new Error('Database not initialized');
    return db.collection('users');
  };

  async function addUser(username, password) {
    console.log('Starting addUser');
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const existingUser = await userCollection().findOne({ username });
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      username,
      password: hashedPassword,
      token: null, // Initialize token field
      createdAt: new Date(),
    };

    const result = await userCollection().insertOne(user);
    console.log('User inserted');
    return result.insertedId;
  }

  async function getUser(username) {
    return await userCollection().findOne({ username });
  }

  async function getUserByToken(token) {
    return await userCollection().findOne({ token });
  }

  async function updateUser(username, updates) {
    const result = await userCollection().updateOne(
      { username },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }

  // Return all methods
  return {
    addUser,
    getUser,
    getUserByToken,
    updateUser,
  };
})();

// Optional: Test code (run separately if needed)
async function runTest() {
  try {
    const dbMethods = await DBPromise;
    console.log('Running test');
    const userId = await dbMethods.addUser('testuser', 'mypassword123');
    console.log(`Added user with ID: ${userId}`);
  } catch (error) {
    console.error(`Error adding user: ${error.message}`);
  } finally {
    // Only close if running as a standalone test
    await client.close();
  }
}

// Uncomment to run test manually
// runTest();

module.exports = DBPromise;