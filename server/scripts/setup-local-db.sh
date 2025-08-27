#!/bin/bash

# Local MySQL Database Setup Script
# This script helps set up a local MySQL database for the scholarship tracker

set -e

echo "🚀 Setting up local MySQL database for Scholarship Tracker"
echo "=========================================================="

# Check if MySQL is running
if ! mysqladmin ping -h localhost --silent; then
    echo "❌ MySQL is not running. Please start MySQL first."
    echo "   On macOS: brew services start mysql"
    echo "   On Ubuntu: sudo systemctl start mysql"
    echo "   On Windows: Start MySQL service from Services"
    exit 1
fi

echo "✅ MySQL is running"

# Get database credentials
echo "🔐 Database Configuration:"
read -p "Database Name (default: scholarship_tracker): " DB_NAME
DB_NAME=${DB_NAME:-scholarship_tracker}

read -p "Database User (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Database Password: " DB_PASSWORD
echo

# Create database if it doesn't exist
echo "📊 Creating database '$DB_NAME'..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run schema creation
echo "🏗️  Creating database schema..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/schema.sql

echo "✅ Database setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Copy env.example to .env"
echo "2. Update .env with your database credentials:"
echo "   DB_HOST=localhost"
echo "   DB_PORT=3306"
echo "   DB_USER=$DB_USER"
echo "   DB_PASSWORD=$DB_PASSWORD"
echo "   DB_NAME=$DB_NAME"
echo "3. Run 'npm install' to install dependencies"
echo "4. Run 'npm run build' to build the TypeScript"
echo "5. Run 'npm run dev' to start the development server"
