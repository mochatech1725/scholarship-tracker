# Scholarship Scraper Technical Architecture

## Overview

The Scholarship Scraper is a Python-based system designed to collect scholarship information from various web sources. It operates as a local/on-premises solution with MySQL database storage and can be deployed to various environments (local, dev, staging, production).

## Detailed Architecture Components

### 1. Infrastructure

- **Local Development**: MySQL database running locally or via Docker
- **Production**: MySQL database (RDS or on-premises)
- **Storage**: Local file system for raw data and logs
- **Environment Support**: Local, dev, staging, and production configurations

### 2. Database Architecture

- **MySQL Database**: Centralized storage for all scholarship data
- **Tables**:
  - `scholarships`: Stores processed scholarship data with comprehensive fields
  - `jobs`: Tracks scraping job metadata and status
  - `websites`: Stores website configurations and scraper settings
  - `applications`: User scholarship applications (if using the full system)

### 3. Scheduling & Orchestration

- **Manual Execution**: Command-line interface for running scrapers
- **Batch Processing**: Support for running multiple scrapers sequentially
- **Job Tracking**: Comprehensive job status tracking in the database
- **Error Handling**: Robust error handling with retry mechanisms

### 4. Data Sources

#### Web Scraping
- **CareerOneStop**: Web crawling for CareerOneStop.org using BeautifulSoup
- **CollegeScholarship**: Web crawling for CollegeScholarships.com
- **General Scraper**: AI-powered intelligent search and extraction
- **AI Discovery**: OpenAI-powered discovery of new scholarship sources
- **Ethical Crawler**: Respectful web crawling with robots.txt compliance

### 5. Data Processing

- **Raw Data Storage**: Local file system for HTML, JSON, and API responses
- **AI Processing**: OpenAI integration for intelligent data extraction
- **Deduplication**: MD5 hash-based duplicate detection
- **Data Parsing**: Intelligent extraction of scholarship details
- **Validation**: Ensures data quality before storage

## Raw Data Storage Structure

```
./raw_data/
├── CareerOneStopScraper/
│   ├── 2024/01/15/
│   │   ├── 2024-01-15T10-30-00-123Z-abc12345.html
│   │   └── 2024-01-15T10-30-00-123Z-abc12345-metadata.json
├── GeneralScraper/
│   └── 2024/01/15/
│       ├── 2024-01-15T10-35-00-456Z-def67890.json
│       └── 2024-01-15T10-35-00-456Z-def67890-metadata.json
└── AIDiscoveryScraper/
    └── 2024/01/15/
        └── ...
```

## Website Configuration Management

The system uses a MySQL-based configuration system that allows:
- Runtime enabling/disabling of scrapers
- Configuration updates without code changes
- Centralized management of all scraper settings

## Deduplication Strategy

1. **ID Generation**: MD5 hash of scholarship title + organization
2. **Duplicate Check**: Query MySQL before insertion
3. **Update Logic**: Upsert pattern - insert if new, update if exists
4. **In-Memory Deduplication**: Remove duplicates before database operations

## Security Considerations

- **Environment Variables**: Secure storage of API keys and database credentials
- **Database Security**: MySQL user authentication and access control
- **Rate Limiting**: Respectful web scraping with configurable delays
- **Robots.txt Compliance**: Ethical crawling practices
- **User Agent**: Transparent identification as ScholarshipBot

## Monitoring & Observability

- **Structured Logging**: Comprehensive logging with different levels
- **Job Tracking**: Database-based job status and metadata tracking
- **Error Handling**: Detailed error logging and reporting
- **Performance Metrics**: Processing time, success rates, and error counts
- **Database Monitoring**: Connection status and query performance

## Scaling Considerations

- **Sequential Processing**: Scrapers run sequentially to avoid overwhelming sources
- **Configurable Delays**: Adjustable rate limiting between requests
- **Database Connection Pooling**: Efficient database connection management
- **Memory Management**: Process scholarships in batches to manage memory usage
- **Error Recovery**: Automatic retry mechanisms with exponential backoff

## Cost Optimization

- **Local Storage**: No cloud storage costs for raw data
- **Database Optimization**: Efficient MySQL queries and indexing
- **Rate Limiting**: Prevents API quota exhaustion
- **Resource Management**: Configurable limits on concurrent operations
- **Efficient Processing**: Batch operations and optimized data structures

## Benefits of Current Architecture

1. **Simplicity**: Easy to understand and maintain
2. **Flexibility**: Can run locally or deploy to any environment
3. **Cost Effective**: No ongoing cloud service costs
4. **Full Control**: Complete control over data and processing
5. **Easy Deployment**: Simple Python application with MySQL dependency
6. **Scalability**: Can scale horizontally by running multiple instances

 