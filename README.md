# Campus Lost & Found Portal

A full-stack web app for reporting, searching, and claiming lost and found items on a college campus. Built with Angular, Express, and PostgreSQL.

## Features

- **Browse & filter** - search by keyword (full-text search via Postgres), filter by lost/found, category, and status, sort by date
- **Report an item** - reactive form with validation for both lost and found reports, including an optional photo upload
- **Item detail & claim flow** - view full item details and move an item through its lifecycle: open -> claimed -> returned
- **Photo uploads** - attach a real photo when reporting an item, stored server-side and served back to the app

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18 (standalone components), RxJS, reactive forms |
| Backend | Node.js, Express |
| Database | PostgreSQL (full-text search via tsvector/GIN index) |
| File uploads | Multer |

## Architecture

Angular (port 4200) sends requests to the Express API (port 4000), which reads from and writes to PostgreSQL and also serves uploaded photos from an /uploads directory.

The frontend never talks to the database directly - every request goes through the Express API, which validates input, runs parameterized queries, and returns JSON. Photo uploads use multipart/form-data, handled by Multer middleware, with the resulting file path stored alongside the item's row in Postgres.

## Running it locally

Prerequisites: Node.js 18+, PostgreSQL running locally.

### 1. Database

    createdb lostfound
    psql lostfound -f backend/schema.sql
    psql lostfound -f backend/seed.sql

### 2. Backend

    cd backend
    npm install
    mkdir -p uploads
    echo "DATABASE_URL=postgres://localhost:5432/lostfound" > .env
    echo "PORT=4000" >> .env
    node src/server.js

### 3. Frontend

    cd frontend
    npm install
    npm start

Visit http://localhost:4200

## Project structure

    backend/
      schema.sql              database schema
      seed.sql                sample data
      src/
        items.repo.js         data access layer (queries, search, pagination)
        server.js             Express routes, validation, file uploads

    frontend/
      src/app/
        models/               TypeScript interfaces shared across the app
        services/             ItemsService (all HTTP calls to the API)
        item-list/            browse, search, and filter screen
        report-item/          reporting form with photo upload
        item-detail/          single item view plus claim/return actions

## Notable design decisions

- **One items table for both lost and found reports**, distinguished by a kind column, avoids unioning two tables together on every search, since a lost item and a found item share the exact same fields.
- **Full-text search via a Postgres GIN index** rather than LIKE '%term%' - LIKE can't use an index and forces a full table scan; to_tsvector/plainto_tsquery can.
- **Every SQL value is parameterized**, never string-concatenated, to prevent SQL injection. Sort order is validated against a fixed allow-list instead, since column names can't be parameterized.
- **Validation happens in two layers** - the Express route layer checks shape and required fields before anything touches SQL; Postgres CHECK constraints are a last line of defense at the database level.
