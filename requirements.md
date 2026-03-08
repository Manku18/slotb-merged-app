: SlotB Barber Management Mobile Application
1. 🎯 Project Goal
The goal is to build a premium, highly performant, and reliable mobile application (iOS/Android) for SlotB based on the provided web dashboard design. The app must enable barbershop owners and managers to monitor real-time bookings, manage tokens, and view comprehensive performance analytics quickly and efficiently. The design must be mobile-first, maintaining the premium, dark-mode, "glass-card" aesthetic defined in the HTML/CSS provided.

2. 📱 Target Platform & Technology Stack
Target Platforms: iOS and Android.

Recommended Framework: React Native (or similar cross-platform framework like Flutter) to ensure a single codebase for both platforms while maintaining native performance and access to device features (e.g., push notifications).

Styling: Maintain the dark theme, neon/glow accents (blue and green), and the "glass-card" aesthetic.

Backend Integration: Must utilize REST APIs and WebSockets as indicated in the provided JavaScript code (dashboard.js).

3. 👤 User Interface (UI) & Experience (UX) - Mobile First
The design must prioritize one-hand usage, quick access to core functions, and easy-to-read data visualization on a small screen.

3.1. Authentication (Login/Onboarding)
Design: A single, sleek screen, maintaining the dark background and premium feel.

Elements:

Logo: Prominently display the SlotB logo at the top.

Credential Fields:

Email/Mobile Number field.

Password field with a toggle to show/hide the password.

Main CTA: A prominent, neon-accented "Login" button (matching the glow effect).

Social Login: Clear, well-designed buttons for "Login by Google" and "Login by Facebook" at the bottom.

Utility Links: Forgot Password? and Sign Up (if applicable).

UX Flow:

Smooth transition/animation upon successful login (e.g., quick fade-in to the Dashboard).

3.2. Core Navigation
The primary navigation for the mobile app must be a Fixed Bottom Navigation Bar with 4-5 clearly identifiable icons:

Dashboard (Home/Stats Icon) - Current landing screen.

Home/Schedule (home Icon) - For detailed appointment view.

Live Tokens (Token/Queue Icon) - For real-time queue management.

Clients/Partners (User/People Icon) - Management of staff and customer profiles.

Settings/More (Cog Icon or Hamburger Menu in top corner).

4. 📈 Feature Requirements (Corresponding to Web Dashboard)
The mobile dashboard must present the most critical information first and allow for easy drill-down.

4.1. Dashboard Screen (Landing)
Header: Shop Name (Rupesh Unisex Salon) and a high-priority Notifications Bell icon (with badge count).

KPI Cards (Top): Must condense the three web stats into one scrollable/swipeable area or stack them for mobile viewing.

Total Bookings: Value, growth percentage (+12% vs last week), and a small, embedded line chart showing the trend.

Offline Bookings

Online Bookings

Earnings Chart (Interactive):

Implement the "Earnings (Last 7 Days)" line chart (Chart.js equivalent for React Native).

Ensure the neon gradient fill and responsive tooltips are maintained.

The "Add Token" and "Add Earning" buttons must be prominently visible, possibly consolidated into a Floating Action Button (FAB).

Key Analytics Summaries: Show compressed views of the most critical analytics:

Booking Distribution (Small Doughnut Chart).

Partner Performance (Top 3 Barbers/Partners by Earnings/Bookings).

4.2. Live Tokens Screen (Queue Management)
Filter Bar: Must have the same filter buttons (All, Waiting, In-Progress, Completed) as the web version.

Token List: A clean, scrollable list of token cards with the following details:

Token Number (Large & prominent).

Customer Name and Service.

Time/Duration and Source (Online/Walk-in).

Action Button: A simple swipe action or button on the card to update the token status (e.g., "Start," "Complete").

New Token FAB: A persistent Floating Action Button (+) to quickly launch the Add New Token Modal.

4.3. Add New Token Modal
A full-screen or half-screen modal overlay that allows for quick data entry:

Customer Name (Input)

Service (Dropdown/Selector)

Barber (Dropdown/Selector)

Mobile Number (Input)

Submit Button (Neon-glow style).

5. ⚙️ Technical Requirements & Data Handling
API Integration: Implement all API calls defined implicitly in the dashboard.js file:

/api/dashboard (GET - Initial data load for stats, earnings, tokens, partners).

/api/tokens (POST - Handle new token creation).

/api/reports/generate (GET - Report download functionality).

Need to use device-native file download for the report.

Real-time Updates (WebSockets): Implement a robust WebSocket client connection to the specified endpoint (ws://your-websocket-endpoint).

Must handle incoming message types: token_created, earnings_updated, stats_updated.

Implement an automatic reconnect logic on connection closure (as shown in the JS code).

Local State Management: Utilize a robust state management solution (e.g., Redux, Zustand, React Context) to manage real-time updates for tokens and stats across the app.

Animations: Implement smooth, performant transitions (e.g., card entry animation, subtle data refresh animation) to enhance the "premium" feel. The floating animation for key stats should be included if possible.

6. 🖼️ Visuals and Aesthetics
Theme: Strictly adhere to the Dark Mode (Deep Blue/Black background) and Glass-Card design outlined in the provided CSS.

Color Mapping (Required):

Primary Background: #111827 or similar deep dark color.

Card Background: rgba(255, 255, 255, 0.05) with blur effect (backdrop-filter).

Neon Blue Accent (glow-blue): #00e1ff (Used for primary CTAs, Online bookings, Line Charts).

Neon Green Accent (glow-green): #4ade80 (Used for positive growth indicators, Offline/Walk-in bookings).