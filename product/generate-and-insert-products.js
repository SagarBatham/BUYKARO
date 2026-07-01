require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');
const ImageKit = require('imagekit');

const REQUIRED_ENV = [
  'MONGODB_URL',
  'MONGODB_DB_NAME',
  'MONGODB_COLLECTION',
  'IMAGEKIT_PUBLIC_KEY',
  'IMAGEKIT_PRIVATE_KEY',
  'IMAGEKIT_URL_ENDPOINT',
  'UNSPLASH_ACCESS_KEY',
];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing ${key} in your .env`);
    process.exit(1);
  }
}

const DELAY_MS = 600;

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SELLERS = [
  '6a2e39978e22d90ffeef9074',
  new ObjectId().toString(),
  new ObjectId().toString(),
  new ObjectId().toString(),
  new ObjectId().toString(),
];
function pickSeller() {
  return SELLERS[Math.floor(Math.random() * SELLERS.length)];
}

const CATEGORIES = [
  { keyword: 'sneakers', priceRange: [999, 6999], brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Skechers'], nouns: ['Running Shoe', 'Sneaker'] },
  { keyword: 'formal shoes', priceRange: [1499, 8999], brands: ['Bata', 'Clarks', 'Woodland', 'Red Tape', 'Hush Puppies'], nouns: ['Leather Shoe', 'Loafer'] },
  { keyword: 'smartphone', priceRange: [9999, 89999], brands: ['Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Realme'], nouns: ['Smartphone', '5G Phone'] },
  { keyword: 'laptop', priceRange: [29999, 129999], brands: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer'], nouns: ['Laptop', 'Notebook'] },
  { keyword: 'headphones', priceRange: [999, 24999], brands: ['Sony', 'JBL', 'Boat', 'Bose', 'Sennheiser'], nouns: ['Headphone', 'Earbuds'] },
  { keyword: 'tshirt', priceRange: [399, 1999], brands: ['H&M', 'Zara', 'Levis', 'US Polo', 'Roadster'], nouns: ['T-Shirt', 'Polo Shirt'] },
  { keyword: 'jeans', priceRange: [899, 3499], brands: ['Levis', 'Wrangler', 'Pepe Jeans', 'Lee', 'Spykar'], nouns: ['Jeans', 'Denim'] },
  { keyword: 'kitchen appliance', priceRange: [799, 12999], brands: ['Prestige', 'Bajaj', 'Philips', 'Pigeon', 'Butterfly'], nouns: ['Mixer Grinder', 'Induction Cooktop'] },
  { keyword: 'cookware', priceRange: [499, 6999], brands: ['Hawkins', 'Wonderchef', 'Cello', 'Milton', 'Pigeon'], nouns: ['Cookware Set', 'Nonstick Pan'] },
  { keyword: 'skincare', priceRange: [199, 2499], brands: ['Nivea', 'Ponds', 'Lakme', 'Mamaearth', 'The Ordinary'], nouns: ['Face Cream', 'Serum'] },
  { keyword: 'makeup', priceRange: [149, 1999], brands: ['Maybelline', 'Lakme', 'Sugar', 'Nykaa', 'MAC'], nouns: ['Lipstick', 'Foundation'] },
  { keyword: 'yoga mat', priceRange: [399, 2999], brands: ['Decathlon', 'Nivia', 'Cosco', 'Boldfit', 'Strauss'], nouns: ['Yoga Mat', 'Fitness Kit'] },
  { keyword: 'cricket bat', priceRange: [999, 14999], brands: ['SG', 'SS', 'MRF', 'Kookaburra', 'Adidas'], nouns: ['Cricket Bat', 'Sports Kit'] },
  { keyword: 'toy', priceRange: [299, 3999], brands: ['Funskool', 'Hot Wheels', 'Lego', 'Fisher-Price', 'Hamleys'], nouns: ['Toy Set', 'Building Blocks'] },
  { keyword: 'board game', priceRange: [399, 2499], brands: ['Hasbro', 'Mattel', 'Funskool', 'Ravensburger', 'Zephyr'], nouns: ['Board Game', 'Puzzle'] },
  { keyword: 'novel book', priceRange: [149, 999], brands: ['Penguin', 'HarperCollins', 'Rupa', 'Bloomsbury', 'Westland'], nouns: ['Novel', 'Bestseller Book'] },
  { keyword: 'grocery pantry', priceRange: [49, 999], brands: ['Tata', 'Aashirvaad', 'Fortune', 'Amul', 'Nestle'], nouns: ['Pantry Pack', 'Grocery Combo'] },
  { keyword: 'sofa furniture', priceRange: [4999, 49999], brands: ['Urban Ladder', 'Pepperfry', 'Nilkamal', 'Godrej Interio', 'Durian'], nouns: ['Sofa', 'Study Table'] },
  { keyword: 'travel bag', priceRange: [699, 6999], brands: ['American Tourister', 'Skybags', 'VIP', 'Safari', 'Wildcraft'], nouns: ['Travel Bag', 'Backpack'] },
  { keyword: 'wrist watch', priceRange: [799, 19999], brands: ['Titan', 'Fossil', 'Casio', 'Fastrack', 'Timex'], nouns: ['Wrist Watch', 'Smartwatch'] },
];

const STYLE_VARIANTS = ['Classic', 'Elite', 'Prime', 'Sport', 'Urban', 'Retro', 'Pro', 'Signature', 'Max', 'Lite'];

function buildCatalog() {
  const items = [];
  for (const cat of CATEGORIES) {
    for (let i = 0; i < 10; i += 1) {
      const brand = cat.brands[i % cat.brands.length];
      const noun = cat.nouns[i % cat.nouns.length];
      const style = STYLE_VARIANTS[i % STYLE_VARIANTS.length];
      items.push({
        title: `${brand} ${noun} ${style}`,
        description: `${brand} ${noun.toLowerCase()} — ${style} edition. Quality checked, ready to ship.`,
        searchQuery: `${brand} ${noun}`,
        fallbackQuery: noun,
        category: cat.keyword.charAt(0).toUpperCase() + cat.keyword.slice(1),
        priceRange: cat.priceRange,
      });
    }
  }
  return items;
}

class RateLimitError extends Error {}

async function searchUnsplash(query) {
  const res = await axios.get('https://api.unsplash.com/search/photos', {
    params: { query, per_page: 5, orientation: 'squarish' },
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    timeout: 15000,
    validateStatus: () => true,
  });

  if (res.status === 403 || res.status === 429) {
    throw new RateLimitError('Unsplash rate limit reached');
  }
  if (res.status !== 200) {
    throw new Error(`Unsplash search failed: ${res.status}`);
  }

  const results = res.data?.results || [];
  if (results.length === 0) return null;
  const pick = results[Math.floor(Math.random() * Math.min(results.length, 3))];
  return pick?.urls?.regular || null;
}

async function findImageUrl(item) {
  for (const query of [item.searchQuery, item.fallbackQuery, item.category]) {
    const url = await searchUnsplash(query);
    if (url) return url;
  }
  return null;
}

async function uploadToImageKit(imageUrl, fileName) {
  const imgRes = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    maxRedirects: 5,
    timeout: 20000,
  });
  const base64 = Buffer.from(imgRes.data).toString('base64');

  const uploadRes = await imagekit.upload({
    file: base64,
    fileName,
    folder: '/buykaro',
    useUniqueFileName: true,
  });

  return {
    url: uploadRes.url,
    thumbnail: uploadRes.thumbnailUrl || uploadRes.url,
  };
}

async function main() {
  const catalog = buildCatalog();
  const client = new MongoClient(process.env.MONGODB_URL, { useUnifiedTopology: true });

  await client.connect();
  console.log('Connected to MongoDB');

  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);

  const existingTitles = new Set(
    (await collection.find({}, { projection: { title: 1 } }).toArray()).map((p) => p.title)
  );

  console.log(`Total candidates: ${catalog.length}`);
  console.log(`Already present: ${existingTitles.size}`);

  let insertedCount = 0;

  for (let i = 0; i < catalog.length; i += 1) {
    const item = catalog[i];
    if (existingTitles.has(item.title)) continue;

    process.stdout.write(`(${i + 1}/${catalog.length}) ${item.title} ... `);

    try {
      const imageUrl = await findImageUrl(item);
      if (!imageUrl) {
        console.log('no image found, skipping');
        await sleep(DELAY_MS);
        continue;
      }

      const fileName = `${item.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
      const { url, thumbnail } = await uploadToImageKit(imageUrl, fileName);

      const [min, max] = item.priceRange;
      const product = {
        _id: new ObjectId(),
        title: item.title,
        description: item.description,
        price: { amount: randomInt(min, max), currency: 'INR' },
        seller: new ObjectId(pickSeller()),
        images: [
          {
            url,
            thumbnail,
            id: new ObjectId().toString(),
            _id: new ObjectId(),
          },
        ],
        stock: randomInt(1, 60),
      };

      await collection.insertOne(product);
      insertedCount += 1;
      console.log('inserted');
    } catch (err) {
      if (err instanceof RateLimitError) {
        console.log('\nUnsplash rate limit reached.');
        console.log(`Inserted this run: ${insertedCount}.`);
        console.log('Rerun later to continue from where it stopped.');
        await client.close();
        process.exit(0);
      }
      console.log('FAILED:', err.message || err);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone. Inserted ${insertedCount} products.`);
  await client.close();
}

main().catch(async (err) => {
  console.error('Fatal error:', err.message || err);
  process.exit(1);
});