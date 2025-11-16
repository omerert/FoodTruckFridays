# FoodTruckConnect
# DP4 ReadMe Document

### Overview
FoodTruckConnect is a front-end prototype to explore food trucks, check schedules, join interest groups, and share short stories about visits; it runs entirely in the browser with no backend or database required.

In this prototype you can:
- View a monthly calendar and an upcoming list of scheduled food trucks.
- Click a country flag to open a cuisine modal with details and images.
- Share a story with rating and photos on the Share Story page.
- View stories, react to them, and add comments on the Stories page.

All data is stored in localStorage in your browser and is cleared if browser storage is wiped or when using private browsing modes depending on the browser’s behavior.

### System requirements
- Modern desktop browser with ES6 module support (Chrome/Edge, Firefox, Safari, Opera; Internet Explorer not supported).
- JavaScript enabled; storage/cookies enabled for localStorage persistence.

Some browsers may block ES module imports when opening index.html via the file:// protocol; if you see a blank page, run a small local server instead of opening the file directly.

### Quick start
- Deployed on: https://omerert.github.io/FoodTruckConnect/

or

1) Download the project:
- git clone https://github.com/omerert/FoodTruckConnect.git
- cd FoodTruckFridays

2) Open in a browser:
- Double-click index.html, or drag it into your browser window.

3) Optional local server (recommended if file:// blocks modules):
- Node: npm install -g http-server && http-server, then open the shown URL.
- VS Code: install “Live Server” → Right‑click index.html → “Open with Live Server”.

### Known limitations
- No authentication: everyone shares the same localStorage on a device/profile; no individual identity tracking.
- Fixed schedule: dates are hardcoded; adding trucks requires code changes.
- Data persistence: clearing storage or switching devices loses data; no sync across devices.
- Mobile responsiveness: usable on mobile but optimized for desktop layouts.
- file:// restrictions: some browsers restrict ES modules when opening files directly; use a local server if needed.

### External dependencies and resources
- Tailwind CSS via CDN for utility-first styling; ideal for prototypes; for production builds prefer installed tooling.
- MDN Web Docs for localStorage and Web Storage API behavior, persistence, and file:// considerations.
- Placeholder images from a placeholder image service; educational links (e.g., Wikipedia) appear in cuisine modals as external references.

### Video walkthrough
YouTube: https://www.youtube.com/watch?v=5XqWiSdn9Nw
