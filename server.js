import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cart from './api/cart.js';
import contacts from './api/contacts.js';
import faqs from './api/faqs.js';
import orders from './api/orders.js';
import platforms from './api/platforms.js';
import products from './api/products.js';
import reviews from './api/reviews.js';
import testimonials from './api/testimonials.js';
import wishlist from './api/wishlist.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

const handlers = {
  '/api/cart': cart,
  '/api/contacts': contacts,
  '/api/faqs': faqs,
  '/api/orders': orders,
  '/api/platforms': platforms,
  '/api/products': products,
  '/api/reviews': reviews,
  '/api/testimonials': testimonials,
  '/api/wishlist': wishlist,
};

app.use(express.json({ limit: '1mb' }));

for (const [route, handler] of Object.entries(handlers)) {
  app.all(route, (req, res) => handler(req, res));
}

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`OTT Bazaar listening on port ${port}`);
});