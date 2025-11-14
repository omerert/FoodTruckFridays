// Import schedule data from separate module
import { foodTruckSchedule } from './calendarData.js';
import { initJoinGroup } from './joinGroup.js';

// --- app state ---
// this just keeps track of what month we're looking at
let currentDisplayDate = new Date();
// let's set the calendar to october 2025 so it matches the screenshot
currentDisplayDate = new Date(2025, 9, 1);

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
 * hides all views and shows just the one we want
 * @param {string} viewname - 'home' or 'calendar'
 */
function showView(viewName) {
    // first, hide everything
    Object.values(views).forEach(view => {
        if (view) view.classList.add('hidden');
    });
    // then, show the one we asked for (as long as it's not the modal)
    if (views[viewName] && viewName !== 'modal') {
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
    calendarTitle.textContent = monthName.toUpperCase();

    // get all the info we need to build the month grid
    const firstDay = new Date(year, month, 1).getDay(); // 0=sun, 1=mon...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 1. create empty cells for the days before the 1st
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = "calendar-day border-b border-r bg-gray-50";
        calendarGrid.appendChild(emptyCell);
    }

    // 2. create cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = "calendar-day border-b border-r p-2";

        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay(); // 5 = friday

        // add the day number (1, 2, 3...)
        const dayNumber = document.createElement('div');
        dayNumber.className = "text-sm font-semibold text-gray-700";
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);

        const dateString = currentDate.toISOString().split('T')[0];
        const eventData = foodTruckSchedule[dateString];

        if (eventData) {
            // visually mark event days that have scheduled trucks
            dayCell.classList.add('has-event');

            const eventDiv = document.createElement('div');
            eventDiv.className = "mt-1 text-xs";

            const truckName = document.createElement('p');
            truckName.className = "font-bold text-gray-900";
            truckName.textContent = eventData.truckName;

            const flag = document.createElement('button');
            flag.className = "text-lg hover:opacity-75 transition-opacity";
            flag.textContent = eventData.flag;
            flag.addEventListener('click', () => {
                populateAndShowModal(eventData);
            });

            const location = document.createElement('p');
            location.className = "text-gray-600";
            location.textContent = eventData.location || '';

            const time = document.createElement('p');
            time.className = "text-gray-600";
            time.textContent = eventData.time || '';

            eventDiv.appendChild(truckName);
            eventDiv.appendChild(flag);
            if (location.textContent) eventDiv.appendChild(location);
            if (time.textContent) eventDiv.appendChild(time);

            dayCell.appendChild(eventDiv);
        }

        calendarGrid.appendChild(dayCell);
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
    if (modalImg1) modalImg1.onerror = () => { modalImg1.src = 'https://placehold.co/300x200/E2E8F0/4A5568?text=Food+Photo'; };
    if (modalImg2) modalImg2.onerror = () => { modalImg2.src = 'https://placehold.co/300x200/E2E8F0/4A5568?text=Food+Photo'; };

    showModal();
}

/**
 * Build the upcoming list view: shows the next N upcoming event days (based on every-other-day rule)
 * and maps any known trucks from foodTruckSchedule.
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

    scheduledDates.forEach(dateString => {
        const eventData = foodTruckSchedule[dateString];

        const li = document.createElement('li');
        li.className = 'bg-white p-3 rounded-lg shadow-sm';

        const row = document.createElement('div');
        row.className = 'flex justify-between items-start gap-3';

        const left = document.createElement('div');
        const dateLabel = document.createElement('div');
        dateLabel.className = 'text-sm text-gray-500';

        // Calculate days from today
        const eventDate = new Date(dateString);
        const todayStart = new Date();
        //Increment by one say since convertion didnt work out
        eventDate.setDate(eventDate.getDate() + 1);
        todayStart.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((eventDate - todayStart) / (1000 * 60 * 60 * 24));

        // Format the relative date
        let relativeDate;
        if (diffDays === 0) {
            relativeDate = 'Today';
        } else if (diffDays === 1) {
            relativeDate = 'Tomorrow';
        } else {
            relativeDate = `In ${diffDays} days`;
        }

        dateLabel.textContent = `${relativeDate} - ${eventDate.toLocaleDateString()}`;
        const title = document.createElement('div');
        title.className = 'font-semibold text-gray-800';
        title.textContent = eventData.truckName;

        left.appendChild(dateLabel);
        left.appendChild(title);

        const right = document.createElement('div');
        right.className = 'text-right';
        const flagBtn = document.createElement('button');
        flagBtn.className = 'text-xl';
        flagBtn.textContent = eventData.flag;
        right.appendChild(flagBtn);

        row.appendChild(left);
        row.appendChild(right);

        li.appendChild(row);

        // make item clickable to show modal
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => populateAndShowModal(eventData));

        listEl.appendChild(li);
    });
}
// --- initial app setup ---
// this runs once all the html is loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- assign dom elements ---
    // now that the dom is loaded, we can safely grab our elements
    views = {
        home: document.getElementById('home-view'),
        calendar: document.getElementById('calendar-view'),
        modal: document.getElementById('modal-view'),
        share: document.getElementById('share-view'),
        joinGroup: document.getElementById('join-group-view')
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
    // set up all our buttons

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

});