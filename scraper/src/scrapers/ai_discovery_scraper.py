#!/usr/bin/env python3
"""
Enhanced AI Discovery Scraper
Integrates ethical crawling, AI-powered source discovery, and content extraction
"""

import os
import time
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
from .base_scraper import BaseScraper
from .ethical_crawler import EthicalCrawler, CrawlConfig
from .source_discovery_engine import SourceDiscoveryEngine
from .content_extraction_pipeline import ContentExtractionPipeline, ExtractedScholarship
from .config.config_loader import SourceCategoryConfig

logger = logging.getLogger(__name__)

@dataclass
class DiscoveryStats:
    """Statistics for the discovery process"""
    total_sources_discovered: int
    total_scholarships_extracted: int
    categories_searched: int
    processing_time: float
    sources_by_category: Dict[str, int]
    scholarships_by_category: Dict[str, int]

class EnhancedAIDiscoveryScraper(BaseScraper):
    """Enhanced AI-powered scholarship discovery scraper"""
    
    def __init__(self, 
                 openai_api_key: str,
                 google_api_key: str,
                 google_cse_id: str,
                 max_sources_per_category: int = 10,
                 max_scholarships_per_source: int = 5):
        
        super().__init__()
        
        # Initialize components
        self.discovery_engine = SourceDiscoveryEngine(
            openai_api_key=openai_api_key,
            google_api_key=google_api_key,
            google_cse_id=google_cse_id
        )
        
        self.crawler = EthicalCrawler(CrawlConfig())
        self.extraction_pipeline = ContentExtractionPipeline(openai_api_key)
        self.config = SourceCategoryConfig()
        
        # Configuration
        self.max_sources_per_category = max_sources_per_category
        self.max_scholarships_per_source = max_scholarships_per_source
        
        # Statistics
        self.stats = DiscoveryStats(
            total_sources_discovered=0,
            total_scholarships_extracted=0,
            categories_searched=0,
            processing_time=0.0,
            sources_by_category={},
            scholarships_by_category={}
        )
    
    def scrape(self, categories: Optional[List[str]] = None) -> List[ExtractedScholarship]:
        """Main scraping method - discover sources and extract scholarships"""
        
        start_time = time.time()
        logger.info("Starting enhanced AI discovery scraper")
        
        # Stage 1: Discovery
        logger.info("Stage 1: Discovering scholarship sources...")
        discovered_sources = self._discover_sources(categories)
        
        # Stage 2: Crawling
        logger.info("Stage 2: Crawling discovered sources...")
        crawled_pages = self._crawl_sources(discovered_sources)
        
        # Stage 3: Extraction
        logger.info("Stage 3: Extracting scholarship data...")
        extracted_scholarships = self._extract_scholarships(crawled_pages)
        
        # Stage 4: Processing and saving
        logger.info("Stage 4: Processing and saving scholarships...")
        self._process_scholarships(extracted_scholarships)
        
        # Update statistics
        self.stats.processing_time = time.time() - start_time
        self.stats.total_sources_discovered = len(discovered_sources)
        self.stats.total_scholarships_extracted = len(extracted_scholarships)
        
        logger.info(f"Scraping complete: {len(extracted_scholarships)} scholarships extracted")
        return extracted_scholarships
    
    def _discover_sources(self, categories: Optional[List[str]] = None) -> List:
        """Discover scholarship sources using AI-powered discovery engine"""
        
        if categories is None:
            categories = self.config.get_category_ids()
        
        self.stats.categories_searched = len(categories)
        logger.info(f"Discovering sources for {len(categories)} categories")
        
        all_sources = []
        
        for category_id in categories:
            try:
                sources = self.discovery_engine.discover_sources(
                    categories=[category_id],
                    max_sources_per_category=self.max_sources_per_category
                )
                
                all_sources.extend(sources)
                self.stats.sources_by_category[category_id] = len(sources)
                
                logger.info(f"Discovered {len(sources)} sources for {category_id}")
                
                # Rate limiting between categories
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"Error discovering sources for {category_id}: {e}")
                continue
        
        return all_sources
    
    def _crawl_sources(self, sources: List) -> List[Dict]:
        """Crawl discovered sources to extract content"""
        
        crawled_pages = []
        
        for source in sources:
            try:
                logger.info(f"Crawling: {source.url}")
                
                # Crawl the source URL
                crawl_result = self.crawler.crawl_url(source.url)
                
                if crawl_result and crawl_result.get('content'):
                    crawled_pages.append({
                        'url': source.url,
                        'title': source.title,
                        'content': crawl_result['content'],
                        'category': source.category,
                        'confidence': source.confidence
                    })
                
                # Rate limiting
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error crawling {source.url}: {e}")
                continue
        
        return crawled_pages
    
    def _extract_scholarships(self, crawled_pages: List[Dict]) -> List[ExtractedScholarship]:
        """Extract scholarship data from crawled pages"""
        
        all_scholarships = []
        
        for page in crawled_pages:
            try:
                logger.info(f"Extracting scholarships from: {page['url']}")
                
                # Extract scholarships from page content
                extraction_result = self.extraction_pipeline.extract_scholarships(
                    content=page['content'],
                    source_url=page['url'],
                    category=page['category']
                )
                
                if extraction_result.success and extraction_result.scholarships:
                    all_scholarships.extend(extraction_result.scholarships)
                    
                    # Update statistics
                    category = page['category']
                    if category not in self.stats.scholarships_by_category:
                        self.stats.scholarships_by_category[category] = 0
                    self.stats.scholarships_by_category[category] += len(extraction_result.scholarships)
                
                # Rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                logger.error(f"Error extracting scholarships from {page['url']}: {e}")
                continue
        
        return all_scholarships
    
    def _process_scholarships(self, scholarships: List[ExtractedScholarship]):
        """Process and save extracted scholarships"""
        
        for scholarship in scholarships:
            try:
                # Save to database
                self._save_scholarship_to_db(scholarship)
                
            except Exception as e:
                logger.error(f"Error saving scholarship {scholarship.title}: {e}")
                continue
    
    def _save_scholarship_to_db(self, scholarship: ExtractedScholarship):
        """Save a scholarship to the database"""
        
        # This is a placeholder - implement actual database saving logic
        # based on your database schema and requirements
        
        query = """
        INSERT INTO scholarships (
            title, description, amount, deadline, eligibility, 
            application_url, source_url, category, extracted_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            scholarship.title,
            scholarship.description,
            scholarship.amount,
            scholarship.deadline,
            scholarship.eligibility,
            scholarship.application_url,
            scholarship.source_url,
            scholarship.category,
            scholarship.extracted_at
        )
        
        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query, values)
                    conn.commit()
                    
            logger.info(f"Saved scholarship: {scholarship.title}")
            
        except Exception as e:
            logger.error(f"Database error saving scholarship: {e}")
            raise
    
    def get_statistics(self) -> DiscoveryStats:
        """Get scraping statistics"""
        return self.stats
    
    def get_config_info(self) -> Dict:
        """Get information about the current configuration"""
        return {
            'categories': self.config.get_all_categories(),
            'total_categories': len(self.config.get_all_categories()),
            'discovery_stats': self.discovery_engine.get_discovery_statistics()
        }
