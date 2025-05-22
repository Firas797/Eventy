const WebSocket = require('ws');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  const connectedUsers = new Set(); // Track connected users

  wss.on('connection', (ws, req) => {
    const userId = req.url.split('userId=')[1];
    
    if (userId) {
      // Check if this is user's first connection
      if (!connectedUsers.has(userId)) {
        connectedUsers.add(userId);
        
        // Send welcome message immediately
        ws.send(JSON.stringify({
          type: 'WELCOME',
          message: "Welcome to our platform! You'll be notified about nearby events."
        }));
      }
    }

    ws.on('close', () => {
      // No need to remove from Set (keeps memory of who got welcome)
    });
  });

  return { sendRealTimeNotification: () => {} }; // Keep existing return structure
}

module.exports = setupWebSocket;