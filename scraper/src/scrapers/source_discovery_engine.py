#!/usr/bin/env python3
"""
Source Discovery Engine
AI-powered discovery of scholarship opportunities from various sources
"""

import os
import json
import time
import hashlib
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
import openai
import requests
from .config.config_loader import SourceCategoryConfig

logger = logging.getLogger(__name__)

@dataclass
class DiscoverySource:
    """Represents a discovered scholarship source"""
    url: str
    title: str
    description: str
    category: str
    confidence: float
    discovered_at: str

@dataclass
class SearchQuery:
    """Represents a search query for discovering sources"""
    query: str
    category: str
    priority: int

class SourceDiscoveryEngine:
    """AI-powered engine for discovering new scholarship sources"""
    
    def __init__(self, openai_api_key: str, google_api_key: str, google_cse_id: str):
        self.openai_client = openai.OpenAI(api_key=openai_api_key)
        self.google_api_key = google_api_key
        self.google_cse_id = google_cse_id
        self.config = SourceCategoryConfig()
        
    def discover_sources(self, categories: Optional[List[str]] = None, max_sources_per_category: int = 10) -> List[DiscoverySource]:
        """Discover scholarship sources for specified categories"""
        if categories is None:
            categories = self.config.get_category_ids()
        
        all_sources = []
        
        for category_id in categories:
            logger.info(f"Discovering sources for category: {category_id}")
            
            # Generate search queries for this category
            queries = self._generate_search_queries(category_id)
            
            # Search for sources using each query
            category_sources = []
            for query in queries[:3]:  # Limit to top 3 queries per category
                sources = self._search_google(query.query, max_results=5)
                
                # Verify sources using AI
                verified_sources = self._verify_sources(sources, category_id)
                category_sources.extend(verified_sources)
                
                # Rate limiting
                time.sleep(1)
            
            # Take top sources for this category
            category_sources = sorted(category_sources, key=lambda x: x.confidence, reverse=True)
            all_sources.extend(category_sources[:max_sources_per_category])
            
            logger.info(f"Found {len(category_sources)} sources for {category_id}")
        
        return all_sources
    
    def _generate_search_queries(self, category_id: str) -> List[SearchQuery]:
        """Generate search queries for a category using AI"""
        category = self.config.get_category_by_id(category_id)
        if not category:
            return []
        
        keywords = category.get('keywords', [])
        category_name = category.get('name', category_id)
        
        prompt = f"""
        Generate 5 specific Google search queries to find scholarship opportunities from {category_name} companies and organizations.
        
        Category: {category_name}
        Keywords: {', '.join(keywords)}
        
        Focus on finding:
        1. Companies in this industry that offer scholarships
        2. Professional associations that provide scholarships
        3. Industry-specific scholarship programs
        4. Corporate scholarship initiatives
        
        Make queries specific and targeted. Include terms like "scholarship", "student", "education", "financial aid".
        
        Return only the search queries, one per line, without numbering or additional text.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.7
            )
            
            queries_text = response.choices[0].message.content.strip()
            queries = [query.strip() for query in queries_text.split('\n') if query.strip()]
            
            return [SearchQuery(query=query, category=category_id, priority=1) for query in queries]
            
        except Exception as e:
            logger.error(f"Error generating queries for {category_id}: {e}")
            # Fallback to basic queries
            fallback_queries = [
                f'"{category_name}" "scholarship" "student"',
                f'"{category_name}" "scholarship program"',
                f'"{category_name}" "financial aid" "student"'
            ]
            return [SearchQuery(query=query, category=category_id, priority=2) for query in fallback_queries]
    
    def _search_google(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search Google Custom Search API with rate limiting and exponential backoff"""
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            'key': self.google_api_key,
            'cx': self.google_cse_id,
            'q': query,
            'num': min(max_results, 10)  # Google CSE max is 10
        }
        
        max_retries = 3
        base_delay = 5  # Start with 5 seconds (more conservative)
        
        for attempt in range(max_retries):
            try:
                # Rate limiting: wait between requests
                if hasattr(self, '_last_google_request'):
                    time_since_last = time.time() - self._last_google_request
                    if time_since_last < 3.0:  # More conservative: 3 seconds between requests
                        sleep_time = 3.0 - time_since_last
                        logger.debug(f"Rate limiting: waiting {sleep_time:.2f} seconds")
                        time.sleep(sleep_time)
                
                self._last_google_request = time.time()
                
                response = requests.get(url, params=params, timeout=30)
                
                # Handle rate limiting specifically
                if response.status_code == 429:
                    delay = base_delay * (2 ** attempt)  # Exponential backoff
                    logger.warning(f"Rate limited by Google API (attempt {attempt + 1}/{max_retries}). Waiting {delay} seconds...")
                    time.sleep(delay)
                    continue
                
                response.raise_for_status()
                
                data = response.json()
                items = data.get('items', [])
                
                results = []
                for item in items:
                    results.append({
                        'url': item.get('link', ''),
                        'title': item.get('title', ''),
                        'description': item.get('snippet', '')
                    })
                
                logger.debug(f"Google search successful for query: {query[:50]}...")
                return results
                
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Rate limited by Google API (attempt {attempt + 1}/{max_retries}). Waiting {delay} seconds...")
                    time.sleep(delay)
                    continue
                else:
                    logger.error(f"HTTP error searching Google: {e}")
                    return []
            except Exception as e:
                logger.error(f"Error searching Google: {e}")
                return []
        
        logger.error(f"Failed to search Google after {max_retries} attempts due to rate limiting")
        return []
    
    def _verify_sources(self, sources: List[Dict], category_id: str) -> List[DiscoverySource]:
        """Use AI to verify if sources actually offer scholarships"""
        category = self.config.get_category_by_id(category_id)
        category_name = category.get('name', category_id) if category else category_id
        
        verified_sources = []
        
        for source in sources:
            prompt = f"""
            Analyze this website to determine if it offers scholarships for students in {category_name}.
            
            URL: {source['url']}
            Title: {source['title']}
            Description: {source['description']}
            
            Determine if this source:
            1. Offers scholarships (not just lists other scholarships)
            2. Is relevant to {category_name} industry
            3. Is a legitimate organization/company
            
            Respond with a JSON object:
            {{
                "offers_scholarships": true/false,
                "relevance_score": 0.0-1.0,
                "confidence": 0.0-1.0,
                "reasoning": "brief explanation"
            }}
            """
            
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.3
                )
                
                result_text = response.choices[0].message.content.strip()
                
                # Try to parse JSON response
                try:
                    result = json.loads(result_text)
                    
                    if result.get('offers_scholarships', False) and result.get('confidence', 0) > 0.6:
                        verified_sources.append(DiscoverySource(
                            url=source['url'],
                            title=source['title'],
                            description=source['description'],
                            category=category_id,
                            confidence=result.get('confidence', 0.5),
                            discovered_at=time.strftime('%Y-%m-%d %H:%M:%S')
                        ))
                
                except json.JSONDecodeError:
                    logger.warning(f"Could not parse AI response for {source['url']}")
                    continue
                    
            except Exception as e:
                logger.error(f"Error verifying source {source['url']}: {e}")
                continue
        
        return verified_sources
    
    def get_discovery_statistics(self) -> Dict:
        """Get statistics about the discovery engine"""
        categories = self.config.get_all_categories()
        
        return {
            'total_categories': len(categories),
            'categories': [cat['name'] for cat in categories],
            'config_loaded': len(categories) > 0
        }
