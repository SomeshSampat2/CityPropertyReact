# CityProperty - React Version

A modern React implementation of the CityProperty real estate platform with role-based authentication and beautiful UI.

## Project Structure

```
src/
├── components/          # React components
│   └── Login.jsx       # Login/landing page component
├── services/           # Business logic and API services
│   └── authService.js  # Authentication service
├── config/            # Configuration files
│   └── firebase.js    # Firebase configuration
├── styles/            # CSS stylesheets
│   └── styles.css     # Main stylesheet with custom variables
├── utils/             # Utility functions (for future use)
├── assets/            # Static assets
│   └── react.svg      # Default React logo
├── App.jsx            # Main app component with routing
└── main.jsx           # Application entry point
```

## Features

- ✅ **Modern React Setup** with Vite
- ✅ **Firebase Authentication** with Google OAuth
- ✅ **Role-Based Access Control** (User, Broker, Admin, SuperAdmin)
- ✅ **Responsive Design** with Bootstrap 5
- ✅ **Glassmorphism Effects** and smooth animations
- ✅ **Hero Section** with background image overlay
- ✅ **Property Carousel** showcasing featured listings
- ✅ **Clean Architecture** with separated concerns

## Getting Started

### Prerequisites
- Node.js (version 20.19+ or 22.12+ recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate to the React folder:
   ```bash
   cd "property dealer React"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev -- --port 4000
   ```

4. Open [http://localhost:4000](http://localhost:4000) in your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication

The app uses Firebase Authentication with Google OAuth. SuperAdmin emails are pre-configured for special access.

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Firebase** - Authentication and database
- **Bootstrap 5** - Responsive UI framework
- **Font Awesome** - Icons
- **Animate.css** - CSS animations