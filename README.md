# Scholarship Tracker

A comprehensive scholarship tracking and management system built with modern web technologies.

## Project Structure

This is a monorepo containing the following components:

- **client/**: Vue.js/Quasar frontend application
- **server/**: Node.js/Express backend API
- **scraper/**: Python-based scholarship data scraper
- **scholarship-types/**: Shared TypeScript type definitions

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scholarship-tracker
   ```

2. **Install dependencies for all components**
   ```bash
   # Install client dependencies
   cd client && npm install && cd ..
   
   # Install server dependencies
   cd server && npm install && cd ..
   
   # Install scraper dependencies
   cd scraper && pip install -r requirements.txt && cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment files
   cp server/env.example server/.env
   cp scraper/env.example scraper/.env
   ```

4. **Start development servers**
   ```bash
   # Start the backend server (in one terminal)
   cd server && npm run dev
   
   # Start the frontend client (in another terminal)
   cd client && npm run dev
   ```

## Available Scripts

### Client (Vue.js/Quasar)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Server (Node.js/Express)
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Scraper (Python)
- `python main.py` - Run the scholarship scraper
- `python -m pytest` - Run tests

## VS Code Workspace

This project includes a VS Code workspace configuration with:

- **Tasks**: Build and development tasks for all components
- **Launch Configurations**: Debug configurations for Node.js and Python
- **Recommended Extensions**: Essential extensions for development

To use the workspace:
1. Open VS Code
2. File → Open Workspace from File...
3. Select `.vscode/scholarship-tracker.code-workspace`

## Architecture

### Frontend (Client)
- **Framework**: Vue.js 3 with Composition API
- **UI Framework**: Quasar Framework
- **State Management**: Pinia
- **Build Tool**: Vite
- **Language**: TypeScript

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL (with Knex.js ORM)
- **Authentication**: Auth0

### Data Scraper
- **Language**: Python
- **Framework**: Custom scraping framework
- **Deployment**: AWS Lambda with CDK
- **Storage**: AWS S3 and RDS

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[Add your license information here]
