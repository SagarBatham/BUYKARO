// Run this from your ai-buddy project root (where node_modules lives):
//   node test-agent-direct.js
//
// This bypasses Socket.IO entirely and calls agent.invoke() the same way
// socket.server.js does, but prints the FULL error instead of swallowing it.

require('dotenv').config();
const agent = require('./src/agent/agent');

async function main() {
  console.log('Invoking agent directly...');
  try {
    const result = await agent.invoke(
      {
        messages: [
          { role: 'user', content: 'Find me a laptop under 50000 rupees' }
        ]
      },
      {
        metadata: {
          token: 'test-token' // dummy, since searchProduct just forwards it as a header
        }
      }
    );
    console.log('SUCCESS');
    console.dir(result, { depth: null });
  } catch (err) {
    console.error('AGENT FAILED');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    if (err.response?.data) {
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

main();