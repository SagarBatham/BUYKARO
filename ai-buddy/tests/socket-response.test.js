// Test client for AI Buddy Socket.IO service
// Install deps first: npm install --save-dev socket.io-client jsonwebtoken dotenv
//
// Run: node test-buddy-socket.js
//
// Set these via env vars or a local .env (DO NOT commit real secrets):
//   TEST_SERVER_URL=https://ai-buddy-service.onrender.com
//   JWT_SECRET=<same secret your server uses to verify tokens>

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');

const SERVER_URL = process.env.TEST_SERVER_URL || 'https://ai-buddy-service.onrender.com';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET. Set it to the same secret your server uses to verify tokens.');
  process.exit(1);
}

// Payload shape just needs to be whatever your app expects on `socket.user`.
// Adjust fields (id/email/etc.) to match your real user tokens if needed.
const token = jwt.sign(
  { id: 'test-user-id', email: 'test@example.com' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('Connecting to', SERVER_URL);

const socket = io(SERVER_URL, {
  path: '/api/socket/socket.io',
  auth: { token },
  query: { token },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected. Socket ID:', socket.id);
  const testMessage = 'Find me a laptop under 50000 rupees';
  console.log('Sending:', testMessage);
  socket.emit('message', testMessage);
});

socket.on('message', (data) => {
  console.log('Response received:');
  console.dir(data, { depth: null });
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.error('Connection rejected:', err.message);
  console.error('-> If this says "Token not Provided" or "Invalid Token", check JWT_SECRET matches the server.');
  process.exit(1);
});

setTimeout(() => {
  console.error('Timed out after 20s with no response.');
  console.error('-> Check Render logs for "Agent Error:" or missing GOOGLE_API_KEY.');
  process.exit(1);
}, 20000);