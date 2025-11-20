import { IlluxatAPI } from './illuxat-api.js';

// Add interactive effects to the profile picture
document.addEventListener('DOMContentLoaded', function() {
    const profileContainer = document.querySelector('.profile-container');
    const particlesContainer = document.querySelector('.particles');
    const username = document.querySelector('.username');
    const profilePic = document.querySelector('.profile-pic');
    
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
    
    // Add click effect
    profileContainer.addEventListener('click', () => {
        username.classList.add('name-pulse');
        
        // Add pulse effect to profile picture
        profilePic.classList.add('pic-pulse');
        
        setTimeout(() => {
            username.classList.remove('name-pulse');
            profilePic.classList.remove('pic-pulse');
        }, 1000);
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
});