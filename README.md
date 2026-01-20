# Settings Management System

A full-stack application for managing arbitrary JSON configuration data with a RESTful API backend and React frontend.

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React, TypeScript, Vite
- **Database**: PostgreSQL
- **Deployment**: Docker, Docker Compose

## Quick Start

### Prerequisites

- Docker Desktop installed and running

### Running the Application

1. Navigate to the project directory:
```bash
cd settings-management-system
```

2. Start all services:
```bash
docker-compose up --build
```

4. Access the application:
   - **Frontend UI**: http://localhost:3000
   - **Backend API**: http://localhost:3001

### Stopping the Application

Press `Ctrl+C` in the terminal, then:
```bash
docker-compose down
```

## API Endpoints

- `POST /settings` - Create a new setting
- `GET /settings?page=1&limit=10` - Get all settings (paginated)
- `GET /settings/{uid}` - Get a specific setting
- `PUT /settings/{uid}` - Update a setting
- `DELETE /settings/{uid}` - Delete a setting
- `GET /health` - Health check

## Architecture Decisions

### Database: PostgreSQL
- **JSONB support** for efficient schemaless JSON storage
- **ACID compliance** for data integrity
- **Proven scalability** for production use

### Pagination: Offset-based
- Simple and user-friendly
- Direct page navigation
- Optimal for moderate-sized datasets
- Could migrate to cursor-based for millions of records

### TypeScript
- Type safety catches errors at compile time
- Improved developer experience
- Aligns with modern web development standards

## Project Structure
```
settings-management-system/
├── backend/
│   ├── src/
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── index.html
│   └── package.json
├── docker-compose.yml
└── README.md
```
```

3. **Save**

---

### **Step 14: Create .gitignore**

1. **In root folder, create new file: `.gitignore`**
2. Paste this:
```
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
build/

# Environment variables
.env
.env.local

# IDEs
.vscode/
.DS_Store

# Docker
*.log