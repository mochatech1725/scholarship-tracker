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

#### **ProductionDatabaseManager** (AWS RDS)
- Connects to AWS RDS MySQL database
- Uses environment variables: `RDS_MYSQL_HOST`, `RDS_MYSQL_PORT`, `RDS_MYSQL_USER`, `RDS_MYSQL_PASSWORD`, `RDS_MYSQL_DATABASE`
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
  - Follows AWS web crawling best practices
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