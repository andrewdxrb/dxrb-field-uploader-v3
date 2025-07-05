# DXRB Field Uploader v3 - Technical Documentation

## 🎯 Project Overview

**Application:** Progressive Web App for bathroom remodeling field photo/video uploads  
**Client:** DXRB (bathroom remodeling company)  
**Development Strategy:** Phase 1 (auth + file upload), then separate Google Drive integration project  
**Current Status:** ✅ **PRODUCTION DEPLOYED & WORKING**

## 📋 Project Requirements

### Core Functionality
- **Authentication:** Email/password (not PIN-based)
- **File Processing:** 85% quality, 1920px max images, 1080p videos
- **File Types:** All common phone formats (jpg, png, heic, mp4, mov, etc.)
- **Batch Limits:** 50 files per batch, unlimited total files
- **File Picker:** Custom browser-controlled (avoid native mobile picker issues)
- **Admin Features:** Integrated admin panel, user management via UI
- **Notifications:** In-browser only (Dropbox/OneDrive style)

### Technical Requirements
- **Progressive Web App (PWA)** 
- **Mobile-first design**
- **Real-time upload progress**
- **Chunked upload system**
- **Role-based access control**

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Airbnb-inspired theme)
- **Icons:** Lucide React
- **Design Pattern:** Atomic Design methodology
- **PWA Features:** Service worker, manifest, offline capability

### Backend Stack
- **Runtime:** Netlify Functions (Node.js ES modules)
- **Database:** Neon PostgreSQL with connection pooling
- **Authentication:** JWT tokens + bcryptjs password hashing
- **File Storage:** Phase 1: Local/temporary, Phase 2: Google Drive

### Infrastructure
- **Hosting:** Netlify
- **Database:** Neon (PostgreSQL)
- **Version Control:** GitHub
- **Domain:** TBD (using Netlify subdomain for now)

## 🚀 Deployment Status

### ✅ Live Application
- **Status:** Production deployed and working
- **Frontend:** React app with smart API switching
- **Backend:** Netlify Functions with Neon database
- **Authentication:** Tested and working
- **Database:** Connected and verified

### ✅ Repository
- **GitHub:** `andrewdxrb/dxrb-field-uploader-v3`
- **Branch:** `main`
- **Last Deploy:** Node 20 LTS compatibility fix

## 🗂️ File Structure

```
/Users/andrewwells/Workspace/pictures_uploader/
├── docs/                           # Technical documentation
├── src/
│   ├── components/                 # React components (Atomic Design)
│   │   ├── atoms/                 # Button, Input, Avatar, etc.
│   │   ├── molecules/             # FilePickerButton, FilePreview
│   │   └── organisms/             # LoginForm, Dashboard
│   ├── services/                  # API services
│   │   ├── api.js                # Real API calls
│   │   └── mockApi.js            # Development mock APIs
│   ├── styles/                   # Tailwind configurations
│   └── App.jsx                   # Smart API switching logic
├── netlify/functions/             # Serverless functions (ES modules)
│   ├── auth.js                   # Authentication endpoints
│   └── upload.js                 # File upload endpoints
├── public/                       # PWA assets
├── package.json                  # Dependencies and scripts
├── netlify.toml                  # Deployment configuration
├── tailwind.config.js            # Airbnb theme configuration
└── vite.config.js               # Build configuration
```

## 🔗 Quick Links

- **[Database Schema](./01-DATABASE-SCHEMA.md)** - Complete PostgreSQL schema
- **[Environment Setup](./02-ENVIRONMENT-SETUP.md)** - Local and production setup
- **[API Documentation](./03-API-DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](./04-DEPLOYMENT-GUIDE.md)** - Step-by-step deployment
- **[Testing Procedures](./05-TESTING-PROCEDURES.md)** - Comprehensive testing guide
- **[Troubleshooting](./06-TROUBLESHOOTING.md)** - Common issues and solutions
- **[Development Roadmap](./07-DEVELOPMENT-ROADMAP.md)** - Next steps and future features

## 🎯 Current Milestone

**✅ Phase 1 Complete:** Authentication & Core Infrastructure  
**🚧 Next:** File Upload Implementation & Testing  
**📋 Future:** Google Drive Integration (Phase 2)

---

*📝 Documentation generated on: December 2024*  
*🤖 Co-authored with [Memex](https://memex.tech)*