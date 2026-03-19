# Mohini App Frontend

A React 18 single-page application for the Shikshalokam platform, featuring voice-based AI chat, rich content editing, internationalization, and PDF generation.

## Features

- **Voice-Based AI Chat** — Real-time voice conversations with AI bots, including speech-to-text and audio playback
- **Mitra (AI Coaching)** — Conversation-based AI assistant for creating improvement plans and coaching feedback
- **PTM (Parent-Teacher Meetings)** — Structured voice-based discussion flows for parent-teacher interactions
- **YLC (Youth Leadership Course)** — Story creation, evidence capture, and structured learning flows
- **PDF Generation** — Export conversations and stories as downloadable PDF reports
- **Rich Text Editing** — Block-based content editing with Editor.js
- **Repository Browser** — Browse and search the Shikshagraha learning content repository
- **Internationalization** — Multi-language support via i18next
- **WebSocket Chat** — Real-time bot conversation handling with reconnect support

## Prerequisites

- Node.js 22+
- npm

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd mohini-app-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment files:

```bash
cp sample.env .env
cp sample.env-cmdrc .env-cmdrc
```

4. Fill in the required values in both `.env` and `.env-cmdrc` (see [Environment Configuration](#environment-configuration)).

5. Start the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000/mohini](http://localhost:3000/mohini).

## Environment Configuration

### `.env` file

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_LOCAL_PROXY` | Yes | Backend API proxy URL (e.g. `https://devqa-mohini.shikshalokam.org`) |
| `REACT_APP_WEBSOCKET_HOST` | Yes | WebSocket server host (e.g. `devqa-mohini.shikshalokam.org`) |
| `REACT_APP_WEBSOCKET_RETRY_NUM` | Yes | Number of WebSocket reconnection attempts |
| `REACT_APP_S3_UPLOAD_RETRY_NUM` | Yes | Number of S3 upload retry attempts |
| `REACT_APP_WS_PROTOCOL` | Yes | WebSocket protocol (`ws` or `wss`) |
| `REACT_APP_COMPANY_SLUG` | Yes | Company identifier slug for retrieving bot configurations |
| `REACT_APP_MEGA_PTM_PROFILE_ID` | No | Profile ID for Mega PTM |
| `REACT_APP_YLC_PROFILE_ID` | No | Profile ID for YLC |
| `REACT_APP_ADUIO_PATH` | No | Audio file path prefix (default: `/mohini/`) |
| `REACT_APP_ROOT_PATH` | No | Application root path (default: `mohini`) |
| `REACT_APP_AUTH_METHOD` | No | Authentication method (e.g. `cookie`) |
| `REACT_APP_AUTH_KEY` | No | Authentication key name (e.g. `shikshaToken`) |
| `REACT_APP_AUTH_ROUTE` | No | Authentication API route |

### `.env-cmdrc` file

This file manages environment-specific variables using [env-cmd](https://github.com/toddbluhm/env-cmd). It supports multiple environments: `dev`, `demo`, and `prod`.

| Variable | Description |
|---|---|
| `REACT_APP_SERVER_URL` | Full backend server URL |
| `REACT_APP_SERVER_HOST` | Backend server hostname |
| `REACT_APP_AWS_ACCESS_ID` | AWS access key ID (for S3 uploads) |
| `REACT_APP_AWS_SECRET_ACCESS` | AWS secret access key |
| `REACT_APP_AWS_REGION` | AWS region |
| `GENERATE_SOURCEMAP` | Enable/disable source maps (dev only) |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with `dev` environment |
| `npm run local` | Start dev server with `local` environment |
| `npm run demo` | Start dev server with `demo` environment |
| `npm run prod` | Start dev server with `prod` environment |
| `npm run build-dev` | Build for dev environment |
| `npm run build-prod` | Build for production environment |
| `npm run build-docker` | Build for Docker environment |
| `npm test` | Run Playwright end-to-end tests |
| `npm run test:headed` | Run Playwright tests in headed mode |
| `npm run test:debug` | Run Playwright tests in debug mode |
| `npm run test:chrome` | Run Playwright tests in Chromium only |

## Running in Production

### With PM2

1. Build the production bundle:

```bash
npm run build-prod
```

2. Start with PM2:

```bash
pm2 start pm2.config.json
```

This runs an Express server (`server.js`) on port **1819** serving the built app at `/mohini`.

### With Docker

1. Build the Docker image:

```bash
docker build -t mohini-app .
```

2. Run the container with environment variables:

```bash
docker run --env-file .env -p 3000:3000 mohini-app
```

The Docker setup uses a multi-stage build (Node.js for building, nginx for serving) and injects environment variables at runtime via `generate-env-config.sh`.

## Project Structure

```
src/
├── api/            # API service calls (ai, auth, chat, flow, story, upload, user)
├── components/     # Reusable React components
├── config/         # App configuration (flow config)
├── constants/      # Application constants (session, URLs)
├── context/        # React Context providers (user context)
├── hooks/          # Custom React hooks (useFlow, useLanguage, useAudio, useStorage)
├── pages/          # Page-level components
│   ├── ai-creation/              # Mitra AI coaching module
│   ├── interview-voice/          # Voice interview flow
│   ├── interview-text-voice/     # Text + voice interview flow
│   ├── ShikshalokamVoiceChat/    # Main voice chat feature
│   ├── UnifiedChat/              # Unified chat interface
│   ├── shikshagraha-repository/  # Content repository browser
│   ├── ShikshalokamMegaPTM/      # Parent-Teacher Meeting module
│   ├── story/                    # Story creation and management
│   ├── Login/                    # Authentication
│   └── Logout/                   # Sign out
├── services/       # Business logic services (API, audio, storage)
├── store/          # Zustand state (chat, user, site, AI creation slices)
├── utils/          # Utility functions and axios configuration
├── App.js          # Root component and routing
├── i18n.js         # Internationalization setup
└── index.js        # Entry point

tests/
├── e2e/            # End-to-end test specs (Playwright)
├── fixtures/       # Test data fixtures
├── helpers/        # Test helper utilities
└── pages/          # Page object models
```

## Tech Stack

| Category | Libraries |
|---|---|
| Framework | React 18, React Router DOM 6 |
| State Management | Zustand 5, TanStack Query 5 |
| Styling | Tailwind CSS, PrimeReact, Styled Components |
| Audio & Media | Wavesurfer.js, React PDF |
| Content Editing | Editor.js, React Markdown, DOMPurify |
| PDF Export | jsPDF, html2canvas |
| Internationalization | i18next, react-i18next |
| HTTP Client | Axios, axios-retry |
| Animations | React Spring |
| Testing | Playwright |
