require('dotenv').config();
const mongoose = require('mongoose');
const productModel = require('./src/model/product.model');

const CATEGORY_RULES = [
  {
    name: 'Electronics',
    keywords: ['phone', 'smartphone', 'laptop', 'notebook', 'charger', 'headphone', 'earbud', 'speaker', 'camera', 'monitor', 'tablet', 'keyboard', 'mouse', 'watch', 'smartwatch', 'tv', 'television', 'router', 'adapter', 'speaker'],
  },
  {
    name: 'Clothing',
    keywords: ['shirt', 'tshirt', 'jeans', 'pants', 'trouser', 'jacket', 'hoodie', 'sweater', 'dress', 'skirt', 'blouse', 'coats', 'shorts', 'shoes', 'sneaker', 'sneakers', 'boot', 'jogger', 'trackpant', 'hoodie'],
  },
  {
    name: 'Home',
    keywords: ['sofa', 'chair', 'table', 'desk', 'lamp', 'cushion', 'mattress', 'bed', 'kitchen', 'cookware', 'pan', 'mug', 'bottle', 'furniture', 'storage', 'cabinet', 'shelf', 'blanket', 'organizer', 'appliance', 'mixer', 'grinder'],
  },
  {
    name: 'Books',
    keywords: ['book', 'novel', 'journal', 'guide', 'storybook', 'magazine', 'reader', 'paperback', 'hardcover', 'literature'],
  },
  {
    name: 'Beauty',
    keywords: ['cream', 'serum', 'lotion', 'makeup', 'lipstick', 'foundation', 'mascara', 'skincare', 'fragrance', 'perfume', 'cosmetic', 'moisturizer', 'toner'],
  },
  {
    name: 'Sports',
    keywords: ['yoga', 'cricket', 'bat', 'ball', 'fitness', 'gym', 'sports', 'bicycle', 'cycle', 'skate', 'roller', 'racket', 'helmet', 'run', 'training', 'workout', 'mat', 'shoe', 'sneaker'],
  },
  {
    name: 'Travel',
    keywords: ['bag', 'backpack', 'luggage', 'suitcase', 'travel', 'trolley', 'duffel', 'carryon', 'passport', 'case'],
  },
];

function inferCategory(text = '') {
  const normalized = text.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword)) {
        return rule.name;
      }
    }
  }
  return 'General';
}

async function main() {
  const uri = process.env.MONGODB_URL;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri || !dbName) {
    console.error('Missing MONGODB_URL or MONGODB_DB_NAME in environment.');
    process.exit(1);
  }

  await mongoose.connect(uri, {
    dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`Connected to MongoDB database: ${dbName}`);

  const products = await productModel.find({
    $or: [
      { category: { $exists: false } },
      { category: null },
      { category: '' },
      { category: 'General' },
    ],
  }).lean();

  if (products.length === 0) {
    console.log('No products found that require category updates.');
    await mongoose.disconnect();
    return;
  }

  const updates = products.map((product) => {
    const title = product.title || '';
    const description = product.description || '';
    const category = inferCategory(`${title} ${description}`);

    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { category } },
      },
    };
  });

  const result = await productModel.bulkWrite(updates);

  console.log(`Updated ${result.modifiedCount} product(s) with inferred categories.`);
  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
}

main().catch((err) => {
  console.error('Failed to update categories:', err);
  process.exit(1);
});