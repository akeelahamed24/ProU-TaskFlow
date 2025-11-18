# ProU-TaskFlow 🚀

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.0-orange.svg)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, comprehensive task management platform designed for teams and individuals to streamline project workflows, enhance collaboration, and boost productivity.


## ✨ Features

### 🎯 Core Functionality
- **Advanced Kanban Board**: Drag-and-drop task management with workflow validation
- **Shared Project Workspace**: Single organization-wide project accessible to all members
- **Shared Organization Calendar**: Calendar events visible to entire team
- **Real-time Collaboration**: Live updates and notifications across the platform
- **Role-based Access**: Comprehensive user roles and permissions system

### 👥 Team Collaboration
- **Shared Workspace**: Single organization-wide project accessible to all members
- **Shared Calendar**: Organization calendar visible to all team members
- **User Management**: Complete user profiles with avatars and role assignments
- **Team Communication**: Built-in chat system with message reactions and threading
- **Activity Feeds**: Real-time activity tracking and notifications
- **Member Invitations**: Easy team member onboarding

### 📊 Analytics & Insights
- **Performance Metrics**: Project progress tracking and analytics
- **Predictive Analytics**: AI-powered insights and recommendations
- **Task Analytics**: Detailed task completion statistics
- **Time Tracking**: Built-in time management features

### 🔧 Advanced Features
- **Smart Search**: Full-text search across tasks, projects, and team members
- **Shared Calendar Integration**: Organization-wide calendar with task deadlines and events
- **File Attachments**: Document and media upload capabilities
- **Custom Workflows**: Flexible task status configurations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication and Realtime Database enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prou-taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create a .env file in the root directory
   cp .env.example .env

   # Add your Firebase configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Configuration**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password, Google, and GitHub providers
   - Enable Realtime Database
   - Copy your Firebase config to the `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:8080
   ```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Backend**: Firebase (Authentication, Realtime Database)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── dashboard/      # Dashboard-specific components
│   ├── tasks/          # Task management components
│   ├── projects/       # Project management components
│   └── auth/           # Authentication components
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Page components and routing
├── services/           # API services and Firebase integration
├── types/              # TypeScript type definitions
└── data/               # Mock data and constants
```

## 🎯 Platform Overview

### User Roles & Permissions
- **Software Engineer**: Basic task management and collaboration
- **Senior Software Engineer**: Enhanced task management capabilities
- **Tech Lead**: Team coordination and project oversight
- **Engineering Manager**: Full project management and team administration
- **DevOps Engineer**: Infrastructure and deployment management
- **QA Engineer**: Quality assurance and testing workflows
- **Product Manager**: Product roadmap and requirement management
- **UX Designer**: Design collaboration and feedback systems
- **Data Engineer**: Data pipeline and analytics management
- **Marketing Designer**: Marketing asset and campaign management
- **Admin**: Full system administration and user management

### Workflow Management
ProU-TaskFlow enforces proper project management workflows:

```
To Do → In Progress → Done
   ↓        ↓        ↓
   ←────────←────────←
```

Tasks can only move to adjacent statuses, preventing workflow violations and ensuring proper project management practices.

### Real-time Features
- **Live Updates**: Instant synchronization across all connected users
- **Activity Tracking**: Comprehensive audit trail of all actions
- **Notifications**: Real-time alerts for mentions, assignments, and updates
- **Collaborative Editing**: Multiple users can work on tasks simultaneously

## 📱 Usage Guide

### Getting Started
1. **Sign Up**: Create an account with email/password or social login
2. **Complete Profile**: Add personal details and select your role
3. **Join Organization**: Access the shared project workspace automatically
4. **View Calendar**: See organization-wide events and task deadlines
5. **Start Collaborating**: Use comments, attachments, and real-time updates

### Task Management
- **Create Tasks**: Use the "+" button in any column to add new tasks to the shared project
- **Drag & Drop**: Move tasks between columns with workflow validation
- **Assign Members**: Click on tasks to assign team members and set priorities
- **Add Comments**: Collaborate with team members using the comment system
- **Track Progress**: Monitor organization-wide task completion and timelines

### Team Collaboration
- **Invite Members**: Add team members to projects and assign roles
- **Chat System**: Use the built-in chat for quick communication
- **File Sharing**: Upload documents and media to tasks
- **Activity Feeds**: Stay updated with team activities and changes

## 🔧 Development

### Available Scripts
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Variables
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Analytics
VITE_ENABLE_ANALYTICS=true
```



