// New shareStory.js module
import { foodTruckSchedule } from './calendarData.js';

// Helper: get unique truck names with basic info
function getUniqueTrucks() {
    const seen = new Set();
    const trucks = [];
    Object.values(foodTruckSchedule).forEach(entry => {
        if (!seen.has(entry.truckName)) {
            seen.add(entry.truckName);
            trucks.push({ name: entry.truckName, flag: entry.flag || '' });
        }
    });
    return trucks;
}

// Render truck options
function populateTruckSelect() {
    const select = document.getElementById('truck-select');
    if (!select) return;
    const trucks = getUniqueTrucks();
    trucks.forEach(truck => {
        const opt = document.createElement('option');
        opt.value = truck.name;
        opt.textContent = `${truck.flag ? truck.flag + ' ' : ''}${truck.name}`;
        select.appendChild(opt);
    });
}

// Star rating UI
function setupRatingStars() {
    const container = document.getElementById('rating-stars');
    const hidden = document.getElementById('rating-value');
    if (!container || !hidden) return;
    container.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'text-2xl text-gray-300 hover:text-yellow-400 transition-colors';
        btn.dataset.value = i;
        btn.innerText = '★';
        btn.addEventListener('click', () => {
            hidden.value = String(i);
            updateStars(i);
        });
        btn.addEventListener('mouseenter', () => updateStars(i));
        btn.addEventListener('mouseleave', () => updateStars(Number(hidden.value)));
        container.appendChild(btn);
    }

    function updateStars(active) {
        Array.from(container.children).forEach((c, idx) => {
            if (idx < active) {
                c.classList.remove('text-gray-300');
                c.classList.add('text-yellow-400');
            } else {
                c.classList.remove('text-yellow-400');
                c.classList.add('text-gray-300');
            }
        });
    }

    // initialize
    updateStars(Number(hidden.value));
}

// Photo preview
function setupPhotoInput() {
    const input = document.getElementById('photo-input');
    const preview = document.getElementById('photo-preview');
    if (!input || !preview) return;
    preview.innerHTML = '';

    input.addEventListener('change', () => {
        preview.innerHTML = '';
        const files = Array.from(input.files).slice(0, 6); // limit preview to 6
        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            const wrap = document.createElement('div');
            wrap.className = 'w-24 h-24 mr-2 mb-2 overflow-hidden rounded-md border';
            const img = document.createElement('img');
            img.className = 'w-full h-full object-cover';
            wrap.appendChild(img);
            preview.appendChild(wrap);

            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    });
}

// Helper: get comments for a story id
function getCommentsForStory(storyId) {
    const allComments = JSON.parse(localStorage.getItem('storyComments') || '{}');
    return allComments[storyId] || [];
}

// Helper: add comment for a story id
function addCommentForStory(storyId, commentText) {
    const allComments = JSON.parse(localStorage.getItem('storyComments') || '{}');
    if (!allComments[storyId]) allComments[storyId] = [];
    allComments[storyId].push({ text: commentText, createdAt: new Date().toISOString() });
    localStorage.setItem('storyComments', JSON.stringify(allComments));
}

// Render stories list
function renderStoriesList() {
    const storiesList = document.getElementById('stories-list');
    if (!storiesList) return;
    storiesList.innerHTML = '';
    const stories = JSON.parse(localStorage.getItem('sharedStories') || '[]');
    if (stories.length === 0) {
        storiesList.innerHTML = '<li class="text-gray-500">No stories yet.</li>';
        return;
    }
    stories.forEach(story => {
        const li = document.createElement('li');
        li.className = 'bg-gray-50 rounded-lg p-4 shadow flex flex-col gap-2';

        // Truck name and rating
        const header = document.createElement('div');
        header.className = 'flex items-center gap-2';
        header.innerHTML = `<span class="font-bold">${story.truck}</span> <span class="text-yellow-400">${'★'.repeat(story.rating)}${'☆'.repeat(5-story.rating)}</span>`;

        // Story text
        const text = document.createElement('div');
        text.className = 'text-gray-700';
        text.textContent = story.story;

        // Photos
        const photosDiv = document.createElement('div');
        photosDiv.className = 'flex flex-wrap gap-2';
        if (story.photos && story.photos.length) {
            story.photos.forEach(photo => {
                const img = document.createElement('img');
                img.src = photo.data;
                img.alt = photo.name;
                img.className = 'w-16 h-16 object-cover rounded border';
                photosDiv.appendChild(img);
            });
        }

        // Buttons
        const actions = document.createElement('div');
        actions.className = 'flex gap-3 mt-2';
        const reactBtn = document.createElement('button');
        reactBtn.className = 'px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
        reactBtn.textContent = 'React';
        reactBtn.addEventListener('click', () => {
            reactBtn.textContent = reactBtn.textContent === 'React' ? '👍' : 'React';
        });

        const commentBtn = document.createElement('button');
        commentBtn.className = 'px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200';
        commentBtn.textContent = 'Comment';

        // Comments section
        const commentsSection = document.createElement('div');
        commentsSection.className = 'mt-2 space-y-2';

        // Render existing comments
        function renderComments() {
            commentsSection.innerHTML = '';
            const comments = getCommentsForStory(story.id);
            comments.forEach(c => {
                const commentDiv = document.createElement('div');
                commentDiv.className = 'text-sm text-gray-600 bg-gray-200 rounded px-2 py-1';
                commentDiv.textContent = `💬 ${c.text}`;
                commentsSection.appendChild(commentDiv);
            });
        }
        renderComments();

        // Add comment input UI
        let commentInputVisible = false;
        commentBtn.addEventListener('click', () => {
            if (commentInputVisible) return;
            commentInputVisible = true;
            const inputDiv = document.createElement('div');
            inputDiv.className = 'flex gap-2 mt-2';
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Add a comment...';
            input.className = 'flex-1 px-2 py-1 rounded border border-gray-300';
            const submitBtn = document.createElement('button');
            submitBtn.textContent = 'Post';
            submitBtn.className = 'px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600';

            submitBtn.addEventListener('click', () => {
                const val = input.value.trim();
                if (val) {
                    addCommentForStory(story.id, val);
                    renderComments();
                    input.value = '';
                }
            });

            inputDiv.appendChild(input);
            inputDiv.appendChild(submitBtn);
            commentsSection.appendChild(inputDiv);
        });

        actions.appendChild(reactBtn);
        actions.appendChild(commentBtn);

        // Date
        const dateDiv = document.createElement('div');
        dateDiv.className = 'text-xs text-gray-400 mt-1';
        dateDiv.textContent = new Date(story.createdAt).toLocaleString();

        li.appendChild(header);
        li.appendChild(text);
        if (story.photos && story.photos.length) li.appendChild(photosDiv);
        li.appendChild(actions);
        li.appendChild(commentsSection);
        li.appendChild(dateDiv);

        storiesList.appendChild(li);
    });
}

// Show stories view
function showStoriesView() {
    // Hide all views except stories
    ['home-view', 'calendar-view', 'modal-view', 'share-view', 'stories-view'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const storiesView = document.getElementById('stories-view');
    if (storiesView) storiesView.classList.remove('hidden');
    renderStoriesList();
}

// Form submit
function setupForm() {
    const form = document.getElementById('share-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const truck = document.getElementById('truck-select').value;
        const story = document.getElementById('story-text').value.trim();
        const rating = Number(document.getElementById('rating-value').value || 0);
        const photos = Array.from(document.getElementById('photo-input').files).slice(0,6);

        if (!truck) {
            alert('Please select a truck.');
            return;
        }

        const stored = JSON.parse(localStorage.getItem('sharedStories') || '[]');

        // For storage, convert photos to data URLs (synchronously for small files)
        const readers = photos.map(file => new Promise((res) => {
            const r = new FileReader();
            r.onload = () => res({ name: file.name, data: r.result });
            r.readAsDataURL(file);
        }));

        Promise.all(readers).then(photoData => {
            const entry = {
                id: Date.now(),
                truck,
                story,
                rating,
                photos: photoData,
                createdAt: new Date().toISOString()
            };
            stored.unshift(entry);
            localStorage.setItem('sharedStories', JSON.stringify(stored));
            form.reset();
            document.getElementById('photo-preview').innerHTML = '';
            showStoriesView();
        });
    });
}

// Cancel/back buttons already wired in main.js; ensure they reset the form when shown
function resetForm() {
    const form = document.getElementById('share-form');
    if (!form) return;
    form.reset();
    document.getElementById('rating-value').value = '0';
    document.getElementById('photo-preview').innerHTML = '';
    setupRatingStars();
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    populateTruckSelect();
    setupRatingStars();
    setupPhotoInput();
    setupForm();

    // Reset when share view is shown
    const shareView = document.getElementById('share-view');
    const observer = new MutationObserver(() => {
        if (shareView && !shareView.classList.contains('hidden')) {
            resetForm();
        }
    });
    if (shareView) observer.observe(shareView, { attributes: true, attributeFilter: ['class'] });

    // Stories back button
    const storiesBackBtn = document.getElementById('stories-back-btn');
    if (storiesBackBtn) storiesBackBtn.addEventListener('click', () => {
        // Hide stories, show home
        document.getElementById('stories-view').classList.add('hidden');
        document.getElementById('home-view').classList.remove('hidden');
    });

    // Optionally, expose showStoriesView globally if you want to navigate from elsewhere
    window.showStoriesView = showStoriesView;
});
