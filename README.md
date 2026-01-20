# Settings Management System

Full-stack app for storing and managing JSON configuration data.

Built with TypeScript throughout - Express backend, React frontend, PostgreSQL for storage, all containerized with Docker.

## Stack
- Backend: Node.js + Express + TypeScript
- Frontend: React + TypeScript + Vite
- Database: PostgreSQL
- Deployment: Docker Compose

## Running It

**Prerequisites:** Docker Desktop

**Steps:**
1. Clone the repo
2. `cd settings-management-system`
3. `docker-compose up --build`
4. Go to http://localhost:3000

Takes about a minute to build and start everything up.

## API Endpoints
- `POST /settings` - Create new setting
- `GET /settings` - Get all (paginated)
- `GET /settings/{uid}` - Get one
- `PUT /settings/{uid}` - Update
- `DELETE /settings/{uid}` - Delete

Backend runs on port 3001 if you want to hit the API directly.

## Design Decisions

**PostgreSQL:** Went with Postgres because JSONB support is perfect for schemaless data, plus ACID guarantees and it's what I'm familiar with.

**Pagination:** Used offset-based (page/limit params). Simple and works fine for this use case. Could switch to cursor-based if we needed to scale to millions of records.

**TypeScript:** Type safety catches a lot of bugs early and makes the code more maintainable. Also matches the role requirements.
