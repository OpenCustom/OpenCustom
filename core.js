(function() {
    'use strict';
    
    class CodeAnimator {
        constructor() {
            this.currentSnippetIndex = 0;
            this.isAnimating = false;
            this.codeSnippets = [];
            this.linesWrapper = null;
            this.totalLines = 20;
            this.currentLines = [];
            
            this.syntaxRules = [
                // Comments
                { regex: /(\/\/.*)/g, className: 'code_comment' },
                { regex: /(\/\*[\s\S]*?\*\/)/g, className: 'code_comment' },
                // Strings
                { regex: /(["'`](?:[^"'`\\]|\\.)*["'`])/g, className: 'code_string' },
                // Keywords
                { regex: /\b(import|from|export|default|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|interface|type|namespace|module|declare|async|await|try|catch|finally|throw|new|this|super|static|public|private|protected|readonly|abstract|override|in|of|typeof|instanceof)\b/g, className: 'code_keyword' },
                // Types
                { regex: /\b(string|number|boolean|any|void|null|undefined|never|unknown|object|Array|Promise|Date|Error|Record|Partial|Required|Readonly|Pick|Omit|ReturnType)\b/g, className: 'code_type' },
                // React/TypeScript specific
                { regex: /\b(React\.FC|useState|useEffect|useCallback|useMemo|useRef|useReducer|useContext|useQuery|useMutation|queryClient|console\.log|JSON\.parse|JSON\.stringify|fetch|localStorage|sessionStorage)\b/g, className: 'code_function' },
                // Numbers
                { regex: /\b(\d+(\.\d+)?)\b/g, className: 'code_number' },
                // Operators
                { regex: /([=+\-*/%&|^~!<>?:]+)/g, className: 'code_operator' },
                // Constants (ALL_CAPS)
                { regex: /\b([A-Z_][A-Z0-9_]+)\b/g, className: 'code_type' }
            ];
        }
        
        init() {
            this.linesWrapper = document.querySelector('.main_content__right-side-code_section-lines_wrapper');
            if (!this.linesWrapper) return;
            
            this.loadCodeSnippets().then(() => {
                this.createEmptyLines();
                setTimeout(() => this.animateCode(), 1000);
            }).catch(error => {
                console.error('Failed to load snippets:', error);
                this.useDefaultSnippets();
                this.createEmptyLines();
                setTimeout(() => this.animateCode(), 1000);
            });
        }
        
        loadCodeSnippets() {
            return fetch('./assets/json/code.json')
                .then(response => {
                    if (!response.ok) throw new Error('Failed to load code.json');
                    return response.json();
                })
                .then(data => {
                    this.codeSnippets = data.codeSnippets || [];
                });
        }
        
        useDefaultSnippets() {
            this.codeSnippets = [
                {
                    language: 'TypeScript',
                    description: 'Default code',
                    code: [
                        "import React, { useState, useEffect } from 'react';",
                        "import { useQuery, useMutation } from '@tanstack/react-query';",
                        "",
                        "interface UserData {",
                        "  id: string;",
                        "  name: string;",
                        "  email: string;",
                        "  createdAt: Date;",
                        "}",
                        "",
                        "const UserDashboard: React.FC = () => {",
                        "  const [filter, setFilter] = useState('active');",
                        "  const [page, setPage] = useState(1);",
                        "",
                        "  const { data: users, isLoading } = useQuery({",
                        "    queryKey: ['users', filter, page],",
                        "    queryFn: fetchUsers,",
                        "  });",
                        "",
                        "  const updateUser = useMutation({",
                        "    mutationFn: updateUserData,",
                        "    onSuccess: () => {",
                        "      queryClient.invalidateQueries({ queryKey: ['users'] });",
                        "    },",
                        "  });",
                        "",
                        "  if (isLoading) return <Loader />;",
                        "  return (",
                        "    <div className='dashboard'>",
                        "      <UserTable users={users} />",
                        "    </div>",
                        "  );",
                        "};"
                    ]
                }
            ];
        }
        
        createEmptyLines() {
            this.linesWrapper.innerHTML = '';
            this.currentLines = [];
            
            for (let i = 1; i <= this.totalLines; i++) {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'code_line';
                
                const numberDiv = document.createElement('div');
                numberDiv.className = 'code_line_number';
                numberDiv.textContent = i;
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'code_line_content';
                
                lineDiv.appendChild(numberDiv);
                lineDiv.appendChild(contentDiv);
                this.linesWrapper.appendChild(lineDiv);
                
                this.currentLines.push({
                    element: contentDiv,
                    text: '',
                    isEmpty: true
                });
            }
        }
        
        createHighlightedElements(text) {
            if (!text) return [];
            
            const elements = [];
            
            const matches = [];
            
            for (const rule of this.syntaxRules) {
                const regex = new RegExp(rule.regex.source, rule.regex.flags);
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    let isInside = false;
                    for (const existingMatch of matches) {
                        if (match.index >= existingMatch.start && match.index + match[0].length <= existingMatch.end) {
                            isInside = true;
                            break;
                        }
                    }
                    
                    if (!isInside) {
                        matches.push({
                            text: match[0],
                            start: match.index,
                            end: match.index + match[0].length,
                            className: rule.className
                        });
                    }
                }
            }
            
            matches.sort((a, b) => a.start - b.start);
            
            let position = 0;
            
            for (const match of matches) {
                if (match.start > position) {
                    const beforeText = text.substring(position, match.start);
                    if (beforeText) {
                        elements.push(document.createTextNode(beforeText));
                    }
                }
                
                const span = document.createElement('span');
                span.className = match.className;
                span.textContent = match.text;
                elements.push(span);
                
                position = match.end;
            }
            
            if (position < text.length) {
                const remainingText = text.substring(position);
                if (remainingText) {
                    elements.push(document.createTextNode(remainingText));
                }
            }
            
            return elements;
        }
        
        async typeLine(lineIndex, text) {
            const line = this.currentLines[lineIndex];
            if (!line) return;
            
            const element = line.element;
            element.classList.add('cursor');
            
            element.innerHTML = '';
            line.text = '';
            
            for (let i = 0; i <= text.length; i++) {
                const currentText = text.substring(0, i);
                
                element.innerHTML = '';
                const highlightedElements = this.createHighlightedElements(currentText);
                
                highlightedElements.forEach(el => {
                    element.appendChild(el);
                });
                
                const cursorSpan = document.createElement('span');
                cursorSpan.className = 'code_cursor';
                cursorSpan.textContent = '|';
                element.appendChild(cursorSpan);
                
                line.text = currentText;
                
                await this.sleep(30 + Math.random() * 20);
            }
            
            element.classList.remove('cursor');
            element.querySelector('.code_cursor')?.remove();
            
            await this.sleep(100);
        }
        
        async eraseLine(lineIndex) {
            const line = this.currentLines[lineIndex];
            if (!line || !line.text) return;
            
            const element = line.element;
            element.classList.add('cursor');
            
            const text = line.text;
            
            for (let i = text.length; i >= 0; i--) {
                const currentText = text.substring(0, i);
                
                element.innerHTML = '';
                const highlightedElements = this.createHighlightedElements(currentText);
                
                highlightedElements.forEach(el => {
                    element.appendChild(el);
                });
                
                const cursorSpan = document.createElement('span');
                cursorSpan.className = 'code_cursor';
                cursorSpan.textContent = '|';
                element.appendChild(cursorSpan);
                
                line.text = currentText;
                
                await this.sleep(20 + Math.random() * 10);
            }
            
            element.classList.remove('cursor');
            element.innerHTML = '';
            line.text = '';
            line.isEmpty = true;
            
            await this.sleep(50);
        }
        
        async animateCode() {
            if (this.isAnimating || this.codeSnippets.length === 0) return;
            this.isAnimating = true;
            
            const snippet = this.codeSnippets[this.currentSnippetIndex];
            const codeLines = snippet.code || [];
            const linesToShow = Math.min(codeLines.length, this.totalLines);
            
            for (let i = 0; i < linesToShow; i++) {
                if (codeLines[i] !== undefined) {
                    await this.typeLine(i, codeLines[i]);
                }
            }
            
            await this.sleep(3000);
            
            for (let i = linesToShow - 1; i >= 0; i--) {
                if (codeLines[i] !== undefined) {
                    await this.eraseLine(i);
                }
            }
            
            await this.sleep(800);
            
            this.currentSnippetIndex = (this.currentSnippetIndex + 1) % this.codeSnippets.length;
            this.isAnimating = false;
            
            setTimeout(() => this.animateCode(), 500);
        }
        
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }
    
    const style = document.createElement('style');
    style.textContent = `
        .code_cursor {
            color: #569cd6;
            font-weight: bold;
            animation: blink 1s infinite;
            display: inline;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    window.CodeAnimator = new CodeAnimator();
})();