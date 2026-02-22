# CulturePass - replit.md

## Overview

CulturePass is a cross-platform cultural community and events platform built with Expo (React Native) for the frontend and Express.js for the backend. It connects users with cultural communities, events, and local businesses across multiple countries (Australia, New Zealand, and beyond). The app features an onboarding flow, event discovery, community engagement, business directory, and user profiles. The vision includes ticketing, a service marketplace, commission engine, and government/council integrations.

Currently the app uses mock data for all content (events, communities, businesses) and has a minimal backend with placeholder user management. The database schema is set up with Drizzle ORM targeting PostgreSQL but is not yet deeply integrated into the app's data flow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, targeting iOS, Android, and Web
- **Routing**: expo-router v6 with file-based routing and typed routes enabled
- **Navigation Structure**:
  - `(onboarding)/` - 4-step onboarding flow (welcome → location → communities → interests)
  - `(tabs)/` - Main tab navigation with 5 tabs: Home, Explore, Communities, Directory, Profile
  - Detail screens: `event/[id]`, `community/[id]`, `business/[id]` as stack screens
- **State Management**:
  - React Context for app state (`OnboardingContext`, `SavedContext`)
  - AsyncStorage for local persistence of onboarding state, saved events, and joined communities
  - TanStack React Query configured for server state (query client set up but minimally used currently)
- **UI/Styling**: React Native StyleSheet (no UI library), custom color system in `constants/colors.ts`, Poppins font family via `@expo-google-fonts/poppins`
- **Animations**: react-native-reanimated for entry animations (FadeInDown, FadeInUp)
- **Haptics**: expo-haptics for tactile feedback on interactions
- **Platform Handling**: Platform-specific safe area insets and web fallbacks throughout

### Backend (Express.js)

- **Runtime**: Node.js with Express v5, TypeScript via tsx (dev) and esbuild (prod build)
- **Server Location**: `server/` directory with `index.ts` (entry), `routes.ts` (API route registration), `storage.ts` (data access layer)
- **CORS**: Dynamic CORS based on Replit environment variables, plus localhost support for Expo web dev
- **Current State**: Minimal - has a user CRUD interface with in-memory storage (`MemStorage`). No API routes are actually registered yet. The `registerRoutes` function is a placeholder.
- **Static Serving**: In production, serves a pre-built Expo web bundle from `dist/` directory; in dev, proxies to Metro bundler

### Data Layer

- **Schema**: Drizzle ORM with PostgreSQL dialect, defined in `shared/schema.ts`
- **Current Schema**: Only a `users` table (id, username, password) with UUID primary keys
- **Storage Pattern**: `IStorage` interface in `server/storage.ts` allows swapping between MemStorage and future database-backed storage
- **Mock Data**: All app content (events, communities, businesses, locations, interests) comes from `data/mockData.ts` - this is the primary data source currently
- **Drizzle Config**: Points to `DATABASE_URL` env var, migrations output to `./migrations/`

### Build & Deployment

- **Dev Mode**: Two parallel processes - `expo:dev` (Metro bundler for mobile/web) and `server:dev` (Express API server on port 5000)
- **Production Build**: `expo:static:build` creates a static web bundle, `server:build` bundles server with esbuild, `server:prod` serves everything
- **Replit Integration**: Uses `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, and proxy URL environment variables for Replit hosting

### Key Design Patterns

- **Shared Types**: `shared/schema.ts` is shared between frontend and backend for type consistency
- **Path Aliases**: `@/*` maps to project root, `@shared/*` maps to `shared/` directory
- **Error Handling**: Custom `ErrorBoundary` component wraps the entire app with a fallback UI and app restart capability
- **Onboarding Gate**: The onboarding layout redirects to tabs if onboarding is complete; otherwise blocks access to the main app

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required by Drizzle ORM config (`DATABASE_URL` env var). Currently not actively used since the app runs on mock data and in-memory storage, but the schema and config are ready.

### Key npm Packages
- **expo** (~54.0.27) - Core framework
- **expo-router** (~6.0.17) - File-based routing
- **drizzle-orm** (^0.39.3) + **drizzle-kit** - Database ORM and migration tooling
- **@tanstack/react-query** (^5.83.0) - Server state management
- **express** (^5.0.1) - Backend HTTP server
- **pg** (^8.16.3) - PostgreSQL client
- **zod** + **drizzle-zod** - Schema validation

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required for db:push and future DB operations)
- `REPLIT_DEV_DOMAIN` - Replit development domain (used for CORS and Expo proxy)
- `REPLIT_DOMAINS` - Comma-separated list of Replit domains for CORS
- `EXPO_PUBLIC_DOMAIN` - Public domain for API calls from the Expo app