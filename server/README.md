# Scholarship Server

A comprehensive scholarship management server built with Express.js, TypeScript, and MySQL, featuring Auth0 integration and advanced scholarship search capabilities.

---

## Features

- **User Authentication**: Secure authentication using Auth0
- **Application Management**: Create, read, update, and delete scholarship applications
- **Recommender System**: Manage recommendation letters and references
- **Scholarship Search (via External Scraper Service)**: This server connects to a MySQL database populated by a separate service called `scholarship-scraper`, which searches for scholarships (using AI and scraping) and stores them in the database. This server uses Knex to query and serve those results.
- **RESTful API**: Clean, well-documented API endpoints
- **TypeScript**: Full type safety and better development experience
- **MySQL**: Local relational database for scholarships (via Knex)
- **Security**: Helmet, CORS

---

## Local Development

This project uses:

- **MySQL**: Local database for storing all application and scholarship data
- **Environment Variables**: For managing database credentials

> **Note:** This server connects to a local MySQL database. Scholarship data is provided by the external `scholarship-scraper` service.

### Environment Variables

Add the following to your `.env` file:

```bash
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=scholarship_tracker
```

---

## How to Run Locally

### 1. Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 2. Clone and Install

```bash
git clone <repository-url>
cd scholarship-server
npm install
cp env.example .env
```

### 3. Set Up Local Database

Run the database setup script:

```bash
bash scripts/setup-local-db.sh
```

This script will:
- Check if MySQL is running
- Create the database if it doesn't exist
- Set up the required schema

### 4. Configure Environment

Edit `.env` with your database credentials and Auth0 configuration.

### 5. Build and Run

```bash
npm run build
npm run dev
```

The server will start on port 3000 by default.


## API Endpoints

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
- `POST /api/scholarships/find` - Search for scholarships (queries MySQL database populated by scholarship-scraper)
- `GET /api/scholarships/sources` - Get available scholarship sources
- `GET /api/scholarships/health` - Check service health

