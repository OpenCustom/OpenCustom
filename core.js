// ============================================================================
// Main Application
// ============================================================================
class OpenCustomApp {
    constructor() {
        // DOM Elements
        this.preloader = document.getElementById('preloader');
        this.progressBar = document.getElementById('progressBar');
        this.percentage = document.getElementById('percentage');
        this.menuBtn = document.getElementById('menuBtn');
        this.closeMenuBtn = document.getElementById('closeMenuBtn');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.codeLines = document.getElementById('codeLines');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.nextBtn = document.getElementById('nextBtn');
        
        // App State
        this.isLoading = true;
        this.isMenuOpen = false;
        this.isCodeAnimating = true;
        this.currentCodeIndex = 0;
        this.codeSnippets = [];
        this.codeAnimator = null;
        
        // Resources to load
        this.resources = [
            './assets/images/opencustom.png',
            './assets/json/code.json',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        ];
        
        // Initialize app
        this.init();
    }
    
    // ========================================================================
    // Initialization
    // ========================================================================
    async init() {
        try {
            // Load resources
            await this.loadResources();
            
            // Initialize components
            this.initNavigation();
            this.initCodeDisplay();
            this.initEventListeners();
            
            // Hide preloader
            this.hidePreloader();
            
            // Start code animation
            this.startCodeAnimation();
            
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
                    setTimeout(resolve, 500);
                }
            };
            
            // Load each resource
            this.resources.forEach(resource => {
                if (resource.endsWith('.css')) {
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
            }, 5000);
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
        }, 500);
    }
    
    // ========================================================================
    // Navigation
    // ========================================================================
    initNavigation() {
        // Toggle mobile menu
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => this.toggleMenu(true));
        }
        
        if (this.closeMenuBtn) {
            this.closeMenuBtn.addEventListener('click', () => this.toggleMenu(false));
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.mobileMenu.contains(e.target) && 
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
    }
    
    toggleMenu(show) {
        this.isMenuOpen = show;
        
        if (this.mobileMenu) {
            if (show) {
                this.mobileMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                this.mobileMenu.classList.remove('active');
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
            this.codeSnippets
        );
        
        // Set up control buttons
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.toggleCodeAnimation());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextCodeSnippet());
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
    
    // ========================================================================
    // Event Listeners
    // ========================================================================
    initEventListeners() {
        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            if (this.codeAnimator) {
                this.codeAnimator.handleResize();
            }
        }, 250));
        
        // Handle visibility change (pause animation when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.codeAnimator) {
                this.codeAnimator.pause();
            } else if (this.isCodeAnimating && this.codeAnimator) {
                this.codeAnimator.start();
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
    constructor(container, snippets) {
        this.container = container;
        this.snippets = snippets;
        this.currentSnippetIndex = 0;
        this.isAnimating = false;
        this.animationTimeout = null;
        this.currentLine = 0;
        this.totalLines = 20;
        this.lines = [];
        
        // Syntax highlighting rules
        this.syntaxRules = [
            // Comments
            { regex: /(\/\/.*)/g, className: 'code-comment' },
            { regex: /(\/\*[\s\S]*?\*\/)/g, className: 'code-comment' },
            // Strings
            { regex: /(["'`](?:[^"'`\\]|\\.)*["'`])/g, className: 'code-string' },
            // Keywords
            { regex: /\b(import|from|export|default|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|interface|type|namespace|module|declare|async|await|try|catch|finally|throw|new|this|super|static|public|private|protected|readonly|abstract|override|in|of|typeof|instanceof)\b/g, className: 'code-keyword' },
            // Types
            { regex: /\b(string|number|boolean|any|void|null|undefined|never|unknown|object|Array|Promise|Date|Error|Record|Partial|Required|Readonly|Pick|Omit|ReturnType)\b/g, className: 'code-type' },
            // Functions
            { regex: /\b(useState|useEffect|useCallback|useMemo|useRef|useReducer|useContext|useQuery|fetchUsers|debounce|formatDate|isValidEmail)\b/g, className: 'code-function' },
            // React specific
            { regex: /\b(React\.FC|ReactNode|JSX\.Element)\b/g, className: 'code-type' },
            // Numbers
            { regex: /\b(\d+(\.\d+)?)\b/g, className: 'code-number' },
            // Operators
            { regex: /([=+\-*/%&|^~!<>?:]+)/g, className: 'code-operator' },
            // Constants
            { regex: /\b([A-Z_][A-Z0-9_]+)\b/g, className: 'code-type' }
        ];
        
        this.init();
    }
    
    init() {
        this.createEmptyLines();
    }
    
    createEmptyLines() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.lines = [];
        
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
            this.animationTimeout = setTimeout(() => this.start(), 2000);
        }
    }
    
    async animateSnippet(snippetIndex) {
        const snippet = this.snippets[snippetIndex];
        if (!snippet || !snippet.code) return;
        
        const lines = snippet.code;
        const linesToShow = Math.min(lines.length, this.totalLines);
        
        // Clear existing lines
        await this.clearLines();
        
        // Type new lines
        for (let i = 0; i < linesToShow; i++) {
            if (lines[i] !== undefined) {
                await this.typeLine(i, lines[i]);
                await this.sleep(50);
            }
        }
        
        // Wait before clearing
        await this.sleep(2000);
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
            
            await this.sleep(20 + Math.random() * 15);
            
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
                await this.sleep(30);
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
            
            await this.sleep(15 + Math.random() * 10);
            
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
        
        let highlighted = text;
        
        // Apply syntax highlighting
        this.syntaxRules.forEach(rule => {
            highlighted = highlighted.replace(
                rule.regex,
                `<span class="${rule.className}">$1</span>`
            );
        });
        
        element.innerHTML = highlighted;
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
    
    handleResize() {
        // Adjust total lines based on container height
        if (this.container) {
            const containerHeight = this.container.clientHeight;
            const lineHeight = 20; // Approximate line height
            this.totalLines = Math.max(10, Math.floor(containerHeight / lineHeight) - 2);
            
            // Recreate lines with new count
            this.createEmptyLines();
            
            // Restart animation if it was running
            if (this.isAnimating) {
                this.pause();
                setTimeout(() => this.start(), 100);
            }
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

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
        document.body.classList.add('loaded');
    });
    
    // Handle service worker registration (optional)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
        });
    }
});