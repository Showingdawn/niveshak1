# Contributing to SafalNiveshak

Thank you for your interest in contributing to SafalNiveshak! This project is an offline-capable, bilingual stock market education platform designed for retail investors in India.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Showingdawn/niveshak1.git
   cd niveshak1-main
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. (Optional) Run the local SQLite/Express backend server:
   ```bash
   cd server
   npm install
   npm start
   ```

## Development Workflow

### Running Locally
To launch the Vite development server:
```bash
npm run dev
```

To build and package the client files (verifying SW/PWA assets):
```bash
npm run build
```

### Coding Guidelines
1. **Design Theme**: Maintain the **dark mode glassmorphism** theme, utilizing the standard purple-blue-cyan gradient scheme.
2. **Bilingual Text**: Ensure all user-facing UI labels have both English and Hindi strings using the `getTxt(en, hi)` utility.
3. **Offline Integrity**: Test features under network disconnection. Fallback to `localStorage` operations if Express/SQLite backend services are offline.

## Pull Request Guidelines
- Write clear, descriptive commit messages.
- Run `npm run build` locally to verify that rolldown packages build cleanly before opening a Pull Request.
