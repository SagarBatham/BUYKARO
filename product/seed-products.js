const https = require('https');
const http = require('http');

const PRODUCT_COUNT = Number(process.env.PRODUCT_COUNT || 200);
const API_BASE_URL = (process.env.PRODUCT_API_URL || 'http://buykaro-alb-786683605.ap-south-1.elb.amazonaws.com/api/products/').replace(/\/?$/, '/');
const AUTH_API_URL = (process.env.AUTH_API_URL || 'http://buykaro-alb-786683605.ap-south-1.elb.amazonaws.com/api/auth').replace(/\/?$/, '');
const TOKEN = process.env.SELLER_TOKEN || '';
const SELLER_ID = process.env.SELLER_ID || '';
const AUTH_EMAIL = process.env.AUTH_EMAIL || process.env.SELLER_EMAIL || '';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || process.env.SELLER_PASSWORD || '';
const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80'
];

const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Beauty', 'Sports'];
const productPrefixes = [
  'Aurora', 'Nova', 'Atlas', 'Zen', 'Luma', 'Echo', 'Crest', 'Pixel', 'Orbit', 'Halo',
  'Vanta', 'Pulse', 'Nimbus', 'Prime', 'Tidal', 'Sage', 'Drift', 'Cove', 'Aero', 'Glacier',
  'Velora', 'Kairo', 'Rivet', 'Mira', 'Solace', 'Nexa', 'Onyx', 'Fable', 'Lumen', 'Quill'
];
const productSuffixes = [
  'Smart Lamp', 'Headphones', 'Backpack', 'Ceramic Mug', 'Wireless Charger', 'Fitness Band', 'Leather Wallet',
  'Desk Organizer', 'Mini Speaker', 'Water Bottle', 'Travel Case', 'Blender', 'Laptop Sleeve', 'Gaming Mouse',
  'Throw Blanket', 'Essential Oil', 'Running Shoes', 'Tote Bag', 'Keyboard', 'Bottle Cooler', 'Watch', 'Sneakers',
  'Notebook', 'Desk Lamp', 'Sunglasses', 'Travel Mug', 'Yoga Mat', 'Smart Watch', 'Coffee Grinder'
];

function makeProduct(index) {
  const category = categories[index % categories.length];
  const prefix = productPrefixes[index % productPrefixes.length];
  const suffix = productSuffixes[(index * 3) % productSuffixes.length];
  const title = `${prefix} ${suffix} ${index + 1}`;
  const description = `${title} is crafted for modern lifestyles with premium materials, reliable performance, and a refined finish.`;
  const price = 199 + ((index * 137) % 3500);
  const stock = 8 + (index % 48);

  return {
    title,
    description,
    price: String(price),
    currency: 'INR',
    stock,
    seller: SELLER_ID || undefined,
    category,
  };
}

function getImageBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(getImageBuffer(res.headers.location));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Image fetch failed with status ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function buildMultipartBody(fields, fileBuffer, filename, contentType) {
  const boundary = `----BuyKaro-${Date.now()}`;
  const parts = [];

  Object.entries(fields).forEach(([key, value]) => {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`));
  });

  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`));
  parts.push(fileBuffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  return { boundary, body: Buffer.concat(parts) };
}

async function createProduct(product, imageUrl, authToken) {
  const imageBuffer = await getImageBuffer(imageUrl);
  const { boundary, body } = buildMultipartBody({
    title: product.title,
    description: product.description,
    price: product.price,
    currency: product.currency,
    stock: String(product.stock),
    category: product.category,
  }, imageBuffer, `${product.title.replace(/\s+/g, '-').toLowerCase()}.jpg`, 'image/jpeg');

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${text}`);
  }

  return response.json();
}

async function getSellerToken() {
  if (TOKEN) return TOKEN.replace(/^Bearer\s+/i, '').trim();

  if (!AUTH_EMAIL || !AUTH_PASSWORD) {
    throw new Error('Missing SELLER_TOKEN or auth credentials. Set SELLER_TOKEN or AUTH_EMAIL/AUTH_PASSWORD before running this script.');
  }

  const loginResponse = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD }),
  });

  const loginText = await loginResponse.text();
  const setCookieHeader = loginResponse.headers.get('set-cookie');
  const cookieToken = setCookieHeader?.match(/token=([^;]+)/)?.[1];

  if (cookieToken) return decodeURIComponent(cookieToken);

  try {
    const parsed = JSON.parse(loginText);
    if (parsed?.token) return parsed.token;
  } catch (error) {
    // ignore
  }

  throw new Error(`Login failed: ${loginResponse.status} ${loginText}`);
}

async function seedProducts() {
  const authToken = await getSellerToken();

  const products = Array.from({ length: PRODUCT_COUNT }, (_, i) => makeProduct(i));
  console.log(`Creating ${products.length} products...`);

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const imageUrl = IMAGE_URLS[index % IMAGE_URLS.length];
    try {
      await createProduct(product, imageUrl, authToken);
      process.stdout.write('.');
    } catch (err) {
      console.error(`\nFailed for ${product.title}:`, err.message);
    }
  }

  console.log('\nSeeding complete.');
}

seedProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});
