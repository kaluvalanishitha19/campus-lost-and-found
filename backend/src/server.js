require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { findItems, findItemById, createItem, updateStatus } = require('./items.repo');

const app = express();
app.use(cors());
app.use(express.json());

const CATEGORIES = ['electronics', 'keys', 'bags', 'clothing', 'id-cards', 'books', 'jewellery', 'other'];
const KINDS = ['lost', 'found'];
const STATUSES = ['open', 'claimed', 'returned'];

// GET /api/items?search=&kind=&category=&status=&sort=&page=
app.get('/api/items', async (req, res, next) => {
  try {
    const result = await findItems(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/api/items/:id', async (req, res, next) => {
  try {
    const item = await findItemById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items — report a lost or found item
app.post('/api/items', async (req, res, next) => {
  try {
    const { title, description, category, kind, location, occurred_on, contact_name, contact_email } = req.body;

    const missing = ['title', 'description', 'category', 'kind', 'location', 'occurred_on', 'contact_name', 'contact_email']
      .filter((field) => !req.body[field] || !String(req.body[field]).trim());
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(', ')}` });
    }
    if (!KINDS.includes(kind)) {
      return res.status(400).json({ error: `kind must be one of: ${KINDS.join(', ')}` });
    }
    if (!/^\S+@\S+\.\S+$/.test(contact_email)) {
      return res.status(400).json({ error: 'contact_email must be a valid email address' });
    }

    const item = await createItem({ title, description, category, kind, location, occurred_on, contact_name, contact_email });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/items/:id/status — move an item through open -> claimed -> returned
app.patch('/api/items/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
    }
    const item = await updateStatus(req.params.id, status);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on port ${port}`));
