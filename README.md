# Scholarship Tracker

A comprehensive scholarship tracking and management system built with modern web technologies, featuring an AI-powered scholarship discovery system.

## Project Structure

This is a monorepo containing the following components:

- **client/**: Vue.js/Quasar frontend application
- **server/**: Node.js/Express backend API
- **scraper/**: Python-based scholarship data scraper with AI-powered discovery
- **scholarship-types/**: Shared TypeScript type definitions

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn
- OpenAI API key
- Google Custom Search API key

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
   # Create .env file in the root directory
   touch .env
   
   # Add required API keys (see Configuration section below)
   ```

4. **Start development servers**
   ```bash
   # Start the backend server (in one terminal)
   cd server && npm run dev
   
   # Start the frontend client (in another terminal)
   cd client && npm run dev
   ```

## Configuration

### Required API Keys

The AI discovery scraper requires the following API keys in your `.env` file:

```bash
# OpenAI API Key - For AI-powered query generation and content verification
OPENAI_API_KEY=your_openai_api_key_here

# Google Custom Search API Key - For web search functionality
GOOGLE_API_KEY=your_google_api_key_here

# Google Custom Search Engine ID - For targeted search results
GOOGLE_CUSTOM_SEARCH_CX=your_google_custom_search_engine_id_here
```

### Setting Up API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `.env` file as `OPENAI_API_KEY=sk-...`

#### Google Custom Search API
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable the Custom Search API:
   - Go to https://console.cloud.google.com/apis/library/customsearch.googleapis.com
   - Click **"Enable"**
4. Create API credentials:
   - Go to https://console.cloud.google.com/apis/credentials
   - Click **"+ Create credentials"** → **"API key"**
   - **Important**: Set API restrictions to **"Don't restrict key"** or add **"Custom Search API"** to allowed APIs
5. Add to `.env` file as `GOOGLE_API_KEY=...`

#### Google Custom Search Engine
1. Go to https://cse.google.com/
2. Create a new search engine
3. Configure to search the entire web
4. Get the Search Engine ID (looks like: `123456789:abcdefghijk`)
5. Add to `.env` file as `GOOGLE_CUSTOM_SEARCH_CX=...`

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
- `python main.py --list` - List available scrapers
- `python main.py --scraper ai_discovery` - Run AI discovery scraper
- `python main.py --all` - Run all scrapers
- `python -m pytest` - Run tests

## AI Discovery Scraper

The scraper includes an advanced AI-powered scholarship discovery system that:

- **Discovers Sources**: Uses AI to generate targeted search queries for 8 categories (STEM, Healthcare, Pharmaceuticals, etc.)
- **Searches Intelligently**: Performs Google Custom Search to find scholarship opportunities
- **Verifies Sources**: Uses AI to verify if discovered URLs actually offer scholarships
- **Crawls Ethically**: Respects robots.txt and implements polite crawling practices
- **Extracts Data**: Uses AI to extract structured scholarship data from web pages

### Categories Supported
- **STEM** - Engineering firms, tech companies, computer science organizations
- **Healthcare & Medical** - Hospitals, medical practices, healthcare organizations
- **Pharmaceuticals** - Pharmaceutical companies, biotech firms
- **Financial Services** - Banks, insurance companies, investment firms
- **Energy & Utilities** - Energy companies, utility providers
- **Consumer Goods** - Consumer product companies, retail brands
- **Agriculture & Food** - Agricultural companies, food producers
- **Construction & Real Estate** - Construction firms, real estate companies

### Running the AI Discovery Scraper

```bash
# Navigate to scraper directory
cd scraper

# Activate virtual environment
source venv/bin/activate

# Run AI discovery scraper
python3 main.py --scraper ai_discovery
```

For detailed documentation, see [scraper/README_SCRAPER_ARCHITECTURE.md](scraper/README_SCRAPER_ARCHITECTURE.md).

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
- **Framework**: Custom scraping framework with AI-powered discovery
- **AI Integration**: OpenAI GPT for query generation and content verification
- **Search Integration**: Google Custom Search API for source discovery
- **Deployment**: Local Python environment
- **Storage**: Local MySQL database

## Troubleshooting

### Common Issues

#### Google API 403 Forbidden Error
If you get `API_KEY_SERVICE_BLOCKED` errors:
1. Enable Custom Search API: https://console.cloud.google.com/apis/library/customsearch.googleapis.com
2. Check API key restrictions: Set to "Don't restrict key" or add "Custom Search API"
3. Create new API key if needed

#### Missing Environment Variables
Ensure your `.env` file is in the root directory and contains all required API keys.

#### Virtual Environment Issues
```bash
cd scraper
source venv/bin/activate
pip install -r requirements.txt
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[Add your license information here]
