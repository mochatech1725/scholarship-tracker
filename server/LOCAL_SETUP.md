# Local Development Setup Guide

This guide will help you set up the Scholarship Tracker server for local development without any AWS dependencies.

## Prerequisites

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Local Database

Run the database setup script:

```bash
bash scripts/setup-local-db.sh
```

This script will:
- Check if MySQL is running
- Create the `scholarship_tracker` database
- Set up the required schema

### 3. Configure Environment

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
APP_DEBUG=true

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=scholarship_tracker

# CORS Configuration
CORS_ORIGIN=http://localhost:9000

# Auth0 Configuration (optional for development)
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com/
AUTH0_AUDIENCE=https://your-api-identifier

# App Secret (at least 32 characters long)
APP_SECRET=your-super-secret-key-at-least-32-characters-long

# OpenAI Configuration (optional)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo

# Application Configuration
MAX_RESULTS=100
```

### 4. Build and Run

```bash
# Build TypeScript
npm run build

# Start development server
npm run dev
```

The server will start on port 3000 by default.

## Database Schema

The application uses the following main tables:

- `scholarships` - Scholarship data from the scraper
- `users` - User accounts and profiles
- `applications` - Scholarship applications
- `recommenders` - Recommendation letters and references
- `essays` - Essay submissions

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Recommenders
- `GET /api/recommenders` - Get all recommenders
- `GET /api/recommenders/:id` - Get recommender by ID
- `GET /api/recommenders/getByUserId/:userId` - Get recommenders by user ID
- `POST /api/recommenders` - Create new recommender
- `PUT /api/recommenders/:id` - Update recommender
- `DELETE /api/recommenders/:id` - Delete recommender

### Scholarship Search
- `POST /api/scholarships/find` - Search for scholarships
- `GET /api/scholarships/sources` - Get available scholarship sources


## Development Workflow

1. **Start MySQL** (if not running as a service)
2. **Start the server:** `npm run dev`
3. **Start the client:** (in the client directory) `npm run dev`
4. **Start the scraper:** (in the scraper directory) `python main.py`

## What Was Removed

The following AWS-related components were removed to create a less expensive version to test with:

- AWS Secrets Manager integration
- AWS RDS configuration
- AWS SDK dependencies
- Bastion host scripts
- AWS-specific environment variables

The application now uses:
- Local MySQL database
- Environment variables for configuration
- Direct database connections via Knex
