# Scholarship Tracker - Scraper Component

This is the scraper component of the Scholarship Tracker system, featuring Python-based scrapers for both development and production environments.

## 🏗️ Architecture Overview

### Scraper Design
- **Python Scrapers**: For local development, testing, and production
- **Environment Support**: Local, dev, staging, production

### Components
- **Python Scrapers**: BeautifulSoup-based scrapers for development and production
- **AWS Infrastructure**: CDK-based infrastructure as code
- **Database**: MySQL for both development and production

## 🚀 Quick Start

### Prerequisites
- Python 3.13+
- Node.js 18+
- MySQL (local for development)
- AWS CLI (for production deployment)

### Local Development Setup

1. **Clone and Setup**
   ```bash
   cd /Users/teial/Tutorials/scholarship-tracker/scraper
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Database Setup**
   ```bash
   mysql -u root < scripts/python/setup_local_db.sql
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your local database settings
   ```

4. **Test Scrapers**
   ```bash
   # Test CareerOneStop scraper
   python main.py --scraper careerone --environment local
   
   # Test CollegeScholarship scraper
   python main.py --scraper collegescholarship --environment local
   
   # List available scrapers
   python main.py --list
   ```

### Production Deployment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Deploy Infrastructure**
   ```bash
   npm run cdk deploy
   ```

3. **Configure Environment**
   ```bash
   # Set up AWS credentials and environment variables
   export AWS_REGION=us-east-1
   export ENVIRONMENT=prod
   ```

## 📁 Project Structure

```
scraper/
├── src/                    # Infrastructure and utilities
│   ├── utils/             # Shared utilities
│   ├── batch/             # AWS Batch job definitions
│   ├── lambda/            # Lambda functions
│   └── utils/             # Shared utilities
├── cdk/                   # AWS CDK infrastructure code
├── scripts/               # Setup and utility scripts
│   ├── python/           # Python development scripts
│   └── aws/              # AWS deployment scripts
├── docs/                  # Documentation
├── *.py                   # Python scraper implementations
├── package.json           # Node.js dependencies
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## 🔧 Available Scrapers

### Python Scrapers
- `careeronestop` - CareerOneStop.org scraper
- `collegescholarship` - CollegeScholarships.org scraper
- `general` - General web scraper
- `rss` - RSS/API feed scraper



## 🌍 Environment Switching

The system supports multiple environments:

```bash
# Local development
python main.py --scraper careerone --environment local

# Development environment
python main.py --scraper careerone --environment dev

# Staging environment
python main.py --scraper careerone --environment staging

# Production environment
python main.py --scraper careerone --environment prod
```

## 🗄️ Database Schema

### Core Tables
- **scholarships**: Scholarship data storage
- **websites**: Scraper configuration and type selection
- **jobs**: Scraping job tracking and metadata
- **users**: User management (for server integration)
- **applications**: Application tracking (for server integration)
- **recommenders**: Recommender management (for server integration)

## 🔒 Security

### Production Security
- VPC isolation with private subnets
- IAM roles with least privilege access
- AWS Secrets Manager for credentials
- Security groups and VPC endpoints

### Development Security
- Local virtual environment isolation
- Local MySQL with development credentials
- No external dependencies for testing

## 📊 Monitoring

### Production Monitoring
- CloudWatch Logs and Metrics
- AWS Batch job monitoring
- Lambda function monitoring
- Database performance monitoring

### Development Monitoring
- Local logging to console
- Debug tools for HTML analysis
- Local database inspection

## 🛠️ Development Tools

### Debug Scripts
- `scripts/python/debug_collegescholarship.py` - HTML structure analysis
- `scripts/python/configure_scrapers.py` - Scraper configuration management
- `scripts/python/test_environment_switch.py` - Environment switching tests

### Utility Scripts
- `scripts/python/run_scraper.sh` - Simplified scraper execution
- `scripts/python/setup_local_db.sql` - Local database setup
- `scripts/aws/` - AWS deployment and management scripts

## 📈 Performance

### Production Performance
- AWS Batch auto-scaling
- S3 storage for raw data
- CloudWatch monitoring
- Lambda orchestration

### Development Performance
- Local processing for immediate feedback
- No AWS charges during development
- Fast iteration and debugging
- Isolated testing environment

## 🤝 Contributing

1. **Local Development**: Use Python scrapers for testing
2. **Production Changes**: Update Python scrapers
3. **Infrastructure**: Modify CDK code for AWS changes
4. **Database**: Update schema in setup scripts

## 📚 Documentation

- [System Design](docs/ScholarshipTrackerSystemDesign.md)
- [Technical Design](docs/ScholarshipTrackerTechnicalDesign.md)
- [Scraping Strategies](SCRAPING_STRATEGIES.md)
- [Command Line Usage](scripts/python/COMMAND_LINE_USAGE.md)

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection**: Check `.env.local` configuration
2. **Scraper Not Found**: Use `python main.py --list` to see available scrapers
3. **Environment Issues**: Ensure virtual environment is activated
4. **AWS Deployment**: Check AWS credentials and region settings

### Debug Commands
```bash
# Check scraper configuration
python scripts/python/configure_scrapers.py

# Test database connection
python scripts/python/test_mysql_connection.py

# Debug HTML structure
python debug_collegescholarship.py
```

## 📄 License

This project is part of the Scholarship Tracker system. See the main project documentation for licensing information.