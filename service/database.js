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

  const channelCollection = () => {
    if (!db) throw new Error('Database not initialized');
    return db.collection('channels');
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


  // Channel Collection methods

  // add channel with params of channelName and username(creator)
  async function addChannel(channelName, username) {
    console.log('Starting addChannel');

    // check if channel name is provided
    if (!channelName || !username) {
      console.log('Channel name and username are required', channelName, username);
      throw new Error('Channel name and username are required');
    }

    // check if channel already exists
    const existingChannel = await channelCollection().findOne({ name: channelName });
    if (existingChannel) {
      throw new Error('Channel already exists');
    }

    // how does the members field work? I want to add the creator of the channel to the members array
    const channel = {
      name: channelName,
      description: '',
      members: [username],
      createdAt: new Date(),
    }

    const result = await channelCollection().insertOne(channel);

    console.log('Channel inserted');
    return result.insertedId;    
  }

  // get channel by name
  async function getChannelByName(channelName) {
    return await channelCollection().findOne({ name: channelName }); // what does this return?
  }

  // get all channels
  async function getAllChannels() {
    return await channelCollection().find({}).toArray();
  }

  // Return all methods
  return {
    addUser,
    getUser,
    getUserByToken,
    updateUser,
    addChannel,
    getChannelByName,
    getAllChannels,
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