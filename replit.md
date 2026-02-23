# CulturePass - replit.md

## Overview

CulturePass is a cross-platform cultural community and events platform that connects users with cultural communities, events, and local businesses. It is designed to operate across multiple countries, including Australia, New Zealand, UAE, UK, and Canada. The platform features user onboarding, event discovery, community engagement, a business directory, user profiles, a perks and benefits system, sponsorship tools, notifications, and payment/wallet integration. The project aims to become a central hub for cultural interaction and commerce.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

The frontend is built with Expo SDK 54 and React Native 0.81, targeting iOS, Android, and Web. It uses `expo-router` for file-based routing and features a structured navigation system including an onboarding flow, main tab navigation (Discover, Calendar, Community, Perks, Profile), and dedicated detail screens. State management is handled with React Context for app-wide state and AsyncStorage for local persistence. Server state is managed via TanStack React Query. UI and styling rely on React Native StyleSheet with a custom color system and Poppins font. Animations are implemented with `react-native-reanimated`, and `expo-haptics` provides tactile feedback.

### Backend (Express.js)

The backend is an Express.js application running on Node.js, developed with TypeScript. It provides over 30 RESTful API endpoints for managing users, profiles, interactions (follows, likes, reviews), payments, sponsorships, perks, memberships, notifications, and tickets. CORS is dynamically configured for Replit environments and local development. In production, the backend also serves the static Expo web bundle.

### Data Layer

The application uses PostgreSQL as its database, managed via Drizzle ORM. The schema, defined in `shared/schema.ts`, includes tables for users, profiles (supporting 9 entity types like community, organisation, artist), follows, likes, reviews, payment methods, transactions, wallets, sponsors, perks, memberships, notifications, and tickets. Frontend data for events, movies, restaurants, activities, and shopping is currently sourced from mock data, while profiles, sponsors, perks, payments, and notifications are backed by the PostgreSQL database.

### Build & Deployment

Development uses parallel processes for the Expo Metro bundler and the Express API server. Production involves building a static web bundle for Expo and bundling the server with esbuild. Replit-specific environment variables are utilized for integration.

### Key Design Patterns

Shared types between frontend and backend ensure type consistency. Path aliases simplify imports. The application includes a global `ErrorBoundary` for graceful error handling. An onboarding gate manages access to the main application. A `useDemoUserId()` hook facilitates testing with a sample user. Entity types are differentiated with unique colors and icons.

## External Dependencies

-   **PostgreSQL Database**: Primary database, configured via `DATABASE_URL`.
-   **Expo**: Core framework for cross-platform development.
-   **expo-router**: For declarative, file-based routing in Expo applications.
-   **drizzle-orm** and **drizzle-kit**: ORM for PostgreSQL and schema migration tools.
-   **@tanstack/react-query**: For efficient server state management.
-   **express**: Node.js web application framework for the backend API.
-   **pg**: PostgreSQL client for Node.js.
-   **zod** and **drizzle-zod**: Used for schema validation and type inference.