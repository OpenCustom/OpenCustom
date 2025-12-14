// ============================================================================
// OpenCustom - Main Application
// ============================================================================
class OpenCustomApp {
    constructor() {
        // DOM Elements
        this.preloader = document.getElementById('preloader');
        this.progressBar = document.getElementById('progressBar');
        this.percentage = document.getElementById('percentage');
        this.menuBtn = document.getElementById('menuBtn');
        this.closeMenuBtn = document.getElementById('closeMenuBtn');
        this.mobileNav = document.getElementById('mobileNav');
        this.codeLines = document.getElementById('codeLines');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.backToTop = document.getElementById('backToTop');
        this.lineCount = document.getElementById('lineCount');
        this.viewDemo = document.getElementById('viewDemo');
        this.particlesContainer = document.getElementById('particles');
        
        // App State
        this.isLoading = true;
        this.isMenuOpen = false;
        this.isCodeAnimating = true;
        this.currentCodeIndex = 0;
        this.codeSnippets = [];
        this.codeAnimator = null;
        
        // Stats Animation
        this.statElements = [];
        this.animatedStats = false;
        
        // Resources to load
        this.resources = [
            './assets/images/opencustom.png',
            './core.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
            'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap'
        ];
        
        // Initialize app
        this.init();
    }
    
    // ========================================================================
    // Initialization
    // ========================================================================
    async init() {
        try {
            // Initialize immediately visible elements
            this.initParticles();
            this.initEventListeners();
            this.initNavigation();
            this.initStatsAnimation();
            
            // Load resources with progress
            await this.loadResources();
            
            // Initialize remaining components
            this.initCodeDisplay();
            
            // Hide preloader
            this.hidePreloader();
            
            // Start animations
            this.startCodeAnimation();
            this.animateStatsOnScroll();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.hidePreloader();
            this.useDefaultCodeSnippets();
            this.startCodeAnimation();
        }
    }
    
    // ========================================================================
    // Resource Loading
    // ========================================================================
    async loadResources() {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalResources = this.resources.length;
            
            const updateProgress = () => {
                loadedCount++;
                const progress = Math.floor((loadedCount / totalResources) * 100);
                
                if (this.progressBar) {
                    this.progressBar.style.width = `${progress}%`;
                }
                
                if (this.percentage) {
                    this.percentage.textContent = `${progress}%`;
                }
                
                if (loadedCount === totalResources) {
                    setTimeout(resolve, 300);
                }
            };
            
            // Load each resource
            this.resources.forEach(resource => {
                if (resource.endsWith('.css') || resource.includes('fonts.googleapis.com')) {
                    this.loadCSS(resource, updateProgress);
                } else if (resource.endsWith('.json')) {
                    this.loadJSON(resource, updateProgress);
                } else {
                    this.loadImage(resource, updateProgress);
                }
            });
            
            // Fallback timeout
            setTimeout(() => {
                if (loadedCount < totalResources) {
                    console.warn('Some resources failed to load');
                    resolve();
                }
            }, 8000);
        });
    }
    
    loadCSS(href, callback) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = callback;
        link.onerror = callback;
        document.head.appendChild(link);
    }
    
    async loadJSON(url, callback) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                this.codeSnippets = data.codeSnippets || [];
            }
        } catch (error) {
            console.error('Failed to load JSON:', error);
        } finally {
            callback();
        }
    }
    
    loadImage(src, callback) {
        const img = new Image();
        img.src = src;
        img.onload = callback;
        img.onerror = callback;
    }
    
    // ========================================================================
    // Preloader
    // ========================================================================
    hidePreloader() {
        this.isLoading = false;
        
        setTimeout(() => {
            if (this.preloader) {
                this.preloader.classList.add('hidden');
            }
            
            // Enable scrolling
            document.body.style.overflow = 'auto';
            
            // Dispatch custom event
            document.dispatchEvent(new CustomEvent('app:loaded'));
            
            // Add loaded class to body
            document.body.classList.add('loaded');
        }, 600);
    }
    
    // ========================================================================
    // Navigation
    // ========================================================================
    initNavigation() {
        // Toggle mobile menu
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu(true);
            });
        }
        
        if (this.closeMenuBtn) {
            this.closeMenuBtn.addEventListener('click', () => this.toggleMenu(false));
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.mobileNav.contains(e.target) && 
                !this.menuBtn.contains(e.target)) {
                this.toggleMenu(false);
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.toggleMenu(false);
            }
        });
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Close mobile menu if open
                    if (this.isMenuOpen) {
                        this.toggleMenu(false);
                    }
                    
                    // Smooth scroll
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    toggleMenu(show) {
        this.isMenuOpen = show;
        
        if (this.mobileNav) {
            if (show) {
                this.mobileNav.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                this.mobileNav.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
        
        // Update menu button icon
        if (this.menuBtn) {
            const icon = this.menuBtn.querySelector('i');
            if (icon) {
                icon.className = show ? 'fas fa-times' : 'fas fa-bars';
            }
        }
    }
    
    // ========================================================================
    // Code Display
    // ========================================================================
    initCodeDisplay() {
        if (this.codeSnippets.length === 0) {
            this.useDefaultCodeSnippets();
        }
        
        // Initialize code animator
        this.codeAnimator = new CodeAnimator(
            this.codeLines,
            this.codeSnippets,
            this.lineCount
        );
        
        // Set up control buttons
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.toggleCodeAnimation());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextCodeSnippet());
        }
        
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copyCurrentCode());
        }
    }
    
    useDefaultCodeSnippets() {
        this.codeSnippets = [
            {
                language: 'TypeScript',
                description: 'React Component with TypeScript',
                code: [
                    "import React, { useState, useEffect } from 'react';",
                    "import { useQuery } from '@tanstack/react-query';",
                    "",
                    "interface User {",
                    "  id: string;",
                    "  name: string;",
                    "  email: string;",
                    "  status: 'active' | 'inactive';",
                    "}",
                    "",
                    "const UserList: React.FC = () => {",
                    "  const [search, setSearch] = useState('');",
                    "  const [page, setPage] = useState(1);",
                    "",
                    "  const { data, isLoading, error } = useQuery({",
                    "    queryKey: ['users', search, page],",
                    "    queryFn: () => fetchUsers(search, page),",
                    "    retry: 3,",
                    "  });",
                    "",
                    "  if (isLoading) {",
                    "    return <LoadingSpinner />;",
                    "  }",
                    "",
                    "  if (error) {",
                    "    return <ErrorMessage error={error} />;",
                    "  }",
                    "",
                    "  return (",
                    "    <div className='user-list'>",
                    "      <SearchBar value={search} onChange={setSearch} />",
                    "      <UserTable users={data.users} />",
                    "      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />",
                    "    </div>",
                    "  );",
                    "};",
                    "",
                    "export default UserList;"
                ]
            },
            {
                language: 'JavaScript',
                description: 'Utility Functions',
                code: [
                    "/**",
                    " * Debounce function to limit how often a function can be called",
                    " * @param {Function} func - Function to debounce",
                    " * @param {number} wait - Wait time in milliseconds",
                    " * @returns {Function} Debounced function",
                    " */",
                    "function debounce(func, wait = 300) {",
                    "  let timeout;",
                    "  return function executedFunction(...args) {",
                    "    const later = () => {",
                    "      clearTimeout(timeout);",
                    "      func(...args);",
                    "    };",
                    "    clearTimeout(timeout);",
                    "    timeout = setTimeout(later, wait);",
                    "  };",
                    "}",
                    "",
                    "/**",
                    " * Format a date to readable string",
                    " * @param {Date} date - Date to format",
                    " * @returns {string} Formatted date string",
                    " */",
                    "function formatDate(date) {",
                    "  return new Intl.DateTimeFormat('en-US', {",
                    "    year: 'numeric',",
                    "    month: 'long',",
                    "    day: 'numeric',",
                    "  }).format(date);",
                    "}",
                    "",
                    "/**",
                    " * Validate email address",
                    " * @param {string} email - Email to validate",
                    " * @returns {boolean} True if email is valid",
                    " */",
                    "function isValidEmail(email) {",
                    "  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;",
                    "  return regex.test(email);",
                    "}"
                ]
            },
            {
                language: 'Python',
                description: 'FastAPI Endpoint',
                code: [
                    "from fastapi import FastAPI, HTTPException, Depends",
                    "from pydantic import BaseModel",
                    "from typing import List, Optional",
                    "from datetime import datetime",
                    "",
                    "app = FastAPI(title='OpenCustom API')",
                    "",
                    "class User(BaseModel):",
                    "    id: str",
                    "    username: str",
                    "    email: str",
                    "    created_at: datetime",
                    "",
                    "class UserCreate(BaseModel):",
                    "    username: str",
                    "    email: str",
                    "    password: str",
                    "",
                    "users_db = []",
                    "",
                    "@app.get('/users', response_model=List[User])",
                    "async def get_users(skip: int = 0, limit: int = 10):",
                    "    return users_db[skip:skip + limit]",
                    "",
                    "@app.post('/users', response_model=User)",
                    "async def create_user(user: UserCreate):",
                    "    user_data = User(",
                    "        id=str(len(users_db) + 1),",
                    "        username=user.username,",
                    "        email=user.email,",
                    "        created_at=datetime.utcnow()",
                    "    )",
                    "    users_db.append(user_data)",
                    "    return user_data"
                ]
            }
        ];
    }
    
    startCodeAnimation() {
        if (this.codeAnimator && this.isCodeAnimating) {
            this.codeAnimator.start();
        }
    }
    
    toggleCodeAnimation() {
        this.isCodeAnimating = !this.isCodeAnimating;
        
        if (this.codeAnimator) {
            if (this.isCodeAnimating) {
                this.codeAnimator.start();
                this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                this.pauseBtn.setAttribute('aria-label', 'Pause animation');
            } else {
                this.codeAnimator.pause();
                this.pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                this.pauseBtn.setAttribute('aria-label', 'Play animation');
            }
        }
    }
    
    nextCodeSnippet() {
        if (this.codeAnimator) {
            this.codeAnimator.next();
        }
    }
    
    copyCurrentCode() {
        if (this.codeAnimator) {
            this.codeAnimator.copyToClipboard();
            
            // Show feedback
            const originalIcon = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            this.copyBtn.setAttribute('aria-label', 'Copied!');
            
            setTimeout(() => {
                this.copyBtn.innerHTML = originalIcon;
                this.copyBtn.setAttribute('aria-label', 'Copy code');
            }, 2000);
        }
    }
    
    // ========================================================================
    // Particles System
    // ========================================================================
    initParticles() {
        if (!this.particlesContainer) return;
        
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Random size
            const size = Math.random() * 3 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random animation
            const duration = Math.random() * 20 + 10;
            particle.style.animation = `
                particleFloat ${duration}s linear infinite,
                particlePulse ${duration / 2}s ease-in-out infinite
            `;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            
            // Random color from gradient
            const colors = ['#0066ff', '#7928ca', '#00d4aa'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            this.particlesContainer.appendChild(particle);
        }
        
        // Add animation keyframes
        this.addParticleAnimations();
    }
    
    addParticleAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.5;
                }
                90% {
                    opacity: 0.5;
                }
                100% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes particlePulse {
                0%, 100% {
                    opacity: 0.3;
                }
                50% {
                    opacity: 0.8;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========================================================================
    // Stats Animation
    // ========================================================================
    initStatsAnimation() {
        this.statElements = document.querySelectorAll('.stat-card-large__value[data-count]');
    }
    
    animateStatsOnScroll() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedStats) {
                        this.animateStats();
                        this.animatedStats = true;
                        observer.disconnect();
                    }
                });
            },
            {
                threshold: 0.5,
                rootMargin: '0px 0px -100px 0px'
            }
        );
        
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }
    
    animateStats() {
        this.statElements.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000;
            const steps = 60;
            const stepValue = target / steps;
            let current = 0;
            
            const timer = setInterval(() => {
                current += stepValue;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current);
            }, duration / steps);
        });
    }
    
    // ========================================================================
    // Event Listeners
    // ========================================================================
    initEventListeners() {
        // Header scroll effect
        const header = document.querySelector('.main-header');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }
        
        // Back to top button
        if (this.backToTop) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    this.backToTop.classList.add('visible');
                } else {
                    this.backToTop.classList.remove('visible');
                }
            });
            
            this.backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
        
        // View Demo button
        if (this.viewDemo) {
            this.viewDemo.addEventListener('click', () => {
                // Scroll to code section
                const codeSection = document.querySelector('.card--code');
                if (codeSection) {
                    codeSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    
                    // Highlight code section
                    codeSection.classList.add('highlight');
                    setTimeout(() => {
                        codeSection.classList.remove('highlight');
                    }, 2000);
                }
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            if (this.codeAnimator) {
                this.codeAnimator.handleResize();
            }
            
            // Update particles on resize
            if (this.particlesContainer) {
                this.particlesContainer.innerHTML = '';
                this.initParticles();
            }
        }, 250));
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.codeAnimator) {
                this.codeAnimator.pause();
            } else if (this.isCodeAnimating && this.codeAnimator) {
                this.codeAnimator.start();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Space to toggle code animation
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.toggleCodeAnimation();
            }
            
            // N for next snippet
            if (e.code === 'KeyN' && e.ctrlKey) {
                e.preventDefault();
                this.nextCodeSnippet();
            }
            
            // C to copy code
            if (e.code === 'KeyC' && e.ctrlKey) {
                e.preventDefault();
                this.copyCurrentCode();
            }
        });
    }
    
    // ========================================================================
    // Utility Functions
    // ========================================================================
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// ============================================================================
// Code Animator Class
// ============================================================================
class CodeAnimator {
    constructor(container, snippets, lineCountElement) {
        this.container = container;
        this.snippets = snippets;
        this.lineCountElement = lineCountElement;
        this.currentSnippetIndex = 0;
        this.isAnimating = false;
        this.animationTimeout = null;
        this.currentLine = 0;
        this.totalLines = 20;
        this.lines = [];
        this.currentCode = '';
        
        // Syntax highlighting rules
        this.syntaxRules = [
            // Comments (single line)
            { regex: /(\/\/.*)/g, className: 'code-comment' },
            // Comments (multi-line)
            { regex: /(\/\*[\s\S]*?\*\/)/g, className: 'code-comment' },
            // Python comments
            { regex: /(#.*)/g, className: 'code-comment' },
            // Strings (all types)
            { regex: /(["'`](?:[^"'`\\]|\\.)*["'`])/g, className: 'code-string' },
            // Keywords
            { regex: /\b(import|from|export|default|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|interface|type|namespace|module|declare|async|await|try|catch|finally|throw|new|this|super|static|public|private|protected|readonly|abstract|override|in|of|typeof|instanceof|def|async|await|True|False|None|async|await|def|class|if|else|elif|for|while|try|except|finally|with|as|from|import|global|nonlocal|lambda|yield|return)\b/g, className: 'code-keyword' },
            // Types
            { regex: /\b(string|number|boolean|any|void|null|undefined|never|unknown|object|Array|Promise|Date|Error|Record|Partial|Required|Readonly|Pick|Omit|ReturnType|int|str|float|bool|list|dict|tuple|set|bytes)\b/g, className: 'code-type' },
            // Functions and methods
            { regex: /\b(useState|useEffect|useCallback|useMemo|useRef|useReducer|useContext|useQuery|fetchUsers|debounce|formatDate|isValidEmail|print|len|range|str|int|float|list|dict|set|tuple|FastAPI|HTTPException|Depends|BaseModel|Optional|List|datetime)\b/g, className: 'code-function' },
            // React specific
            { regex: /\b(React\.FC|ReactNode|JSX\.Element)\b/g, className: 'code-type' },
            // Numbers
            { regex: /\b(\d+(\.\d+)?)\b/g, className: 'code-number' },
            // Operators
            { regex: /([=+\-*/%&|^~!<>?:]+)/g, className: 'code-operator' },
            // Decorators and annotations
            { regex: /(@[\w.]+)/g, className: 'code-type' },
            // Constants
            { regex: /\b([A-Z_][A-Z0-9_]+)\b/g, className: 'code-type' }
        ];
        
        this.init();
    }
    
    init() {
        this.createEmptyLines();
        this.updateLineCount();
    }
    
    createEmptyLines() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.lines = [];
        
        const containerHeight = this.container.clientHeight;
        const lineHeight = 24;
        this.totalLines = Math.max(10, Math.floor(containerHeight / lineHeight) - 2);
        
        for (let i = 1; i <= this.totalLines; i++) {
            const lineElement = this.createLineElement(i);
            this.container.appendChild(lineElement);
            this.lines.push({
                element: lineElement,
                content: '',
                isVisible: false
            });
        }
    }
    
    createLineElement(number) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'code-line';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'code-line__number';
        numberSpan.textContent = number;
        
        const contentSpan = document.createElement('span');
        contentSpan.className = 'code-line__content';
        
        lineDiv.appendChild(numberSpan);
        lineDiv.appendChild(contentSpan);
        
        return lineDiv;
    }
    
    async start() {
        if (this.isAnimating || this.snippets.length === 0) return;
        
        this.isAnimating = true;
        await this.animateSnippet(this.currentSnippetIndex);
        
        // Move to next snippet
        this.currentSnippetIndex = (this.currentSnippetIndex + 1) % this.snippets.length;
        
        // Continue animation if still active
        if (this.isAnimating) {
            this.animationTimeout = setTimeout(() => this.start(), 3000);
        }
    }
    
    async animateSnippet(snippetIndex) {
        const snippet = this.snippets[snippetIndex];
        if (!snippet || !snippet.code) return;
        
        this.currentCode = snippet.code.join('\n');
        const lines = snippet.code;
        const linesToShow = Math.min(lines.length, this.totalLines);
        
        // Clear existing lines
        await this.clearLines();
        
        // Type new lines with staggered animation
        for (let i = 0; i < linesToShow; i++) {
            if (lines[i] !== undefined) {
                await this.typeLine(i, lines[i]);
                await this.sleep(this.getTypingDelay(lines[i]));
            }
        }
        
        // Update line count
        this.updateLineCount();
        
        // Wait before clearing
        await this.sleep(2500);
    }
    
    async typeLine(lineIndex, text) {
        if (lineIndex >= this.lines.length) return;
        
        const line = this.lines[lineIndex];
        const contentElement = line.element.querySelector('.code-line__content');
        
        if (!contentElement) return;
        
        line.isVisible = true;
        line.content = '';
        
        // Add cursor
        contentElement.classList.add('cursor');
        
        // Type character by character
        for (let i = 0; i <= text.length; i++) {
            if (!this.isAnimating) return;
            
            const currentText = text.substring(0, i);
            this.highlightSyntax(contentElement, currentText);
            
            // Add cursor at the end
            const cursorSpan = document.createElement('span');
            cursorSpan.className = 'code-cursor';
            cursorSpan.textContent = '|';
            contentElement.appendChild(cursorSpan);
            
            line.content = currentText;
            
            await this.sleep(this.getCharDelay(text, i));
            
            // Remove cursor before next character
            cursorSpan.remove();
        }
        
        // Remove cursor class when done
        contentElement.classList.remove('cursor');
    }
    
    async clearLines() {
        for (let i = this.lines.length - 1; i >= 0; i--) {
            if (!this.isAnimating) return;
            
            if (this.lines[i].isVisible) {
                await this.eraseLine(i);
                await this.sleep(40);
            }
        }
    }
    
    async eraseLine(lineIndex) {
        if (lineIndex >= this.lines.length) return;
        
        const line = this.lines[lineIndex];
        const contentElement = line.element.querySelector('.code-line__content');
        
        if (!contentElement || !line.content) return;
        
        const text = line.content;
        
        // Add cursor
        contentElement.classList.add('cursor');
        
        // Erase character by character
        for (let i = text.length; i >= 0; i--) {
            if (!this.isAnimating) return;
            
            const currentText = text.substring(0, i);
            this.highlightSyntax(contentElement, currentText);
            
            // Add cursor at the end
            const cursorSpan = document.createElement('span');
            cursorSpan.className = 'code-cursor';
            cursorSpan.textContent = '|';
            contentElement.appendChild(cursorSpan);
            
            line.content = currentText;
            
            await this.sleep(20);
            
            // Remove cursor before next character
            cursorSpan.remove();
        }
        
        // Clear the line
        contentElement.innerHTML = '';
        contentElement.classList.remove('cursor');
        line.isVisible = false;
        line.content = '';
    }
    
    highlightSyntax(element, text) {
        if (!text) {
            element.innerHTML = '';
            return;
        }
        
        let highlighted = this.escapeHtml(text);
        
        // Apply syntax highlighting
        this.syntaxRules.forEach(rule => {
            highlighted = highlighted.replace(
                rule.regex,
                `<span class="${rule.className}">$1</span>`
            );
        });
        
        element.innerHTML = highlighted;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getTypingDelay(line) {
        // Longer lines get more time
        const baseDelay = 30;
        const lengthDelay = line.length * 1.5;
        return Math.min(baseDelay + lengthDelay, 100);
    }
    
    getCharDelay(line, index) {
        const baseDelay = 15;
        
        // Speed up for spaces and punctuation
        const char = line.charAt(index - 1);
        if (char === ' ' || char === ',') return baseDelay * 0.7;
        if (char === '.' || char === ';') return baseDelay * 1.5;
        
        // Random variation for natural typing effect
        return baseDelay + Math.random() * 15;
    }
    
    pause() {
        this.isAnimating = false;
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }
    }
    
    next() {
        this.pause();
        
        // Clear current lines
        this.clearLines().then(() => {
            // Start next snippet
            this.currentSnippetIndex = (this.currentSnippetIndex + 1) % this.snippets.length;
            this.start();
        });
    }
    
    copyToClipboard() {
        if (!this.currentCode) return;
        
        navigator.clipboard.writeText(this.currentCode).catch(err => {
            console.error('Failed to copy code:', err);
            
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = this.currentCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }
    
    handleResize() {
        // Adjust total lines based on container height
        if (this.container) {
            this.createEmptyLines();
            
            // Restart animation if it was running
            if (this.isAnimating) {
                this.pause();
                setTimeout(() => this.start(), 100);
            }
        }
    }
    
    updateLineCount() {
        if (this.lineCountElement) {
            const currentSnippet = this.snippets[this.currentSnippetIndex];
            const lineCount = currentSnippet ? currentSnippet.code.length : 0;
            this.lineCountElement.textContent = lineCount;
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================================================
// Initialize Application
// ============================================================================
// ============================================================================
// Initialize Application
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    window.OpenCustomApp = new OpenCustomApp();
    
    // Add loading class to body
    document.body.classList.add('loading');
    
    // Remove loading class when app is ready
    document.addEventListener('app:loaded', () => {
        document.body.classList.remove('loading');
    });
    
    // Service worker registration (optional)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Only register in production environment
            const isProduction = window.location.hostname !== 'localhost' && 
                                window.location.hostname !== '127.0.0.1';
            
            if (isProduction) {
                navigator.serviceWorker.register('/sw.js').catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
            }
        });
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Show user-friendly error message
    if (document.body) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff375f;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 9999;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        errorDiv.textContent = 'An error occurred. Please refresh the page.';
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OpenCustomApp, CodeAnimator };
}