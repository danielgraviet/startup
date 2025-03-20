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
  const user = await findUser('token', req.cookies[authCookieName]);
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
  const channelMessages = messages[channelId] || [];
  res.json(channelMessages);
});


// send a message to a channel
apiRouter.post('/messages/:channelId', verifyAuth, (req, res) => {
  const { channelId } = req.params;
  const { content } = req.body;
  const user = req.user.username;

  if (!content) {
    return res.status(400).json({ msg: 'Content is required' });
  }

  const channel = channels.find((c) => c.id === channelId);
  if (!channel) {
    return res.status(404).json({ msg: 'Channel not found' });
  }

  const message = {
    id: uuid.v4(),
    content,
    sender: user,
    timestamp: new Date().toISOString()
  };

  if (!messages[channelId]) {
    messages[channelId] = [];
  }

  messages[channelId].push(message);
  res.status(201).json(message);
});


// Contact Endpoints
apiRouter.post('/contact', verifyAuth, (req, res) => {
  const { email, name, message } = req.body;

  if (!email || !name || !message) {
    return res.status(400).json({ msg: 'All fields are required' });
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