# LaikaMobil

LaikaMobil is a mobile application built with React Native and Expo designed for event discovery, ticket purchasing, and digital ticket management. The application interfaces with the Pilgrim API to provide real-time data, secure authentication, and a seamless user experience.

## Technologies Used

- Framework: React Native with Expo
- Navigation: React Navigation (Bottom Tabs, Native Stack)
- Network Requests: Axios
- State Management: Custom AuthStore leveraging pattern subscriptions
- Local Storage: AsyncStorage and Expo SecureStore
- UI Enhancements: Expo Blur, Expo Linear Gradient
- Assets: React Native QRCode SVG

## Project Structure

The source code is organized within the `src/` directory to maintain separation of concerns:

- `api/`: Configuration for Axios instances and API base URLs.
- `components/`: Reusable UI elements (`ui/` subfolder) and domain-specific complex components (e.g., interactive maps, filter bars).
- `hooks/`: Custom React hooks to abstract business logic and state selection.
- `screens/`: Top-level React components representing individual application views.
- `services/`: Encapsulated modules for handling backend API communication (Auth, Events, Tickets, Payments, Users).
- `store/`: Global state management, primarily handling user session and authentication tokens.
- `styles/`: Comprehensive design system containing theme definitions (Light/Dark modes), typography, and style utilities.

## Setup and Installation

### Prerequisites

Ensure you have the following installed in your development environment:
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)
- Expo CLI

### Installation Steps

1. Navigate to the project directory.
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables. Create a `.env` file in the root directory and specify the backend API URL:
   ```env
   EXPO_PUBLIC_PILGRIM_API_URL=http://your-backend-ip:8000/api
   ```
4. Start the Expo development server:
   ```bash
   npm run start
   ```
5. Scan the QR code generated in the terminal using the Expo Go application on your physical device, or press `a` for Android emulator / `i` for iOS simulator.

## Available Scripts

- `npm run start`: Starts the Expo packager.
- `npm run android`: Starts the application on an active Android emulator or connected device.
- `npm run ios`: Starts the application on an active iOS simulator.
- `npm run lint`: Analyzes the codebase for syntax and style issues using ESLint.

## Core Features

- User Authentication: Secure login flow with persistent session storage.
- Event Catalog: Browse and search available events.
- Event Details: Access detailed event information, image galleries, and schedules.
- Venue Interaction: Select tickets through an interactive venue seating map.
- Checkout Flow: Shopping cart management and payment intent generation.
- Digital Wallet: Access purchased tickets equipped with scannable QR codes for event entry.
- Theming: Full support for Light, Dark, and System appearance preferences.

## Architecture Guidelines

- All external API calls must be routed through the appropriate module in the `services/` directory.
- UI components must avoid hardcoded colors or spacing. Always utilize the `useAppTheme` and `useStyles` hooks to ensure compatibility with the global design system.
- Application routing and navigation structures are centralized within `App.tsx`.
