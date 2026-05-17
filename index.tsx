/**
 * @file index.tsx
 * @description Application entry point. Mounts the root React component into
 *              the DOM node with id="root". Wrapped in React.StrictMode to
 *              surface potential issues during development.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Locate the root DOM element — if missing, the app cannot start
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a concurrent React root and render the application
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);