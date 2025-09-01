#!/usr/bin/env python3
"""
Base scraper class for all scholarship scrapers
"""

import os
import time
import logging
import uuid
from abc import ABC, abstractmethod
from typing import List, Optional
from tenacity import retry, stop_after_attempt, wait_exponential

from ..utils_python import Scholarship, ScrapingResult, ScrapingMetadata
from ..utils_python.database_manager import DatabaseManagerFactory

logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """Base class for all scrapers"""
    
    def __init__(self, 
                 scholarships_table: str = "",
                 jobs_table: str = "",
                 job_id: str = "",
                 environment: str = "local",
                 raw_data_bucket: Optional[str] = None):
        self.scholarships_table = scholarships_table
        self.jobs_table = jobs_table
        self.job_id = job_id
        self.environment = environment
        self.raw_data_bucket = raw_data_bucket
        
        # Create database manager using factory
        self.db_manager = DatabaseManagerFactory.create_database_manager(environment)
        
        # Rate limiting
        self.last_call_time = 0
        self.min_delay = 1.0  # Minimum delay between requests
    
    def _rate_limit(self):
        """Implement rate limiting between requests"""
        current_time = time.time()
        time_since_last = current_time - self.last_call_time
        
        if time_since_last < self.min_delay:
            sleep_time = self.min_delay - time_since_last
            time.sleep(sleep_time)
        
        self.last_call_time = time.time()
    
    def get_db_connection(self):
        """Get database connection from manager"""
        return self.db_manager.get_connection()
    
    def close_db_connection(self):
        """Close database connection"""
        self.db_manager.disconnect()
    
    def create_scholarship_id(self) -> str:
        """Generate a unique scholarship ID"""
        return f"sch_{uuid.uuid4().hex[:16]}"
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def save_scholarship(self, scholarship: Scholarship) -> bool:
        """Save scholarship to database using database manager"""
        try:
            return self.db_manager.save_scholarship(scholarship)
        except Exception as e:
            logger.error(f"Error saving scholarship: {e}")
            raise
    
    def update_job_status(self, status: str, metadata: ScrapingMetadata):
        """Update job status using database manager"""
        self.db_manager.update_job_status(status, metadata)
    
    def clean_text(self, text: str, max_length: Optional[int] = None) -> str:
        """Clean and truncate text"""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Truncate if needed
        if max_length and len(text) > max_length:
            text = text[:max_length-3] + "..."
        
        return text
    
    def extract_amount(self, text: str) -> Optional[float]:
        """Extract monetary amount from text"""
        import re
        
        if not text:
            return None
        
        # Look for dollar amounts
        pattern = r'\$?([0-9,]+(?:\.[0-9]{2})?)'
        matches = re.findall(pattern, text)
        
        if matches:
            # Take the largest amount found
            amounts = [float(match.replace(',', '')) for match in matches]
            return max(amounts)
        
        return None
    
    @abstractmethod
    def scrape(self) -> ScrapingResult:
        """Main scraping method to be implemented by subclasses"""
        pass
    
    def run(self) -> ScrapingResult:
        """Main entry point for running the scraper"""
        logger.info(f"Starting {self.__class__.__name__}")
        
        try:
            # Create metadata with job information
            job_metadata = ScrapingMetadata()
            job_metadata.job_id = self.job_id
            website_name = self.__class__.__name__.replace('Scraper', '').lower()
            job_metadata.website = website_name
            logger.debug(f"Setting website name: {website_name} for class: {self.__class__.__name__}")
            
            # Update job status to running
            self.update_job_status('running', job_metadata)
            
            # Perform scraping
            result = self.scrape()
            
            # Add job information to result metadata
            if hasattr(result.metadata, '__dict__'):
                result.metadata.job_id = self.job_id
                result.metadata.website = self.__class__.__name__.replace('Scraper', '').lower()
                completed_metadata = result.metadata
            elif isinstance(result.metadata, dict):
                result.metadata['job_id'] = self.job_id
                result.metadata['website'] = self.__class__.__name__.replace('Scraper', '').lower()
                # Convert dict to ScrapingMetadata object
                completed_metadata = ScrapingMetadata(
                    records_found=result.metadata.get('total_found', 0),
                    records_processed=result.metadata.get('total_processed', 0),
                    records_inserted=result.metadata.get('total_inserted', 0),
                    records_updated=result.metadata.get('total_updated', 0),
                    job_id=result.metadata.get('job_id'),
                    website=result.metadata.get('website'),
                    errors=result.metadata.get('errors', [])
                )
            else:
                # Fallback: create basic metadata
                completed_metadata = ScrapingMetadata(
                    job_id=self.job_id,
                    website=self.__class__.__name__.replace('Scraper', '').lower()
                )
            
            # Update job status to completed
            self.update_job_status('completed', completed_metadata)
            
            logger.info(f"Scraping completed successfully. Found {len(result.scholarships)} scholarships")
            return result
            
        except Exception as e:
            logger.error(f"Scraping failed: {e}")
            
            # Create metadata with job information for failed status
            failed_metadata = ScrapingMetadata(errors=[str(e)])
            failed_metadata.job_id = self.job_id
            failed_metadata.website = self.__class__.__name__.replace('Scraper', '').lower()
            
            self.update_job_status('failed', failed_metadata)
            
            # Return a proper ScrapingResult instead of raising the exception
            return ScrapingResult(
                success=False,
                scholarships=[],
                errors=[str(e)],
                metadata={
                    'job_id': self.job_id,
                    'website': self.__class__.__name__.replace('Scraper', '').lower(),
                    'total_found': 0,
                    'total_processed': 0,
                    'total_inserted': 0,
                    'total_updated': 0
                }
            )
        finally:
            # Clean up database connection
            self.close_db_connection()
