# DXRB Field Uploader v3

Progressive Web App for bathroom remodeling field photo/video uploads with authentication and batch processing.

## 🚀 Features

- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive, mobile-first design
- **Real authentication** with Neon PostgreSQL database
- **File upload** with chunked processing for large files
- **Batch management** - up to 50 files per batch
- **Atomic Design** component architecture
- **ES module** Netlify functions
- **PWA capabilities** for mobile installation
- **Mock/Real API** switching for development

## 🏗️ Architecture

### Frontend
- **React 18** + **Vite** + **Tailwind CSS**
- **Lucide React** icons
- **React Hot Toast** for notifications
- **Axios** for API communication

### Backend
- **Netlify Functions** (Node.js ES modules)
- **Neon PostgreSQL** database with connection pooling
- **JWT authentication** with bcrypt password hashing
- **Chunked file upload** system

### Components (Atomic Design)
- **Atoms**: Button, Input, Avatar, Badge, ProgressBar, Spinner
- **Molecules**: FilePickerButton, FilePreview  
- **Organisms**: LoginForm
- **Templates**: Main app layout

## 🎯 Database Schema

### Users Table
- Authentication with email/username
- Role-based access (admin, worker)
- Profile management

### Photos Table  
- File metadata and upload tracking
- Google Drive integration ready
- Batch organization

### Upload Sessions Table
- Chunked upload progress tracking
- Batch management
- File processing status

## 🚀 Deployment

### Local Development
```bash
# Install dependencies
npm install

# Start development server with mock APIs
npm run dev

# Start with real backend functions
npx netlify dev
```

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key
```

### Production
- **GitHub** repository with auto-deploy
- **Netlify** hosting with serverless functions
- **Neon** PostgreSQL database

## 🔐 Authentication

### Test Accounts
- **Admin**: `admin@dxrb.com` / `password123`
- **Worker**: `worker@dxrb.com` / `password`

## 📱 Mobile Experience

- **PWA-ready** with offline capabilities
- **Mobile-first** responsive design
- **Custom file picker** to avoid native picker issues
- **Touch-friendly** interface with large tap targets

## 🎨 Design System

Based on **Airbnb-inspired** design principles:
- Primary color: Rose/Pink theme
- Clean, modern interface
- Consistent spacing and typography
- Accessible color contrast

---

**Built with ❤️ for DXRB bathroom remodeling teams**

🤖 Generated with [Memex](https://memex.tech)  
Co-Authored-By: Memex <noreply@memex.tech>