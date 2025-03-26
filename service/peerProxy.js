// peerProxy.js
const { WebSocketServer } = require('ws');

function peerProxy(httpServer) {
  // Create a WebSocket server attached to the HTTP server
  const wss = new WebSocketServer({ server: httpServer });

  // Handle new WebSocket connections
  wss.on('connection', (ws) => {
    ws.isAlive = true; // Mark connection as alive

    // Respond to pong messages to keep connection alive
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Log incoming messages (for debugging; we'll expand this later)
    ws.on('message', (data) => {
      console.log('Received WebSocket message:', data.toString());
    });
  });

  // Ping clients every 10 seconds to check liveness
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate(); // Close dead connections
      ws.isAlive = false;
      ws.ping(); // Send ping to client
    });
  }, 10000);

  return wss; // Return the WebSocket server instance for use in index.js
}

module.exports = { peerProxy };