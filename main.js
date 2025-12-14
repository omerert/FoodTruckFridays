// Import schedule data from separate module
import { foodTruckSchedule, holidays } from './calendarData.js';
import { initJoinGroup } from './joinGroup.js';
import { initShareStory, showStoriesView } from './shareStory.js';

// --- app state ---
// this just keeps track of what month we're looking at
let currentDisplayDate = new Date();
// determine a base date for the "every other day" schedule
// we pick the earliest date in the foodTruckSchedule keys as the base
const scheduleDates = Object.keys(foodTruckSchedule).slice().sort();
const baseEventDate = scheduleDates.length ? new Date(scheduleDates[0]) : new Date();

// --- dom elements ---
// here we're just grabbing all the html parts we need to work with
// we declare them here, but we'll assign them *after* the dom loads
let views = {};
let calendarGrid;
let calendarTitle;
let modalTitle;
let modalDescription;
let modalLink;
let modalImg1;
let modalImg2;

// --- navigation functions ---

/**
 * Updates the navigation bar to highlight the active tab
 * @param {string} viewName - The name of the current view
 */
function updateNavHighlight(viewName) {
    const navItems = {
        'calendar': 'nav-calendar',
        'share': 'nav-share',   // "Stories" tab highlights for Share view
        'stories': 'nav-share', // "Stories" tab also highlights for Stories Feed view
        'joinGroup': 'nav-groups'
    };

    // Standard styling classes
    const inactiveClasses = ['text-gray-600', 'hover:text-mauve-600', 'bg-transparent'];
    const activeClasses = ['text-mauve-700', 'bg-mauve-100', 'font-bold', 'rounded-xl', 'px-4', 'py-2'];

    // Reset all nav items
    Object.values(navItems).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove(...activeClasses);
            el.classList.add(...inactiveClasses);
            // Reset icon color if needed (handled by CSS group-hover usually, but we can force it)
            const icon = el.querySelector('i');
            if(icon) icon.classList.remove('stroke-mauve-600');
        }
    });

    // Highlight the current one
    const activeId = navItems[viewName];
    if (activeId) {
        const activeEl = document.getElementById(activeId);
        if (activeEl) {
            activeEl.classList.remove(...inactiveClasses);
            activeEl.classList.add(...activeClasses);
             // Force icon color match
             const icon = activeEl.querySelector('i');
             if(icon) icon.classList.add('stroke-mauve-600');
        }
    }
}

/**
 * hides all views and shows just the one we want
 * @param {string} viewname - 'home' or 'calendar'
 */
function showView(viewName) {
    // first, hide everything
    Object.values(views).forEach(view => {
        if (view) view.classList.add('hidden');
    });
    
    // then, show the one we asked for (as long as it's not the modal)
    // Handle 'stories' view special case since it might be triggered externally or added to views
    if (viewName === 'stories') {
        const storiesView = document.getElementById('stories-view');
        if (storiesView) storiesView.classList.remove('hidden');
        showStoriesView(); // direct import
    } else if (views[viewName] && viewName !== 'modal') {
        views[viewName].classList.remove('hidden');

        // If showing calendar view, ensure correct subview is shown
        if (viewName === 'calendar') {
            const calendarContainer = document.getElementById('calendar-container');
            const listContainer = document.getElementById('list-container');
            const showingCalendar = !calendarContainer.classList.contains('hidden');

            document.getElementById('show-calendar-view').classList.toggle('active', showingCalendar);
            document.getElementById('show-list-view').classList.toggle('active', !showingCalendar);
        }
    }

    // Toggle Nav Bar Visibility
    const navBar = document.getElementById('main-nav-links');
    if (navBar) {
        if (viewName === 'home') {
            navBar.style.display = 'none';
        } else {
            navBar.style.display = ''; // Reverts to CSS (flex on desktop, hidden on mobile)
        }
    }

    // Update the Navigation Highlight
    updateNavHighlight(viewName);
}

/**
 * Switch between calendar and list views within the calendar page
 * @param {string} viewType - 'calendar' or 'list'
 */
function switchCalendarView(viewType) {
    const calendarContainer = document.getElementById('calendar-container');
    const calendarHeader = document.getElementById('calendar-header');
    const listContainer = document.getElementById('list-container');
    const calendarBtn = document.getElementById('show-calendar-view');
    const listBtn = document.getElementById('show-list-view');

    if (viewType === 'calendar') {
        calendarContainer.classList.remove('hidden');
        calendarHeader.classList.remove('hidden');
        listContainer.classList.add('hidden');
        calendarBtn.classList.add('active');
        listBtn.classList.remove('active');
    } else {
        calendarContainer.classList.add('hidden');
        calendarHeader.classList.add('hidden');
        listContainer.classList.remove('hidden');
        calendarBtn.classList.remove('active');
        listBtn.classList.add('active');
    }
}
// simple functions to show or hide the modal
function showModal() {
    if (views.modal) views.modal.classList.remove('hidden');
}
function hideModal() {
    if (views.modal) views.modal.classList.add('hidden');
}

// --- calendar logic ---

/**
 * builds and displays the calendar for a given month and year
 * @param {number} year - the full year (e.g., 2025)
 * @param {number} month - the month (0-indexed, 0=jan)
 */
function buildCalendar(year, month) {
    // exit if the calendar grid element isn't ready yet
    if (!calendarGrid) {
        console.error("calendarGrid is not initialized.");
        return;
    }

    // clear out the old calendar days before we build new ones
    calendarGrid.innerHTML = '';

    // set the "october 2025" title
    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    calendarTitle.textContent = monthName; // Font style handles the uppercase if needed

    // get all the info we need to build the month grid
    const firstDay = new Date(year, month, 1).getDay(); // 0=sun, 1=mon...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // identify "today" so we can highlight it
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const currentDay = today.getDate();

    // 1. create empty cells for the days before the 1st
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        // Add 'empty' class to remove borders/bg for cleaner look
        emptyCell.className = "calendar-day empty";
        calendarGrid.appendChild(emptyCell);
    }

    // 2. create cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = "calendar-day p-3 flex flex-col justify-between cursor-pointer"; // Flex layout for content

        // check if this cell is "today"
        if (isCurrentMonth && day === currentDay) {
            dayCell.classList.add('today-highlight');
        }

        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay(); // 5 = friday

        // add the day number (1, 2, 3...)
        const dayNumber = document.createElement('div');
        dayNumber.className = "flex justify-between items-start";
        
        const numberSpan = document.createElement('span');
        numberSpan.textContent = day;
        // Bold font for today, gray for others
        numberSpan.className = (isCurrentMonth && day === currentDay) ? "text-lg font-bold text-mauve-700" : "text-sm font-semibold text-gray-400";
        
        dayNumber.appendChild(numberSpan);

        // If it is today, let's add that label inside the header line
        if (isCurrentMonth && day === currentDay) {
            const todayBadge = document.createElement('span');
            todayBadge.className = "text-[10px] font-bold uppercase bg-mauve-100 text-mauve-700 px-2 py-0.5 rounded-full tracking-wide";
            todayBadge.textContent = "Today";
            dayNumber.appendChild(todayBadge);
        }

        dayCell.appendChild(dayNumber);

        // Use local date handling to prevent timezone shifts
        const yearStr = currentDate.getFullYear();
        const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(currentDate.getDate()).padStart(2, '0');
        const dateString = `${yearStr}-${monthStr}-${dayStr}`;
        
        // UPDATED: Check for Holiday
        if (holidays[dateString]) {
            const holidayDiv = document.createElement('div');
            // Changed text-red-500 to text-mauve-700 (Brand color)
            holidayDiv.className = "text-[10px] font-bold text-mauve-700 mt-1 leading-tight";
            holidayDiv.textContent = holidays[dateString];
            dayCell.appendChild(holidayDiv);
        }

        const eventData = foodTruckSchedule[dateString];

        if (eventData) {
            // visually mark event days that have scheduled trucks
            dayCell.classList.add('has-event');

            const eventDiv = document.createElement('div');
            eventDiv.className = "mt-auto pt-2"; // Push to bottom

            // Tag style for truck name
            const truckTag = document.createElement('div');
            truckTag.className = "bg-white border border-mauve-200 rounded-lg p-2 shadow-sm group-hover:shadow-md transition-shadow";
            
            const nameRow = document.createElement('div');
            nameRow.className = "flex items-start gap-1.5 mb-1"; // changed items-center to items-start for better wrapping
            
            const flagSpan = document.createElement('span');
            flagSpan.textContent = eventData.flag;
            flagSpan.className = "text-lg shrink-0"; // added shrink-0 so flag doesn't squash
            
            const nameSpan = document.createElement('span');
            nameSpan.className = "text-xs font-bold text-gray-800 leading-tight"; // removed truncate
            nameSpan.textContent = eventData.truckName;
            
            nameRow.appendChild(flagSpan);
            nameRow.appendChild(nameSpan);
            truckTag.appendChild(nameRow);

            // Time (Full Range)
            if (eventData.time) {
                const timeSpan = document.createElement('div');
                timeSpan.className = "text-[10px] text-gray-500 pl-0.5 flex items-center gap-1 mb-0.5";
                // Add clock icon, removed split() to show full range
                timeSpan.innerHTML = `<i data-lucide="clock" class="w-3 h-3 inline-block shrink-0"></i> ${eventData.time}`;
                truckTag.appendChild(timeSpan);
            }

            // Location (New Addition)
            if (eventData.location) {
                const locationSpan = document.createElement('div');
                locationSpan.className = "text-[10px] text-gray-500 pl-0.5 flex items-center gap-1";
                // Add map-pin icon
                locationSpan.innerHTML = `<i data-lucide="map-pin" class="w-3 h-3 inline-block shrink-0"></i> ${eventData.location}`;
                truckTag.appendChild(locationSpan);
            }

            eventDiv.appendChild(truckTag);
            dayCell.appendChild(eventDiv);

            // Make whole cell clickable
            dayCell.addEventListener('click', (e) => {
                populateAndShowModal(eventData);
            });
        }

        calendarGrid.appendChild(dayCell);
    }
    
    // Re-initialize icons for newly created elements
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * fills the modal with event data and shows it
 * @param {object} eventdata - the event object from foodtruckschedule
 */
function populateAndShowModal(eventData) {
    const info = eventData.cuisineInfo;
    // check if modal elements are ready before trying to set them
    if (modalTitle) modalTitle.textContent = info.name;
    if (modalDescription) modalDescription.textContent = info.description;
    if (modalLink) modalLink.href = info.link;
    if (modalImg1) modalImg1.src = info.img1;
    if (modalImg2) modalImg2.src = info.img2;

    // just in case the images don't load, show a placeholder
    if (modalImg1) modalImg1.onerror = () => { modalImg1.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'; };
    if (modalImg2) modalImg2.onerror = () => { modalImg2.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'; };

    showModal();
}

/**
 * Build the upcoming list view: shows the next N upcoming event days
 * @param {number} daysAhead - how many days ahead to search (defaults to 30)
 */
function buildUpcomingList(daysAhead = 30) {
    const listEl = document.getElementById('upcoming-list-ul');
    if (!listEl) return;
    listEl.innerHTML = '';

    // Get all scheduled dates from today forward
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduledDates = Object.keys(foodTruckSchedule)
        .filter(dateString => {
            const [year, month, day] = dateString.split('-').map(Number);
            const d = new Date(year, month - 1, day);
            return d >= today; // keep only upcoming
        })
        .sort()
        .slice(0, daysAhead);

    if (scheduledDates.length === 0) {
        listEl.innerHTML = '<li class="p-4 text-center text-gray-500 italic">No events scheduled soon.</li>';
        return;
    }

    scheduledDates.forEach(dateString => {
        const eventData = foodTruckSchedule[dateString];

        const li = document.createElement('li');
        li.className = 'cursor-pointer group';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'p-4 flex items-center justify-between';

        const leftDiv = document.createElement('div');
        leftDiv.className = 'flex items-center gap-4';

        // Date Badge
        const [y, m, d] = dateString.split('-').map(Number);
        const eventDate = new Date(y, m - 1, d);
        const monthShort = eventDate.toLocaleDateString('en-US', { month: 'short' });
        const dayNum = eventDate.getDate();

        const dateBadge = document.createElement('div');
        dateBadge.className = "flex flex-col items-center justify-center w-14 h-14 bg-mauve-50 rounded-xl text-mauve-700 border border-mauve-100 group-hover:bg-mauve-100 transition-colors";
        dateBadge.innerHTML = `<span class="text-xs font-bold uppercase">${monthShort}</span><span class="text-xl font-bold">${dayNum}</span>`;
        
        leftDiv.appendChild(dateBadge);

        const infoDiv = document.createElement('div');
        
        const titleRow = document.createElement('div');
        titleRow.className = "flex items-center gap-2";
        
        const title = document.createElement('h4');
        title.className = 'font-bold text-gray-800 text-lg group-hover:text-mauve-600 transition-colors';
        title.textContent = eventData.truckName;
        titleRow.appendChild(title);
        
        const flag = document.createElement('span');
        flag.className = "text-xl";
        flag.textContent = eventData.flag;
        titleRow.appendChild(flag);
        
        infoDiv.appendChild(titleRow);

        const metaRow = document.createElement('p');
        metaRow.className = "text-sm text-gray-500 mt-0.5 flex items-center gap-3";
        metaRow.innerHTML = `
            <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${eventData.time}</span>
            <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${eventData.location}</span>
        `;
        infoDiv.appendChild(metaRow);

        leftDiv.appendChild(infoDiv);
        
        const rightDiv = document.createElement('div');
        rightDiv.innerHTML = `<i data-lucide="chevron-right" class="w-5 h-5 text-gray-300 group-hover:text-mauve-400 transform group-hover:translate-x-1 transition-all"></i>`;

        contentDiv.appendChild(leftDiv);
        contentDiv.appendChild(rightDiv);
        
        li.appendChild(contentDiv);
        li.addEventListener('click', () => populateAndShowModal(eventData));

        listEl.appendChild(li);
    });
    
    // Initialize icons for the list items
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Initialize rotating text on homepage
function initRotatingText() {
    const headingElement = document.querySelector('#home-view h2');
    const subtitleElement = document.querySelector('#home-view p');
    if (!headingElement || !subtitleElement) return;

    const phrases = [
        {
            heading: 'Discover Flavor & Community',
            subtitle: 'Connect with culture through food. Find your next meal, share your story, and meet new friends in a welcoming community for immigrants and locals alike.'
        },
        {
            heading: 'Where Flavor Meets Community',
            subtitle: 'Connect with others through the foods you love. Discover local trucks, share your story, and make friends in a community that welcomes immigrants and locals alike.'
        },
        {
            heading: 'Food That Brings Us Together',
            subtitle: 'Connect with culture through food. Explore new meals, share your journey, and build friendships in a welcoming space for immigrants and locals.'
        }
    ];

    let currentIndex = 0;

    // Set initial styling
    headingElement.style.transition = 'opacity 1.5s ease-in-out';
    subtitleElement.style.transition = 'opacity 1.5s ease-in-out';
    headingElement.style.opacity = '1';
    subtitleElement.style.opacity = '1';
    headingElement.textContent = phrases[currentIndex].heading;
    subtitleElement.textContent = phrases[currentIndex].subtitle;

    // Rotate text every 15 seconds
    setInterval(() => {
        // Fade out
        headingElement.style.opacity = '0';
        subtitleElement.style.opacity = '0';

        // Change text and fade in during the same fade period
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % phrases.length;
            headingElement.textContent = phrases[currentIndex].heading;
            subtitleElement.textContent = phrases[currentIndex].subtitle;
            // Trigger reflow to ensure transition works
            void headingElement.offsetWidth;
            headingElement.style.opacity = '1';
            subtitleElement.style.opacity = '1';
        }, 1500);
    }, 15000);
}

// --- initial app setup ---
// this runs once all the html is loaded
document.addEventListener('DOMContentLoaded', () => {

    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // --- assign dom elements ---
    // now that the dom is loaded, we can safely grab our elements
    views = {
        home: document.getElementById('home-view'),
        calendar: document.getElementById('calendar-view'),
        modal: document.getElementById('modal-view'),
        share: document.getElementById('share-view'),
        stories: document.getElementById('stories-view'),
        joinGroup: document.getElementById('join-group-view'),
        // UPDATED: Profile View
        profile: document.getElementById('profile-view')
    };
    calendarGrid = document.getElementById('calendar-days-grid');
    calendarTitle = document.getElementById('calendar-month-year');
    modalTitle = document.getElementById('modal-title');
    modalDescription = document.getElementById('modal-description');
    modalLink = document.getElementById('modal-link');
    modalImg1 = document.getElementById('modal-img-1');
    modalImg2 = document.getElementById('modal-img-2');

    // build the calendar for the first time
    // now calendarGrid will be a valid element
    buildCalendar(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth());

    // build the upcoming list for the first time
    buildUpcomingList(30);

    // --- navigation event listeners ---
    
    // Header Navigation Links
    document.getElementById('nav-calendar')?.addEventListener('click', () => showView('calendar'));
    document.getElementById('nav-share')?.addEventListener('click', () => showView('share'));
    document.getElementById('nav-groups')?.addEventListener('click', () => showView('joinGroup'));

    // UPDATED: Profile Navigation
    document.getElementById('nav-profile-btn')?.addEventListener('click', () => {
        loadProfile();
        showView('profile');
    });

    // Profile -> Home
    document.getElementById('profile-back-btn')?.addEventListener('click', () => showView('home'));
    
    // Save Profile
    document.getElementById('save-profile-btn')?.addEventListener('click', saveProfile);

    // home -> calendar
    document.getElementById('view-calendar-btn').addEventListener('click', () => {
        showView('calendar');
    });

    // home -> share
    const viewShareBtn = document.getElementById('view-share-btn');
    if (viewShareBtn) {
        viewShareBtn.addEventListener('click', () => {
            showView('share');
        });
    }

    // home -> join group
    const viewJoinGroupBtn = document.getElementById('view-join-group-btn');
    if (viewJoinGroupBtn) {
        viewJoinGroupBtn.addEventListener('click', () => {
            showView('joinGroup');
        });
    }

    // calendar -> home
    document.getElementById('back-to-home-btn').addEventListener('click', () => {
        showView('home');
    });

    // join group -> home
    const groupBackBtn = document.getElementById('group-back-btn');
    if (groupBackBtn) {
        groupBackBtn.addEventListener('click', () => {
            showView('home');
        });
    }

    // share -> home (back)
    const shareBackBtn = document.getElementById('share-back-btn');
    if (shareBackBtn) shareBackBtn.addEventListener('click', () => showView('home'));

    // share cancel button inside the form
    const shareCancel = document.getElementById('share-cancel');
    if (shareCancel) shareCancel.addEventListener('click', () => showView('home'));

    // modal close button
    document.getElementById('modal-close-btn').addEventListener('click', hideModal);

    // let's also close the modal if you click the dark background
    if (views.modal) {
        views.modal.addEventListener('click', (e) => {
            if (e.target === views.modal) {
                hideModal();
            }
        });
    }

    // calendar month navigation
    document.getElementById('prev-month-btn').addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        buildCalendar(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth());
    });

    document.getElementById('next-month-btn').addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        buildCalendar(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth());
    });

    // calendar/list view switching
    document.getElementById('show-calendar-view').addEventListener('click', () => {
        switchCalendarView('calendar');
    });

    document.getElementById('show-list-view').addEventListener('click', () => {
        switchCalendarView('list');

        document.getElementById("calendar-month-year").classList.remove("active");
    });

    // Initialize the Join Group module
    initJoinGroup();

    // Initialize the Share Story module
    initShareStory();
    
    // Initialize rotating text on homepage
    initRotatingText();
    
    // Check initial state (default is home)
    showView('home');

    // --- UPDATED: Profile Logic ---
    function loadProfile() {
        // 1. Load Personal Details
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        document.getElementById('profile-name').value = profile.name || '';
        document.getElementById('profile-location').value = profile.location || '';
        document.getElementById('profile-bio').value = profile.bio || '';
        document.getElementById('profile-cuisine').value = profile.cuisine || '';

        // Update Badge Preview
        document.getElementById('display-card-name').textContent = profile.name || 'Guest';

        // 2. Load Stats (Cross-reference other modules' storage)
        const memberships = JSON.parse(localStorage.getItem('userGroupMemberships') || '[]');
        const stories = JSON.parse(localStorage.getItem('sharedStories') || '[]');
        
        document.getElementById('stats-groups').textContent = memberships.length;
        document.getElementById('stats-stories').textContent = stories.length;
    }

    function saveProfile() {
        const profile = {
            name: document.getElementById('profile-name').value.trim(),
            location: document.getElementById('profile-location').value.trim(),
            bio: document.getElementById('profile-bio').value.trim(),
            cuisine: document.getElementById('profile-cuisine').value
        };

        localStorage.setItem('userProfile', JSON.stringify(profile));
        
        // Visual feedback
        const btn = document.getElementById('save-profile-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Saved!';
        btn.classList.add('bg-green-600');
        
        // Update Badge immediately
        document.getElementById('display-card-name').textContent = profile.name || 'Guest';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('bg-green-600');
        }, 2000);
    }
});
