const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const path = require('path');
const DBPromise = require('./database.js');

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../dist')));

// In-memory data
let users = [];
let channels = [];
let messages = {}; // in-memory storage (replace with database in production)
const authCookieName = 'token';

// API Router
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Helper Functions
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: false, // Change to true in production with HTTPS
    httpOnly: true,
    sameSite: 'strict',
  });
}

async function findUser(field, value) {
  if (!value) return null;
  if (field === 'username') {
    return await DB.getUser(value);
  }

  if (field === 'token') {
    return await DB.getUserByToken(value); // Assumes you add this method in database.js
  }
  return null;
}

async function createUser(username, password) {
  console.log("createUser attempt: ", username, password);
  const token = uuid.v4();
  const userId = await DB.addUser(username, password); // Store in MongoDB with password
  const user = { _id: userId, username, token };
  await DB.updateUser(username, { token }); // Store token in DB
  return user;
}

async function findChannel(name) {
  return await DB.getChannelByName(name);
}

async function createChannel(name, description = '', username) {
  const existingChannel = await findChannel(name);

  if (existingChannel) {
    console.log('Channel already exists');
    return null;
  }

  const channelId = await DB.addChannel(name, username);
  return {id: channelId, name, description, members: [username]};
}

const verifyAuth = async (req, res, next) => {
  const token = req.cookies[authCookieName];
  console.log(`Verifying token: ${token}`); // Add this

  const user = await findUser('token', req.cookies[authCookieName]);
  console.log(`Verifying user: ${user ? user.username : 'No user found'}`); // Add this
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ msg: 'Unauthorized' });
  }
};

// Authentication Endpoints
apiRouter.post('/auth/register', async (req, res) => {
  console.log("register attempt: ", req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password are required' });
  }

  if (await findUser('username', username)) {
    return res.status(409).json({ msg: 'Username already exists' });
  }
  const user = await createUser(username, password);
  setAuthCookie(res, user.token);
  res.json({ username: user.username });
});

apiRouter.post('/auth/login', async (req, res) => {
  console.log("login attempt: ", req.body);
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ msg: 'Username and password are required' });

  const user = await findUser('username', username);
  if (user && await bcrypt.compare(password, user.password)) {
    user.token = uuid.v4();
    await DB.updateUser(username, { token: user.token });
    setAuthCookie(res, user.token);
    res.json({ username: user.username });
  } else {
    res.status(401).json({ msg: 'User not found' });
  }
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    await DB.updateUser(user.username, { token: null });
    res.clearCookie(authCookieName);
    res.status(204).end();
  } else {
    res.status(401).json({ msg: 'Unauthorized' });
  }
});

apiRouter.get('/auth/check', verifyAuth, (req, res) => {
  res.json({ username: req.user.username });
});

// CHANNEL ENDPOINTS
apiRouter.post('/channel', verifyAuth, async (req, res) => {
  // this part gets the name and description from the request body, & checks them.
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ msg: 'Channel name is required' });

  // this part creates the channel
  const channel = await createChannel(name, description, req.user.username);
  if (!channel) return res.status(409).json({ msg: 'Channel already exists' });
  res.json(channel);
});

apiRouter.get('/channels', verifyAuth, async (_req, res) => {
  // fetches all channels from the database
  const channels = await DB.getAllChannels(); 
  res.json(channels);
});

apiRouter.delete('/channel/:channelId', verifyAuth, async (req, res) => {
  const { channelId } = req.params;
  console.log(`Received DELETE request for channel: ${channelId}`);
  try {
    const deleted = await DB.deleteChannelById(channelId);
    console.log(`Delete result: ${deleted}`);
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(404).json({ msg: 'Channel not found' });
    }
  } catch (err) {
    console.error('Error in DELETE /channel/:channelId:', err.stack);
    res.status(500).json({ msg: 'Error deleting channel', error: err.message });
  }
});

// MESSAGE ENDPOINTS
// get message for a channel
apiRouter.get('/messages/:channelId', verifyAuth, async (req, res) => {
  const { channelId } = req.params;
  console.log(`Fetching messages for channelId: ${channelId}`); // Add this
  try {
    const channelMessages = await DB.getMessagesByChannel(channelId);
    console.log(`Returning messages: ${JSON.stringify(channelMessages)}`);
    res.json(channelMessages);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ msg: 'Error fetching messages', error: error.message });
  }
});


// send a message to a channel
apiRouter.post('/messages/:channelId', verifyAuth, async (req, res) => {
  const { channelId } = req.params;
  const { content } = req.body;
  const sender = req.user.username;

  if (!content) {
    return res.status(400).json({ msg: 'Content is required' });
  }

  // Verify channel exists (handled in addMessage, but you could add extra check here if needed)
  try {
    const message = await DB.addMessage(channelId, content, sender);
    res.status(201).json(message);
  } catch (error) {
    if (error.message === 'Channel not found') {
      return res.status(404).json({ msg: 'Channel not found' });
    }
    res.status(500).json({ msg: 'Error sending message', error: error.message });
  }
});


// Contact Endpoints
apiRouter.post('/contact', verifyAuth, async (req, res) => {
  const { email, name, message } = req.body;

  if (!email || !name || !message) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  try {
    const form = await DB.addForm(email, name, message);
    console.log('Form submitted:', form);
  } catch (error) {
    console.error('Error submitting form:', error);
    return res.status(500).json({ msg: 'Error submitting form', error: error.message });
  }

  console.log('Received contact form submission:', { email, name, message });
  res.status(200).json({ msg: 'Form submitted successfully' });
});

// Error Handling Middleware (before static fallback)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ msg: 'Internal server error', error: err.message });
});

// Fallback to serve React app
app.get('*', (req, res) => {
  const distPath = path.join(__dirname, '../dist', 'index.html');
  if (require('fs').existsSync(distPath)) {
    res.sendFile(distPath);
  } else {
    res.status(404).json({ msg: 'Frontend not found - run `npm run build` first' });
  }
});

// Start the app
async function startApp() {
  DB = await DBPromise; // Assign the resolved DB to the global variable
  console.log('Connected to database');
}

startApp()
  .then(() => {
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
  });