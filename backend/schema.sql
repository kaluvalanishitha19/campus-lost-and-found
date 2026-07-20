-- Campus Lost & Found Portal — schema

DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS items;

CREATE TABLE items (
  id            SERIAL PRIMARY KEY,
  case_number   TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN
                  ('electronics','keys','bags','clothing','id-cards','books','jewellery','other')),
  kind          TEXT NOT NULL CHECK (kind IN ('lost','found')),
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','claimed','returned')),
  location      TEXT NOT NULL,
  occurred_on   DATE NOT NULL,
  contact_name  TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE claims (
  id         SERIAL PRIMARY KEY,
  item_id    INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimant   TEXT NOT NULL,
  email      TEXT NOT NULL,
  proof      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_items_kind_status ON items (kind, status);
CREATE INDEX idx_items_category    ON items (category);
CREATE INDEX idx_items_occurred    ON items (occurred_on DESC);
CREATE INDEX idx_items_search      ON items
  USING GIN (to_tsvector('english', title || ' ' || description || ' ' || location));
