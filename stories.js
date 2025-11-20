// Initialize Firebase using config
firebase.initializeApp(config.firebase);
const db = firebase.firestore();

// Story functionality
let stories = [];
let isAdmin = false;
let adminPassword = config.admin.password;

// Video platform detection
function detectVideoPlatform(url) {
    if (!url) return null;
    const urlLower = url.toLowerCase();

    // YouTube (including Shorts)
    if (urlLower.includes('youtube.com/watch') || urlLower.includes('youtu.be/') || urlLower.includes('youtube.com/shorts/')) {
        const videoId = extractYouTubeId(url);
        const isShorts = urlLower.includes('/shorts/');
        return {
            platform: 'youtube',
            videoId: videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            isShorts: isShorts,
            aspectRatio: isShorts ? 'portrait' : 'landscape'
        };
    }

    // Direct video file
    if (urlLower.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/)) {
        return {
            platform: 'direct',
            videoUrl: url,
            aspectRatio: 'auto'
        };
    }

    return null;
}

function extractYouTubeId(url) {
    if (url.includes('/shorts/')) {
        const shortsMatch = url.match(/\/shorts\/([^/?&#]+)/);
        return shortsMatch ? shortsMatch[1] : null;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Admin functions
function handleGearClick() {
    if (isAdmin) {
        showLogoutConfirm();
    } else {
        showAdminLoginForGear();
    }
}

function showAdminLoginForGear() {
    const loginModal = document.createElement('div');
    loginModal.className = 'story-modal active';
    loginModal.style.zIndex = '1003';

    loginModal.innerHTML = ` <div class="story-modal-content">
      <div style="text-align: center;">
        <div style="margin-bottom: 20px;">
          <i class="fa-solid fa-lock" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 15px;"></i>
          <h3 style="color: var(--accent-color); margin-bottom: 15px;">Admin Access Required</h3>
          <p style="color: #f5f5f5; font-size: 1.1rem;">Enter admin password to access admin features</p>
        </div>
        <div style="margin-bottom: 20px;">
          <input type="password" id="adminPasswordInput" placeholder="Enter password..." style="width: 100%; padding: 12px; border: 2px solid var(--accent-color); border-radius: 10px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem;">
        </div>
        <div style="display: flex; gap: 15px; justify-content: center;">
          <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove(); document.body.style.overflow = 'auto';" style="background: #555; color: white; border: none; padding: 12px 25px; border-radius: 20px; cursor: pointer; font-size: 1rem;">
            <i class="fa-solid fa-times"></i> Cancel
          </button>
          <button onclick="verifyAdminPasswordForGear()" style="background: linear-gradient(45deg, var(--accent-color), var(--accent-color-secondary)); color: white; border: none; padding: 12px 25px; border-radius: 20px; cursor: pointer; font-size: 1rem;">
            <i class="fa-solid fa-check"></i> Login
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(loginModal);
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        document.getElementById('adminPasswordInput').focus();
    }, 100);

    document.getElementById('adminPasswordInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            verifyAdminPasswordForGear();
        }
    });
}

function verifyAdminPasswordForGear() {
    const inputPassword = document.getElementById('adminPasswordInput').value;

    if (inputPassword === adminPassword) {
        isAdmin = true;
        sessionStorage.setItem('lemoAdminSession', 'true');
        document.querySelector('.story-modal.active').remove();
        document.body.style.overflow = 'auto';
        showNotification('Admin access granted! Welcome back! 🔓');

        updateGearIcon();
        renderStories();
    } else {
        showNotification('Incorrect password! Please try again! ❌');
        document.getElementById('adminPasswordInput').value = '';
        document.getElementById('adminPasswordInput').focus();
    }
}

function updateGearIcon() {
    const gearIcon = document.querySelector('.admin-gear');
    if (isAdmin) {
        gearIcon.classList.add('admin-active');
        gearIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
        gearIcon.title = 'Admin Active - Click to logout';
    } else {
        gearIcon.classList.remove('admin-active');
        gearIcon.innerHTML = '<i class="fa-solid fa-gear"></i>';
        gearIcon.title = 'Admin Settings';
    }
}

function showLogoutConfirm() {
    const logoutModal = document.createElement('div');
    logoutModal.className = 'story-modal active';
    logoutModal.style.zIndex = '1003';

    logoutModal.innerHTML = `
    <div class="story-modal-content" style="max-width: 400px;">
      <div style="text-align: center;">
        <div style="margin-bottom: 20px;">
          <i class="fa-solid fa-sign-out-alt" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 15px;"></i>
          <h3 style="color: var(--accent-color); margin-bottom: 15px;">Logout Admin</h3>
          <p style="color: #f5f5f5; font-size: 1.1rem;">Are you sure you want to logout from admin mode?</p>
        </div>
        <div style="display: flex; gap: 15px; justify-content: center;">
          <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove(); document.body.style.overflow = 'auto';" style="background: linear-gradient(45deg, var(--accent-color), var(--accent-color-secondary)); color: white; border: none; padding: 12px 25px; border-radius: 20px; cursor: pointer; font-size: 1rem;">
            <i class="fa-solid fa-times"></i> Cancel
          </button>
          <button onclick="logoutAdmin()" style="background: linear-gradient(45deg, #ff6b6b, #ee5a52); color: white; border: none; padding: 12px 25px; border-radius: 20px; cursor: pointer; font-size: 1rem;">
            <i class="fa-solid fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(logoutModal);
    document.body.style.overflow = 'hidden';
}

function logoutAdmin() {
    isAdmin = false;
    sessionStorage.removeItem('lemoAdminSession');
    document.querySelector('.story-modal.active').remove();
    document.body.style.overflow = 'auto';
    updateGearIcon();
    renderStories();
    showNotification('Admin logged out successfully! 👋');
}

// Story modal functions
function openStoryModal() {
    if (!isAdmin) {
        showAdminLoginForGear();
        return;
    }
    document.getElementById('storyModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeStoryModal() {
    document.getElementById('storyModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('storyForm').reset();
    uploadedImageData = null;
    uploadedVideoData = null;
    document.getElementById('imageFileName').textContent = '';
    document.getElementById('videoFileName').textContent = '';
}

// Add story
async function addStory(title, content, imageUrl = null, videoUrl = null) {
    let videoInfo = detectVideoPlatform(videoUrl);

    const finalImage = imageUrl || (videoInfo && videoInfo.thumbnail) || null;

    const story = {
        title: title,
        content: content,
        imageUrl: finalImage,
        videoUrl: videoUrl,
        videoInfo: videoInfo,
        timestamp: new Date().toLocaleDateString(),
        views: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await db.collection('stories').add(story);
        story.id = docRef.id;
        stories.unshift(story);
        renderStories();
        closeStoryModal();
        showNotification('Story added successfully! ✨');
    } catch (error) {
        console.error('Error adding story:', error);
        showNotification('Error adding story. Please try again! ❌');
    }
}

// Render stories
function renderStories() {
    const container = document.getElementById('storiesContainer');
    container.innerHTML = '';

    if (isAdmin) {
        const addButton = document.createElement('div');
        addButton.className = 'story-item add-story';
        addButton.onclick = openStoryModal;
        addButton.innerHTML = `
      <div class="add-button">
        <i class="fa-solid fa-plus"></i>
      </div>
      <div class="add-text">Create story</div>
    `;
        container.appendChild(addButton);
    }

    if (stories && stories.length > 0) {
        stories.forEach((story, index) => {
            const storyElement = createStoryElement(story, index);
            container.appendChild(storyElement);
        });
    } else if (!isAdmin) {
        const noStoriesMessage = document.createElement('div');
        noStoriesMessage.style.cssText = `
      text-align: center;
      padding: 20px;
      color: #888;
      font-style: italic;
    `;
        noStoriesMessage.textContent = 'No stories available yet.';
        container.appendChild(noStoriesMessage);
    }
}

function createStoryElement(story, index) {
    const storyDiv = document.createElement('div');
    storyDiv.className = 'story-item';
    storyDiv.onclick = () => viewStory(story, index);

    let storyImage = (story.imageUrl) || ((story.videoInfo && story.videoInfo.thumbnail) ? story.videoInfo.thumbnail : 'https://img.alfrsantv.com/img/f17546454730791.jpg');

    storyDiv.innerHTML = `
    <img src="${storyImage}" alt="${story.title}" class="story-image" onerror="this.src='https://img.alfrsantv.com/img/f17546454730791.jpg'">
    <div class="story-profile">
      <img src="https://img.alfrsantv.com/img/f17546454730791.jpg" alt="Profile">
    </div>
    <div class="story-overlay">
      <i class="fa-solid fa-play"></i>
    </div>
  `;

    return storyDiv;
}

async function viewStory(story, index) {
    story.views++;
    try {
        await db.collection('stories').doc(story.id).update({
            views: story.views
        });
    } catch (error) {
        console.error('Error updating view count:', error);
        story.views--;
    }

    const viewerModal = document.createElement('div');
    viewerModal.className = 'story-modal active';
    viewerModal.style.zIndex = '1001';

    viewerModal.innerHTML = `
    <div class="story-modal-content" style="max-width: 700px;">
      <button class="story-modal-close" onclick="this.parentElement.parentElement.remove(); document.body.style.overflow = 'auto';">
        <i class="fa-solid fa-times"></i>
      </button>
      <div style="text-align: center;">
        <h3 style="color: var(--accent-color); margin-bottom: 15px;">${story.title}</h3>

        ${story.videoUrl ? `
          <div style="margin-bottom: 20px; position: relative;">
            ${story.videoInfo && story.videoInfo.platform === 'youtube' ? `
              <div style="position: relative; width: 100%; padding-bottom: ${story.videoInfo.aspectRatio === 'portrait' ? '177.78%' : '56.25%'}; border-radius: 15px; overflow: hidden;">
                <iframe
                  src="${story.videoInfo.embedUrl}?autoplay=0&rel=0"
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                  allowfullscreen>
                </iframe>
              </div>
            ` : `
              <div style="position: relative; width: 100%; border-radius: 15px; overflow: hidden;">
                <video controls style="width: 100%; height: auto; max-height: 70vh; background: #000; object-fit: contain; border-radius: 15px;">
                  <source src="${story.videoUrl}" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
              </div>
            `}
          </div>
        ` : ''}

        ${story.imageUrl && !story.videoUrl ? `
          <div style="margin-bottom: 20px;">
            <img src="${story.imageUrl}" alt="${story.title}" style="max-width: 100%; border-radius: 15px;">
          </div>
        ` : ''}

        <div style="color: #f5f5f5; font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px; text-align: left;">
          ${story.content.replace(/\\n/g, '<br>')}
        </div>

        <div style="color: #aaa; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <span><i class="fa-solid fa-calendar"></i> ${story.timestamp}</span>
          <span><i class="fa-solid fa-eye"></i> ${story.views} views</span>
        </div>

        <div style="margin-top: 20px;">
          ${isAdmin ? `<button onclick="deleteStory('${story.id}')" style="background: linear-gradient(45deg, #ff6b6b, #ee5a52); color: white; border: none; padding: 10px 20px; border-radius: 15px; cursor: pointer; margin-right: 10px;">
            <i class="fa-solid fa-trash"></i> Delete
          </button>` : ''}
          <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove(); document.body.style.overflow = 'auto';" style="background: linear-gradient(45deg, var(--accent-color), var(--accent-color-secondary)); color: white; border: none; padding: 10px 20px; border-radius: 15px; cursor: pointer;">
            <i class="fa-solid fa-check"></i> Close
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(viewerModal);
    document.body.style.overflow = 'hidden';
}

async function deleteStory(storyId) {
    if (confirm('Are you sure you want to delete this story?')) {
        try {
            await db.collection('stories').doc(storyId).delete();
            stories = stories.filter(story => story.id !== storyId);
            renderStories();
            document.querySelector('.story-modal.active').remove();
            document.body.style.overflow = 'auto';
            showNotification('Story deleted successfully! 🗑️');
        } catch (error) {
            console.error('Error deleting story:', error);
            showNotification('Error deleting story. Please try again! ❌');
        }
    }
}

// Load stories from Firebase
async function loadStories() {
    try {
        const snapshot = await db.collection('stories')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        stories = [];
        snapshot.forEach(doc => {
            const story = doc.data();
            story.id = doc.id;
            stories.push(story);
        });

        renderStories();
    } catch (error) {
        console.error('Error loading stories:', error);
        showNotification('Error loading stories. Please refresh the page! ❌');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(45deg, var(--accent-color), var(--accent-color-secondary));
    color: white;
    padding: 15px 25px;
    border-radius: 25px;
    z-index: 10000;
    font-weight: 600;
    box-shadow: 0 5px 20px var(--border-glow);
    animation: slideIn 0.3s ease;
  `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// File upload handling
let uploadedImageData = null;
let uploadedVideoData = null;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('storyImageFile').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                uploadedImageData = e.target.result;
                document.getElementById('imageFileName').textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('storyVideoFile').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                uploadedVideoData = e.target.result;
                document.getElementById('videoFileName').textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission
    document.getElementById('storyForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('storyTitle').value.trim();
        const content = document.getElementById('storyContent').value.trim();
        const imageUrl = document.getElementById('storyImage').value.trim();
        const videoUrl = document.getElementById('storyVideo').value.trim();

        const finalImageUrl = uploadedImageData || imageUrl || null;
        const finalVideoUrl = uploadedVideoData || videoUrl || null;

        if (title || content || finalImageUrl || finalVideoUrl) {
            addStory(title || '', content || '', finalImageUrl, finalVideoUrl);
            uploadedImageData = null;
            uploadedVideoData = null;
            document.getElementById('imageFileName').textContent = '';
            document.getElementById('videoFileName').textContent = '';
        } else {
            showNotification('Please fill in at least one field! 📝');
        }
    });

    // Close modal when clicking outside
    document.getElementById('storyModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeStoryModal();
        }
    });

    // Scroll stories function
    window.scrollStories = function (direction = 'right') {
        const container = document.getElementById('storiesContainer');
        const distance = Math.round(container.clientWidth * 0.8);
        container.scrollBy({
            left: direction === 'left' ? -distance : distance,
            behavior: 'smooth'
        });
        setTimeout(updateStoryNav, 350);
    };

    // Show/hide left/right nav buttons based on scroll position
    function updateStoryNav() {
        const container = document.getElementById('storiesContainer');
        const leftBtn = document.getElementById('storyNavLeft');
        const rightBtn = document.getElementById('storyNavRight');
        if (!container || !leftBtn || !rightBtn) return;
        leftBtn.style.display = container.scrollLeft > 4 ? 'flex' : 'none';
        rightBtn.style.display = 'flex';
    }

    // Initialize
    loadStories();

    const sc = document.getElementById('storiesContainer');
    if (sc) {
        sc.addEventListener('scroll', updateStoryNav, { passive: true });
        window.addEventListener('resize', updateStoryNav);
        updateStoryNav();
    }

    // Check if admin session exists
    const adminSession = sessionStorage.getItem('lemoAdminSession');
    if (adminSession === 'true') {
        isAdmin = true;
        updateGearIcon();
        renderStories();
    }
});
