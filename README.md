# FoodTruckConnect

## Overview
Food Truck Connect is a web application that helps immigrants discover food trucks, share experiences, and build community through food. It enables users to:
* Discover food truck schedules, operating hours, and locations
* Learn about global cuisines through cultural descriptions
* Share personal stories about food truck visits
* React and comment on community experiences
* Join interest groups based on cuisine preferences
* Manage their personal foodie profile

The system runs entirely in the browser with no backend required, making it easy to deploy and use locally.

## Key Features
* **Calendar & Schedule View** — Monthly calendar with upcoming food truck locations and times
* **Cuisine Discovery** — Click flags to learn about cuisines with descriptions and images
* **Story Sharing** — Publish experiences with 1-5 star ratings and photos
* **Community Engagement** — React with 17 emojis and add threaded comments
* **Group Management** — Browse, filter, and create food truck interest groups
* **Story Editing** — Edit, delete, and manage your published stories
* **Local Data Storage** — All data saved in browser's localStorage

## How to run UI
* Deployed on: https://omerert.github.io/FoodTruckConnect/

**or**

1. **Download the project:**
    * `git clone https://github.com/omerert/FoodTruckConnect.git`
    * `cd FoodTruckConnect`

2. **Open in a browser:**
    * Double-click `index.html`, or drag it into your browser window.

3. **Optional local server (recommended if `file://` blocks modules):**
    * Node: `npm install -g http-server && http-server`, then open the shown URL.
    * VS Code: install “Live Server” → Right‑click `index.html` → “Open with Live Server”.

## Usage

### Homepage
* View rotating welcome messages
* Choose from 3 main features:
    * **View Calendar** — Browse food truck schedule
    * **Share Story** — Write and publish experiences
    * **Join Group** — Browse or create community groups

### Calendar View
* **Monthly Calendar** — See all scheduled food trucks for current month
* **List View** — Upcoming 30-day schedule in list format
* **Click Cuisine Flags** — Learn about specific cuisines with images and descriptions

### Share Story
* **Write Tab** — Create new story with truck selection, rating, reflection, and photos
* **Stories Tab** — View, edit, and delete your published stories
* **Comments** — Add threaded replies to community stories
* **Reactions** — React with emojis: 👍, ❤️, 😂, 🤩, 🔥, 😋, 😍, 🎉, and more

### Join Group
* **Browse Groups** — Filter by cuisine, type (cultural/language/social), and member size
* **Groups Joined** — View communities you're part of
* **Create Group** — Start your own food truck interest group
* **Recommended Trucks** — See upcoming events related to group cuisine

### Profile
* **Personal Details** — Update your name, location, bio
* **Preferences** — Set your favorite cuisine
* **Activity Stats** — View the number of groups joined and stories shared

## Project Structure

FoodTruckConnect/ 
├── index.html      # Main HTML with all views 
├── main.js         # Calendar & navigation logic 
├── shareStory.js   # Story, comment, & reaction system 
├── joinGroup.js    # Group management & browsing 
├── calendarData.js # Food truck schedule data 
├── styles.css      # Custom CSS & animations 
└── README.md       # This documentation

## System Requirements
* **Modern Browser** — Chrome, Edge, Firefox, Safari (ES6 module support)
* **JavaScript** — Must be enabled
* **localStorage** — Must be enabled for data persistence
* **Local Server** — Required to avoid `file://` protocol issues

## Known Limitations
* **No Backend** — No authentication or user accounts (simulated via local profile)
* **Fixed Schedule** — Food truck dates are hardcoded; requires code changes to update
* **No Data Sync** — Data stored locally; cleared if storage is wiped
* **No Cross-Device Sync** — Each device/browser has separate data
* **Desktop-Optimized** — Mobile responsive but designed for desktop
* **file:// Issues** — Some browsers block ES modules; use local server

## Technologies Used

### Frontend Stack
* **HTML5** — Semantic markup and structure
* **CSS3** — Modern styling with Tailwind CSS
* **JavaScript (ES6+)** — Core application logic using ES6 modules
* **Tailwind CSS (CDN)** — Utility-first styling framework
* **Lucide Icons (CDN)** — High-quality SVG icons
* **Google Fonts** — Outfit font family (weights 300-700)

### Storage & Data
* **localStorage** — Client-side browser storage (no backend needed)
* **JSON** — Data serialization format

### Design System
* **Mauve (#9d7586)** — Primary brand color
* **Cream (#fdfbf7)** — Warm background
* **Sage (#8ca38c)** — Accent highlights
* **Yellow** — For rating stars

## External dependencies and resources
* Tailwind CSS via CDN for utility-first styling; ideal for production
* Lucide Icons via CDN for UI elements
* Google Fonts (Outfit) for typography
* MDN Web Docs for localStorage and Web Storage API behavior
* Placeholder images from a placeholder image service; educational links (e.g., Wikipedia) appear in cuisine modals as external references.

## Video Walkthrough
YouTube link: https://www.youtube.com/watch?v=5XqWiSdn9Nw
