/**
 * Content Protection System
 * This script implements multiple layers of protection against copying, 
 * screenshotting, and other content extraction methods.
 */

(function() {
    // Configuration
    const config = {
        enableCopyProtection: true,
        enableScreenshotProtection: true,
        enableRightClickProtection: true,
        enableDragProtection: true,
        enableDevToolsProtection: true,
        enableWatermark: true,
        enableContentBlurring: true,
        watermarkText: "MALWARE CORPORATION",
        watermarkOpacity: 0.15,
        warningMessage: "Content copying is prohibited"
    };
    
    // Initialize all protections
    function initProtection() {
        if (config.enableCopyProtection) {
            preventCopying();
        }
        
        if (config.enableRightClickProtection) {
            preventRightClick();
        }
        
        if (config.enableDragProtection) {
            preventDragging();
        }
        
        if (config.enableDevToolsProtection) {
            preventDevTools();
        }
        
        if (config.enableWatermark) {
            addWatermark();
        }
        
        if (config.enableScreenshotProtection) {
            implementScreenshotProtection();
        }
        
        if (config.enableContentBlurring) {
            implementContentBlurring();
        }
        
        // Additional protection for text selection
        preventTextSelection();
        
        // CSS injection for additional protection
        injectProtectionCSS();
    }
    
    // Prevent copying text
    function preventCopying() {
        // Disable copy, cut, paste events
        document.addEventListener('copy', function(e) {
            e.preventDefault();
            showWarning();
        });
        
        document.addEventListener('cut', function(e) {
            e.preventDefault();
            showWarning();
        });
        
        document.addEventListener('paste', function(e) {
            e.preventDefault();
            showWarning();
        });
        
        // Disable keyboard shortcuts for copy/paste
        document.addEventListener('keydown', function(e) {
            // Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+S, Ctrl+U, Ctrl+P, F12, PrintScreen
            if ((e.ctrlKey && (e.keyCode === 67 || e.keyCode === 88 || e.keyCode === 86 || 
                               e.keyCode === 83 || e.keyCode === 85 || e.keyCode === 80)) || 
                e.keyCode === 123 || e.keyCode === 44) {
                e.preventDefault();
                showWarning();
                return false;
            }
        });
    }
    
    // Prevent right-click context menu
    function preventRightClick() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showWarning();
        });
    }
    
    // Prevent dragging elements
    function preventDragging() {
        document.addEventListener('dragstart', function(e) {
            e.preventDefault();
            showWarning();
        });
    }
    
    // Prevent text selection
    function preventTextSelection() {
        // CSS approach is in injectProtectionCSS()
        
        // JS approach as backup
        document.addEventListener('selectstart', function(e) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
    }
    
    // Add dynamic watermark
    function addWatermark() {
        // Create watermark container
        const watermarkContainer = document.createElement('div');
        watermarkContainer.className = 'content-watermark';
        document.body.appendChild(watermarkContainer);
        
        // Create a pattern of watermarks
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        const watermarkDensity = 5; // Number of watermarks per row/column
        
        for (let i = 0; i < watermarkDensity; i++) {
            for (let j = 0; j < watermarkDensity; j++) {
                const watermark = document.createElement('div');
                watermark.className = 'watermark-text';
                watermark.textContent = config.watermarkText;
                watermark.style.left = `${(i / watermarkDensity) * 100}%`;
                watermark.style.top = `${(j / watermarkDensity) * 100}%`;
                watermark.style.opacity = config.watermarkOpacity;
                watermark.style.transform = `rotate(-30deg)`;
                watermarkContainer.appendChild(watermark);
            }
        }
        
        // Update watermark positions on resize
        window.addEventListener('resize', function() {
            // Clear existing watermarks
            watermarkContainer.innerHTML = '';
            
            // Re-create watermarks
            const newContainerWidth = window.innerWidth;
            const newContainerHeight = window.innerHeight;
            
            for (let i = 0; i < watermarkDensity; i++) {
                for (let j = 0; j < watermarkDensity; j++) {
                    const watermark = document.createElement('div');
                    watermark.className = 'watermark-text';
                    watermark.textContent = config.watermarkText;
                    watermark.style.left = `${(i / watermarkDensity) * 100}%`;
                    watermark.style.top = `${(j / watermarkDensity) * 100}%`;
                    watermark.style.opacity = config.watermarkOpacity;
                    watermark.style.transform = `rotate(-30deg)`;
                    watermarkContainer.appendChild(watermark);
                }
            }
        });
    }
    
    // Detect and prevent DevTools
    function preventDevTools() {
        // Method 1: Detect DevTools using window.outerWidth/Height vs innerWidth/Height
        const checkDevTools = function() {
            const threshold = 160;
            if (window.outerWidth - window.innerWidth > threshold || 
                window.outerHeight - window.innerHeight > threshold) {
                document.body.innerHTML = '<div class="devtools-warning">Developer tools detected. Access denied.</div>';
            }
        };
        
        window.addEventListener('resize', checkDevTools);
        setInterval(checkDevTools, 1000);
        
        // Method 2: Detect using debugger statement in a loop
        // This makes debugging difficult by triggering the debugger repeatedly
        setInterval(function() {
            debugger;
        }, 100);
        
        // Method 3: Console overriding
        const consoleProperties = ['log', 'debug', 'info', 'warn', 'error', 'dir', 'dirxml', 'trace', 'group', 'groupCollapsed', 'groupEnd', 'clear', 'count', 'countReset', 'assert', 'profile', 'profileEnd', 'time', 'timeLog', 'timeEnd', 'timeStamp', 'context', 'table'];
        
        for (const property of consoleProperties) {
            if (typeof console[property] === 'function') {
                console[property] = function() {
                    return false;
                };
            }
        }
    }
    
    // Implement screenshot protection
    function implementScreenshotProtection() {
        // Method 1: Canvas fingerprinting to detect screenshots
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, 1, 1);
        
        // Check for canvas manipulation
        setInterval(function() {
            const imageData = ctx.getImageData(0, 0, 1, 1).data;
            if (imageData[3] !== 26) { // 0.1 * 255 ≈ 26
                // Canvas has been tampered with, potentially for screenshot
                showWarning();
            }
        }, 1000);
        
        // Method 2: Detect visibility change (may indicate screenshot)
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                // Page is hidden, potentially for screenshot
                setTimeout(function() {
                    if (document.visibilityState === 'visible') {
                        // Quick hide-show pattern may indicate screenshot
                        showWarning();
                    }
                }, 100);
            }
        });
        
        // Method 3: Detect fullscreen changes (may indicate screenshot preparation)
        document.addEventListener('fullscreenchange', function() {
            showWarning();
        });
    }
    
    // Implement content blurring when focus is lost
    function implementContentBlurring() {
        window.addEventListener('blur', function() {
            document.body.classList.add('content-protected');
        });
        
        window.addEventListener('focus', function() {
            document.body.classList.remove('content-protected');
        });
    }
    
    // Show warning message
    function showWarning() {
        const warningElement = document.getElementById('copy-warning');
        
        if (!warningElement) {
            const warning = document.createElement('div');
            warning.id = 'copy-warning';
            warning.textContent = config.warningMessage;
            document.body.appendChild(warning);
            
            setTimeout(function() {
                warning.classList.add('show');
            }, 10);
            
            setTimeout(function() {
                warning.classList.remove('show');
                setTimeout(function() {
                    if (warning.parentNode) {
                        warning.parentNode.removeChild(warning);
                    }
                }, 500);
            }, 2000);
        }
    }
    
    // Inject CSS for protection
    function injectProtectionCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Prevent text selection */
            body {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            
            /* Allow text selection in inputs and textareas */
            input, textarea {
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                user-select: text;
            }
            
            /* Watermark styling */
            .content-watermark {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
                overflow: hidden;
            }
            
            .watermark-text {
                position: absolute;
                font-size: 24px;
                color: rgba(0, 0, 0, 0.7);
                pointer-events: none;
                font-family: Arial, sans-serif;
                white-space: nowrap;
            }
            
            /* Warning message */
            #copy-warning {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-100px);
                background-color: rgba(255, 0, 0, 0.8);
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 10000;
                transition: transform 0.3s ease-in-out;
                font-family: Arial, sans-serif;
                font-weight: bold;
            }
            
            #copy-warning.show {
                transform: translateX(-50%) translateY(0);
            }
            
            /* Content protection when window loses focus */
            body.content-protected .protected-content {
                filter: blur(10px);
            }
            
            /* DevTools warning */
            .devtools-warning {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #f00;
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 24px;
                font-family: Arial, sans-serif;
                z-index: 99999;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize protection when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProtection);
    } else {
        initProtection();
    }
})();
