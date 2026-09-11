const { MongoClient } = require('mongodb');

const DB_NAME = process.env.MONGODB_DB || 'wedding';

let cachedClientPromise = null;

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  if (!cachedClientPromise) {
    const client = new MongoClient(uri);
    cachedClientPromise = client.connect();
  }
  return cachedClientPromise;
}

async function getDb() {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}

module.exports = { getDb };
