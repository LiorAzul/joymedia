/* ============================================
   JOY MEDIA - Main JavaScript
   ============================================ */

// ============================================
// Gallery Class - Touch-enabled Carousel
// ============================================

class Gallery {
    constructor(containerId, dotsId, options = {}) {
        this.container = document.getElementById(containerId);
        this.dotsContainer = document.getElementById(dotsId);
        
        if (!this.container) return;
        
        this.track = this.container.querySelector('.gallery-track');
        this.slides = this.container.querySelectorAll('.gallery-slide');
        this.slidesCount = this.slides.length;
        
        this.currentIndex = 0;
        this.autoplayInterval = options.autoplayInterval || 7000;
        this.isAutoplay = options.autoplay !== false;
        this.autoplayTimer = null;
        
        // Touch handling
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isDragging = false;
        this.startTranslate = 0;
        this.currentTranslate = 0;
        
        this.init();
    }
    
    init() {
        this.createDots();
        this.bindEvents();
        this.goToSlide(0);
        
        if (this.isAutoplay) {
            this.startAutoplay();
        }
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        
        for (let i = 0; i < this.slidesCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'gallery-dot';
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => {
                this.goToSlide(i);
                this.resetAutoplay();
            });
            this.dotsContainer.appendChild(dot);
        }
        
        this.dots = this.dotsContainer.querySelectorAll('.gallery-dot');
    }
    
    bindEvents() {
        // Touch events
        this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.container.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Mouse events for desktop
        this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.container.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.container.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Pause autoplay on hover
        this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.startAutoplay();
            }
        });
    }
    
    handleTouchStart(e) {
        this.isDragging = true;
        this.touchStartX = e.touches[0].clientX;
        this.startTranslate = this.currentTranslate;
        this.track.style.transition = 'none';
        this.pauseAutoplay();
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const diff = currentX - this.touchStartX;
        const containerWidth = this.container.offsetWidth;
        
        // RTL: subtract instead of add for correct direction
        this.currentTranslate = this.startTranslate - (diff / containerWidth) * 100;
        this.track.style.transform = `translateX(${this.currentTranslate}%)`;
        
        // Prevent vertical scrolling while swiping
        if (Math.abs(diff) > 10) {
            e.preventDefault();
        }
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.track.style.transition = 'transform 0.5s ease-out';
        
        const diff = this.currentTranslate - this.startTranslate;
        const threshold = 15; // percentage
        
        // RTL: swipe directions are reversed
        if (diff > threshold && this.currentIndex < this.slidesCount - 1) {
            this.nextSlide();
        } else if (diff < -threshold && this.currentIndex > 0) {
            this.prevSlide();
        } else {
            this.goToSlide(this.currentIndex);
        }
        
        this.startAutoplay();
    }
    
    handleMouseDown(e) {
        this.isDragging = true;
        this.touchStartX = e.clientX;
        this.startTranslate = this.currentTranslate;
        this.track.style.transition = 'none';
        this.container.style.cursor = 'grabbing';
        e.preventDefault();
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const currentX = e.clientX;
        const diff = currentX - this.touchStartX;
        const containerWidth = this.container.offsetWidth;
        
        // RTL: subtract instead of add for correct direction
        this.currentTranslate = this.startTranslate - (diff / containerWidth) * 100;
        this.track.style.transform = `translateX(${this.currentTranslate}%)`;
    }
    
    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.track.style.transition = 'transform 0.5s ease-out';
        this.container.style.cursor = 'grab';
        
        const diff = this.currentTranslate - this.startTranslate;
        const threshold = 10;
        
        // RTL: swipe directions are reversed
        if (diff > threshold && this.currentIndex < this.slidesCount - 1) {
            this.nextSlide();
        } else if (diff < -threshold && this.currentIndex > 0) {
            this.prevSlide();
        } else {
            this.goToSlide(this.currentIndex);
        }
    }
    
    goToSlide(index) {
        if (index < 0) index = 0;
        if (index >= this.slidesCount) index = this.slidesCount - 1;
        
        this.currentIndex = index;
        // RTL: use positive translateX to move right
        this.currentTranslate = index * 100;
        this.track.style.transform = `translateX(${this.currentTranslate}%)`;
        
        this.updateDots();
    }
    
    nextSlide() {
        if (this.currentIndex < this.slidesCount - 1) {
            this.goToSlide(this.currentIndex + 1);
        } else {
            this.goToSlide(0); // Loop back to start
        }
    }
    
    prevSlide() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        } else {
            this.goToSlide(this.slidesCount - 1); // Loop to end
        }
    }
    
    updateDots() {
        if (!this.dots) return;
        
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    startAutoplay() {
        if (!this.isAutoplay) return;
        
        this.pauseAutoplay();
        this.autoplayTimer = setInterval(() => {
            this.nextSlide();
        }, this.autoplayInterval);
    }
    
    pauseAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
    
    resetAutoplay() {
        this.pauseAutoplay();
        this.startAutoplay();
    }
}

// ============================================
// Typing Effect Class
// ============================================

class TypingEffect {
    constructor(elementId, phrases, options = {}) {
        this.element = document.getElementById(elementId);
        if (!this.element) return;
        
        this.phrases = phrases;
        this.typingSpeed = options.typingSpeed || 100;
        this.deletingSpeed = options.deletingSpeed || 50;
        this.pauseDuration = options.pauseDuration || 2000;
        
        this.currentPhraseIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        
        this.init();
    }
    
    init() {
        this.type();
    }
    
    type() {
        const currentPhrase = this.phrases[this.currentPhraseIndex];
        
        if (this.isDeleting) {
            // Deleting characters
            this.element.textContent = currentPhrase.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            // Typing characters
            this.element.textContent = currentPhrase.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }
        
        let delay = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
        
        // Check if word is complete
        if (!this.isDeleting && this.currentCharIndex === currentPhrase.length) {
            delay = this.pauseDuration;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
            delay = 500;
        }
        
        setTimeout(() => this.type(), delay);
    }
}

// ============================================
// Intersection Observer for Animations
// ============================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('#values .glass-card, #about .glass-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        observer.observe(el);
    });
}

// ============================================
// Smooth Header on Scroll
// ============================================

function initSmoothHeader() {
    const header = document.querySelector('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
    
    header.style.transition = 'transform 0.3s ease-out';
}

// ============================================
// Initialize Everything
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Galleries
    new Gallery('stillsGallery', 'stillsDots', {
        autoplay: true,
        autoplayInterval: 6000
    });
    
    new Gallery('weddingsGallery', 'weddingsDots', {
        autoplay: true,
        autoplayInterval: 7000
    });
    
    new Gallery('videoGallery', 'videoDots', {
        autoplay: false // Don't autoplay video gallery
    });
    
    new Gallery('testimonialsGallery', 'testimonialsDots', {
        autoplay: true,
        autoplayInterval: 5000
    });
    
    // Initialize Typing Effect
    const slogans = [
        'תוציא אותי מפה',
        'מה אני עושה פה',
        'לא נעים מאוד',
        'מה קורה פה?',
        'מה זה פה?',
        'נעם תיזהר ממני',
        'שלום ולא להתראות'
    ];
    
    new TypingEffect('typingText', slogans, {
        typingSpeed: 100,
        deletingSpeed: 60,
        pauseDuration: 2500
    });
    
    // Initialize Scroll Animations
    initScrollAnimations();
    
    // Initialize Smooth Header
    initSmoothHeader();
    
    // Prevent context menu on images and add loaded class
    document.querySelectorAll('.gallery-image').forEach(img => {
        img.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Add loaded class when image loads
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
            img.addEventListener('error', () => {
                console.error('Failed to load image:', img.src);
                img.classList.add('loaded'); // Remove animation even on error
            });
        }
    });
});

// ============================================
// Service Worker Registration (Optional PWA)
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable PWA support
        // navigator.serviceWorker.register('/sw.js');
    });
}

