// Join Group Module
// Handles group browsing, creation, and joining functionality

// Import food truck schedule
import { foodTruckSchedule } from './calendarData.js';

// Sample groups with diverse options (seed data)
const sampleGroups = [
    {
        id: 1,
        name: "Lebanese Kitchen Crew",
        description: "Sharing Lebanese cuisine and culture through food truck adventures",
        cuisine: "Middle Eastern",
        type: "culture",
        language: "Arabic",
        members: 7,
        createdBy: "Hana",
        imageEmoji: "🇱🇧"
    },
    {
        id: 2,
        name: "Spanish Speaking Foodies",
        description: "Learning English while exploring food trucks - ¡Todos son bienvenidos!",
        cuisine: "Latin American",
        type: "language",
        language: "Spanish",
        members: 5,
        createdBy: "Carlos",
        imageEmoji: "🇪🇸"
    },
    {
        id: 3,
        name: "Newcomer Friends",
        description: "Immigrants and locals connecting over food, building community together",
        cuisine: "Mixed",
        type: "mixed",
        language: "English",
        members: 12,
        createdBy: "Sarah & Ahmed",
        imageEmoji: "🤝"
    },
    {
        id: 4,
        name: "Asian Fusion Squad",
        description: "Discovering diverse Asian cuisines and making new friends",
        cuisine: "Asian",
        type: "culture",
        language: "Cantonese/English",
        members: 8,
        createdBy: "Wei",
        imageEmoji: "🇨🇳"
    },
    {
        id: 5,
        name: "Integration Through Food",
        description: "Bringing together people of all backgrounds to celebrate food and culture",
        cuisine: "Mixed",
        type: "mixed",
        language: "Multiple",
        members: 15,
        createdBy: "Community Team",
        imageEmoji: "🌍"
    },
    {
        id: 6,
        name: "East African Eats",
        description: "Ethiopian and Somali food lovers sharing their heritage",
        cuisine: "African",
        type: "culture",
        language: "Amharic/English",
        members: 6,
        createdBy: "Abdi",
        imageEmoji: "🇪🇹"
    }
];

// Cuisine mapping to help match food trucks with groups
const cuisineMapping = {
    'Middle Eastern': ['Lebanese', 'Palestinian', 'Turkish', 'Iranian', 'Israeli'],
    'Asian': ['Chinese', 'Taiwanese', 'Vietnamese', 'Thai', 'Indonesian', 'Japanese', 'Korean'],
    'Latin American': ['Venezuelan', 'Mexican', 'Colombian', 'Brazilian', 'Chilean'],
    'African': ['Ethiopian', 'Somali', 'Nigerian', 'Senegalese', 'Moroccan'],
    'European': ['Italian', 'Spanish', 'Greek', 'Polish', 'Ukrainian', 'French', 'German'],
    'North American': ['American', 'Canadian', 'BBQ'],
    'Mixed': []
};

// Get recommended food trucks based on group cuisine
function getRecommendedTrucks(groupCuisine) {
    const recommendedTrucks = [];
    const cuisineKeywords = cuisineMapping[groupCuisine] || [];

    Object.entries(foodTruckSchedule).forEach(([dateString, truckData]) => {
        // Check if this truck's cuisine matches the group's cuisine
        const cuisineName = truckData.cuisineInfo?.name || '';

        // Check if any keyword matches
        const isMatch = cuisineKeywords.some(keyword =>
            cuisineName.toLowerCase().includes(keyword.toLowerCase())
        );

        if (isMatch) {
            // Avoid duplicates by checking truck name
            if (!recommendedTrucks.find(t => t.truckName === truckData.truckName)) {
                recommendedTrucks.push({
                    truckName: truckData.truckName,
                    flag: truckData.flag,
                    cuisine: truckData.cuisineInfo?.name,
                    date: dateString,
                    time: truckData.time,
                    location: truckData.location
                });
            }
        }
    });

    return recommendedTrucks;
}

// Load groups from localStorage or use sample data
function loadGroups() {
    const stored = localStorage.getItem('foodTruckGroups');
    if (stored) {
        return JSON.parse(stored);
    }
    // First time - save sample groups
    localStorage.setItem('foodTruckGroups', JSON.stringify(sampleGroups));
    return sampleGroups;
}

// Save groups to localStorage
function saveGroups(groups) {
    localStorage.setItem('foodTruckGroups', JSON.stringify(groups));
}

// Load user's group memberships
function getUserGroupMemberships() {
    const stored = localStorage.getItem('userGroupMemberships');
    return stored ? JSON.parse(stored) : [];
}

// Add user to a group
function joinGroup(groupId) {
    const memberships = getUserGroupMemberships();
    if (!memberships.includes(groupId)) {
        memberships.push(groupId);
        localStorage.setItem('userGroupMemberships', JSON.stringify(memberships));
        // Also increment group member count
        const groups = loadGroups();
        const group = groups.find(g => g.id === groupId);
        if (group) {
            group.members += 1;
            saveGroups(groups);
        }
    }
}

// Remove user from a group
function leaveGroup(groupId) {
    let memberships = getUserGroupMemberships();
    memberships = memberships.filter(id => id !== groupId);
    localStorage.setItem('userGroupMemberships', JSON.stringify(memberships));
    // Also decrement group member count
    const groups = loadGroups();
    const group = groups.find(g => g.id === groupId);
    if (group && group.members > 0) {
        group.members -= 1;
        saveGroups(groups);
    }
}

// Check if user is in a group
function isUserInGroup(groupId) {
    const memberships = getUserGroupMemberships();
    return memberships.includes(groupId);
}

// Filter groups based on criteria
function filterGroups(cuisine = '', type = '', size = '') {
    let groups = loadGroups();

    if (cuisine) {
        groups = groups.filter(g => g.cuisine === cuisine);
    }

    if (type) {
        groups = groups.filter(g => g.type === type);
    }

    if (size) {
        if (size === 'small') {
            groups = groups.filter(g => g.members >= 2 && g.members <= 5);
        } else if (size === 'medium') {
            groups = groups.filter(g => g.members >= 6 && g.members <= 10);
        } else if (size === 'large') {
            groups = groups.filter(g => g.members >= 11);
        }
    }

    return groups;
}

// Render recommended food trucks with event info
function renderRecommendedTrucks(trucks) {
    if (trucks.length === 0) {
        return '<p class="text-sm text-gray-500 italic">No recommended food trucks at this time.</p>';
    }

    let html = '<div class="mt-3 pt-3 border-t border-gray-200"><p class="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1"><span class="text-base">🍽️</span> Recommended Food Trucks & Events:</p><div class="space-y-2">';

    trucks.slice(0, 3).forEach(truck => {
        html += `
            <div class="text-xs bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-2.5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">${truck.flag}</span>
                    <span class="font-bold text-gray-800">${truck.truckName}</span>
                </div>
                <p class="text-gray-600 font-medium">${truck.cuisine}</p>
                <div class="mt-1 flex items-center gap-1 text-gray-500">
                    <span class="text-xs">📅</span>
                    <p class="text-xs">${truck.date}</p>
                </div>
                <div class="flex items-center gap-1 text-gray-500">
                    <span class="text-xs">🕐</span>
                    <p class="text-xs">${truck.time}</p>
                </div>
                <div class="flex items-center gap-1 text-gray-500">
                    <span class="text-xs">📍</span>
                    <p class="text-xs">${truck.location}</p>
                </div>
            </div>
        `;
    });

    if (trucks.length > 3) {
        html += `<p class="text-xs text-mauve-600 italic font-medium">...and ${trucks.length - 3} more upcoming events!</p>`;
    }

    html += '</div></div>';
    return html;
}

// Render a single group card with enhanced styling
function renderGroupCard(group, showJoinButton = true) {
    const isJoined = isUserInGroup(group.id);
    const recommendedTrucks = getRecommendedTrucks(group.cuisine);

    const card = document.createElement('div');
    card.className = 'bg-gradient-to-br from-white to-cream-50 rounded-2xl shadow-md border border-mauve-100 p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300';

    card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
            <div class="flex items-start gap-3 flex-1">
                <div class="text-4xl animate-bounce-subtle">${group.imageEmoji}</div>
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800 text-lg">${group.name}</h4>
                    <p class="text-xs text-gray-500">Created by ${group.createdBy}</p>
                </div>
            </div>
        </div>
        
        <p class="text-sm text-gray-700 mb-3 leading-relaxed">${group.description}</p>
        
        <div class="flex flex-wrap gap-2 mb-3">
            <span class="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full px-3 py-1.5 font-medium">${group.cuisine}</span>
            <span class="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full px-3 py-1.5 font-medium">${group.type === 'culture' ? '🌍 Cultural' : group.type === 'language' ? '💬 Language' : '🤝 Mixed'}</span>
            ${group.language ? `<span class="text-xs bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full px-3 py-1.5 font-medium">${group.language}</span>` : ''}
        </div>

        ${renderRecommendedTrucks(recommendedTrucks)}
        
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div class="flex items-center gap-2 text-sm text-gray-600">
                <span class="text-lg">👥</span>
                <span><strong class="group-member-count-${group.id} text-mauve-600">${group.members}</strong> members</span>
            </div>
            ${showJoinButton ? `
            <button class="group-join-btn px-5 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 shadow-sm ${isJoined
                ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:shadow-md'
                : 'bg-gradient-to-r from-mauve-500 to-mauve-600 text-white hover:shadow-lg'
            }" data-group-id="${group.id}" data-joined="${isJoined}">
                ${isJoined ? '✓ Joined' : '+ Join Group'}
            </button>` : `
            <span class="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold">✓ Member</span>
            `}
        </div>
    `;

    return card;
}

// Render all groups with current filters
function renderGroupsList() {
    const cuisine = document.getElementById('filter-cuisine')?.value || '';
    const type = document.getElementById('filter-type')?.value || '';
    const size = document.getElementById('filter-size')?.value || '';

    const groups = filterGroups(cuisine, type, size);
    const groupsList = document.getElementById('groups-list');

    if (!groupsList) return;

    groupsList.innerHTML = '';

    if (groups.length === 0) {
        groupsList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">🔍</div>
                <p class="text-gray-600 text-lg font-medium mb-2">No groups match your filters.</p>
                <p class="text-sm text-gray-400">Try adjusting your preferences or create a new group!</p>
            </div>
        `;
        return;
    }

    groups.forEach(group => {
        const card = renderGroupCard(group, true);
        groupsList.appendChild(card);
    });

    // Add event listeners to join buttons
    document.querySelectorAll('.group-join-btn').forEach(btn => {
        btn.addEventListener('click', handleGroupButtonClick);
    });
}

// Render joined groups
function renderJoinedGroupsList() {
    const memberships = getUserGroupMemberships();
    const allGroups = loadGroups();
    const joinedGroups = allGroups.filter(group => memberships.includes(group.id));
    const groupsList = document.getElementById('joined-groups-list');

    if (!groupsList) return;

    groupsList.innerHTML = '';

    if (joinedGroups.length === 0) {
        groupsList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">👋</div>
                <p class="text-gray-600 text-lg font-medium mb-2">You haven't joined any groups yet!</p>
                <p class="text-sm text-gray-400 mb-4">Browse available groups to find your community.</p>
                <button id="go-to-browse" class="px-6 py-2.5 bg-mauve-600 text-white rounded-xl font-medium hover:bg-mauve-700 transition-all shadow-md hover:shadow-lg">
                    Browse Groups
                </button>
            </div>
        `;
        document.getElementById('go-to-browse')?.addEventListener('click', () => {
            switchGroupTab('browse');
        });
        return;
    }

    joinedGroups.forEach(group => {
        const card = renderGroupCard(group, true);
        groupsList.appendChild(card);
    });

    // Add event listeners to join buttons
    document.querySelectorAll('.group-join-btn').forEach(btn => {
        btn.addEventListener('click', handleGroupButtonClick);
    });
}

// Handle join/leave button clicks
function handleGroupButtonClick(e) {
    const btn = e.target;
    const groupId = parseInt(btn.dataset.groupId);
    const isJoined = btn.dataset.joined === 'true';

    if (isJoined) {
        leaveGroup(groupId);
        btn.dataset.joined = 'false';
        btn.textContent = '+ Join Group';
        btn.className = 'group-join-btn px-5 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 shadow-sm bg-gradient-to-r from-mauve-500 to-mauve-600 text-white hover:shadow-lg';
    } else {
        joinGroup(groupId);
        btn.dataset.joined = 'true';
        btn.textContent = '✓ Joined';
        btn.className = 'group-join-btn px-5 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 shadow-sm bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:shadow-md';
    }

    // Update the member count display
    const memberCountElement = document.querySelector(`.group-member-count-${groupId}`);
    if (memberCountElement) {
        const groups = loadGroups();
        const group = groups.find(g => g.id === groupId);
        if (group) {
            memberCountElement.textContent = group.members;
        }
    }

    // Refresh joined groups tab if it's active
    const joinedTab = document.getElementById('show-joined-groups-view');
    if (joinedTab && joinedTab.classList.contains('active')) {
        renderJoinedGroupsList();
    }
}

// Switch between browse, joined, and create views
function switchGroupTab(viewType) {
    const browseSection = document.getElementById('browse-groups-section');
    const joinedSection = document.getElementById('joined-groups-section');
    const createSection = document.getElementById('create-group-section');
    const browseBtn = document.getElementById('show-join-groups-view');
    const joinedBtn = document.getElementById('show-joined-groups-view');
    const createBtn = document.getElementById('show-create-group-view');

    // Hide all sections
    browseSection?.classList.add('hidden');
    joinedSection?.classList.add('hidden');
    createSection?.classList.add('hidden');
    
    // Remove active from all buttons
    browseBtn?.classList.remove('active');
    joinedBtn?.classList.remove('active');
    createBtn?.classList.remove('active');

    // Show selected section
    if (viewType === 'browse') {
        browseSection?.classList.remove('hidden');
        browseBtn?.classList.add('active');
        renderGroupsList();
    } else if (viewType === 'joined') {
        joinedSection?.classList.remove('hidden');
        joinedBtn?.classList.add('active');
        renderJoinedGroupsList();
    } else if (viewType === 'create') {
        createSection?.classList.remove('hidden');
        createBtn?.classList.add('active');
    }
}

// Handle group creation
function handleCreateGroup(e) {
    e.preventDefault();

    const name = document.getElementById('group-name').value.trim();
    const description = document.getElementById('group-description').value.trim();
    const cuisine = document.getElementById('group-cuisine').value;
    const type = document.getElementById('group-type-create').value;
    const language = document.getElementById('group-language').value.trim();

    if (!name || !cuisine || !type) {
        alert('Please fill in all required fields');
        return;
    }

    const groups = loadGroups();
    const newGroup = {
        id: Math.max(...groups.map(g => g.id), 0) + 1,
        name,
        description,
        cuisine,
        type,
        language: language || type === 'language' ? 'TBD' : '',
        members: 1,
        createdBy: 'You',
        imageEmoji: cuisine === 'Middle Eastern' ? '🇱🇧' :
            cuisine === 'Asian' ? '🇨🇳' :
                cuisine === 'Latin American' ? '🇪🇸' :
                    cuisine === 'African' ? '🇪🇹' :
                        cuisine === 'European' ? '🇮🇹' :
                            cuisine === 'North American' ? '🇺🇸' : '🌍'
    };

    groups.unshift(newGroup); // Add to top of list
    saveGroups(groups);

    // Add user to their own group
    joinGroup(newGroup.id);

    // Reset form
    document.getElementById('create-group-form').reset();

    // Show success message
    alert(`Great! Your group "${newGroup.name}" has been created!`);

    // Switch back to browse view to show new group
    switchGroupTab('browse');
    renderGroupsList();
}

// Initialize the Join Group module
export function initJoinGroup() {
    // Set up view switching buttons
    document.getElementById('show-join-groups-view')?.addEventListener('click', () => {
        switchGroupTab('browse');
    });

    document.getElementById('show-joined-groups-view')?.addEventListener('click', () => {
        switchGroupTab('joined');
    });

    document.getElementById('show-create-group-view')?.addEventListener('click', () => {
        switchGroupTab('create');
    });

    // Set up filter listeners
    document.getElementById('filter-cuisine')?.addEventListener('change', renderGroupsList);
    document.getElementById('filter-type')?.addEventListener('change', renderGroupsList);
    document.getElementById('filter-size')?.addEventListener('change', renderGroupsList);

    // Set up create group form
    document.getElementById('create-group-form')?.addEventListener('submit', handleCreateGroup);

    document.getElementById('create-cancel')?.addEventListener('click', () => {
        document.getElementById('create-group-form').reset();
        switchGroupTab('browse');
    });

    // Initial render
    renderGroupsList();
}

// Export functions for use in main.js
export { renderGroupsList, joinGroup, leaveGroup, isUserInGroup, loadGroups };
