// config.js - загрузка и управление конфигурацией

// Загрузка конфигурации и инициализация
export function loadConfig() {
    return fetch('config/main.json')
        .then(response => {
            // Получаем текст о статусе запроса из конфигурации, если доступна
            const logMessage = window.config && window.config.texts && window.config.texts.config ? 
                window.config.texts.config.logs.fetchStatus.replace('{source}', 'main') : 
                'Fetch main config response status:';
            
            console.log(logMessage, response.status);
            
            if (!response.ok) {
                // Получаем текст ошибки из конфигурации, если доступна
                const errorMessage = window.config && window.config.texts && window.config.texts.config ? 
                    window.config.texts.config.errors.httpError.replace('{status}', response.status) : 
                    `HTTP error! Status: ${response.status}`;
                
                throw new Error(errorMessage);
            }
            return response.json();
        })
        .then(mainConfig => {
            // Получаем текст об успешной загрузке из конфигурации, если доступна
            const logMessage = mainConfig.texts && mainConfig.texts.config ? 
                mainConfig.texts.config.logs.mainConfigLoaded : 
                'Main config loaded successfully:';
                
            console.log(logMessage, mainConfig);
            
            // Save main config globally
            window.config = mainConfig;
            
            // Обновить UI на основе конфигурации
            updateUIFromConfig(mainConfig);
            
            // Now load all category files in parallel
            return Promise.all([
                loadCategoryConfig('channels'),
                loadCategoryConfig('shops'),
                loadCategoryConfig('groups'),
                loadCategoryConfig('private'),
                loadCategoryConfig('pricing')
            ]);
        });
}

// Функция загрузки категорий
export function loadCategoryConfig(categoryId) {
    // Получаем текст о попытке загрузки из конфигурации, если доступна
    const loadingMessage = window.config && window.config.texts && window.config.texts.config ? 
        window.config.texts.config.logs.loadingAttempt.replace('{category}', categoryId) : 
        `Attempting to load ${categoryId}.json from config directory...`;
    
    console.log(loadingMessage);
    
    return fetch(`config/${categoryId}.json`)
        .then(response => {
            // Получаем текст о статусе запроса из конфигурации, если доступна
            const logMessage = window.config && window.config.texts && window.config.texts.config ? 
                window.config.texts.config.logs.fetchStatus.replace('{source}', categoryId) : 
                `Fetch ${categoryId} config response status:`;
            
            console.log(logMessage, response.status);
            
            if (!response.ok) {
                // Получаем текст ошибки из конфигурации, если доступна
                const errorMessage = window.config && window.config.texts && window.config.texts.config ? 
                    window.config.texts.config.errors.categoryError
                        .replace('{category}', categoryId)
                        .replace('{status}', response.status) : 
                    `HTTP error loading ${categoryId}! Status: ${response.status}`;
                
                throw new Error(errorMessage);
            }
            return response.json();
        })
        .then(categoryConfig => {
            // Получаем тексты логов из конфигурации, если доступны
            const loadedMessage = window.config && window.config.texts && window.config.texts.config ? 
                window.config.texts.config.logs.categoryLoaded.replace('{category}', categoryId) : 
                `${categoryId} config loaded successfully:`;
                
            const itemsCountMessage = window.config && window.config.texts && window.config.texts.config ? 
                window.config.texts.config.logs.itemsCount.replace('{category}', categoryId) : 
                `Number of items in ${categoryId}:`;
            
            console.log(loadedMessage, categoryConfig);
            console.log(itemsCountMessage, categoryConfig.items ? categoryConfig.items.length : 0);
            
            return categoryConfig;
        })
        .catch(error => {
            // Получаем текст об ошибке загрузки из конфигурации, если доступна
            const errorMessage = window.config && window.config.texts && window.config.texts.config ? 
                window.config.texts.config.logs.errorLoading.replace('{category}', categoryId) : 
                `Error loading ${categoryId} configuration:`;
            
            console.error(errorMessage, error);
            
            // Получаем формат имени категории по умолчанию
            const format = window.config && window.config.texts && window.config.texts.config && 
                           window.config.texts.config.defaults.categoryNameFormat === 'capitalize' ? 
                           'capitalize' : 'default';
            
            // Формируем имя категории согласно формату
            let categoryName;
            if (format === 'capitalize') {
                categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
            } else {
                categoryName = categoryId;
            }
            
            // Return an empty category to prevent breaking the app
            return {
                id: categoryId,
                name: categoryName,
                items: []
            };
        });
}

// Обновление пользовательского интерфейса на основе конфигурации
function updateUIFromConfig(mainConfig) {
    // Set page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = mainConfig.title;
        
        // Получаем текст лога из конфигурации, если доступна
        const logMessage = mainConfig.texts && mainConfig.texts.config ? 
            mainConfig.texts.config.logs.pageTitleSet : 
            'Page title set to:';
        
        console.log(logMessage, mainConfig.title);
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
            
            // Set text for "Subscribe to all channels" button
            const subscribeAllText = document.getElementById('subscribe-all-text');
            if (subscribeAllText && mainConfig.texts.buttons && mainConfig.texts.buttons.subscribeAll) {
                subscribeAllText.textContent = mainConfig.texts.buttons.subscribeAll;
            }
            
            // Update "Back to top" button title if available
            const backToTopButton = document.getElementById('back-to-top');
            if (backToTopButton && mainConfig.texts.buttons && mainConfig.texts.buttons.backToTop) {
                backToTopButton.title = mainConfig.texts.buttons.backToTop;
            }
        }
    }
}
