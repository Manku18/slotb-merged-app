# SlotB Partner Mobile App

A premium mobile application for barbershop owners and managers to monitor real-time bookings, manage tokens, and view comprehensive performance analytics.

## Features

- **Premium Dark Mode UI**: Glass-card aesthetic with neon accents (Electric Teal #00e1ff and Neon Green #4ade80)
- **Dashboard**: Real-time KPI cards, earnings charts, and partner performance analytics
- **Live Token Management**: Queue management with status filters and real-time updates
- **home View**: Daily schedule and appointment management
- **Settings**: User profile, notifications, and app preferences

## Technology Stack

- **Framework**: React Native with Expo Router
- **State Management**: Zustand
- **Charts**: react-native-chart-kit
- **Icons**: @expo/vector-icons (Ionicons)
- **Styling**: React Native StyleSheet with custom theme system

## Project Structure

```
├── app/
│   ├── (tabs)/
│   │   ├── dashboard.tsx      # Main dashboard screen
│   │   ├── tokens.tsx         # Live tokens management
│   │   ├── home.tsx       # Schedule/home view
│   │   └── settings.tsx      # Settings screen
│   ├── login.tsx              # Authentication screen
│   └── _layout.tsx            # Root layout with auth routing
├── components/
│   └── ui/
│       ├── GlassCard.tsx     # Glass-card component
│       ├── GlowButton.tsx    # Neon-accented button
│       ├── InputField.tsx    # Form input with glow effect
│       └── KPICard.tsx        # KPI stat card component
├── constants/
│   └── theme.ts               # SlotB color palette and theme
├── store/
│   └── useAppStore.ts         # Zustand state management
├── services/
│   └── api.ts                 # API service and WebSocket client
└── hooks/
    └── useWebSocket.ts        # WebSocket hook for real-time updates
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_WS_URL=ws://localhost:3000
```

## Color Palette

- **Background**: `#111827` (Deep dark)
- **Glass Card**: `rgba(255, 255, 255, 0.05)` with blur effect
- **Neon Blue**: `#00e1ff` (Primary accent, online bookings, charts)
- **Neon Green**: `#4ade80` (Positive indicators, offline bookings)

## API Endpoints

The app uses mock data by default. To connect to a real backend:

- `GET /api/dashboard` - Fetch dashboard stats, earnings, tokens, and partners
- `POST /api/tokens` - Create a new token
- `GET /api/reports/generate` - Generate and download reports

## WebSocket Events

- `token_created` - New token created
- `stats_updated` - Dashboard stats updated
- `earnings_updated` - Earnings data updated
- `token_status_updated` - Token status changed

## Development

The app uses Expo Router for file-based routing. Authentication state is managed globally using Zustand, and the app automatically routes to login if not authenticated.

## License

Private - SlotB Partner Demo
