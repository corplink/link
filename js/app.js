// app.js - основной файл инициализации (не модульная версия)
// Этот файл используется для поддержки работы с разными серверами

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, attempting to fetch config files...');
    
    // Global config object
    window.config = {};
    
    // Load main configuration file first
    fetch('config/main.json')
        .then(response => {
            console.log('Fetch main config response status:', response.status);
            if (!response.ok) {
                // Get error message from config if available, or use default
                const errorMessage = `HTTP error! Status: ${response.status}`;
                throw new Error(errorMessage);
            }
            return response.json();
        })
        .then(mainConfig => {
            console.log('Main config loaded successfully:', mainConfig);
            
            // Save main config globally
            window.config = mainConfig;
            
            // Set page title
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = mainConfig.title;
                
                // Get log message from config if available, or use default
                let pageTitleLogMessage = 'Page title set to:';
                if (mainConfig.texts && mainConfig.texts.config && 
                    mainConfig.texts.config.logs && mainConfig.texts.config.logs.pageTitleSet) {
                    pageTitleLogMessage = mainConfig.texts.config.logs.pageTitleSet;
                }
                console.log(pageTitleLogMessage, mainConfig.title);
            }
            
            // Set header and subtitle
            const headerElement = document.querySelector('h1');
            const subtitleElement = document.querySelector('header p');
            
            if (headerElement) {
                headerElement.textContent = mainConfig.title;
            }
            
            if (subtitleElement) {
                subtitleElement.textContent = mainConfig.subtitle;
            }
            
            // Set footer text
            const footerCopyright = document.getElementById('footer-copyright');
            if (footerCopyright) {
                footerCopyright.textContent = mainConfig.footer;
            }
            
            // Set "About catalog" text
            const aboutText = document.getElementById('about-text');
            if (aboutText && mainConfig.aboutText) {
                aboutText.textContent = mainConfig.aboutText;
            }
            
            // Set texts from "texts" section
            if (mainConfig.texts) {
                // Set search placeholder
                const searchInput = document.getElementById('search-input');
                if (searchInput && mainConfig.texts.search) {
                    searchInput.placeholder = mainConfig.texts.search;
                }
                
                // Set tab texts
                if (mainConfig.texts.tabs) {
                    document.querySelectorAll('.tab-label').forEach(label => {
                        const tabType = label.getAttribute('data-tab');
                        if (tabType && mainConfig.texts.tabs[tabType]) {
                            label.textContent = mainConfig.texts.tabs[tabType];
                        }
                    });
                }
                
                // Set footer texts
                if (mainConfig.texts.footer) {
                    // Section headers
                    const aboutTitle = document.getElementById('footer-about-title');
                    if (aboutTitle && mainConfig.texts.footer.about) {
                        aboutTitle.textContent = mainConfig.texts.footer.about;
                    }
                    
                    const contactsTitle = document.getElementById('footer-contacts-title');
                    if (contactsTitle && mainConfig.texts.footer.contacts) {
                        contactsTitle.textContent = mainConfig.texts.footer.contacts;
                    }
                    
                    const forumsTitle = document.getElementById('footer-forums-title');
                    if (forumsTitle && mainConfig.texts.footer.forums) {
                        forumsTitle.textContent = mainConfig.texts.footer.forums;
                    }
                }
            }
            
            // Set contact information
            if (mainConfig.contactInfo) {
                updateContactInfo(mainConfig.contactInfo);
            }
            
            // Set external links
            if (mainConfig.externalLinks) {
                updateExternalLinks(mainConfig.externalLinks);
            }
            
            // Load each category configuration
            return Promise.all([
                loadCategoryConfig('channels'),
                loadCategoryConfig('shops'),
                loadCategoryConfig('groups'),
                loadCategoryConfig('private'),
                loadCategoryConfig('pricing')
            ]);
        })
        .then(categories => {
            // Processing all further functions from script.js
            // For brevity, you can just copy the content of script.js here
            // In this version, it will be the same functionality as in the modular structure,
            // but without dividing into modules
            console.log('Loaded categories:', categories);
            
            // In a real implementation, you will need to copy code from script.js here
            // but without the initial event listener as we are already inside it
            
            // To maintain functionality, it's better to keep a reference to the original script.js
            const scriptTag = document.createElement('script');
            scriptTag.src = 'script.js';
            document.body.appendChild(scriptTag);
        })
        .catch(error => {
            console.error('Error loading configuration:', error);
            
            // Get error messages from config if available
            let errorTitle = 'Error loading configuration';
            let checkConsoleText = 'Check browser console for more details';
            
            if (window.config && window.config.texts && window.config.texts.config && 
                window.config.texts.config.errors) {
                errorTitle = window.config.texts.config.errors.errorTitle || errorTitle;
                checkConsoleText = window.config.texts.config.errors.checkConsole || checkConsoleText;
            }
            
            // Display error on page for better visibility
            document.body.innerHTML += `<div style="color: red; background: black; padding: 20px; margin: 20px; border: 2px solid red; position: fixed; top: 0; left: 0; z-index: 9999;">
                <h2>${errorTitle}</h2>
                <p>${error.message}</p>
                <p>${checkConsoleText}</p>
            </div>`;
        });
    
    // Function to load a category config file
    function loadCategoryConfig(categoryId) {
        // Get log message from config if available, or use default
        let loadingAttemptMessage = `Attempting to load ${categoryId}.json from config directory...`;
        if (window.config && window.config.texts && window.config.texts.config && 
            window.config.texts.config.logs && window.config.texts.config.logs.loadingAttempt) {
            loadingAttemptMessage = window.config.texts.config.logs.loadingAttempt.replace('{category}', categoryId);
        }
        console.log(loadingAttemptMessage);
        
        return fetch(`config/${categoryId}.json`)
            .then(response => {
                // Get log message from config if available, or use default
                let fetchStatusMessage = `Fetch ${categoryId} config response status:`;
                if (window.config && window.config.texts && window.config.texts.config && 
                    window.config.texts.config.logs && window.config.texts.config.logs.fetchStatus) {
                    fetchStatusMessage = window.config.texts.config.logs.fetchStatus.replace('{source}', categoryId);
                }
                console.log(fetchStatusMessage, response.status);
                
                if (!response.ok) {
                    // Get error message from config if available, or use default
                    let errorMessage = `HTTP error loading ${categoryId}! Status: ${response.status}`;
                    if (window.config && window.config.texts && window.config.texts.config && 
                        window.config.texts.config.errors && window.config.texts.config.errors.categoryError) {
                        errorMessage = window.config.texts.config.errors.categoryError
                            .replace('{category}', categoryId)
                            .replace('{status}', response.status);
                    }
                    throw new Error(errorMessage);
                }
                return response.json();
            })
            .then(categoryConfig => {
                // Get log messages from config if available, or use defaults
                let categoryLoadedMessage = `${categoryId} config loaded successfully:`;
                let itemsCountMessage = `Number of items in ${categoryId}:`;
                
                if (window.config && window.config.texts && window.config.texts.config && 
                    window.config.texts.config.logs) {
                    if (window.config.texts.config.logs.categoryLoaded) {
                        categoryLoadedMessage = window.config.texts.config.logs.categoryLoaded.replace('{category}', categoryId);
                    }
                    if (window.config.texts.config.logs.itemsCount) {
                        itemsCountMessage = window.config.texts.config.logs.itemsCount.replace('{category}', categoryId);
                    }
                }
                
                console.log(categoryLoadedMessage, categoryConfig);
                console.log(itemsCountMessage, categoryConfig.items ? categoryConfig.items.length : 0);
                return categoryConfig;
            })
            .catch(error => {
                // Get error message from config if available, or use default
                let errorLoadingMessage = `Error loading ${categoryId} configuration:`;
                if (window.config && window.config.texts && window.config.texts.config && 
                    window.config.texts.config.logs && window.config.texts.config.logs.errorLoading) {
                    errorLoadingMessage = window.config.texts.config.logs.errorLoading.replace('{category}', categoryId);
                }
                
                console.error(errorLoadingMessage, error);
                
                // Get default formatting option from config if available
                let nameFormat = 'capitalize';
                if (window.config && window.config.texts && window.config.texts.config && 
                    window.config.texts.config.defaults && window.config.texts.config.defaults.categoryNameFormat) {
                    nameFormat = window.config.texts.config.defaults.categoryNameFormat;
                }
                
                // Format category name based on config
                let formattedName = categoryId;
                if (nameFormat === 'capitalize') {
                    formattedName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
                }
                
                // Return an empty category to prevent breaking the app
                return {
                    id: categoryId,
                    name: formattedName,
                    items: []
                };
            });
    }
    
    // Function to update contact information
    function updateContactInfo(contactInfo) {
        const contactLabels = document.querySelectorAll('.contact-label');
        const contactValues = document.querySelectorAll('.contact-value');
        
        // Update labels
        contactLabels.forEach(label => {
            const contactType = label.getAttribute('data-contact-type');
            if (contactType && window.config.texts && window.config.texts.footer && 
                window.config.texts.footer.contactLabels && window.config.texts.footer.contactLabels[contactType]) {
                label.textContent = window.config.texts.footer.contactLabels[contactType];
            }
        });
        
        // Update values
        contactValues.forEach(value => {
            const contactType = value.previousElementSibling.getAttribute('data-contact-type');
            if (contactType && contactInfo[contactType]) {
                // Set visible part (truncated if needed)
                const fullValue = contactInfo[contactType];
                let displayValue = fullValue;
                
                // Get truncation settings from config if available
                let maxLength = 30;
                let startChars = 15;
                let endChars = 10;
                let separator = '...';
                
                if (window.config && window.config.texts && window.config.texts.contacts && 
                    window.config.texts.contacts.truncation) {
                    maxLength = window.config.texts.contacts.truncation.maxLength || maxLength;
                    startChars = window.config.texts.contacts.truncation.startChars || startChars;
                    endChars = window.config.texts.contacts.truncation.endChars || endChars;
                    separator = window.config.texts.contacts.truncation.separator || separator;
                }
                
                // Truncate long values
                if (fullValue.length > maxLength && contactType !== 'tox') {
                    displayValue = fullValue.substring(0, startChars) + separator + 
                                  fullValue.substring(fullValue.length - endChars);
                } else if (contactType === 'tox') {
                    // Special formatting for Tox ID
                    displayValue = fullValue;
                }
                
                value.textContent = displayValue;
                value.setAttribute('data-full', fullValue);
                
                // Show the contact item
                const contactItem = value.closest('.contact-item');
                if (contactItem) {
                    contactItem.style.display = 'flex';
                    // Add data-contact-type attribute to the parent element
                    contactItem.setAttribute('data-contact-type', contactType);
                }
            } else {
                // Hide the contact item if no value or if it starts with underscore (commented out)
                const contactItem = value.closest('.contact-item');
                if (contactItem) {
                    if (contactType && contactType.startsWith('_')) {
                        contactItem.style.display = 'none';
                    } else if (!contactInfo[contactType]) {
                        contactItem.style.display = 'none';
                    }
                }
            }
        });
    }
    
    // Function to update external links
    function updateExternalLinks(externalLinks) {
        const forumsListElement = document.querySelector('.forums-list');
        if (forumsListElement && externalLinks && externalLinks.length > 0) {
            forumsListElement.innerHTML = '';
            
            externalLinks.forEach(link => {
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.target = '_blank';
                linkElement.innerHTML = `<i class="${link.icon}"></i> ${link.name}`;
                forumsListElement.appendChild(linkElement);
            });
        }
    }
});
