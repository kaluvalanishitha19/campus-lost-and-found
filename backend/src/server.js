require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { findItems, findItemById, createItem, updateStatus } = require('./items.repo');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded photos as static files, e.g. /uploads/169234-photo.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const CATEGORIES = ['electronics', 'keys', 'bags', 'clothing', 'id-cards', 'books', 'jewellery', 'other'];
const KINDS = ['lost', 'found'];
const STATUSES = ['open', 'claimed', 'returned'];

// Multer config: save to disk with a collision-safe filename, reject non-images.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, or WebP images are allowed'));
    }
    cb(null, true);
  },
});

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

// POST /api/items — report a lost or found item, with an optional photo
app.post('/api/items', upload.single('photo'), async (req, res, next) => {
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

    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    const item = await createItem({
      title, description, category, kind, location, occurred_on,
      contact_name, contact_email, photo_url,
    });
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
  if (err.message && err.message.includes('images are allowed')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on port ${port}`));
