# G2G Assessment - User Management System

A Vue.js 3 user management application built with TypeScript and Firebase Firestore.

## Project Overview

This application demonstrates a comprehensive user management system with the following features:

- **User Management**: Create, read, update, and delete user records
- **Data Visualization**: Toggle between list and grid views
- **Advanced Filtering**: Filter by name, email, DOB, gender, profile picture, created at, updated at
- **Sorting Capabilities**: Sort by multiple user attributes
- **CSV Export**: Export user data to CSV format
- **Responsive Design**: Works across different screen sizes

## Technical Stack

- **Frontend Framework**: Vue.js 3.5.21 with Composition API
- **Type Safety**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.6
- **UI Components**: Reka UI (shadcn-vue equivalent)
- **Styling**: Tailwind CSS 4.1.13
- **Form Validation**: Vee-Validate 4.15.1 with Zod 3.25.76
- **Data Persistence**: Firebase Firestore 12.3.0

## Architecture

The application follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer** (`src/models/`): Core business entities and validation
- **Application Layer** (`src/composables/`): Business logic and state management
- **Infrastructure Layer** (`src/service/`): External system integration
- **Presentation Layer** (`src/components/`): User interface components

## Development Environment

The project includes a professional development environment with:

### Code Quality Tools

- **ESLint**: Static code analysis with TypeScript support
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Enforces conventional commit message format

### Version Control

- **Node.js Version**: Enforced via `.nvmrc` (v20.11.1)
- **npm Version**: Enforced via `engines` field in package.json

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix linting issues
- `npm run format`: Format code with Prettier

## Getting Started

1. Ensure you have Node.js v20.11.1 or higher installed
2. Clone the repository
3. Install dependencies: `npm install`
4. Create a `.env` file based on `.env.example` with your Firebase credentials
5. Start the development server: `npm run dev`

## Code Organization

- `src/models/`: Domain entities and validation schemas
- `src/composables/`: Reusable stateful logic
- `src/service/`: External API integrations
- `src/components/`: UI components
  - `src/components/ui/`: Reusable UI components
  - `src/components/user/`: User-specific components
- `src/lib/`: Utility functions

## Best Practices Implemented

- **Clean Architecture**: Clear separation of concerns
- **Single Responsibility Principle**: Each module has one reason to change
- **Type Safety**: Comprehensive TypeScript typing
- **Optimistic UI Updates**: Immediate UI feedback with backend confirmation
- **Consistent Coding Style**: Enforced via ESLint and Prettier
- **Conventional Commits**: Standardized commit messages
