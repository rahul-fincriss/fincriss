# FinCrisS - Financial Crime Surveillance System

FinCrisS is a high-performance, real-time platform designed for financial institutions to detect, manage, and investigate suspicious activities. This application provides a unified interface for analysts, investigators, and administrators to monitor alerts, manage cases, and tune detection models.

## 🚀 Recent Accomplishments: API Integration Phase

We have successfully migrated the core modules from mock data to a fully integrated backend API (`api.fincriss.com`).

### Integrated Modules
- **Authentication & Security**: Fully integrated with JWT-based sessions, role-based navigation, and persistent login status.
- **Analyst Workbench**: Real-time alert ingestion, filtering, and assignment. Implemented "Open Case" workflow directly from alerts.
- **Investigator Workspace**: Full case lifecycle management, including metadata updates, status transitions, and final closures.
- **Dashboard & Analytics**: Dynamic metrics pulling global counts for alerts, open cases, and pending STRs.
- **Workforce Management**: Live user administration, including role assignments and account status toggles.
- **Model Tuning & Governance**: Granular control over detection rules and their specific sensitivity thresholds via live API mutations.
- **Audit Trail**: Centralized logging system capturing all administrative and investigative actions for compliance.

> [!NOTE]
> **Customer 360** currently operates on mock data as the backend endpoints are pending deployment.

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite
- **Data Fetching**: React Query (TanStack Query) for robust caching and state management.
- **State Management**: Context API (Auth, UI states).
- **Styling**: Tailwind CSS & shadcn/ui (Radix UI) for a premium, accessible interface.
- **Icons**: Lucide React.
- **Date Handling**: date-fns.

## 📦 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

### Development
```bash
# Start the local development server
npm run dev
```

### Environment Configuration
Ensure your `.env` file points to the correct API environment:
```env
VITE_API_URL=https://api.fincriss.com
```

## 🏗️ Project Structure
- `src/services/`: API communication layer (Axios clients).
- `src/hooks/`: Custom React Query hooks for each domain.
- `src/components/`: Reusable UI components and domain-specific fragments.
- `src/pages/`: Main application screens and routing logic.
- `src/constants/`: Shared business logic constants (Priorities, Queues, Categories).

## ⚖️ Governance & Compliance
All configuration changes to detection parameters (Thresholds, Rule Toggles) are captured in the **Audit Trail**. FinCrisS maintains a strict "Submit for Review" pattern for production-level model updates.
