# Scholarship Tracker Technical Design Document

## Table of Contents
1. [Overview](#1-overview)
   1.1. [Project](#11-project)
   1.2. [Description](#12-description)
   1.3. [Assumptions](#13-assumptions)
2. [Requirements](#2-requirements)
   2.1. [Features and Functionalities](#21-features-and-functionalities)
   2.2. [Non functional requirements](#22-non-functional-requirements)
3. [System Architecture](#3-system-architecture)
   3.1. [High Level Design](#31-high-level-design)
   3.2. [Technology Stack](#32-technology-stack)
   3.3. [System Components](#33-system-components)
4. [Module Design](#4-module-design)
5. [Database Design](#5-database-design)
6. [API Design](#6-api-design)
7. [Security Design](#7-security-design)
8. [Library Integration and Use Cases](#8-library-integration-and-use-cases)

---

## 1. Overview

### 1.1. Project
**Project Name**: Scholarship Tracker System  
**Version**: 1.0.0  
**Project Type**: Web Application  
**Architecture**: Microservices with Independent Components  

### 1.2. Description
The Scholarship Tracker is a comprehensive web application designed to help students discover, track, and manage scholarship opportunities. The system consists of three independent components that work together through a shared database:

1. **Scholarship Scraper (Python + Local MySQL)** - Automated scholarship discovery and data collection service
2. **Scholarship Server (Backend API)** - User management and application tracking service
3. **Scholarship Client (Frontend)** - User interface for scholarship search and application management

The system provides automated scholarship discovery through AI-powered web scraping, secure user authentication, comprehensive application tracking, and an intuitive user interface for managing scholarship applications.

### 1.3. Assumptions
- Users have basic internet connectivity and modern web browsers
- Local MySQL database is available and properly configured
- Auth0 service is available for authentication
- Scholarship websites remain accessible for scraping
- Users are primarily students seeking scholarship opportunities
- Database performance is sufficient for expected user load
- Local development environment is properly configured

---

## 2. Requirements

### 2.1. Features and Functionalities

#### Core Features
- **User Authentication**: Secure login/logout with Auth0 integration
- **Scholarship Discovery**: Automated scraping and AI-powered processing
- **Application Management**: Create, read, update, delete scholarship applications
- **Recommender System**: Management of recommendation letters and references
- **Advanced Search**: Intelligent scholarship matching and filtering
- **User Profile Management**: Personal information and preferences
- **Dashboard**: Overview of applications and recent scholarship matches

#### Functional Requirements
- Users can register and authenticate securely
- Users can search for scholarships using various criteria
- Users can create and track scholarship applications
- Users can manage recommender information
- System automatically discovers and updates scholarship data
- System provides intelligent scholarship recommendations


## 3. System Architecture

#### Architecture Type
- **Microservices Architecture**: Three independent services
- **Database-Centric Integration**: Shared MySQL database
- **Event-Driven**: Scheduled scraping and processing

### 3.2. Technology Stack

#### 3.2.1. Frontend
- **Framework**: Vue.js 3 with Composition API
- **UI Framework**: Quasar Framework v2.16.0
- **State Management**: Pinia v3.0.1
- **Routing**: Vue Router v4.0.12
- **Authentication**: Auth0 Vue SDK v2.4.0
- **HTTP Client**: Axios v1.2.1
- **Build Tool**: Vite with Quasar CLI
- **Styling**: SCSS with Material Design components
- **TypeScript**: v5.5.3 for type safety

#### 3.2.2. Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js v4.18.2
- **Language**: TypeScript v5.3.3
- **ORM**: Knex.js v3.1.0
- **Authentication**: Auth0 with express-oauth2-jwt-bearer
- **Security**: Helmet v7.1.0, CORS v2.8.5
- **Logging**: Morgan v1.10.0
- **Process Management**: PM2 for production

#### 3.2.3. Database
- **Database**: Local MySQL v8.0+ (previously AWS RDS MySQL v8.0.35)
- **ORM**: Knex.js for query building
- **Connection Pooling**: Built-in MySQL2 pooling

#### 3.2.4. Infrastructure (Current Implementation)
- **Local Development**: Python virtual environment with local MySQL
- **Scraper Execution**: Direct Python script execution
- **Storage**: Local file system for raw data and logs
- **AI/ML**: OpenAI for intelligent processing
- **Monitoring**: Local logging and console output
- **Secrets Management**: Environment variables and .env files


### 3.3. System Components

#### 3.3.1. Describe the major components

**Scholarship Client (Frontend)**
- **Purpose**: User interface for scholarship management
- **Responsibilities**: 
  - User authentication and session management
  - Scholarship search and filtering
  - Application creation and tracking
  - Recommender management
  - Dashboard and reporting

**Scholarship Server (Backend API)**
- **Purpose**: RESTful API for business logic and data management
- **Responsibilities**:
  - User management and authentication
  - Recommender management
  - Scholarship search and filtering

**Scholarship Scraper (Data Collection)**
- **Purpose**: Automated scholarship discovery and data processing
- **Responsibilities**:
  - Web scraping of scholarship websites
  - AI-powered data extraction and categorization
  - Data cleaning and normalization
  - Local MySQL database population and updates

#### 3.3.2. Third-party services

**Authentication Services**
- **Auth0**: OAuth2/JWT authentication and user management
- **Purpose**: Secure user authentication and authorization

**External APIs**
- **Scholarship Websites**: CareerOneStop, CollegeScholarship, etc.
- **Purpose**: Data source for scholarship information

---

## 4. Module Design

### Frontend Modules

**Authentication Module**
- User login/logout functionality
- Session management
- Profile management
- Auth0 integration

**Dashboard Module**
- Application overview
- Recent scholarship matches
- Quick actions and shortcuts
- Statistics and metrics

**Application Management Module**
- Create new applications
- Edit existing applications
- Track application status
- Application timeline and history

**Scholarship Search Module**
- Advanced search filters
- AI-powered recommendations
- Save favorite scholarships
- Export functionality

**Recommender Management Module**
- Add/edit recommenders
- Track recommendation status
- Send reminder emails
- Recommender profiles

**State Management Module**
- Pinia store management
- User state management
- Application state management
- Scholarship state management

### Backend Modules

**User Management Module**
- User CRUD operations
- Profile management
- Authentication integration
- Role-based access control

**Application Management Module**
- Application CRUD operations
- Status tracking
- Validation and business rules
- Data relationships

**Scholarship Search Module**
- Database querying
- Filtering and sorting
- Search optimization
- Data aggregation

**Recommender Module**
- Recommender CRUD operations
- Relationship management
- Email integration
- Status tracking

### Scraper Modules

**Web Scraping Module**
- Multi-source scraping
- Rate limiting and respect
- Error handling and retries
- Data extraction

**AI Processing Module**
- Data categorization
- Intelligent filtering
- Content analysis
- Quality assessment

**Data Management Module**
- Database operations
- Data cleaning
- Conflict resolution
- Update strategies

### 4.1. Frontend State Management (Pinia)

The frontend application uses Pinia for state management with the following store structure:

## 5. Database Design

### 5.1. ER Diagram

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│       Users         │    │Applications        │    │   Recommenders     │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ user_id (PK)        │    │ application_id (PK) │    │ recommender_id (PK)│
│ auth_user_id        │◄───┤ user_id (FK)        │    │ user_id (FK)       │
│ first_name          │    │ scholarship_name    │    │ first_name         │
│ last_name           │    │ organization        │    │ last_name          │
│ email_address       │    │ application_link    │    │ email_address      │
│ phone_number        │    │ status              │    │ relationship       │
│ created_at          │    │ due_date            │    │ phone_number       │
│ updated_at          │    │ amount              │    │ created_at         │
└─────────────────────┘    │ created_at          │    │ updated_at         │
          │                │ updated_at          │    └─────────────────────┘
          │                └─────────────────────┘              │
          │                           │                          │
          │                        │                          │
          ▼                        ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│User Search Prefs    │    │      Essays         │    │  Recommendations   │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ user_id (PK,FK)     │    │ essay_id (PK)      │    │ recommendation_id   │
│ target_type         │    │ application_id (FK)│    │ application_id (FK) │
│ subject_areas       │    │ theme              │    │ recommender_id (FK)│
│ gender              │    │ units             │    │ content            │
│ ethnicity           │    │ essay_link        │    │ status             │
│ academic_gpa        │    │ word_count        │    │ submitted_at       │
│ academic_level      │    │ created_at        │    │ created_at         │
│ created_at          │    │ updated_at        │    │ updated_at         │
│ updated_at          │    └─────────────────────┘    └─────────────────────┘
└─────────────────────┘

┌─────────────────────┐
│    Scholarships     │
├─────────────────────┤
│ scholarship_id (PK) │
│ title              │
│ description        │
│ organization       │
│ target_type        │
│ min_award          │
│ max_award          │
│ deadline           │
│ eligibility        │
│ apply_url          │
│ source             │
│ active             │
│ created_at         │
│ updated_at         │
└─────────────────────┘
```



## 6. API Design

### 6.1. Endpoints

#### Authentication Endpoints
```
POST   /api/auth/login          # User authentication
POST   /api/auth/logout         # User logout
GET    /api/auth/profile        # Get user profile
```

#### User Management Endpoints
```
GET    /api/users               # List all users
GET    /api/users/:id           # Get specific user
POST   /api/users               # Create new user
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user
```

#### Application Management Endpoints
```
GET    /api/applications                    # List all applications
GET    /api/applications/:id                # Get specific application
POST   /api/applications                    # Create new application
PUT    /api/applications/:id                # Update application
DELETE /api/applications/:id                # Delete application
GET    /api/applications/user/:userId       # Get user's applications
```

#### Recommender Management Endpoints
```
GET    /api/recommenders                    # List all recommenders
GET    /api/recommenders/:id                # Get specific recommender
GET    /api/recommenders/user/:userId       # Get user's recommenders
POST   /api/recommenders                    # Create new recommender
PUT    /api/recommenders/:id                # Update recommender
DELETE /api/recommenders/:id                # Delete recommender
```

#### Scholarship Search Endpoints
```
POST   /api/scholarships/find               # Search scholarships
GET    /api/scholarships/sources            # Get available sources
GET    /api/scholarships/health             # Service health check
GET    /api/scholarships/categories         # Get scholarship categories
```

### 6.3. Authentication

#### Authentication Flow
1. **Client Request**: User attempts to access protected resource
2. **Token Validation**: Server validates JWT token with Auth0
3. **User Context**: Server extracts user information from token
4. **Authorization**: Server checks user permissions
5. **Response**: Server returns requested data or error


---

## 7. Security Design

### 7.1. Authentication/Authorization

#### OAuth2/JWT Implementation
- **Provider**: Auth0
- **Flow**: Authorization Code Flow with PKCE
- **Token Type**: JWT (JSON Web Tokens)
- **Token Expiry**: 24 hours for access tokens
- **Refresh Tokens**: 30 days with automatic renewal


### 7.2. Vulnerabilities

#### Common Vulnerabilities and Mitigations

**SQL Injection**
- **Risk**: High
- **Mitigation**: Parameterized queries with Knex.js
- **Monitoring**: Query logging and analysis

**Cross-Site Scripting (XSS)**
- **Risk**: Medium
- **Mitigation**: Input sanitization, CSP headers
- **Monitoring**: Content Security Policy violations

**Cross-Site Request Forgery (CSRF)**
- **Risk**: Low
- **Mitigation**: JWT tokens, SameSite cookies
- **Monitoring**: Unusual request patterns

**Authentication Bypass**
- **Risk**: High
- **Mitigation**: Auth0 integration, token validation
- **Monitoring**: Failed authentication attempts


## 8. Library Integration and Use Cases

### 8.1. How Libraries Work Together

The scholarship tracker uses a carefully orchestrated set of libraries that work together in specific patterns:

#### 8.1.1. Scraping Pipeline
```
1. Web Request (Requests/Selenium) 
   ↓
2. HTML Parsing (BeautifulSoup/Cheerio)
   ↓
3. Data Extraction (Custom Logic)
   ↓
4. Data Processing (Pandas/NumPy)
   ↓
5. Database Storage (PyMySQL/MySQL2)
   ↓
6. Error Handling (Tenacity)
```

#### 8.1.2. Library Integration Summary

**Scraping Pipeline:**
- Selenium/BeautifulSoup → Scrape HTML content
- Pandas/NumPy → Process and clean data
- Tenacity → Handle retries and failures
- PyMySQL → Store processed data

**Server-Side Processing:**
- Puppeteer → Handle complex JavaScript websites
- Cheerio → Parse HTML responses
- MySQL2 → Store and retrieve data

#### 8.1.3. Cross-Language Integration

**Python Scrapers (Local Development)**
- BeautifulSoup → Pandas → PyMySQL → Tenacity
- Selenium → BeautifulSoup → PyMySQL → Tenacity

**TypeScript Scrapers (Production AWS)**
- Puppeteer → Cheerio → MySQL2 → Custom retry logic

**Server API (Node.js)**
- MySQL2 → Knex.js → Express.js → Auth0


### 8.2. Library Selection Rationale

**BeautifulSoup**: Industry standard for HTML parsing in Python
- Excellent for extracting data from HTML
- Handles malformed HTML gracefully
- Simple and intuitive API

**Selenium**: Essential for JavaScript-heavy websites
- Handles dynamic content loading
- Simulates real user interactions
- Cross-browser compatibility

**Pandas**: Best-in-class data processing
- Powerful data manipulation capabilities
- Excellent for data cleaning and transformation
- Built on NumPy for performance

**NumPy**: Fast numerical operations
- Optimized C implementations
- Foundation for scientific computing
- Memory-efficient array operations

**PyMySQL**: Lightweight MySQL connector
- Pure Python implementation
- No external dependencies
- Excellent performance

**Tenacity**: Robust retry mechanisms
- Exponential backoff strategies
- Configurable retry policies
- Decorator-based implementation

**Puppeteer**: Modern browser automation
- Headless Chrome automation
- Excellent for complex web scraping
- Node.js integration

**Cheerio**: Server-side HTML parsing
- jQuery-like API for Node.js
- Fast and lightweight
- Perfect for server-side processing

