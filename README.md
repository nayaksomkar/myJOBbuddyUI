# myJOBbuddy UI

A clean, minimal ChatGPT-style chat interface for resume analysis. Upload resumes (PDF/TXT), chat with AI about them, and get insights on experience, skills, education, and more.

## Features

- **Resume Upload**: Upload PDF or TXT resumes directly through the chat input
- **Preloaded Resumes**: Three sample resumes available in tabs for immediate analysis
- **Chat Interface**: Conversational UI similar to ChatGPT with clean message bubbles
- **Voice Input**: Microphone icon for speech-to-text input
- **New Chat**: Start fresh conversations with the "New Chat" button
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Backend Integration

This UI requires `VITE_API_URL` to be set for resume parsing. Create a `.env` file in the project root:

```
VITE_API_URL=https://your-backend-api.com
```

The frontend sends uploaded resumes as multipart form data to `{VITE_API_URL}/parse`. The backend accepts both PDF and TXT formats.

## AI Integration

This UI uses [LLMPing](https://github.com/nayaksomkar/LLMPing) as its AI backend for generating interview-prep responses.

Set `VITE_AI_API_URL` in `.env`:

```
VITE_AI_API_URL=https://your-llm-api.example/chat
```

For GitHub Pages, add `VITE_API_URL` and `VITE_AI_API_URL` as repository
secrets under **Settings > Secrets and variables > Actions**. The Pages
workflow injects these values while building the production bundle. Do not
put private API keys in Vite client variables: Vite embeds `VITE_*` values in
the public JavaScript bundle.

### Expected API contract

Request:
```bash
curl -X POST https://your-llm-api.example/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"your message here"}'
```

Response:
```json
{
  "answer": "Hello! How can I help you today?",
  "provider": "google_genai",
  "model": "gemini-2.5-flash"
}
```

The UI sends the user message plus the selected resume text as context in a simple JSON body, reads `data.answer`, and displays it as the assistant reply. If `VITE_AI_API_URL` is not set, the app uses a local fallback response instead of calling the API.

## Adding This UI to an Existing Project

To integrate this resume analysis UI into an existing React project:

1. **Copy the source files** from `src/App.jsx` and `src/App.css` into your project
2. **Install dependencies** if needed:
   ```bash
   npm install react react-dom
   ```
3. **Configure the API URL** via environment variable (required):
   ```bash
   # .env
   VITE_API_URL=https://your-backend-api.com
   ```
4. **Add the component** to your app entry point:
   ```javascript
   import App from './App.jsx'
   ```
5. **Include the CSS** in your main stylesheet or import it in `App.jsx`

## Customization

- **Preloaded Resumes**: Edit the `SAMPLE_RESUMES` array in `App.jsx` to add your own preloaded resume data
- **Branding**: Update the brand name and icon in the sidebar header section
- **API Endpoint**: Set `VITE_API_URL` in `.env` (required, no hardcoded fallback)
- **Styling**: Modify CSS variables in `index.css` to adjust colors and theme

## Tech Stack

- React 19
- Vite
- Vanilla CSS (no external UI libraries)
