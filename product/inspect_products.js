require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    console.error('Set MONGODB_URL in .env');
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB_NAME || null;
  const collName = process.env.MONGODB_COLLECTION || 'products';

  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  console.log('Connected to', uri);

  const db = dbName ? client.db(dbName) : client.db();
  console.log('Inspecting DB:', db.databaseName, ' Collection:', collName);

  const coll = db.collection(collName);
  const docs = await coll.find({}).sort({ _id: -1 }).limit(10).toArray();

  if (!docs.length) {
    console.log('No documents found in this collection.');
  } else {
    docs.forEach((d, i) => {
      const title = d.title || '<no title>';
      const id = d._id;
      const images = Array.isArray(d.images) ? d.images.map(im => im.url).join(', ') : d.image || '<no images>';
      console.log(`\n#${i + 1} ${title} (${id})\n images: ${images}`);
    });
  }

  await client.close();
}

run().catch(err => { console.error(err); process.exit(1); });
