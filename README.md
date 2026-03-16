# Todo List Manager (Node.js)

A backend REST API for managing multiple todo lists and their items, built with Node.js and Express.

**Key features:**

- Create and manage multiple independent lists
- Add, update, and delete items inside each list
- Full CRUD operations for both lists and items
- Item status tracking (`todo` / `done`)
- Persistent storage with SQLite
- Request validation and centralized error handling
- Automated test suite with Jest and Supertest

---

## Architecture

The project follows a **CMV (Controller → Model → View)** pattern, separating HTTP handling, data logic, and response formatting.

```
Client
  ↓
Routes          — map HTTP endpoints to controller functions
  ↓
Controllers     — handle requests, validate input, call models
  ↓
Models          — execute SQL queries against the database
  ↓
SQLite Database — persistent data storage
```

| Layer | Responsibility |
|---|---|
| Routes | Declare endpoints, attach middleware |
| Controllers | Orchestrate request/response cycle |
| Models | All SQL queries and data access |
| Middleware | Validation, logging, error handling |

---

## Project Structure

```
todo-list-manager-node/
│
├── src/
│   ├── server.js              # Express app entry point
│   ├── controllers/
│   │   ├── lists.controller.js
│   │   └── items.controller.js
│   ├── models/
│   │   ├── list.model.js
│   │   └── item.model.js
│   ├── routes/
│   │   ├── lists.routes.js
│   │   └── items.routes.js
│   ├── middleware/
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   └── logger.middleware.js
│   └── db/
│       └── database.js        # SQLite singleton connection
│
├── tests/
│   ├── setup.js               # DB reset before each test
│   ├── lists.test.js
│   └── items.test.js
│
├── scripts/
│   ├── init-db.js             # Database initialization script
│   └── init-db.sql            # Schema DDL
│
├── data/
│   └── database.sqlite        # SQLite database file (auto-created)
│
├── package.json
└── README.md
```

---

## Database

### Entities

The system manages two entities: **List** and **Item**.  
One list can contain multiple items (1 → N relationship).

```
LISTS
─────────────────────
id          INTEGER PK
title       TEXT NOT NULL
description TEXT
created_at  DATETIME
updated_at  DATETIME

        │ 1
        │
        ▼ N

ITEMS
─────────────────────
id          INTEGER PK
text        TEXT NOT NULL
status      TEXT ('todo' | 'done')
list_id     INTEGER FK → lists.id
created_at  DATETIME
updated_at  DATETIME
```

### Initialize the database

```bash
npm run db:init
```

This creates `data/database.sqlite` and runs `scripts/init-db.sql` to set up the `lists` and `items` tables.

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/pianic2/todo-list-manager-node.git
cd todo-list-manager-node

# 2. Install dependencies
npm install

# 3. Initialize the database
npm run db:init

# 4. Start the server
node src/server.js
```

The server starts on `http://localhost:3000` by default.  
Set the `PORT` environment variable to use a different port.

---

## API Documentation

All endpoints return JSON. Success and error shapes are consistent:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "message" }
```

---

### Lists

#### GET /lists
Return all lists ordered by creation date (newest first).

```bash
curl http://localhost:3000/lists
```

```json
{
  "success": true,
  "data": [
    { "id": 1, "title": "Groceries", "description": "Weekly shopping", "created_at": "...", "updated_at": null }
  ]
}
```

---

#### POST /lists
Create a new list.

```bash
curl -X POST http://localhost:3000/lists \
  -H "Content-Type: application/json" \
  -d '{"title":"Groceries","description":"Weekly shopping"}'
```

```json
{ "success": true, "data": { "id": 1, "title": "Groceries", ... } }
```

| Field | Required | Type |
|---|---|---|
| `title` | yes | string |
| `description` | no | string |

---

#### GET /lists/:id
Return a single list by ID.

```bash
curl http://localhost:3000/lists/1
```

Returns `404` if not found.

---

#### PUT /lists/:id
Update title and/or description of a list.

```bash
curl -X PUT http://localhost:3000/lists/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title","description":"Updated description"}'
```

```json
{ "success": true, "data": { "id": 1, "title": "Updated title", ... } }
```

---

#### DELETE /lists/:id
Delete a list by ID.

```bash
curl -X DELETE http://localhost:3000/lists/1
```

Returns `204 No Content` on success, `404` if not found.

---

### Items

#### GET /lists/:listId/items
Return all items belonging to a list, ordered oldest first.

```bash
curl http://localhost:3000/lists/1/items
```

```json
{ "success": true, "data": [ { "id": 1, "text": "Buy milk", "status": "todo", ... } ] }
```

---

#### POST /lists/:listId/items
Add a new item to a list.

```bash
curl -X POST http://localhost:3000/lists/1/items \
  -H "Content-Type: application/json" \
  -d '{"text":"Buy milk","status":"todo"}'
```

```json
{ "success": true, "data": { "id": 1, "text": "Buy milk", "status": "todo", ... } }
```

| Field | Required | Type | Values |
|---|---|---|---|
| `text` | yes | string | any |
| `status` | no | string | `todo` (default) or `done` |

---

#### GET /lists/:listId/items/:itemId
Return a single item by ID.

```bash
curl http://localhost:3000/lists/1/items/1
```

Returns `404` if not found.

---

#### PUT /lists/:listId/items/:itemId
Update the text of an item.

```bash
curl -X PUT http://localhost:3000/lists/1/items/1 \
  -H "Content-Type: application/json" \
  -d '{"text":"Buy oat milk"}'
```

```json
{ "success": true, "data": { "id": 1, "text": "Buy oat milk", ... } }
```

---

#### DELETE /lists/:listId/items/:itemId
Delete an item.

```bash
curl -X DELETE http://localhost:3000/lists/1/items/1
```

Returns `204 No Content` on success.

---

#### PATCH /lists/:listId/items/:itemId/status
Change the status of an item.

```bash
curl -X PATCH http://localhost:3000/lists/1/items/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'
```

```json
{ "success": true, "data": { "id": 1, "status": "done", ... } }
```

| Field | Required | Values |
|---|---|---|
| `status` | yes | `todo` or `done` |

---

## Testing

The test suite uses **Jest** and **Supertest**. It resets the database before each test to guarantee isolation.

```bash
npm test
```

Expected output:

```
PASS  tests/lists.test.js
PASS  tests/items.test.js

Test Suites: 2 passed, 2 total
Tests:       6 passed, 6 total
```

### What is tested

- **lists.test.js** — POST, GET all, GET by id, PUT, DELETE
- **items.test.js** — Full CRUD flow: create, list, update, change status, delete

---

## Technologies

| Component | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | SQLite |
| DB Driver | better-sqlite3 |
| Test Framework | Jest |
| HTTP Test Client | Supertest |
