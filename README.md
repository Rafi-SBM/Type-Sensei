# TypeSensei

**Surpass your limits. Right here. Right now.**

**Link :** https://type-sensei.vercel.app 

TypeSensei is a modern typing-practice web application designed to help you improve your typing speed and accuracy with meaningful, engaging content. Built with React and modern web technologies, it combines responsive design with intelligent text generation to create an effective learning experience.

## Key Features

- **Three Difficulty Levels** - Easy, Medium, and Hard modes with progressively complex vocabulary and topics
- **Two Game Modes** - Timed mode (configurable in minutes) and unlimited Practice mode
- **Real-Time Statistics** - Live WPM, accuracy percentage, and character-by-character feedback
- **Intelligent Text Generation** - Coherent, meaningful passages about technology and software engineering topics:
  - Local generation for immediate UI feedback
  - Remote generation via OpenRouter for diverse content
  - Automatic new content after 2 consecutive plays of the same mode
- **Dark Mode Support** - Toggle between light and dark themes (preference persists across sessions)
- **Results Panel** - Detailed performance metrics after each session including WPM, accuracy, and best score tracking
- **Progressive Enhancement** - Works perfectly with local generation; enhanced with remote generation when API key is available
- **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **Accessible** - Keyboard-first interactions, ARIA labels, and semantic HTML

## Content Quality

Unlike random typing practice apps, TypeSensei generates passages with real meaning:
- **Easy level:** Simple, clear sentences about modern technology and web development basics
- **Medium level:** Technical content about microservices, APIs, DevOps, and cloud computing
- **Hard level:** Complex topics including distributed systems, blockchain, Kubernetes, and GraphQL

## Technologies

- **Framework:** React 18 with TypeScript
- **Bundler / Dev Server:** Vite
- **Styling:** Tailwind CSS with CSS variables for theming
- **Components:** Radix UI + shadcn/ui style system
- **AI Integration:** OpenRouter API (optional, for remote text generation)
- **State Management:** React hooks with localStorage persistence

## Quickstart

Prerequisites:
- Node.js (18+) and npm installed

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The development server will start and serve the app locally (typically at `http://localhost:8080/`).

To create an optimized production build:

```bash
npm run build
npm run preview
```

## Project Structure

```
TypeSensei/
├── src/
│   ├── components/
│   │   └── typing-game/
│   │       ├── Header.tsx         - Title and dark mode toggle
│   │       ├── ModeSelector.tsx   - Level and duration selection
│   │       ├── QuoteDisplay.tsx   - Text display with character feedback
│   │       ├── TypingInput.tsx    - Input capture and key handling
│   │       ├── StatsBar.tsx       - Live statistics display
│   │       └── ResultsPanel.tsx   - Post-game results and metrics
│   ├── hooks/
│   │   └── use-dark-mode.ts       - Dark mode state management
│   ├── lib/
│   │   ├── generator.ts           - Text generation with validation
│   │   └── openrouter.ts          - OpenRouter API integration
│   ├── data/
│   │   └── quotes.ts              - Word pools for local generation
│   ├── pages/
│   │   └── Index.tsx              - Main game page
│   ├── App.tsx                    - Root component and routing
│   ├── main.tsx                   - Application entry point
│   └── index.css                  - Global styles and theming
├── public/
│   ├── favicon.png                - Site icon
│   └── site.webmanifest           - PWA manifest
├── package.json                   - Dependencies and scripts
├── vite.config.ts                 - Vite configuration
└── index.html                     - HTML entry point
```

## License

TypeSensei is open source. Feel free to fork, modify, and deploy!
