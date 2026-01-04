import { IlluxatAPI } from './illuxat-api.js';

// Define image viewer functions first so they're available
function openImageViewer(imageSrc) {
    try {
        // Create modal if it doesn't exist
        let imageModal = document.getElementById('imageViewerModal');
        if (!imageModal) {
            imageModal = document.createElement('div');
            imageModal.id = 'imageViewerModal';
            imageModal.className = 'image-viewer-modal';
            imageModal.innerHTML = `
                <div class="image-viewer-content">
                    <button class="image-viewer-close" onclick="closeImageViewer()" aria-label="Close">
                        <i class="fa-solid fa-times"></i>
                    </button>
                    <div class="image-viewer-wrapper">
                        <div class="image-viewer-container">
                            <img src="" alt="Profile Picture" class="image-viewer-img" id="imageViewerImg">
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(imageModal);
            
            // Close on background click
            imageModal.addEventListener('click', (e) => {
                if (e.target === imageModal || e.target.classList.contains('image-viewer-wrapper')) {
                    closeImageViewer();
                }
            });
            
            // Close on Escape key
            const escapeHandler = (e) => {
                if (e.key === 'Escape' && imageModal.classList.contains('active')) {
                    closeImageViewer();
                }
            };
            document.addEventListener('keydown', escapeHandler);
        }
        
        // Set image source and show modal
        const img = document.getElementById('imageViewerImg');
        if (!img) {
            console.error('Image element not found in modal');
            return;
        }
        img.src = imageSrc;
        imageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error in openImageViewer:', error);
    }
}

function closeImageViewer() {
    const imageModal = document.getElementById('imageViewerModal');
    if (imageModal) {
        imageModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Make functions globally accessible
window.openImageViewer = openImageViewer;
window.closeImageViewer = closeImageViewer;

// Add interactive effects to the profile picture
document.addEventListener('DOMContentLoaded', function() {
    const profileContainer = document.querySelector('.profile-container');
    const particlesContainer = document.querySelector('.particles');
    const username = document.querySelector('.username');
    const profilePic = document.querySelector('.profile-pic');
    
    // Check if elements are found
    if (!profilePic) {
        console.error('Profile picture not found!');
        return;
    }
    
    // Initialize status indicator
    const statusIndicator = document.getElementById('statusIndicator');
    const statusIcon = statusIndicator.querySelector('.status-icon');
    
    // Set initial loading state
    statusIcon.classList.add('loading');
    
    // Check online status immediately and then every second
    checkOnlineStatus();
    setInterval(checkOnlineStatus, 1000);
    
    // Initially hide elements for entrance animation
    profileContainer.style.opacity = '0';
    username.style.opacity = '0';
    
    // Create additional particles for more dynamic effect
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('span');
        particle.classList.add('particle');
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.width = `${Math.random() * 10 + 5}px`;
        particle.style.height = particle.style.width;
        particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        particle.style.backgroundColor = i % 3 === 0 ? '#bb86fc' : i % 3 === 1 ? '#03dac6' : '#cf6679';
        particlesContainer.appendChild(particle);
    }
    
    // Entrance animation
    setTimeout(() => {
        profileContainer.style.transition = 'opacity 1s ease, transform 1s ease';
        profileContainer.style.opacity = '1';
        profileContainer.style.transform = 'scale(1)';
        
        setTimeout(() => {
            username.style.transition = 'opacity 1s ease';
            username.style.opacity = '1';
            
            // Add typing effect to username with enhanced animation
            const userNameText = username.textContent;
            username.textContent = '';
            let i = 0;
            const typing = setInterval(() => {
                if (i < userNameText.length) {
                    username.textContent += userNameText.charAt(i);
                    // Add glow effect during typing
                    username.style.textShadow = `0 0 ${10 + (i % 5) * 5}px var(--accent-color)`;
                    i++;
                } else {
                    clearInterval(typing);
                    // Reset to normal animation
                    username.style.textShadow = '';
                }
            }, 100);
        }, 500);
    }, 300);
    
    // Add mouse move effect
    profileContainer.addEventListener('mousemove', (e) => {
        const rect = profileContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const angleX = (y - centerY) / 10;
        const angleY = (centerX - x) / 10;
        
        profileContainer.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });
    
    // Reset transform when mouse leaves
    profileContainer.addEventListener('mouseleave', () => {
        profileContainer.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
    
    // Add click handler to profile image to open image viewer (Facebook-style)
    profilePic.style.pointerEvents = 'auto';
    profilePic.style.zIndex = '10';
    profilePic.style.cursor = 'pointer';
    
    // Direct click handler
    profilePic.onclick = function(e) {
        e.stopPropagation();
        e.preventDefault();
        const imageSrc = this.src || this.getAttribute('src');
        if (imageSrc) {
            openImageViewer(imageSrc);
        }
        return false;
    };
    
    // Also add event listener as backup
    profilePic.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        const imageSrc = this.src || this.getAttribute('src');
        if (imageSrc) {
            openImageViewer(imageSrc);
        }
    }, false);
    
    // Add click effect to profile container (but not the image itself)
    profileContainer.addEventListener('click', (e) => {
        // Only trigger pulse if clicking on container, not the image
        if (e.target !== profilePic && !profilePic.contains(e.target)) {
            username.classList.add('name-pulse');
            profilePic.classList.add('pic-pulse');
            
            setTimeout(() => {
                username.classList.remove('name-pulse');
                profilePic.classList.remove('pic-pulse');
            }, 1000);
        }
    });
    
    // Add click effect to username directly
    username.addEventListener('click', (e) => {
        e.stopPropagation();
        username.classList.add('name-pulse');
        
        setTimeout(() => {
            username.classList.remove('name-pulse');
        }, 1000);
    });
    
    // Function to check online status
    async function checkOnlineStatus() {
        try {
            // Create instance of IlluxatAPI
            const api = new IlluxatAPI();
            
            // Check status for user "lemo"
            const response = await api.online('lemo');
            
            if (response.error) {
                console.error('Error checking status:', response.error);
                statusIcon.classList.remove('loading', 'online');
                statusIcon.classList.add('offline');
                return;
            }
            
            // Update status indicator based on response
            if (response.data && response.data.status === 'Online') {
                statusIcon.classList.remove('loading', 'offline');
                statusIcon.classList.add('online');
            } else {
                statusIcon.classList.remove('loading', 'online');
                statusIcon.classList.add('offline');
            }
        } catch (error) {
            console.error('Error checking status:', error);
            statusIcon.classList.remove('loading', 'online');
            statusIcon.classList.add('offline');
        }
    }
    
    // Automatic Profile Picture Switcher with Crossfade Effect
    const profileImages = [
        'https://img.alfrsantv.com/img/f176356891083911.jpg',
        'https://img.alfrsantv.com/img/f176746659232911.jpg'
    ];
    
    let currentImageIndex = 0;
    
    // Function to switch profile picture with crossfade effect
    function switchProfilePicture() {
        // Move to next image
        currentImageIndex = (currentImageIndex + 1) % profileImages.length;
        
        // Add fade-out class
        profilePic.style.opacity = '0';
        profilePic.style.transition = 'opacity 0.8s ease-in-out';
        
        // Change image source after fade-out
        setTimeout(() => {
            profilePic.src = profileImages[currentImageIndex];
            
            // Fade-in with new image
            profilePic.style.opacity = '1';
        }, 800);
    }
    
    // Start automatic switching every 3 seconds
    setInterval(switchProfilePicture, 3000);
});

// Handle gear icon click for admin login/dashboard access
function handleGearClick() {
    // Check if we're already in the stories.js file which has the admin functions
    if (typeof isAdmin !== 'undefined') {
        if (isAdmin) {
            // If already admin, toggle dashboard visibility
            toggleDashboard();
        } else {
            // If not admin, show login
            showAdminLoginForGear();
        }
    } else {
        // Fallback to login if admin functions aren't available
        showAdminLoginForGear();
    }
}

// Theme Switcher Functions
function toggleThemeMenu() {
    const themeMenu = document.getElementById('themeMenu');
    if (themeMenu) {
        themeMenu.classList.toggle('active');
    }
}

function changeTheme(themeName) {
    // Remove all theme attributes
    document.documentElement.removeAttribute('data-theme');
    
    // Apply new theme
    if (themeName !== 'default') {
        document.documentElement.setAttribute('data-theme', themeName);
    }
    
    // Save to localStorage
    localStorage.setItem('selectedTheme', themeName);
    
    // Update active state in menu
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-theme') === themeName) {
            option.classList.add('active');
        }
    });
    
    // Update meta theme-color
    const themeColors = {
        'default': '#7c3aed',
        'blue': '#3b82f6',
        'green': '#10b981',
        'red': '#ef4444',
        'orange': '#f59e0b',
        'dark': '#ffffff'
    };
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColors[themeName] || themeColors['default']);
    }
    
    // Close theme menu after selection
    const themeMenu = document.getElementById('themeMenu');
    if (themeMenu) {
        setTimeout(() => {
            themeMenu.classList.remove('active');
        }, 300);
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme or use default
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    
    // Apply theme without closing menu (since menu isn't open yet)
    document.documentElement.removeAttribute('data-theme');
    if (savedTheme !== 'default') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Update meta theme-color
    const themeColors = {
        'default': '#7c3aed',
        'blue': '#3b82f6',
        'green': '#10b981',
        'red': '#ef4444',
        'orange': '#f59e0b',
        'dark': '#ffffff'
    };
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColors[savedTheme] || themeColors['default']);
    }
    
    // Mark active theme in menu
    setTimeout(() => {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-theme') === savedTheme) {
                option.classList.add('active');
            }
        });
    }, 100);
    
    // Close theme menu when clicking outside
    document.addEventListener('click', function(event) {
        const themeMenu = document.getElementById('themeMenu');
        const themeSwitcher = document.querySelector('.theme-switcher');
        
        if (themeMenu && themeSwitcher) {
            if (!themeMenu.contains(event.target) && 
                !themeSwitcher.contains(event.target) && 
                themeMenu.classList.contains('active')) {
                themeMenu.classList.remove('active');
            }
        }
    });
});

// Make functions globally accessible
window.toggleThemeMenu = toggleThemeMenu;
window.changeTheme = changeTheme;