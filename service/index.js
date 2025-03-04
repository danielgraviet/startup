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
let users = [];
let channels = [];
let messages = [];
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
  if (await findChannel(name)) return null;
  const channel = { name, description };
  channels.push(channel);
  return channel;
}

// Authentication Endpoints
apiRouter.post('/auth/register', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ msg: 'Username is required' });
  if (await findUser('username', username)) {
    return res.status(409).json({ msg: 'Username already exists' });
  }
  const user = await createUser(username);
  setAuthCookie(res, user.token);
  res.json({ username: user.username });
});

apiRouter.post('/auth/login', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ msg: 'Username is required' });
  const user = await findUser('username', username);
  if (user) {
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    res.json({ username: user.username });
  } else {
    res.status(401).json({ msg: 'User not found' });
  }
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) delete user.token;
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Channel and Message Endpoints (unchanged for now)
apiRouter.post('/channel', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ msg: 'Channel name is required' });
  const channel = await createChannel(name, description);
  if (!channel) return res.status(409).json({ msg: 'Channel already exists' });
  res.json(channel);
});

apiRouter.get('/channels', (_req, res) => {
  res.json(channels);
});

const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ msg: 'Unauthorized' });
  }
};

apiRouter.post('/message', verifyAuth, async (req, res) => {
  const { channelName, content } = req.body;
  if (!channelName || !content) {
    return res.status(400).json({ msg: 'Channel name and content are required' });
  }
  if (!(await findChannel(channelName))) {
    return res.status(404).json({ msg: 'Channel not found' });
  }
  const message = { channelName, username: req.user.username, content, timestamp: new Date().toISOString() };
  messages.push(message);
  res.json(message);
});

apiRouter.get('/messages/:channelName', verifyAuth, (req, res) => {
  const { channelName } = req.params;
  const channelMessages = messages.filter((m) => m.channelName === channelName);
  res.json(channelMessages);
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

// Static Fallback (only if public directory exists)
app.use((req, res, next) => {
  const publicPath = path.join(__dirname, 'public', 'index.html');
  if (require('fs').existsSync(publicPath)) {
    res.sendFile('index.html', { root: 'public' });
  } else {
    res.status(404).json({ msg: 'Route not found' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});