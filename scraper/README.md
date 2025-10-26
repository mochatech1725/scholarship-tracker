# Scholarship Scraper - Complete Guide

A comprehensive, AI-powered scholarship discovery system that finds scholarships from diverse sources including businesses, professional associations, and industry organizations.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Scraping Strategies](#scraping-strategies)
4. [Setup and Configuration](#setup-and-configuration)
5. [Usage](#usage)
6. [Troubleshooting](#troubleshooting)

## Overview

This scraper provides multiple approaches for discovering scholarship opportunities:

- **AI Discovery Scraper**: Finds scholarships from businesses and industry organizations using AI
- **General Scraper**: Efficient broad-based scraping of major scholarship sites
- **Website-Specific Scrapers**: Targeted scraping of specific scholarship websites

## Architecture

### Database Architecture

The scraper uses a clean database abstraction with the Factory pattern:

#### **DatabaseManager** (Abstract Base Class)
- Defines the interface for database operations
- Handles scholarship saving, job status updates, and connection management

#### **LocalDatabaseManager** (Local Development)
- Connects to local MySQL database
- Uses environment variables: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- Logs job status updates locally

#### **ProductionDatabaseManager** (Production)
- Connects to production MySQL database
- Uses environment variables: `PROD_MYSQL_HOST`, `PROD_MYSQL_PORT`, `PROD_MYSQL_USER`, `PROD_MYSQL_PASSWORD`, `PROD_MYSQL_DATABASE`
- Designed for production job status tracking

#### **DatabaseManagerFactory**
- Creates the appropriate database manager based on environment
- Supports: `local`, `dev`, `staging`, `prod` environments
- Automatically defaults to local for unknown environments

### AI Discovery Components

#### 1. Source Discovery Engine (`source_discovery_engine.py`)
- **Purpose**: AI-powered discovery of new scholarship sources
- **Features**:
  - Generates targeted Google search queries using OpenAI
  - Performs Google Custom Search API queries
  - Uses AI to verify if discovered URLs actually offer scholarships
  - Supports multiple categories (STEM, Business, Industry sectors)

#### 2. Ethical Crawler (`ethical_crawler.py`)
- **Purpose**: Polite and efficient website crawling
- **Features**:
  - Respects `robots.txt` directives
  - Implements crawl delays and rate limiting
  - Extracts URLs from sitemaps
  - Follows web crawling best practices
  - Extracts basic scholarship data during crawling

#### 3. Content Extraction Pipeline (`content_extraction_pipeline.py`)
- **Purpose**: AI-enhanced extraction of scholarship details
- **Features**:
  - Uses OpenAI for structured data extraction
  - Falls back to regex pattern matching if AI unavailable
  - Extracts title, amount, deadline, eligibility, and more
  - Supports both HTML and PDF content

#### 4. AI Discovery Scraper (`ai_discovery_scraper.py`)
- **Purpose**: Main orchestrator that integrates all components
- **Features**:
  - Multi-stage pipeline: Discovery → Crawling → Extraction → Processing
  - Configurable limits and thresholds
  - Comprehensive statistics and monitoring
  - Database integration for saving results

#### 5. Configuration System (`config/`)
- **Purpose**: Centralized configuration management
- **Features**:
  - JSON-based category definitions
  - Simple structure with just id, name, and keywords
  - Easy to modify and extend
  - Portable across different environments

### Category Configuration

The system uses a simplified category structure defined in `config/source_categories.json`:

```json
{
  "categories": [
    {
      "id": "STEM",
      "name": "STEM",
      "keywords": ["engineering", "technology", "tech", "software", "hardware", "computer science", "STEM"]
    },
    {
      "id": "healthcare_medical",
      "name": "Healthcare & Medical", 
      "keywords": ["healthcare", "medical", "hospital"]
    }
  ]
}
```

#### Current Categories (8 total):
- **STEM** - Engineering firms, tech companies, computer science organizations
- **Healthcare & Medical** - Hospitals, medical practices, healthcare organizations
- **Pharmaceuticals** - Pharmaceutical companies, biotech firms
- **Financial Services** - Banks, insurance companies, investment firms
- **Energy & Utilities** - Energy companies, utility providers
- **Consumer Goods** - Consumer product companies, retail brands
- **Agriculture & Food** - Agricultural companies, food producers
- **Construction & Real Estate** - Construction firms, real estate companies

## Scraping Strategies

### 1. **AI Discovery Scraper** (Most Advanced)

**File:** `ai_discovery_scraper.py`

**Approach:**
- Uses AI to discover new scholarship sources from businesses and organizations
- Generates targeted search queries using OpenAI
- Ethically crawls websites respecting robots.txt
- Extracts structured scholarship data using AI

**Benefits:**
- Finds "hidden" scholarships from non-traditional sources
- AI-powered discovery and extraction
- Ethical web crawling
- Comprehensive coverage across industries

**Usage:**
```bash
python3 main.py --scraper ai_discovery
```

### 2. **General Scraper** (Efficient Broad Search)

**File:** `general_scraper.py`

**Approach:**
- Uses only 3-6 broad search terms instead of 40+ specific keywords
- Searches: `['scholarship', 'financial aid', 'grant', 'fellowship', 'award']`
- Gets more results per search by using broader selectors
- Much faster and more efficient than keyword-by-keyword approach

**Benefits:**
- 6x faster than keyword-by-keyword approach
- Less likely to hit rate limits
- More comprehensive results per search
- Easier to maintain

**Usage:**
```bash
python3 main.py --scraper general
```

### 3. **Website-Specific Scrapers** (Targeted)

**Files:** `careeronestop_scraper.py`, `collegescholarship_scraper.py`

**Approach:**
- Targeted scraping of specific scholarship websites
- Uses efficient broad search approach
- Searches with single broad term: `'scholarship'`
- Much faster than the old keyword-by-keyword approach

**Usage:**
```bash
python3 main.py --scraper careeronestop_python
python3 main.py --scraper collegescholarship_python
```

### Performance Comparison

| Approach | Speed | Reliability | Data Quality | Discovery | Maintenance |
|----------|-------|-------------|--------------|-----------|-------------|
| AI Discovery | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| General | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Website-Specific | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

### Recommended Strategy

#### For Production:
```bash
# Weekly: Get comprehensive data with general scraper
python3 main.py --scraper general

# Monthly: Discover new sources with AI
python3 main.py --scraper ai_discovery

# Monthly: Get specific niche scholarships
python3 main.py --scraper careeronestop_python
python3 main.py --scraper collegescholarship_python
```

#### For Development/Testing:
```bash
# Quick test with general scraper
python3 main.py --scraper general

# Test AI discovery
python3 main.py --scraper ai_discovery
```

## Setup and Configuration

### 1. Environment Setup

#### Virtual Environment
```bash
# Navigate to scraper directory
cd scraper

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Environment Variables
Create a `.env` file in the parent directory (`/Users/teial/Tutorials/scholarship-tracker/.env`) with:

```bash
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=scholarships

# Production MySQL (for production)
PROD_MYSQL_HOST=your-production-mysql-host
PROD_MYSQL_PORT=3306
PROD_MYSQL_USER=your_username
PROD_MYSQL_PASSWORD=your_password
PROD_MYSQL_DATABASE=scholarships

# AI Discovery Scraper (Required)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CUSTOM_SEARCH_CX=your_custom_search_engine_id_here
```

### 2. API Setup

#### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add to `.env`: `OPENAI_API_KEY=your_key_here`

#### Google Custom Search API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the "Custom Search API"
4. Create credentials (API Key)
5. Add to `.env`: `GOOGLE_API_KEY=your_key_here`

#### Google Custom Search Engine
1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Create a new search engine
3. Get your Search Engine ID
4. Add to `.env`: `GOOGLE_CUSTOM_SEARCH_CX=your_engine_id_here`

### 3. Database Setup

#### Production MySQL (Optional)
1. Set up a production MySQL database
2. Note the host, username, and password
3. Add to `.env` file

## Usage

### Basic Usage
```bash
# List available scrapers
python3 main.py --help

# Run a specific scraper
python3 main.py --scraper ai_discovery
python3 main.py --scraper general
```

### Environment Switching
```bash
# Local mode (default)
python3 main.py --scraper general --environment local

# Production mode (Production MySQL)
python3 main.py --scraper general --environment prod
```

### Testing Your Setup
```bash
# Test configuration
python3 src/scrapers/config/config_loader.py

# Test Google API
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_SEARCH_ENGINE_ID&q=test"

# Test AI discovery
python3 main.py --scraper ai_discovery
```

## Troubleshooting

### Common Issues

#### 1. Google API 403 Forbidden Error
**Error:** `403 Client Error: Forbidden` with `API_KEY_SERVICE_BLOCKED`

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Library"
3. Search for "Custom Search API" and enable it
4. Go to "APIs & Services" > "Credentials"
5. Edit your API key
6. Under "API restrictions", either:
   - Select "Don't restrict key" (for testing)
   - Or add "Custom Search API" to allowed APIs

#### 2. Missing Environment Variables
**Error:** `❌ Missing required API keys for AI discovery scraper`

**Solution:**
1. Check your `.env` file is in the parent directory
2. Verify all required keys are set:
   - `OPENAI_API_KEY`
   - `GOOGLE_API_KEY`
   - `GOOGLE_CUSTOM_SEARCH_CX`

#### 3. Virtual Environment Issues
**Error:** `ModuleNotFoundError: No module named 'dotenv'`

**Solution:**
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Cost Estimates

#### OpenAI API
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Typical run**: ~$0.10-0.50 per category
- **Monthly estimate**: $5-20 depending on usage

#### Google Custom Search API
- **Free tier**: 100 queries/day
- **Paid tier**: $5 per 1000 queries
- **Typical run**: 10-50 queries
- **Monthly estimate**: $0-5 depending on usage

### Getting Help

1. **Check the logs** for detailed error messages
2. **Verify API keys** are correctly set in `.env`
3. **Test individual components** using the test commands above
4. **Check Google Cloud Console** for API enablement and restrictions

## Next Steps

1. **Start with the general scraper** to test your setup
2. **Set up API keys** for AI discovery features
3. **Test different strategies** to find what works best for your needs
4. **Monitor costs** and adjust usage accordingly
5. **Customize categories** in `config/source_categories.json` for your specific interests
