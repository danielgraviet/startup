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
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
}

// Main setup
(async () => {
  await initializeDb(); // Wait for db to be ready

  console.log('DB initialized:', !!db); // Debug: confirm db is set

  const userCollection = () => {
    if (!db) throw new Error('Database not initialized');
    return db.collection('users');
  };

  async function addUser(username, password) {
    console.log('Starting addUser'); // Debug
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
      createdAt: new Date(),
    };

    try {
      const result = await userCollection().insertOne(user);
      console.log('User inserted'); // Debug
      return result.insertedId;
    } catch (error) {
      throw new Error(`Failed to add user: ${error.message}`);
    }
  }

  // Test
  try {
    console.log('Running test');
    const userId = await addUser('testuser', 'mypassword123');
    console.log(`Added user with ID: ${userId}`);
  } catch (error) {
    console.error(`Error adding user: ${error.message}`);
  } finally {
    await client.close();
  }

  module.exports = { addUser };
})();