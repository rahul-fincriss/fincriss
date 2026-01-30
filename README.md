# FinCrisS UI - AML Compliance Platform

A modern React-based web application for Anti-Money Laundering (AML) compliance monitoring and case management, designed for financial institutions to detect, investigate, and report suspicious financial activities.

## 🚀 Features

### Alert Management
- **Multi-source Alert Ingestion**: Process alerts from Core Banking, Wire Transfers, Card Monitoring, and Trade Finance systems
- **MAPS Scoring**: Money Laundering Alert Prioritization System with risk scoring and automated prioritization
- **Alert Workbench**: Interactive triage interface for alert review and case creation
- **SLA Tracking**: Real-time deadline monitoring with visual indicators

### Case Investigation
- **Comprehensive Case Management**: Full lifecycle tracking from alert to resolution
- **Collaborative Workspace**: Multi-user investigation with document and note management
- **Risk Assessment**: Dynamic risk scoring based on customer profiles and transaction patterns
- **Audit Trail**: Complete audit logging for compliance and regulatory requirements

### STR Filing & Reporting
- **AI-Assisted Drafting**: Automated STR (Suspicious Transaction Report) generation
- **Multi-Level Review**: Investigator → Principal Officer approval workflow
- **Change Tracking**: Version control and audit trail for all STR modifications
- **Regulatory Compliance**: FIU submission workflow with status tracking

### User Management & Access Control
- **Role-Based Access**: 5 distinct user roles (Analyst, Investigator, Principal Officer, Compliance, Admin)
- **Secure Authentication**: Protected routes with session management
- **Permission-Based Navigation**: Dynamic menu filtering based on user roles

## 🛠 Technology Stack

### Frontend Framework
- **React 18** with TypeScript for type-safe development
- **Vite** for fast build tooling and development server
- **React Router DOM** for client-side routing

### UI & Styling
- **shadcn/ui** - Complete component system built on Radix UI primitives
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Lucide React** - Beautiful icon library
- **Recharts** - Data visualization components

### State Management & Data
- **React Query** (@tanstack/react-query) for server state management
- **React Hook Form** with **Zod** validation for robust form handling
- **Context API** for authentication and global state

### Development & Testing
- **ESLint** with TypeScript rules for code quality
- **Vitest** for unit testing
- **TypeScript** for static type checking

## 📁 Project Structure

```
fincriss-ui/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── layout/          # Layout components (AppLayout, Sidebar, etc.)
│   │   ├── shared/          # Shared components (MetricCard, Badges, etc.)
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # React contexts (AuthContext)
│   ├── data/                # Mock data and constants
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and configurations
│   ├── pages/               # Page components and routing
│   ├── types/               # TypeScript type definitions
│   └── test/                # Test utilities
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── tailwind.config.ts      # Tailwind CSS configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm (or bun)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fincriss-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest tests
- `npm run test:watch` - Run tests in watch mode

## 🔐 Authentication

The application uses a demo authentication system with predefined users for different roles:

- **Analyst**: Sarah Chen (sarah.chen@bank.com)
- **Investigator**: Michael Torres (michael.torres@bank.com)
- **Principal Officer**: Dr. Amanda Williams (amanda.williams@bank.com)
- **Compliance**: Robert Kim (robert.kim@bank.com)
- **Admin**: James Patterson (james.patterson@bank.com)

## 🏗 Architecture Overview

### Component Architecture
- **Atomic Design**: Organized into atoms, molecules, and organisms
- **Composition over Inheritance**: Flexible component composition
- **Custom Hooks**: Business logic abstracted into reusable hooks

### State Management
- **Local State**: React useState for component-specific state
- **Server State**: React Query for API data fetching and caching
- **Global State**: Context API for authentication and app-wide state

### Data Flow
1. **Alerts** → **Prioritization** → **Case Creation** → **Investigation** → **STR Filing**
2. Each step includes audit logging and status tracking
3. Role-based permissions control access at each stage

## 🎨 Design System

### Color Scheme
- **Risk-based Colors**: High (red), Medium (orange), Low (green)
- **Semantic Colors**: Primary, secondary, muted, destructive
- **Status Indicators**: Visual feedback for all system states

### Typography
- **Inter Font Family**: Clean, professional typography
- **Responsive Scaling**: Consistent text sizing across devices
- **Accessibility**: WCAG compliant contrast ratios

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices with progressive enhancement
- **Breakpoint System**: Consistent responsive behavior across components
- **Touch-Friendly**: Appropriate touch targets and gestures

## 🔍 Testing Strategy

- **Unit Tests**: Component and utility function testing with Vitest
- **Integration Tests**: User workflow testing
- **E2E Tests**: Full application testing (planned)

## 🚀 Deployment

The application is configured for deployment on:
- **Vercel**
- **Netlify**
- **Docker** (planned)
- **Static hosting** platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for financial compliance and regulatory excellence**
