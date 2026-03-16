# Todo List Manager — Project Plan

Backend project for managing multiple todo lists and their items using **Node.js**.

The system must allow:

- creation of multiple lists
- management of items inside each list
- CRUD operations for both lists and items
- item status tracking (`todo` / `done`)

---

## 1. Project Goals

The goal of this project is to build a **clean and well-structured backend application** that exposes REST APIs for managing todo lists.

Key objectives:

- implement CRUD for lists
- implement CRUD for items
- maintain relationship between lists and items
- design clear architecture
- maintain readable codebase
- use proper Git workflow

---

## 2. Technology Stack

| Component | Technology |
|--------|--------|
Backend | Node.js |
Framework | Express |
Database | SQLite |
Driver | better-sqlite3 |
Version Control | Git + GitHub |

---

## 3. Architectural Pattern

The project follows a **CMV architecture**:

```
Controller → Model → View
```

Responsibilities:

| Layer | Responsibility |
|------|----------------|
Controller | Handle HTTP requests |
Model | Data logic and database queries |
View | Format output responses |

---

## 4. Project Structure

```

todo-list-manager-node
│
├── src
│
│   ├── server.js
│
│   ├── controllers
│   │   ├── lists.controller.js
│   │   └── items.controller.js
│
│   ├── models
│   │   ├── list.model.js
│   │   └── item.model.js
│
│   ├── views
│   │   ├── list.view.js
│   │   └── item.view.js
│
│   ├── routes
│   │   ├── lists.routes.js
│   │   └── items.routes.js
│
│   ├── db
│   │   └── database.js
│
│   └── utils
│       └── validator.js
│
├── data
│   └── database.sqlite
│
├── scripts
│   └── init-db.sql
│
├── README.md
├── package.json
└── .gitignore

```

---

## 5. System Architecture

```

Client
│
▼
Express Server
│
▼
Routes
│
▼
Controllers
│
▼
Models
│
▼
SQLite Database
│
▼
Views
│
▼
JSON Response

```

---

## 6. Data Model

The system contains **two main entities**:

- List
- Item

A list can contain multiple items.

---

## 7. ER Diagram

```

+----------------------+
|        LISTS         |
+----------------------+
| id (PK)              |
| title                |
| description          |
| created_at           |
| updated_at           |
+----------------------+
│
│ 1
│
▼
+----------------------+
|        ITEMS         |
+----------------------+
| id (PK)              |
| text                 |
| status               |
| list_id (FK)         |
| created_at           |
| updated_at           |
+----------------------+

```

Relationship:

```

LISTS 1 ────── N ITEMS

```

Foreign key:

```

items.list_id → lists.id

````

---

## 8. Database Schema (SQL)

```sql
CREATE TABLE lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    status TEXT CHECK(status IN ('todo','done')) DEFAULT 'todo',
    list_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY(list_id) REFERENCES lists(id)
);
````

---

## 9. API Design

### Lists

#### Create list

```
POST /lists
```

Body

```
{
    "title": "Groceries",
    "description": "Shopping list"
}
```

---

#### Get all lists

```
GET /lists
```

---

#### Get single list

```
GET /lists/:id
```

---

#### Update list

```
PUT /lists/:id
```

---

#### Delete list

```
DELETE /lists/:id
```

---

### Items API

#### Create item

```
POST /lists/:listId/items
```

---

#### Get items of list

```
GET /lists/:listId/items
```

---

#### Get item

```
GET /lists/:listId/items/:itemId
```

---

#### Update item

```
PUT /lists/:listId/items/:itemId
```

---

#### Delete item

```
DELETE /lists/:listId/items/:itemId
```

---

#### Change item status

```
PATCH /lists/:listId/items/:itemId/status
```

Body:

```
{
"status": "done"
}
```

---

## 10. Response Format

Success response:

```
{
"success": true,
"data": {...}
}
```

Error response:

```
{
"success": false,
"error": "message"
}
```

---

## 11. Development Phases

### Phase 1 — Project Setup

Tasks:

* initialize Node project
* install dependencies
* create folder structure
* configure Express server

Deliverables:

* server running
* base repository structure

---

### Phase 2 — Database Layer

Tasks:

* configure SQLite
* create database schema
* create database connection module

Deliverables:

* working SQLite database
* tables created

---

### Phase 3 — Model Layer

Tasks:

* implement list model
* implement item model
* write SQL queries

Deliverables:

* CRUD operations available in models

---

### Phase 4 — Controller Layer

Tasks:

* implement lists controller
* implement items controller

Deliverables:

* business logic separated from routes

---

### Phase 5 — Routing

Tasks:

* create routes for lists
* create routes for items
* connect controllers

Deliverables:

* REST API endpoints active

---

### Phase 6 — Views

Tasks:

* format JSON responses
* standardize API output

Deliverables:

* consistent API responses

---

### Phase 7 — Testing

Tasks:

* test all endpoints
* test CRUD operations
* verify database consistency

Tools:

* curl
* Postman

---

## 12. Development TODO List

### Setup

* [x] Initialize project
* [x] Install dependencies
* [x] Setup Express server
* [x] Setup database connection

---

### Database

* [x] Create tables
* [x] Create database init script

---

### Lists

* [x] Create list
* [x] Get all lists
* [x] Get single list
* [x] Update list
* [x] Delete list

---

### Items

* [x] Create item
* [x] Get items of list
* [x] Get single item
* [x] Update item
* [x] Delete item
* [x] Change status

---

### API

* [x] Define routes
* [x] Connect controllers
* [x] Test endpoints

---

### Finalization

* [x] Write README
* [x] Clean code
* [x] Final commit

---

## 13. Git Workflow

Recommended commit strategy:

```
inital commit
init project structure and express server
add SQLite database configuration and schema initialization
add models for item and list with CRUD operations
add controllers for managing lists and items with CRUD operations
refactor enhance error handling and validation for item and list operations

add Jest testing framework and implement API tests for items and 
update documentation
```

---

## 14. Example Workflow

Example request:

```
POST /lists
```

Flow:

```
Client
 ↓
Route
 ↓
Controller
 ↓
Model
 ↓
Database
 ↓
View
 ↓
Response JSON
```

---

## 15. Optional Improvements

Possible enhancements:

* item filtering by status
* pagination
* item ordering
* timestamps update
* validation middleware

---

## 16. Expected Outcome

At the end of the project the system should:

* support multiple lists
* manage items inside lists
* track item status
* expose REST API
* maintain clean architecture
* have clear documentation

---
