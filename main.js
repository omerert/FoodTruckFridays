// --- our fake data ---
// this is all the info for our food trucks
// we'll eventually load this from a database, but for now, it lives here
// we added the 'cuisineinfo' for the popup modal
const foodTruckSchedule = {
    "2025-10-03": {
        truckName: "Teo Taco",
        location: "123 Dallas St",
        time: "5 PM - 9 PM",
        flag: "🇲🇽",
        cuisineInfo: {
            name: "Mexican Cuisine",
            description: "Rooted in Mayan and Aztec traditions, Mexican cuisine is a vibrant blend of indigenous and Spanish flavors. It's famous for its complex sauces (moles), fresh ingredients like corn, beans, and chili peppers, and its communal approach to eating.",
            link: "https://en.wikipedia.org/wiki/Mexican_cuisine",
            img1: "https://placehold.co/300x200/006847/FFFFFF?text=Tacos",
            img2: "https://placehold.co/300x200/CE1126/FFFFFF?text=Enchiladas"
        }
    },
    "2025-10-10": {
        truckName: "Pizza & Pasta",
        location: "321 Sunny St",
        time: "11 AM - 2 PM",
        flag: "🇮🇹",
        cuisineInfo: {
            name: "Italian Cuisine",
            description: "Italian food is characterized by its simplicity, with many dishes having only a few high-quality ingredients. It's a celebration of regional diversity, from the rich pastas of the north to the sun-baked pizzas and seafood of the south.",
            link: "https://en.wikipedia.org/wiki/Italian_cuisine",
            img1: "https://placehold.co/300x200/008C45/FFFFFF?text=Pasta",
            img2: "https://placehold.co/300x200/CD212A/FFFFFF?text=Pizza"
        }
    },
    "2025-10-17": {
        truckName: "Panda Potstickers",
        location: "457 Shady Rd",
        time: "5 PM - 9 PM",
        flag: "🇨🇳",
        cuisineInfo: {
            name: "Chinese Cuisine",
            description: "With thousands of years of history, Chinese cuisine is incredibly diverse. It balances the five key flavors: sweet, sour, salty, bitter, and spicy. Dumplings, like potstickers, are a beloved part of celebrations, symbolizing wealth and togetherness.",
            link: "https://en.wikipedia.org/wiki/Chinese_cuisine",
            img1: "https://placehold.co/300x200/EE1C25/FFFFFF?text=Dumplings",
            img2: "https://placehold.co/300x200/FFFF00/000000?text=Noodles"
        }
    },
    "2025-10-24": {
        truckName: "Halal Heaven",
        location: "842 Trinity Rd",
        time: "5 PM - 9 PM",
        flag: "🇵🇰",
        cuisineInfo: {
            name: "Pakistani Cuisine",
            description: "Pakistani food is rich with aromatic spices and herbs. It features a blend of influences from South Asia and the Middle East. Signature dishes often include slow-cooked meats, flavorful curries, and fragrant biryanis, all prepared according to Halal traditions.",
            link: "https://en.wikipedia.org/wiki/Pakistani_cuisine",
            img1: "https://placehold.co/300x200/006600/FFFFFF?text=Biryani",
            img2: "https://placehold.co/300x200/FFFFFF/000000?text=Kebab"
        }
    },
    "2025-10-31": {
        truckName: "Kim's Kimchi",
        location: "987 Smith Dr",
        time: "11 AM - 2 PM",
        flag: "🇰🇷",
        cuisineInfo: {
            name: "Korean Cuisine",
            description: "Korean cuisine is known for its bold, spicy, and savory flavors. Fermented foods like kimchi are a staple at every meal. Barbecue (gogi-gui) and shared side dishes (banchan) highlight the communal and interactive nature of Korean dining.",
            link: "https://en.wikipedia.org/wiki/Korean_cuisine",
            img1: "https://placehold.co/300x200/CD2E3A/FFFFFF?text=Kimchi",
            img2: "https://placehold.co/300x200/0047A0/FFFFFF?text=Bibimbap"
        }
    },
    "2025-11-07": {
        truckName: "La Vita è Bella",
        location: "Tech Park Courtyard",
        time: "11:30 AM - 2:30 PM",
        flag: "🇮🇹",
        cuisineInfo: {
            name: "Italian Cuisine",
            description: "Italian food is characterized by its simplicity, with many dishes having only a few high-quality ingredients. It's a celebration of regional diversity, from the rich pastas of the north to the sun-baked pizzas and seafood of the south.",
            link: "https://en.wikipedia.org/wiki/Italian_cuisine",
            img1: "https://placehold.co/300x200/008C45/FFFFFF?text=Pasta",
            img2: "https://placehold.co/300x200/CD212A/FFFFFF?text=Pizza"
        }
    },
    "2025-11-14": {
        truckName: "Tokyo Drift Tastes",
        location: "Main Plaza (East Side)",
        time: "11:00 AM - 2:00 PM",
        flag: "🇯🇵",
        cuisineInfo: {
            name: "Japanese Cuisine",
            description: "Japanese cuisine is based on 'washoku', or harmony in food. It emphasizes seasonality, quality of ingredients, and presentation. From delicate sushi to savory ramen, it respects the natural flavors of each component.",
            link: "https://en.wikipedia.org/wiki/Japanese_cuisine",
            img1: "https://placehold.co/300x200/BC002D/FFFFFF?text=Sushi",
            img2: "https://placehold.co/300x200/FFFFFF/000000?text=Ramen"
        }
    }
};

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
            location.textContent = eventData ? eventData.location : '';

            const time = document.createElement('p');
            time.className = "text-gray-600";
            time.textContent = eventData ? eventData.time : '';

            eventDiv.appendChild(truckName);
            eventDiv.appendChild(flag);
            eventDiv.appendChild(location);
            eventDiv.appendChild(time);

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
    const scheduledDates = Object.keys(foodTruckSchedule)
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
        dateLabel.textContent = new Date(dateString).toLocaleDateString();

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
        modal: document.getElementById('modal-view')
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

    // calendar -> home
    document.getElementById('back-to-home-btn').addEventListener('click', () => {
        showView('home');
    });

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

});