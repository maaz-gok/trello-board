# Trello Bug Viewer

A sleek, modern, standalone Kanban board viewer for Trello JSON exports. 

## Features
- **Instant Preload:** The included `index.html` has JSON data preloaded so it renders immediately upon opening.
- **Drag & Drop:** You can drag and drop any new Trello `.json` export directly onto the page to view it instantly.
- **Glassmorphism UI:** Features a dark-mode, frosted-glass aesthetic for a premium feel.
- **Local & Secure:** All parsing and rendering happens locally in your browser. No data is sent to any servers.

## How to run locally
Simply double-click `index.html` to open it in your browser of choice.

## How to preload your own data
If you want to create a standalone HTML file with your *own* data preloaded (for easy sharing with clients):
1. Place your Trello `.json` export in the same directory.
2. Update the `<script id="preloaded-data" type="application/json">` block inside `index.html` with your new JSON content.
   *(Make sure to replace any `</script>` tags within your JSON with `<\/script>` to avoid breaking the HTML).*
