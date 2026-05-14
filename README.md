# Boomerang — Campus Lost & Found

A full-stack web application for Epitech campus students to report lost and found items, browse listings, and communicate with each other through in-app messaging.

Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication (register, login, JWT access + refresh tokens)
- Multi-step post creation wizard with image uploads (1-3 photos)
- Browse and search with filters (type, category, location, sort)
- In-app polling-based messaging between users
- User profile with active and resolved posts
- Responsive, mobile-first design with warm Goldilox-inspired palette

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, React Query, Axios, Sonner |
| Backend | Node.js, Express, Mongoose, JWT, bcrypt, Multer |
| Database | MongoDB (Docker Compose) |
| Validation | Zod (shared between client and server) |

## Prerequisites

- Node.js 18+
- Docker

## Setup

### 1. Clone and install

```bash

cd backend && npm install
cd ../frontend && npm install
```

### 2. Start MongoDB

```bash
docker compose up -d
```

This starts:
- **MongoDB** on `localhost:27017`
- **Mongo Express** (DB viewer) on `http://localhost:8081`

### 3. Environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit with your values or keep defaults for local development.

### 4. Run

In two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## Project Structure

```
boomerang/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── pages/          # Route-level components
│       ├── components/     # Reusable UI (PostCard, Select, PostForm, etc.)
│       ├── hooks/          # Custom hooks (useAuth)
│       ├── services/       # API call functions
│       └── context/        # Auth context
├── backend/           # Express + Mongoose
│   └── src/
│       ├── routes/         # Express routers
│       ├── controllers/    # Request handlers
│       ├── models/         # Mongoose schemas
│       ├── middleware/      # Auth, validation, uploads
│       └── config/         # DB connection, env
├── shared/            # Zod schemas + constants
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh access token |
| POST | `/api/auth/logout` | No | Logout (clears refresh cookie) |
| GET | `/api/auth/me` | Yes | Current user |

### Posts
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/posts` | No | Browse posts (query: type, category, building, search, sort, page, author) |
| GET | `/api/posts/:id` | No | Get single post |
| POST | `/api/posts` | Yes | Create post (multipart/form-data) |
| PUT | `/api/posts/:id` | Yes | Update own post |
| DELETE | `/api/posts/:id` | Yes | Delete own post |
| PATCH | `/api/posts/:id/resolve` | Yes | Mark as resolved |

### Messaging
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/conversations` | Yes | List conversations |
| POST | `/api/conversations` | Yes | Start conversation about a post |
| GET | `/api/conversations/:id/messages` | Yes | Get messages (polling, 5s interval) |
| POST | `/api/conversations/:id/messages` | Yes | Send message |
