# LimVA Platform

## Overview

LimVA is an educational AI platform built as a full-stack web application that helps students with homework analysis, test generation, and AI-powered Q&A. The platform provides four main features: direct question asking via Zalo integration, homework checking with AI analysis, automated test generation, and various educational utilities including an AI chat system. The application is designed with a modern React frontend and Express.js backend, leveraging AI services for educational content processing.

## User Preferences

Preferred communication style: Simple, everyday language.
Document reading requirement: Display content exactly as in original file without reformatting - preserve original structure, spacing, and layout.
AI personality: AI should respond as created by LimVA and use teacher/educator communication style when chatting with students - friendly, warm tone like teachers, address students as "em" and refer to self as "thầy/cô".
AI feature separation: AI in chat feature should only handle general conversation and knowledge Q&A. It should NOT check homework or generate tests - must redirect users to appropriate features ("Kiểm tra bài làm" for homework analysis, "Sinh đề thi" for test generation).
Subject specialization in homework checking: Science subjects (Toán, Vật lí, Hóa học, Sinh học) can be handled by general science AI, while other subjects (Ngữ văn, Tin học, etc.) must be subject-specific - AI should reject cross-subject analysis.
AI model-specific feature availability: When using DeepSeek (which doesn't support image processing), hide image-related features including matrix test generation tab and image upload button in AI chat. Only show these features when using GPT-5.

## Admin Access

Default admin credentials:
- Username: admin
- Password: admin123

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI design
- **State Management**: TanStack React Query for server state management and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular component architecture with separate pages for different features (home, not-found) and reusable UI components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Basic admin authentication using bcrypt for password hashing
- **API Design**: RESTful API structure with organized route handlers
- **Development Setup**: Hot reloading with Vite integration for seamless development experience

### Database Schema
- **Admin Settings**: Stores AI model preferences and API keys for the platform
- **Homework Submissions**: Records student homework submissions with optional images and AI analysis results
- **Generated Tests**: Stores automatically generated test questions and answers with metadata
- **Chat Conversations**: Maintains chat history for AI conversations with students
- **Homework Chat Context**: Stores context data for homework-related chat conversations

### Database Management
- **Export**: Download complete database as SQL file with timestamp naming
- **Import/Restore**: Upload and restore database from SQL file with automatic data clearing
- **Admin Panel**: Integrated database management through web interface

### AI Integration Architecture
- **Primary AI Service**: OpenRouter API for accessing multiple AI models (DeepSeek, GPT, etc.)
- **Image Processing**: ImgBB service for image upload and hosting
- **Document Processing**: Client-side processing with PDF.js and Mammoth.js for immediate file reading
- **AI Features**: 
  - Homework analysis with image recognition capabilities
  - Dynamic test generation based on subject and difficulty parameters
  - Interactive chat system for student Q&A
  - Advanced document reading with authentic content preservation:
    * Client-side PDF processing with PDF.js maintaining exact layout and spacing
    * Word document processing with both HTML preview and plain text extraction
    * Excel and text file support with original formatting preservation
    * Position-aware text extraction to preserve table structures and mathematical formulas
- **Flexible Model Selection**: Admin-configurable AI model selection through settings panel

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database (PostgreSQL) - Serverless database hosting
- **AI Processing**: OpenRouter API - Multi-model AI service provider
- **Image Hosting**: ImgBB API - Image upload and hosting service

### Development & Build Tools
- **Package Manager**: npm with package-lock.json for dependency management
- **Build System**: Vite for frontend bundling and development server
- **Database Migration**: Drizzle Kit for schema management and migrations
- **TypeScript**: Full TypeScript support across frontend and backend

### UI & Styling Dependencies
- **Component Library**: Radix UI primitives with shadcn/ui customizations
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Font Awesome for iconography
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **Document Processing**: PDF.js for client-side PDF reading, Mammoth.js for Word document processing

### Third-Party Integrations
- **Social Integration**: Zalo group integration for direct student support
- **Replit Integration**: Custom Replit plugins for development environment optimization
- **Error Handling**: Runtime error overlay for development debugging