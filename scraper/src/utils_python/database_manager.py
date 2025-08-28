#!/usr/bin/env python3
"""
Database Manager - Abstract database operations for different environments
"""

import os
import logging
import pymysql
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from datetime import datetime
from .scholarship_types import Scholarship

logger = logging.getLogger(__name__)


class DatabaseManager(ABC):
    """Abstract base class for database operations"""
    
    def __init__(self, environment: str):
        self.environment = environment
        self.connection = None
    
    @abstractmethod
    def connect(self) -> bool:
        """Establish database connection"""
        pass
    
    @abstractmethod
    def disconnect(self):
        """Close database connection"""
        pass
    
    @abstractmethod
    def save_scholarship(self, scholarship: Scholarship) -> bool:
        """Save scholarship to database"""
        pass
    
    @abstractmethod
    def update_job_status(self, status: str, metadata: Any):
        """Update job status"""
        pass
    
    def get_connection(self):
        """Get database connection"""
        if not self.connection or not self.connection.open:
            self.connect()
        return self.connection


class LocalDatabaseManager(DatabaseManager):
    """Local MySQL database manager"""
    
    def __init__(self, environment: str = "local"):
        super().__init__(environment)
        self.host = os.getenv('MYSQL_HOST', 'localhost')
        self.port = int(os.getenv('MYSQL_PORT', '3306'))
        self.user = os.getenv('MYSQL_USER', 'root')
        self.password = os.getenv('MYSQL_PASSWORD', '')
        self.database = os.getenv('MYSQL_DATABASE', 'scholarships')
    
    def connect(self) -> bool:
        """Connect to local MySQL database"""
        try:
            self.connection = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
            logger.debug(f"Connected to local MySQL database: {self.database}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to local MySQL: {e}")
            return False
    
    def disconnect(self):
        """Close local database connection"""
        if self.connection and self.connection.open:
            self.connection.close()
            logger.debug("Disconnected from local MySQL database")
    
    def save_scholarship(self, scholarship: Scholarship) -> bool:
        """Save scholarship to local MySQL database"""
        conn = self.get_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        try:
            # Ensure scholarship has required fields
            if not scholarship.scholarship_id:
                scholarship.scholarship_id = self._create_scholarship_id()
            
            if not scholarship.created_at:
                scholarship.created_at = datetime.now()
            
            scholarship.updated_at = datetime.now()
            
            # Convert to dict for database insertion
            data = scholarship.to_dict()
            
            # Check if scholarship already exists
            cursor.execute(
                "SELECT scholarship_id FROM scholarships WHERE scholarship_id = %s",
                (scholarship.scholarship_id,)
            )
            
            if cursor.fetchone():
                # Update existing scholarship
                placeholders = ', '.join([f"{k} = %s" for k in data.keys() if k != 'scholarship_id'])
                values = [v for k, v in data.items() if k != 'scholarship_id']
                values.append(scholarship.scholarship_id)
                
                query = f"UPDATE scholarships SET {placeholders} WHERE scholarship_id = %s"
                cursor.execute(query, values)
                logger.info(f"Updated scholarship in local DB: {scholarship.title}")
            else:
                # Insert new scholarship
                placeholders = ', '.join(['%s'] * len(data))
                columns = ', '.join(data.keys())
                query = f"INSERT INTO scholarships ({columns}) VALUES ({placeholders})"
                cursor.execute(query, list(data.values()))
                logger.info(f"Inserted scholarship in local DB: {scholarship.title}")
            
            conn.commit()
            return True
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Local MySQL database error: {e}")
            raise
        finally:
            cursor.close()
    
    def update_job_status(self, status: str, metadata: Any):
        """Update job status (local mode just logs)"""
        logger.info(f"Local job status update: {status} - {metadata}")
    
    def _create_scholarship_id(self) -> str:
        """Generate a unique scholarship ID"""
        import uuid
        return f"sch_{uuid.uuid4().hex[:16]}"


class ProductionDatabaseManager(DatabaseManager):
    """Production AWS RDS MySQL database manager"""
    
    def __init__(self, environment: str = "prod"):
        super().__init__(environment)
        self.host = os.getenv('RDS_MYSQL_HOST')
        self.port = int(os.getenv('RDS_MYSQL_PORT', '3306'))
        self.user = os.getenv('RDS_MYSQL_USER')
        self.password = os.getenv('RDS_MYSQL_PASSWORD')
        self.database = os.getenv('RDS_MYSQL_DATABASE', 'scholarships')
    
    def connect(self) -> bool:
        """Connect to AWS RDS MySQL database"""
        try:
            self.connection = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
            logger.debug(f"Connected to AWS RDS MySQL database: {self.database}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to AWS RDS MySQL: {e}")
            return False
    
    def disconnect(self):
        """Close production database connection"""
        if self.connection and self.connection.open:
            self.connection.close()
            logger.debug("Disconnected from AWS RDS MySQL database")
    
    def save_scholarship(self, scholarship: Scholarship) -> bool:
        """Save scholarship to AWS RDS MySQL database"""
        conn = self.get_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        try:
            # Ensure scholarship has required fields
            if not scholarship.scholarship_id:
                scholarship.scholarship_id = self._create_scholarship_id()
            
            if not scholarship.created_at:
                scholarship.created_at = datetime.now()
            
            scholarship.updated_at = datetime.now()
            
            # Convert to dict for database insertion
            data = scholarship.to_dict()
            
            # Check if scholarship already exists
            cursor.execute(
                "SELECT scholarship_id FROM scholarships WHERE scholarship_id = %s",
                (scholarship.scholarship_id,)
            )
            
            if cursor.fetchone():
                # Update existing scholarship
                placeholders = ', '.join([f"{k} = %s" for k in data.keys() if k != 'scholarship_id'])
                values = [v for k, v in data.items() if k != 'scholarship_id']
                values.append(scholarship.scholarship_id)
                
                query = f"UPDATE scholarships SET {placeholders} WHERE scholarship_id = %s"
                cursor.execute(query, values)
                logger.info(f"Updated scholarship in AWS RDS: {scholarship.title}")
            else:
                # Insert new scholarship
                placeholders = ', '.join(['%s'] * len(data))
                columns = ', '.join(data.keys())
                query = f"INSERT INTO scholarships ({columns}) VALUES ({placeholders})"
                cursor.execute(query, list(data.values()))
                logger.info(f"Inserted scholarship in AWS RDS: {scholarship.title}")
            
            conn.commit()
            return True
            
        except Exception as e:
            conn.rollback()
            logger.error(f"AWS RDS MySQL database error: {e}")
            raise
        finally:
            cursor.close()
    
    def update_job_status(self, status: str, metadata: Any):
        """Update job status (production mode would update DynamoDB)"""
        logger.info(f"AWS RDS job status update: {status} - {metadata}")
        # In a real implementation, this would update DynamoDB or another job tracking system
    
    def _create_scholarship_id(self) -> str:
        """Generate a unique scholarship ID"""
        import uuid
        return f"sch_{uuid.uuid4().hex[:16]}"


class DatabaseManagerFactory:
    """Factory for creating database managers based on environment"""
    
    @staticmethod
    def create_database_manager(environment: str) -> DatabaseManager:
        """Create appropriate database manager for environment"""
        if environment == "local":
            logger.debug("Creating LocalDatabaseManager")
            return LocalDatabaseManager(environment)
        elif environment in ["dev", "staging", "prod"]:
            logger.debug(f"Creating ProductionDatabaseManager for {environment}")
            return ProductionDatabaseManager(environment)
        else:
            logger.warning(f"Unknown environment '{environment}', defaulting to local")
            return LocalDatabaseManager("local")
