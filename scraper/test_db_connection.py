#!/usr/bin/env python3
"""
Test database connection script
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.utils_python.database_manager import DatabaseManagerFactory

# Load environment variables
load_dotenv('../.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_database_connection():
    """Test database connection"""
    logger.info("Testing database connection...")
    
    # Print environment variables
    logger.info("Environment variables:")
    logger.info(f"  MYSQL_HOST: {os.getenv('MYSQL_HOST', 'NOT SET')}")
    logger.info(f"  MYSQL_PORT: {os.getenv('MYSQL_PORT', 'NOT SET')}")
    logger.info(f"  MYSQL_USER: {os.getenv('MYSQL_USER', 'NOT SET')}")
    logger.info(f"  MYSQL_PASSWORD: {'SET' if os.getenv('MYSQL_PASSWORD') else 'NOT SET'}")
    logger.info(f"  MYSQL_DATABASE: {os.getenv('MYSQL_DATABASE', 'NOT SET')}")
    
    # Test local database manager
    try:
        logger.info("\nTesting LocalDatabaseManager...")
        db_manager = DatabaseManagerFactory.create_database_manager("local")
        
        # Test connection
        if db_manager.connect():
            logger.info("✅ Local database connection successful!")
            
            # Test job status update
            logger.info("Testing job status update...")
            from src.utils_python import ScrapingMetadata
            metadata = ScrapingMetadata(
                job_id="test_job_123",
                website="test_website",
                records_found=5,
                records_processed=5,
                records_inserted=3,
                records_updated=2
            )
            
            db_manager.update_job_status('running', metadata)
            logger.info("✅ Job status update successful!")
            
            db_manager.disconnect()
            logger.info("✅ Database disconnected successfully!")
        else:
            logger.error("❌ Local database connection failed!")
            
    except Exception as e:
        logger.error(f"❌ Error testing local database: {e}")
    
    # Test production database manager
    try:
        logger.info("\nTesting ProductionDatabaseManager...")
        db_manager = DatabaseManagerFactory.create_database_manager("prod")
        
        # Test connection
        if db_manager.connect():
            logger.info("✅ Production database connection successful!")
            db_manager.disconnect()
        else:
            logger.error("❌ Production database connection failed!")
            
    except Exception as e:
        logger.error(f"❌ Error testing production database: {e}")

if __name__ == "__main__":
    test_database_connection()
