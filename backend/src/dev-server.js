/**
 * dev-server.js
 * 
 * Local development entry point that spins up an in-memory MongoDB instance
 * automatically — no system MongoDB installation required.
 * 
 * Usage:  node src/dev-server.js
 *         (or via:  npm run dev:local)
 */
require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  // Start the in-memory MongoDB
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'auction',
    },
  });

  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;

  console.log(`[dev-server] In-memory MongoDB started at: ${uri}`);

  // Now load and start the actual server
  require('./server');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n[dev-server] Shutting down...');
    await mongod.stop();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error('[dev-server] Failed to start:', err);
  process.exit(1);
});
