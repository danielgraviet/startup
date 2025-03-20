const { MongoClient, ObjectId } = require('mongodb');
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

  const messageCollection = () => {
    if (!db) throw new Error('Database not initialized');
    return db.collection('messages');
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

  // delete channel by id
  async function deleteChannelById(channelId) {
    console.log(`Deleting channel from DB with ID: ${channelId}`);
    try {
      const result = await channelCollection().deleteOne({
        _id: new ObjectId(channelId),
      });
      console.log(`DB delete result: ${result.deletedCount}`);
      return result.deletedCount > 0;
    } catch (err) {
      console.error('Error in deleteChannel:', err.stack);
      throw err;
    }
  }

  // message collection methods
  // add a message to a channel
  async function addMessage(channelId, content, sender) {
    if (!channelId || !content || !sender) {
      throw new Error('Channel ID, content, and sender are required');
    }

    // verify the channel exists
    const channel = await channelCollection().findOne({ _id: new ObjectId(channelId) });
    if (!channel) {
      throw new Error('Channel not found');
    }

    const message = {
      channelId: new ObjectId(channelId),
      content,
      sender,
      createdAt: new Date(),
    }

    const result = await messageCollection().insertOne(message);
    return {id: result.insertedId, ...message};
  }

  // get all messages from a channel
  async function getMessagesByChannel(channelId) {
    if (!channelId) {
      throw new Error('Channel ID is required');
    }
    let queryId;
    try {
      queryId = new ObjectId(channelId);
    } catch (e) {
      console.log(`Invalid ObjectId: ${channelId}, treating as string`);
      queryId = channelId;
    }
    const messages = await messageCollection()
      .find({ channelId: queryId })
      .sort({ createdAt: 1 })
      .toArray();
    console.log(`Found ${messages.length} messages`);
    console.log(`Raw messages: ${JSON.stringify(messages)}`); // Add this
    return messages.map(msg => ({
      id: msg._id.toString(),
      content: msg.content,
      sender: msg.sender,
      createdAt: msg.createdAt.toISOString(),
    }));
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
    deleteChannelById,
    addMessage,
    getMessagesByChannel,
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