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
    allComments[storyId].push({ text: commentText, createdAt: new Date().toISOString(), replies: [] });
    localStorage.setItem('storyComments', JSON.stringify(allComments));
}

// Helper: delete comment for a story id
function deleteCommentForStory(storyId, commentIndex) {
    const allComments = JSON.parse(localStorage.getItem('storyComments') || '{}');
    if (allComments[storyId]) {
        allComments[storyId].splice(commentIndex, 1);
        localStorage.setItem('storyComments', JSON.stringify(allComments));
    }
}

// Helper: add reply to a comment
function addReplyToComment(storyId, commentIndex, replyText) {
    const allComments = JSON.parse(localStorage.getItem('storyComments') || '{}');
    if (allComments[storyId] && allComments[storyId][commentIndex]) {
        if (!allComments[storyId][commentIndex].replies) {
            allComments[storyId][commentIndex].replies = [];
        }
        allComments[storyId][commentIndex].replies.push({ text: replyText, createdAt: new Date().toISOString() });
        localStorage.setItem('storyComments', JSON.stringify(allComments));
    }
}

// Helper: get reactions for reviews
function getReactionsForStory(storyId) {
    const allReactions = JSON.parse(localStorage.getItem('storyReactions') || '{}');
    return allReactions[storyId] || [];
}

// Helper: add reaction for reviews
function addReactionForStory(storyId, emoji) {
    const allReactions = JSON.parse(localStorage.getItem('storyReactions') || '{}');
    if (!allReactions[storyId]) allReactions[storyId] = [];
    allReactions[storyId].push({ emoji, createdAt: new Date().toISOString() });
    localStorage.setItem('storyReactions', JSON.stringify(allReactions));
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
        li.className = 'bg-white rounded-2xl shadow-sm border border-mauve-100 hover:shadow-lg hover:border-mauve-200 transition-all duration-300 p-6 flex flex-col gap-4';

        // Header with truck name and rating
        const header = document.createElement('div');
        header.className = 'flex items-start justify-between gap-4';
        
        const truckInfo = document.createElement('div');
        truckInfo.className = 'flex-1';
        
        const truckName = document.createElement('h4');
        truckName.className = 'text-lg font-bold text-gray-800 mb-2';
        truckName.textContent = story.truck;
        
        const ratingSpan = document.createElement('div');
        ratingSpan.className = 'flex items-center gap-1';
        ratingSpan.innerHTML = `<span class="text-yellow-400 text-lg">${'★'.repeat(story.rating)}${'☆'.repeat(5-story.rating)}</span> <span class="text-sm text-gray-500 font-medium">${story.rating}/5</span>`;
        
        truckInfo.appendChild(truckName);
        truckInfo.appendChild(ratingSpan);
        header.appendChild(truckInfo);
        
        // Date badge
        const dateDiv = document.createElement('div');
        dateDiv.className = 'text-xs text-gray-400 whitespace-nowrap';
        dateDiv.textContent = new Date(story.createdAt).toLocaleDateString();
        header.appendChild(dateDiv);

        // Story text
        const text = document.createElement('p');
        text.className = 'text-gray-700 leading-relaxed';
        text.textContent = story.story;

        // Photos with lightbox
        const photosDiv = document.createElement('div');
        photosDiv.className = 'flex flex-wrap gap-3';
        
        // Create lightbox modal
        const photoLightbox = document.createElement('div');
        photoLightbox.className = 'hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer';
        
        const lightboxImg = document.createElement('img');
        lightboxImg.className = 'max-w-2xl max-h-[80vh] object-contain rounded-xl shadow-2xl cursor-default';
        lightboxImg.addEventListener('click', (e) => e.stopPropagation());
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors';
        closeBtn.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
        closeBtn.addEventListener('click', () => photoLightbox.classList.add('hidden'));
        
        photoLightbox.appendChild(closeBtn);
        photoLightbox.appendChild(lightboxImg);
        document.body.appendChild(photoLightbox);
        
        photoLightbox.addEventListener('click', () => photoLightbox.classList.add('hidden'));
        
        if (story.photos && story.photos.length) {
            story.photos.forEach(photo => {
                const imgWrap = document.createElement('div');
                imgWrap.className = 'relative group cursor-pointer';
                const img = document.createElement('img');
                img.src = photo.data;
                img.alt = photo.name;
                img.className = 'w-20 h-20 object-cover rounded-xl shadow-sm border border-mauve-100 group-hover:shadow-lg group-hover:scale-110 transition-all duration-200';
                
                img.addEventListener('click', () => {
                    lightboxImg.src = photo.data;
                    photoLightbox.classList.remove('hidden');
                    if (window.lucide) window.lucide.createIcons();
                });
                
                imgWrap.appendChild(img);
                photosDiv.appendChild(imgWrap);
            });
        }

        // Helper: get reactions for a story id
        function getReactionsForStory(storyId) {
            const allReactions = JSON.parse(localStorage.getItem('storyReactions') || '{}');
            return allReactions[storyId] || [];
        }

        // Helper: add reaction for a story id
        function addReactionForStory(storyId, emoji) {
            const allReactions = JSON.parse(localStorage.getItem('storyReactions') || '{}');
            if (!allReactions[storyId]) allReactions[storyId] = [];
            allReactions[storyId].push({ emoji, createdAt: new Date().toISOString() });
            localStorage.setItem('storyReactions', JSON.stringify(allReactions));
            updateReactionDisplay();
        }

        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'flex gap-3 pt-3 border-t border-gray-100 relative';
        
        // Reaction emoji options
        const reactionEmojis = ['👍', '❤️', '😂', '🤩', '🔥', '😋', '😍', '🎉', '👏', '🙌', '😲', '🤔', '😒', '🤢', '😤', '🤡', '💀'];

        // Reaction display (summary of reactions)
        const reactionsDisplay = document.createElement('div');
        reactionsDisplay.className = 'flex flex-wrap gap-2 mb-3';
        
        function updateReactionDisplay() {
            reactionsDisplay.innerHTML = '';
            const reactions = getReactionsForStory(story.id);
            const reactionCounts = {};
            reactions.forEach(r => {
                reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
            });

            Object.entries(reactionCounts).forEach(([emoji, count]) => {
                const badge = document.createElement('div');
                badge.className = 'inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-mauve-50 to-purple-50 border border-mauve-200 rounded-full text-sm font-medium text-gray-700 hover:from-mauve-100 hover:to-purple-100 transition-all';
                badge.innerHTML = `<span>${emoji}</span><span class="text-xs text-gray-500">${count}</span>`;
                reactionsDisplay.appendChild(badge);
            });
        }
        updateReactionDisplay();

        const reactBtn = document.createElement('button');
        reactBtn.className = 'px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-mauve-50 to-purple-50 text-mauve-700 hover:from-mauve-100 hover:to-purple-100 border border-mauve-200 hover:border-mauve-300 relative';
        reactBtn.textContent = '👍 React';
        
        // Reaction picker popup
        const reactionPicker = document.createElement('div');
        reactionPicker.className = 'hidden absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-lg border border-mauve-200 p-3 flex gap-2 z-50 animate-fadeIn';
        reactionEmojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.type = 'button';
            emojiBtn.textContent = emoji;
            emojiBtn.className = 'text-2xl p-2 rounded-lg hover:bg-mauve-50 transition-colors transform hover:scale-125';
            emojiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addReactionForStory(story.id, emoji);
                reactionPicker.classList.add('hidden');
            });
            reactionPicker.appendChild(emojiBtn);
        });
        
        reactBtn.addEventListener('click', () => {
            reactionPicker.classList.toggle('hidden');
        });
        
        actions.appendChild(reactBtn);
        actions.appendChild(reactionPicker);

        const commentBtn = document.createElement('button');
        commentBtn.className = 'px-4 py-2 rounded-lg text-sm font-medium transition-all text-gray-600 hover:text-mauve-600 hover:bg-gray-50';
        commentBtn.textContent = '💬 Comment';

        // Comments section
        const commentsSection = document.createElement('div');
        commentsSection.className = 'mt-4 pt-4 border-t border-gray-100 space-y-3';

        // Render existing comments
        function renderComments() {
            // Clear but preserve the add comment button area
            const existingComments = commentsSection.querySelectorAll('[data-comment]');
            existingComments.forEach(c => c.remove());

            const comments = getCommentsForStory(story.id);
            if (comments.length === 0) return;

            const commentsHeader = document.createElement('h5');
            commentsHeader.className = 'text-xs font-bold uppercase text-gray-400 tracking-wider';
            commentsHeader.textContent = `💬 ${comments.length} Comment${comments.length !== 1 ? 's' : ''}`;
            commentsSection.insertBefore(commentsHeader, commentsSection.firstChild);

            comments.forEach((c, idx) => {
                const commentDiv = document.createElement('div');
                commentDiv.setAttribute('data-comment', 'true');
                commentDiv.className = 'flex gap-3 animate-fadeIn';
                
                const avatar = document.createElement('div');
                avatar.className = 'flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-mauve-200 to-purple-200 flex items-center justify-center text-sm font-bold text-mauve-700';
                avatar.textContent = '👤';
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'flex-1 min-w-0';
                
                const textDiv = document.createElement('p');
                textDiv.className = 'text-sm text-gray-700 bg-cream-50 rounded-xl px-4 py-2 border border-gray-100';
                textDiv.textContent = c.text;
                
                const metaDiv = document.createElement('p');
                metaDiv.className = 'text-xs text-gray-400 mt-1 px-1 ml-1';
                metaDiv.textContent = new Date(c.createdAt).toLocaleDateString();
                
                contentDiv.appendChild(textDiv);
                contentDiv.appendChild(metaDiv);
                
                commentDiv.appendChild(avatar);
                commentDiv.appendChild(contentDiv);
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
            inputDiv.className = 'flex gap-2 mt-3 pt-3 border-t border-gray-100';
            
            const avatar = document.createElement('div');
            avatar.className = 'flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-mauve-300 to-purple-300 flex items-center justify-center text-sm font-bold text-white';
            avatar.textContent = '👤';
            
            const formDiv = document.createElement('div');
            formDiv.className = 'flex-1 flex gap-2';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Share your thoughts...';
            input.className = 'flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-cream-50 text-sm focus:border-mauve-400 focus:ring-1 focus:ring-mauve-200 focus:outline-none transition-colors';
            
            const submitBtn = document.createElement('button');
            submitBtn.type = 'button';
            submitBtn.textContent = 'Post';
            submitBtn.className = 'px-4 py-2 rounded-lg bg-mauve-600 text-white text-sm font-medium hover:bg-mauve-700 transition-colors shadow-sm hover:shadow-md';

            submitBtn.addEventListener('click', () => {
                const val = input.value.trim();
                if (val) {
                    addCommentForStory(story.id, val);
                    renderComments();
                    input.value = '';
                    commentInputVisible = false;
                    inputDiv.remove();
                }
            });

            formDiv.appendChild(input);
            formDiv.appendChild(submitBtn);
            
            inputDiv.appendChild(avatar);
            inputDiv.appendChild(formDiv);
            commentsSection.appendChild(inputDiv);
            input.focus();
        });

        actions.appendChild(reactBtn);
        actions.appendChild(commentBtn);

        li.appendChild(header);
        li.appendChild(text);
        if (story.photos && story.photos.length) li.appendChild(photosDiv);
        li.appendChild(reactionsDisplay);
        li.appendChild(actions);
        li.appendChild(commentsSection);

        storiesList.appendChild(li);
    });
}

// Show stories view
export function showStoriesView() {
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

// Render user's own stories in the "My Stories" tab
function renderUserStories() {
    const userStoriesList = document.getElementById('user-stories-list');
    if (!userStoriesList) return;
    
    const stories = JSON.parse(localStorage.getItem('sharedStories') || '[]');
    userStoriesList.innerHTML = '';
    
    if (stories.length === 0) {
        userStoriesList.innerHTML = '<li class="text-center text-gray-500 py-8">No stories yet. Write one to get started!</li>';
        return;
    }
    
    stories.forEach(story => {
        const li = document.createElement('li');
        li.className = 'bg-white rounded-2xl shadow-sm border border-mauve-100 hover:shadow-lg hover:border-mauve-200 transition-all duration-300 p-6 flex flex-col gap-4';
        
        // Header
        const header = document.createElement('div');
        header.className = 'flex items-start justify-between gap-4 mb-3';
        
        const truckInfo = document.createElement('div');
        truckInfo.className = 'flex-1';
        
        const truckName = document.createElement('h4');
        truckName.className = 'text-lg font-bold text-gray-800 mb-1';
        truckName.textContent = story.truck;
        
        truckInfo.appendChild(truckName);
        header.appendChild(truckInfo);
        
        // Three-dot menu
        const menuContainer = document.createElement('div');
        menuContainer.className = 'relative';
        
        const menuBtn = document.createElement('button');
        menuBtn.type = 'button';
        menuBtn.className = 'p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600';
        menuBtn.innerHTML = '<i data-lucide="more-vertical" class="w-5 h-5"></i>';
        
        const dropdown = document.createElement('div');
        dropdown.className = 'hidden absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[150px]';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg flex items-center gap-2';
        editBtn.innerHTML = '<i data-lucide="edit" class="w-4 h-4"></i> Edit';
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg flex items-center gap-2';
        deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i> Delete';
        
        deleteBtn.addEventListener('click', () => {
            if (confirm('Delete this story?')) {
                const updatedStories = stories.filter(s => s.id !== story.id);
                localStorage.setItem('sharedStories', JSON.stringify(updatedStories));
                renderUserStories();
            }
        });
        
        dropdown.appendChild(editBtn);
        dropdown.appendChild(deleteBtn);
        
        menuBtn.addEventListener('click', () => {
            dropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuContainer.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        
        menuContainer.appendChild(menuBtn);
        menuContainer.appendChild(dropdown);
        header.appendChild(menuContainer);
        
        li.appendChild(header);
        
        // Date and edit info
        const dateInfo = document.createElement('div');
        dateInfo.className = 'text-xs text-gray-400 mb-3 flex items-center gap-2';
        
        const postedSpan = document.createElement('span');
        const postedDate = new Date(story.createdAt);
        postedSpan.textContent = `Posted ${postedDate.toLocaleDateString()} at ${postedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        dateInfo.appendChild(postedSpan);
        
        if (story.editedAt) {
            const separator = document.createElement('span');
            separator.textContent = '•';
            dateInfo.appendChild(separator);
            
            const editedSpan = document.createElement('span');
            const editedDate = new Date(story.editedAt);
            editedSpan.textContent = `Edited ${editedDate.toLocaleDateString()} at ${editedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            dateInfo.appendChild(editedSpan);
        }
        
        li.appendChild(dateInfo);
        
        // Story text (editable mode)
        const textContainer = document.createElement('div');
        textContainer.className = 'mb-3';
        
        const text = document.createElement('p');
        text.className = 'text-gray-700 text-sm leading-relaxed';
        text.textContent = story.story;
        
        const textInput = document.createElement('textarea');
        textInput.className = 'hidden w-full px-3 py-2 rounded-lg border border-gray-200 bg-cream-50 text-sm focus:border-mauve-400 focus:ring-1 focus:ring-mauve-200 focus:outline-none transition-colors font-sans';
        textInput.value = story.story;
        textInput.rows = 3;
        
        textContainer.appendChild(text);
        textContainer.appendChild(textInput);
        li.appendChild(textContainer);
        
        // Rating (editable mode)
        const ratingContainer = document.createElement('div');
        ratingContainer.className = 'mb-3';
        
        const ratingDisplay = document.createElement('div');
        ratingDisplay.className = 'flex items-center gap-1';
        ratingDisplay.innerHTML = `<span class="text-yellow-400">${'★'.repeat(story.rating)}${'☆'.repeat(5-story.rating)}</span> <span class="text-sm text-gray-500">${story.rating}/5</span>`;
        
        const ratingEdit = document.createElement('div');
        ratingEdit.className = 'hidden flex gap-1';
        const editRatingInput = document.createElement('input');
        editRatingInput.type = 'hidden';
        editRatingInput.value = story.rating;
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('button');
            star.type = 'button';
            star.className = `text-2xl ${i <= story.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`;
            star.textContent = '★';
            star.addEventListener('click', () => {
                editRatingInput.value = i;
                Array.from(ratingEdit.querySelectorAll('button')).forEach((s, idx) => {
                    if (idx < i) {
                        s.classList.remove('text-gray-300');
                        s.classList.add('text-yellow-400');
                    } else {
                        s.classList.remove('text-yellow-400');
                        s.classList.add('text-gray-300');
                    }
                });
            });
            ratingEdit.appendChild(star);
        }
        ratingEdit.appendChild(editRatingInput);
        
        ratingContainer.appendChild(ratingDisplay);
        ratingContainer.appendChild(ratingEdit);
        li.appendChild(ratingContainer);
        
        // Photo edit container (hidden by default)
        const photoEditContainer = document.createElement('div');
        photoEditContainer.className = 'hidden mb-3';
        
        const photoEditLabel = document.createElement('label');
        photoEditLabel.className = 'block text-sm font-semibold text-gray-700 mb-2';
        photoEditLabel.textContent = 'Update Photos';
        photoEditContainer.appendChild(photoEditLabel);
        
        const photoEditInput = document.createElement('input');
        photoEditInput.type = 'file';
        photoEditInput.multiple = true;
        photoEditInput.accept = 'image/*';
        photoEditInput.className = 'w-full px-3 py-2 rounded-lg border border-gray-200 bg-cream-50 text-sm';
        photoEditContainer.appendChild(photoEditInput);
        
        const photoEditPreview = document.createElement('div');
        photoEditPreview.className = 'flex flex-wrap gap-2 mt-2';
        photoEditContainer.appendChild(photoEditPreview);
        
        // Handle file preview for edit mode
        photoEditInput.addEventListener('change', () => {
            photoEditPreview.innerHTML = '';
            const files = Array.from(photoEditInput.files).slice(0, 6);
            files.forEach(file => {
                if (!file.type.startsWith('image/')) return;
                const reader = new FileReader();
                const wrap = document.createElement('div');
                wrap.className = 'w-16 h-16 overflow-hidden rounded-lg border border-mauve-200';
                const img = document.createElement('img');
                img.className = 'w-full h-full object-cover';
                wrap.appendChild(img);
                photoEditPreview.appendChild(wrap);

                reader.onload = (e) => {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        });
        
        li.appendChild(photoEditContainer);
        
        // Edit mode toggle
        let isEditing = false;
        
        editBtn.addEventListener('click', () => {
            isEditing = !isEditing;
            
            if (isEditing) {
                text.classList.add('hidden');
                textInput.classList.remove('hidden');
                ratingDisplay.classList.add('hidden');
                ratingEdit.classList.remove('hidden');
                photoEditContainer.classList.remove('hidden');
                
                // Show save and cancel buttons
                actionsDiv.classList.add('hidden');
                editActionsDiv.classList.remove('hidden');
                
                editBtn.innerHTML = '';
                menuBtn.disabled = true;
                dropdown.classList.add('hidden');
                
                textInput.focus();
            }
        });
        
        // Edit actions (Save/Cancel)
        const editActionsDiv = document.createElement('div');
        editActionsDiv.className = 'hidden flex gap-2 pt-3';
        
        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'px-4 py-2 rounded-lg bg-mauve-600 text-white text-sm font-medium hover:bg-mauve-700 transition-colors';
        saveBtn.textContent = 'Save';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors';
        cancelBtn.textContent = 'Cancel';
        
        saveBtn.addEventListener('click', () => {
            story.story = textInput.value.trim();
            story.rating = parseInt(editRatingInput.value);
            story.editedAt = new Date().toISOString();
            
            // Handle new photos
            const newFiles = Array.from(photoEditInput.files);
            if (newFiles.length > 0) {
                const readers = newFiles.map(file => new Promise((res) => {
                    const r = new FileReader();
                    r.onload = () => res({ name: file.name, data: r.result });
                    r.readAsDataURL(file);
                }));

                Promise.all(readers).then(photoData => {
                    story.photos = photoData;
                    
                    const updatedStories = stories.map(s => s.id === story.id ? story : s);
                    localStorage.setItem('sharedStories', JSON.stringify(updatedStories));
                    
                    finalizeSave();
                });
            } else {
                const updatedStories = stories.map(s => s.id === story.id ? story : s);
                localStorage.setItem('sharedStories', JSON.stringify(updatedStories));
                finalizeSave();
            }
            
            function finalizeSave() {
                isEditing = false;
                text.textContent = story.story;
                text.classList.remove('hidden');
                textInput.classList.add('hidden');
                ratingDisplay.innerHTML = `<span class="text-yellow-400">${'★'.repeat(story.rating)}${'☆'.repeat(5-story.rating)}</span> <span class="text-sm text-gray-500">${story.rating}/5</span>`;
                ratingDisplay.classList.remove('hidden');
                ratingEdit.classList.add('hidden');
                photoEditContainer.classList.add('hidden');
                
                actionsDiv.classList.remove('hidden');
                editActionsDiv.classList.add('hidden');
                menuBtn.disabled = false;
                
                // Update date info
                const editedDate = new Date(story.editedAt);
                dateInfo.innerHTML = `<span>Posted ${new Date(story.createdAt).toLocaleDateString()} at ${new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                       <span>Edited ${editedDate.toLocaleDateString()} at ${editedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
                
                renderUserStories();
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            isEditing = false;
            text.classList.remove('hidden');
            textInput.classList.add('hidden');
            ratingDisplay.classList.remove('hidden');
            ratingEdit.classList.add('hidden');
            photoEditContainer.classList.add('hidden');
            photoEditInput.value = '';
            photoEditPreview.innerHTML = '';
            
            actionsDiv.classList.remove('hidden');
            editActionsDiv.classList.add('hidden');
            menuBtn.disabled = false;
        });
        
        editActionsDiv.appendChild(saveBtn);
        editActionsDiv.appendChild(cancelBtn);
        
        // Photos preview with lightbox
        if (story.photos && story.photos.length) {
            const photosDiv = document.createElement('div');
            photosDiv.className = 'flex flex-wrap gap-2 mb-3';
            
            // Create lightbox modal for this story's photos
            const photoLightbox = document.createElement('div');
            photoLightbox.className = 'hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer';
            
            const lightboxImg = document.createElement('img');
            lightboxImg.className = 'max-w-2xl max-h-[80vh] object-contain rounded-xl shadow-2xl cursor-default';
            lightboxImg.addEventListener('click', (e) => e.stopPropagation());
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors';
            closeBtn.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
            closeBtn.addEventListener('click', () => photoLightbox.classList.add('hidden'));
            
            photoLightbox.appendChild(closeBtn);
            photoLightbox.appendChild(lightboxImg);
            document.body.appendChild(photoLightbox);
            
            photoLightbox.addEventListener('click', () => photoLightbox.classList.add('hidden'));
            
            story.photos.forEach(photo => {
                const img = document.createElement('img');
                img.src = photo.data;
                img.alt = photo.name;
                img.className = 'w-16 h-16 object-cover rounded-lg border border-mauve-200 cursor-pointer hover:scale-110 transition-transform';
                
                img.addEventListener('click', () => {
                    lightboxImg.src = photo.data;
                    photoLightbox.classList.remove('hidden');
                    if (window.lucide) window.lucide.createIcons();
                });
                
                photosDiv.appendChild(img);
            });
            li.appendChild(photosDiv);
        }

        // Helper: get reactions for a story id
        function getReactionsForStory(storyId) {
            const allReactions = JSON.parse(localStorage.getItem('storyReactions') || '{}');
            return allReactions[storyId] || [];
        }

        // Helper: add reaction for a story id
        function addReactionForStory(storyId, emoji) {
            const allReactions = JSON.parse(localStorage.getItem('storyReactions') || '{}');
            if (!allReactions[storyId]) allReactions[storyId] = [];
            allReactions[storyId].push({ emoji, createdAt: new Date().toISOString() });
            localStorage.setItem('storyReactions', JSON.stringify(allReactions));
            updateReactionDisplay();
        }

        // Reaction display (summary of reactions)
        const reactionsDisplay = document.createElement('div');
        reactionsDisplay.className = 'flex flex-wrap gap-2 mb-3';
        
        function updateReactionDisplay() {
            reactionsDisplay.innerHTML = '';
            const reactions = getReactionsForStory(story.id);
            const reactionCounts = {};
            reactions.forEach(r => {
                reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
            });

            Object.entries(reactionCounts).forEach(([emoji, count]) => {
                const badge = document.createElement('div');
                badge.className = 'inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-mauve-50 to-purple-50 border border-mauve-200 rounded-full text-sm font-medium text-gray-700 hover:from-mauve-100 hover:to-purple-100 transition-all';
                badge.innerHTML = `<span>${emoji}</span><span class="text-xs text-gray-500">${count}</span>`;
                reactionsDisplay.appendChild(badge);
            });
        }
        updateReactionDisplay();
        li.appendChild(reactionsDisplay);
        
        // Reaction emoji options
        const reactionEmojis = ['👍', '❤️', '😂', '🤩', '🔥', '😋', '😍', '🎉', '👏', '🙌', '😲', '🤔', '😒', '🤢', '😤', '🤡', '💀'];

        // Action buttons (reactions + comments)
        const actions = document.createElement('div');
        actions.className = 'flex gap-3 pt-3 border-t border-gray-100 relative';

        const reactBtn = document.createElement('button');
        reactBtn.className = 'px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-mauve-50 to-purple-50 text-mauve-700 hover:from-mauve-100 hover:to-purple-100 border border-mauve-200 hover:border-mauve-300 relative';
        reactBtn.textContent = '👍 React';
        
        // Reaction picker popup
        const reactionPicker = document.createElement('div');
        reactionPicker.className = 'hidden absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-lg border border-mauve-200 p-3 flex gap-2 z-50 animate-fadeIn flex-wrap max-w-xs';
        reactionEmojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.type = 'button';
            emojiBtn.textContent = emoji;
            emojiBtn.className = 'text-2xl p-2 rounded-lg hover:bg-mauve-50 transition-colors transform hover:scale-125';
            emojiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addReactionForStory(story.id, emoji);
                reactionPicker.classList.add('hidden');
            });
            reactionPicker.appendChild(emojiBtn);
        });
        
        reactBtn.addEventListener('click', () => {
            reactionPicker.classList.toggle('hidden');
        });
        
        actions.appendChild(reactBtn);
        actions.appendChild(reactionPicker);
        li.appendChild(actions);
        
        // Comments section
        const comments = getCommentsForStory(story.id);
        const commentCount = comments.length;
        
        const commentSection = document.createElement('div');
        commentSection.className = 'mb-3 pt-3';
        
        // Comment display button
        const commentDisplayBtn = document.createElement('button');
        commentDisplayBtn.type = 'button';
        commentDisplayBtn.className = 'text-sm text-mauve-600 hover:text-mauve-800 font-medium flex items-center gap-2 transition-colors';
        if (commentCount > 0) {
            commentDisplayBtn.innerHTML = `💬 View ${commentCount} Comment${commentCount !== 1 ? 's' : ''}`;
        } else {
            commentDisplayBtn.innerHTML = '💬 Add Comment';
        }
        
        let commentsExpanded = false;
        const commentsDisplay = document.createElement('div');
        commentsDisplay.className = 'hidden mt-3 space-y-3';
        
        function renderCommentsDisplay() {
            commentsDisplay.innerHTML = '';
            const updatedComments = getCommentsForStory(story.id);
            updatedComments.forEach((c, commentIdx) => {
                // Top-level comment
                const commentDiv = document.createElement('div');
                commentDiv.className = 'flex gap-2';
                
                const avatar = document.createElement('div');
                avatar.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-mauve-200 to-purple-200 flex items-center justify-center text-xs font-bold text-mauve-700';
                avatar.textContent = '👤';
                
                const content = document.createElement('div');
                content.className = 'flex-1 min-w-0';
                
                const textDiv = document.createElement('div');
                textDiv.className = 'flex items-start justify-between gap-2';
                
                const text = document.createElement('p');
                text.className = 'text-sm text-gray-700 bg-cream-50 rounded-lg px-3 py-2 border border-gray-100';
                text.textContent = c.text;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'text-xs text-red-500 hover:text-red-700 font-medium transition-colors flex-shrink-0 pt-1';
                deleteBtn.textContent = '✕';
                deleteBtn.addEventListener('click', () => {
                    deleteCommentForStory(story.id, commentIdx);
                    renderCommentsDisplay();
                    updateCommentCount();
                });
                
                textDiv.appendChild(text);
                textDiv.appendChild(deleteBtn);
                
                const date = document.createElement('p');
                date.className = 'text-xs text-gray-400 mt-1 px-1';
                date.textContent = new Date(c.createdAt).toLocaleDateString();
                
                const replyLink = document.createElement('button');
                replyLink.type = 'button';
                replyLink.className = 'text-xs text-mauve-600 hover:text-mauve-800 font-medium transition-colors mt-1';
                replyLink.textContent = 'Reply';
                replyLink.addEventListener('click', () => {
                    showReplyInput(commentIdx);
                });
                
                content.appendChild(textDiv);
                content.appendChild(date);
                content.appendChild(replyLink);
                
                commentDiv.appendChild(avatar);
                commentDiv.appendChild(content);
                commentsDisplay.appendChild(commentDiv);
                
                // Render replies
                if (c.replies && c.replies.length > 0) {
                    c.replies.forEach((r, replyIdx) => {
                        const replyDiv = document.createElement('div');
                        replyDiv.className = 'flex gap-2 ml-8 mt-2';
                        
                        const replyAvatar = document.createElement('div');
                        replyAvatar.className = 'flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-sage-100 to-mauve-100 flex items-center justify-center text-xs font-bold text-sage-600';
                        replyAvatar.textContent = '↳';
                        
                        const replyContent = document.createElement('div');
                        replyContent.className = 'flex-1';
                        
                        const replyTextDiv = document.createElement('div');
                        replyTextDiv.className = 'flex items-start justify-between gap-2 mb-1';
                        
                        const replyText = document.createElement('p');
                        replyText.className = 'text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100';
                        replyText.textContent = r.text;
                        
                        const replyDeleteBtn = document.createElement('button');
                        replyDeleteBtn.type = 'button';
                        replyDeleteBtn.className = 'text-xs text-red-500 hover:text-red-700 font-medium transition-colors flex-shrink-0';
                        replyDeleteBtn.textContent = '✕';
                        replyDeleteBtn.addEventListener('click', () => {
                            c.replies.splice(replyIdx, 1);
                            const allComments = JSON.parse(localStorage.getItem('storyComments') || '{}');
                            allComments[story.id] = updatedComments;
                            localStorage.setItem('storyComments', JSON.stringify(allComments));
                            renderCommentsDisplay();
                        });
                        
                        replyTextDiv.appendChild(replyText);
                        replyTextDiv.appendChild(replyDeleteBtn);
                        
                        const replyDate = document.createElement('p');
                        replyDate.className = 'text-xs text-gray-400 px-1';
                        replyDate.textContent = new Date(r.createdAt).toLocaleDateString();
                        
                        replyContent.appendChild(replyTextDiv);
                        replyContent.appendChild(replyDate);
                        
                        replyDiv.appendChild(replyAvatar);
                        replyDiv.appendChild(replyContent);
                        commentsDisplay.appendChild(replyDiv);
                    });
                }
                
                // Reply input (shown when replying to this comment)
                const replyInputDiv = document.createElement('div');
                replyInputDiv.className = 'hidden ml-8 flex gap-2 mt-2';
                replyInputDiv.setAttribute('data-reply-input', commentIdx);
                
                const replyInputAvatar = document.createElement('div');
                replyInputAvatar.className = 'flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-mauve-300 to-purple-300 flex items-center justify-center text-xs font-bold text-white';
                replyInputAvatar.textContent = '↳';
                
                const replyFormDiv = document.createElement('div');
                replyFormDiv.className = 'flex-1 flex gap-2';
                
                const replyInput = document.createElement('input');
                replyInput.type = 'text';
                replyInput.placeholder = 'Write a reply...';
                replyInput.className = 'flex-1 px-2 py-1.5 rounded-lg border border-gray-200 bg-cream-50 text-xs focus:border-mauve-400 focus:ring-1 focus:ring-mauve-200 focus:outline-none transition-colors';
                
                const replySubmitBtn = document.createElement('button');
                replySubmitBtn.type = 'button';
                replySubmitBtn.textContent = 'Post';
                replySubmitBtn.className = 'px-2 py-1.5 rounded-lg bg-mauve-600 text-white text-xs font-medium hover:bg-mauve-700 transition-colors';
                
                replySubmitBtn.addEventListener('click', () => {
                    const val = replyInput.value.trim();
                    if (val) {
                        addReplyToComment(story.id, commentIdx, val);
                        replyInputDiv.classList.add('hidden');
                        renderCommentsDisplay();
                    }
                });
                
                replyFormDiv.appendChild(replyInput);
                replyFormDiv.appendChild(replySubmitBtn);
                replyInputDiv.appendChild(replyInputAvatar);
                replyInputDiv.appendChild(replyFormDiv);
                commentsDisplay.appendChild(replyInputDiv);
            });
            
            // Add comment input
            const inputDiv = document.createElement('div');
            inputDiv.className = 'flex gap-2 pt-2 border-t border-gray-100 mt-2';
            
            const inputAvatar = document.createElement('div');
            inputAvatar.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-mauve-300 to-purple-300 flex items-center justify-center text-xs font-bold text-white';
            inputAvatar.textContent = '👤';
            
            const formDiv = document.createElement('div');
            formDiv.className = 'flex-1 flex gap-2';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Add a comment...';
            input.className = 'flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-cream-50 text-sm focus:border-mauve-400 focus:ring-1 focus:ring-mauve-200 focus:outline-none transition-colors';
            
            const submitBtn = document.createElement('button');
            submitBtn.type = 'button';
            submitBtn.textContent = 'Post';
            submitBtn.className = 'px-3 py-1.5 rounded-lg bg-mauve-600 text-white text-sm font-medium hover:bg-mauve-700 transition-colors';
            
            submitBtn.addEventListener('click', () => {
                const val = input.value.trim();
                if (val) {
                    addCommentForStory(story.id, val);
                    input.value = '';
                    renderCommentsDisplay();
                    updateCommentCount();
                }
            });
            
            formDiv.appendChild(input);
            formDiv.appendChild(submitBtn);
            inputDiv.appendChild(inputAvatar);
            inputDiv.appendChild(formDiv);
            commentsDisplay.appendChild(inputDiv);
        }
        
        function showReplyInput(commentIdx) {
            // Hide all reply inputs
            commentsDisplay.querySelectorAll('[data-reply-input]').forEach(el => {
                el.classList.add('hidden');
            });
            // Show the one for this comment
            const replyInput = commentsDisplay.querySelector(`[data-reply-input="${commentIdx}"]`);
            if (replyInput) {
                replyInput.classList.remove('hidden');
                replyInput.querySelector('input').focus();
            }
        }
        
        if (commentCount > 0) {
            renderCommentsDisplay();
        }
        
        function updateCommentCount() {
            const updatedComments = getCommentsForStory(story.id);
            const newCount = updatedComments.length;
            if (newCount > 0) {
                commentDisplayBtn.innerHTML = `💬 View ${newCount} Comment${newCount !== 1 ? 's' : ''}`;
            } else {
                commentDisplayBtn.innerHTML = '💬 Add Comment';
            }
        }
        
        commentDisplayBtn.addEventListener('click', () => {
            commentsExpanded = !commentsExpanded;
            if (commentsExpanded) {
                if (commentsDisplay.innerHTML === '') {
                    renderCommentsDisplay();
                }
                commentsDisplay.classList.remove('hidden');
                commentDisplayBtn.innerHTML = `💬 Hide Comments`;
            } else {
                commentsDisplay.classList.add('hidden');
                const updatedComments = getCommentsForStory(story.id);
                const newCount = updatedComments.length;
                commentDisplayBtn.innerHTML = newCount > 0 ? `💬 View ${newCount} Comment${newCount !== 1 ? 's' : ''}` : '💬 Add Comment';
            }
        });
        
        commentSection.appendChild(commentDisplayBtn);
        commentSection.appendChild(commentsDisplay);
        
        li.appendChild(commentSection);
        li.appendChild(editActionsDiv);
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        userStoriesList.appendChild(li);
    });
}

// Tab switching functionality
function setupShareTabs() {
    const writeTab = document.getElementById('tab-write-story');
    const myStoriesTab = document.getElementById('tab-my-stories');
    const writeSection = document.getElementById('write-story-section');
    const myStoriesSection = document.getElementById('my-stories-section');
    
    writeTab?.addEventListener('click', () => {
        writeSection.classList.remove('hidden');
        myStoriesSection.classList.add('hidden');
        writeTab.classList.add('active');
        myStoriesTab.classList.remove('active');
    });
    
    myStoriesTab?.addEventListener('click', () => {
        myStoriesSection.classList.remove('hidden');
        writeSection.classList.add('hidden');
        myStoriesTab.classList.add('active');
        writeTab.classList.remove('active');
        renderUserStories();
    });
}

// Export this initialization function
export function initShareStory() {
    populateTruckSelect();
    setupRatingStars();
    setupPhotoInput();
    setupForm();
    setupShareTabs();

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
        document.getElementById('stories-view').classList.add('hidden');
        document.getElementById('home-view').classList.remove('hidden');
    });
}
