const express = require('express');
const cookieParser = require('cookie-parser');
const uuid = require('uuid');
const path = require('path');

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public')); // Serve static files from public directory

// In-memory data
let users = []; // [{ username, token }]
let channels = []; // [{ name, description }]
let messages = []; // [{ channelName, username, content, timestamp }]
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
  return users.find((u) => u[field] === value);
}

async function createUser(username) {
  const user = { username, token: uuid.v4() };
  users.push(user);
  return user;
}

async function findChannel(name) {
  return channels.find((c) => c.name === name);
}

async function createChannel(name, description = '') {
  if (await findChannel(name)) {
    return null; // Channel already exists
  }
  const channel = { name, description };
  channels.push(channel);
  return channel;
}

// Authentication Endpoints
apiRouter.post('/auth/register', async (req, res) => {
  const { username } = req.body;
  if (await findUser('username', username)) {
    res.status(409).send({ msg: 'Username already exists' });
  } else {
    const user = await createUser(username);
    setAuthCookie(res, user.token);
    res.send({ username: user.username });
  }
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) delete user.token;
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Channel Endpoints
apiRouter.post('/channel', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).send({ msg: 'Channel name is required' });
  }
  const channel = await createChannel(name, description);
  if (!channel) {
    return res.status(409).send({ msg: 'Channel already exists' });
  }
  res.send(channel);
});

apiRouter.get('/channels', (_req, res) => {
  res.send(channels);
});

// Messaging Endpoints
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user; // Attach user to request
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

apiRouter.post('/message', verifyAuth, async (req, res) => {
  const { channelName, content } = req.body;
  if (!channelName || !content) {
    return res.status(400).send({ msg: 'Channel name and content are required' });
  }
  if (!(await findChannel(channelName))) {
    return res.status(404).send({ msg: 'Channel not found' });
  }

  const message = {
    channelName,
    username: req.user.username,
    content,
    timestamp: new Date().toISOString(),
  };
  messages.push(message);
  res.send(message);
});

apiRouter.get('/messages/:channelName', verifyAuth, (req, res) => {
  const { channelName } = req.params;
  const channelMessages = messages.filter((m) => m.channelName === channelName);
  res.send(channelMessages);
});

// Error Handling
app.use((err, req, res, next) => {
  res.status(500).send({ type: err.name, message: err.message });
});

// Fallback to index.html
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Start Server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});