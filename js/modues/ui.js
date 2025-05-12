// ui.js - User interface components
import { initSearch } from './search.js';
import { initPricingSection } from './pricing.js';
import { initContactModal, openContactModal } from './contacts.js';
import UrlHandler from './url-handler.js';

// Create cards for different content types
export function createCard(item, hasPrivateChannel, privateChannelMap, cardId, config, categoryId) {
    const card = document.createElement('div');
    card.className = 'card';
    if (cardId) {
        card.id = cardId;
    }
    
    // Add attributes for search
    card.setAttribute('data-title', item.title.toLowerCase());
    card.setAttribute('data-description', item.description.toLowerCase());
    card.setAttribute('data-username', item.username.toLowerCase());
    
    // Create card header with logo and title
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    
    // Create logo
    const cardLogo = document.createElement('div');
    cardLogo.className = 'card-logo';
    
    // Check if logo exists
    if (item.logo) {
        const logoImg = document.createElement('img');
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        // Use logo path from config
        const logoPath = config.logoPath || 'logo/';
        logoImg.src = `${logoPath}${item.logo}?t=${timestamp}`;
        logoImg.alt = item.title;
        
        // Error handler for image loading
        logoImg.onerror = function() {
            // If image doesn't load, show placeholder
            this.style.display = 'none';
            
            // Get placeholder text from configuration
            let logoPlaceholder = 'TG';
            if (config && config.texts && config.texts.ui) {
                logoPlaceholder = config.texts.ui.logoPlaceholder || logoPlaceholder;
            }
            
            cardLogo.textContent = item.logoPlaceholder || logoPlaceholder;
        };
        
        cardLogo.appendChild(logoImg);
    } else {
        // If logo is not specified, use placeholder
        // Get placeholder text from configuration
        let logoPlaceholder = 'TG';
        if (config && config.texts && config.texts.ui) {
            logoPlaceholder = config.texts.ui.logoPlaceholder || logoPlaceholder;
        }
        
        cardLogo.textContent = item.logoPlaceholder || logoPlaceholder;
    }
    
    // Create title and username container
    const titleContainer = document.createElement('div');
    titleContainer.className = 'title-container';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = item.title;
    titleContainer.appendChild(title);
    
    // Add username
    if (item.username && categoryId !== 'private') {
        const usernameText = document.createElement('div');
        usernameText.className = 'username-text';
        usernameText.textContent = item.username;
        titleContainer.appendChild(usernameText);
    }
    
    // Create container for top buttons (to the right of the title)
    const headerButtons = document.createElement('div');
    headerButtons.className = 'header-buttons';
    
    // Add slug for URL navigation
    const slug = item.slug || (item.username ? item.username.replace('@', '') : item.title.toLowerCase().replace(/\s+/g, '-'));
    card.setAttribute('data-slug', slug);
    
    // Create "share" icon for URL
    const shareButton = document.createElement('a');
    shareButton.className = 'share-button-header';
    shareButton.href = 'javascript:void(0);';
    shareButton.innerHTML = '<i class="fas fa-link"></i>';
    
    // Get share button tooltip from configuration
    let shareButtonTooltip = 'Copy link';
    if (config && config.texts && config.texts.ui) {
        shareButtonTooltip = config.texts.ui.shareButton || shareButtonTooltip;
    }
    
    shareButton.title = shareButtonTooltip;
    
    // Add handler for copying URL
    shareButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Get URL for the element
        const url = UrlHandler.createUrl(slug);
        
        // Get success and error messages from configuration
        let copySuccessText = 'Copied!';
        let copyErrorText = 'Error copying';
        
        if (config && config.texts && config.texts.ui) {
            copySuccessText = config.texts.ui.copySuccess || copySuccessText;
            copyErrorText = config.texts.ui.copyError || copyErrorText;
        }
        
        // Copy to clipboard
        try {
            navigator.clipboard.writeText(url).then(() => {
                shareButton.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    shareButton.innerHTML = '<i class="fas fa-link"></i>';
                }, 2000);
            });
        } catch (error) {
            console.error('Error copying URL to clipboard:', error);
        }
    });
    
    // Add button to container
    headerButtons.appendChild(shareButton);

    // Add container for buttons to header (after cardLogo and titleContainer)
    cardHeader.appendChild(cardLogo);
    cardHeader.appendChild(titleContainer);
    cardHeader.appendChild(headerButtons);
    card.appendChild(cardHeader);
    
    // Add description
    const description = document.createElement('p');
    description.className = 'card-description';
    description.textContent = item.description;
    card.appendChild(description);
    
    // Add price information for private channels
    if (item.price) {
        const priceContainer = document.createElement('div');
        priceContainer.className = 'price-container';
        
        const priceTitle = document.createElement('h4');
        priceTitle.textContent = config.texts && config.texts.buttons ? config.texts.buttons.subscriptionOptions || 'Subscription Options:' : 'Subscription Options:';
        priceTitle.className = 'price-title';
        priceContainer.appendChild(priceTitle);
        
        const priceList = document.createElement('ul');
        priceList.className = 'price-list';
        
        if (item.price.month) {
            const monthItem = document.createElement('li');
            monthItem.innerHTML = `<span class="price-period">${config.texts && config.texts.buttons ? config.texts.buttons.month || '1 Month' : '1 Month'}:</span> <span class="price-value">${item.price.month}</span>`;
            priceList.appendChild(monthItem);
        }
        
        if (item.price.threeMonths) {
            const threeMonthsItem = document.createElement('li');
            threeMonthsItem.innerHTML = `<span class="price-period">${config.texts && config.texts.buttons ? config.texts.buttons.threeMonths || '3 Months' : '3 Months'}:</span> <span class="price-value">${item.price.threeMonths}</span>`;
            priceList.appendChild(threeMonthsItem);
        }
        
        if (item.price.lifetime) {
            const lifetimeItem = document.createElement('li');
            lifetimeItem.innerHTML = `<span class="price-period">${config.texts && config.texts.buttons ? config.texts.buttons.lifetime || 'Lifetime' : 'Lifetime'}:</span> <span class="price-value">${item.price.lifetime}</span>`;
            priceList.appendChild(lifetimeItem);
        }
        
        priceContainer.appendChild(priceList);
        card.appendChild(priceContainer);
    }
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'card-buttons';
    
    // Add ads price button if available
    if (item.ads) {
        const adsBtn = document.createElement('a');
        adsBtn.href = "javascript:void(0);";
        adsBtn.className = 'ads-btn';
        
        // Determine button text based on category
        let adsBtnText = config.texts && config.texts.buttons ? config.texts.buttons.ads || 'Ad Price' : 'Ad Price'; // Default text
        let adsPeriodText = config.texts && config.texts.buttons && config.texts.buttons.adsPeriods ? config.texts.buttons.adsPeriods : {
            '24h': '24 hours',
            'week': 'Week',
            'month': 'Month',
            'one': 'One mailing',
            'three': 'Three mailings',
            'ten': 'Ten mailings'
        };
        
        // If category-specific texts are available, use them
        if (config.texts && config.texts.categories && config.texts.categories[categoryId]) {
            if (config.texts.categories[categoryId].adButton) {
                adsBtnText = config.texts.categories[categoryId].adButton;
            }
        }
        
        // Ads icon and text
        adsBtn.innerHTML = `
            <i class="fas fa-ad"></i>
            <span>${adsBtnText}</span>
        `;
        
        // Create dropdown menu for ads prices
        const adsDropdown = document.createElement('div');
        adsDropdown.className = 'ads-dropdown';
        
        // Add prices to dropdown
        const pricesList = document.createElement('ul');
        pricesList.className = 'ads-prices-list';
        
        if (categoryId === 'shops') {
            // For shops, use the new keys
            if (item.ads['one']) {
                const oneItem = document.createElement('li');
                oneItem.innerHTML = `<span class="ads-period">${adsPeriodText['one'] || 'One mailing'}:</span> <span class="ads-price">$${item.ads['one']}</span>`;
                pricesList.appendChild(oneItem);
            }
            
            if (item.ads['three']) {
                const threeItem = document.createElement('li');
                threeItem.innerHTML = `<span class="ads-period">${adsPeriodText['three'] || 'Three mailings'}:</span> <span class="ads-price">$${item.ads['three']}</span>`;
                pricesList.appendChild(threeItem);
            }
            
            if (item.ads['ten']) {
                const tenItem = document.createElement('li');
                tenItem.innerHTML = `<span class="ads-period">${adsPeriodText['ten'] || 'Ten mailings'}:</span> <span class="ads-price">$${item.ads['ten']}</span>`;
                pricesList.appendChild(tenItem);
            }
        } else {
            // For channels and groups, use the original keys
            if (item.ads['24h']) {
                const dayItem = document.createElement('li');
                dayItem.innerHTML = `<span class="ads-period">${adsPeriodText['24h'] || '24 hours'}:</span> <span class="ads-price">$${item.ads['24h']}</span>`;
                pricesList.appendChild(dayItem);
            }
            
            if (item.ads.week) {
                const weekItem = document.createElement('li');
                weekItem.innerHTML = `<span class="ads-period">${adsPeriodText['week'] || 'Week'}:</span> <span class="ads-price">$${item.ads.week}</span>`;
                pricesList.appendChild(weekItem);
            }
            
            if (item.ads.month) {
                const monthItem = document.createElement('li');
                monthItem.innerHTML = `<span class="ads-period">${adsPeriodText['month'] || 'Month'}:</span> <span class="ads-price">$${item.ads.month}</span>`;
                pricesList.appendChild(monthItem);
            }
        }
        
        adsDropdown.appendChild(pricesList);
        
        // Add contact button to dropdown
        const contactBtn = document.createElement('a');
        contactBtn.href = "javascript:void(0);";
        contactBtn.className = 'ads-contact-btn';
        
        // Use different text for shops based on config
        let contactBtnText = config.texts && config.texts.buttons ? config.texts.buttons.contactUs || 'Contact Us' : 'Contact Us';
        if (config.texts && config.texts.categories && config.texts.categories[categoryId]) {
            if (config.texts.categories[categoryId].contactButton) {
                contactBtnText = config.texts.categories[categoryId].contactButton;
            }
        }
        
        contactBtn.innerHTML = `<i class="fas fa-envelope"></i> ${contactBtnText}`;
        contactBtn.onclick = function() {
            openContactModal();
        };
        
        adsDropdown.appendChild(contactBtn);
        
        // Toggle dropdown on click
        adsBtn.onclick = function() {
            this.classList.toggle('active');
            adsDropdown.classList.toggle('show');
        };
        
        // Add ads button and dropdown to container
        buttonsContainer.appendChild(adsBtn);
        buttonsContainer.appendChild(adsDropdown);
    }
    
    // Add private channel button if available
    if (hasPrivateChannel && item.privateChannel) {
        const privateBtn = document.createElement('a');
        
        // Check if there is a corresponding card in private channels
        const privateCardId = privateChannelMap[item.privateChannel.username];
        
        if (privateCardId) {
            // If there is a corresponding card, make button to switch to it
            privateBtn.href = "javascript:void(0);";
            privateBtn.onclick = function() {
                // Add class for button animation on click
                this.classList.add('btn-clicked');
                
                // Remove animation class after transition
                setTimeout(() => {
                    this.classList.remove('btn-clicked');
                    window.switchToPrivateTab(privateCardId);
                }, 300);
            };
        } else {
            // Otherwise, just a link to the Telegram channel
            privateBtn.href = item.privateChannel.link;
            privateBtn.target = '_blank';
        }
        
        privateBtn.className = 'private-btn';
        
        // Lock icon
        privateBtn.innerHTML = `
            <i class="fas fa-lock"></i>
            <span>${config.texts && config.texts.buttons ? config.texts.buttons.private || 'Private' : 'Private'}</span>
        `;
        
        // Add private button
        buttonsContainer.appendChild(privateBtn);
    }
    
    // Add username as a link if available
    if (item.username) {
        const usernameLink = document.createElement('a');
        usernameLink.href = item.link;
        usernameLink.textContent = item.username;
        usernameLink.target = '_blank';
        usernameLink.className = 'username-link';
        usernameLink.rel = 'noopener noreferrer';
        buttonsContainer.appendChild(usernameLink);
    } else {
        // Add main link button if no username
        const mainLink = document.createElement('a');
        mainLink.href = item.link;
        mainLink.textContent = config.texts && config.texts.buttons ? config.texts.buttons.visit || 'Visit' : 'Visit';
        mainLink.target = '_blank';
        mainLink.className = 'main-link';
        mainLink.rel = 'noopener noreferrer';
        buttonsContainer.appendChild(mainLink);
    }
    
    // Add buttons to card
    card.appendChild(buttonsContainer);
    
    return card;
}

// Initialize user interface
export function initUI(categories) {
    console.log('All category configs loaded successfully');
    console.log('Loaded categories:', categories);
    
    // Check that all categories are loaded correctly
    const channelsCategory = categories.find(cat => cat.id === 'channels');
    const shopsCategory = categories.find(cat => cat.id === 'shops');
    const groupsCategory = categories.find(cat => cat.id === 'groups');
    const privateCat = categories.find(cat => cat.id === 'private');
    const pricingCategory = categories.find(cat => cat.id === 'pricing');
    
    console.log('Channels category:', channelsCategory);
    console.log('Shops category:', shopsCategory);
    console.log('Groups category:', groupsCategory);
    console.log('Private category:', privateCat);
    console.log('Pricing category:', pricingCategory);
    
    // Store categories in the global config
    window.config.categories = categories;
    
    // Create a map of private channels to their IDs
    const privateChannelMap = {};
    
    // Find the private channels category
    const privateCategory = categories.find(cat => cat.id === 'private');
    if (privateCategory) {
        privateCategory.items.forEach((item, index) => {
            // Use username as key for mapping
            privateChannelMap[item.username] = `private-card-${index}`;
        });
    }
    
    // Generate cards for each category
    // Process categories in the correct order, corresponding to tabs
    const orderedCategories = [
        channelsCategory,
        shopsCategory,
        groupsCategory,
        privateCat,
        pricingCategory
    ];
    
    // Check that all categories exist
    orderedCategories.forEach((category, index) => {
        if (!category) {
            console.error(`Category at index ${index} is undefined!`);
            return;
        }
        
        console.log(`Processing category: ${category.id}, index: ${index}`);
        
        // Skip pricing category as it's handled differently
        if (category.id === 'pricing') {
            initPricingSection(category);
            return;
        }
        
        // Determine the correct contentId based on the category ID
        let contentId;
        if (category.id === 'channels') {
            contentId = 'content1';
        } else if (category.id === 'shops') {
            contentId = 'content2';
        } else if (category.id === 'groups') {
            contentId = 'content3';
        } else if (category.id === 'private') {
            contentId = 'content4';
        } else {
            contentId = `content${index + 1}`;
        }
        
        console.log(`Looking for content element with ID: ${contentId} for category ${category.id}`);
        
        const contentElement = document.getElementById(contentId);
        
        if (contentElement) {
            console.log(`Found content element for ${category.id}`);
            const cardsContainer = contentElement.querySelector('.link-cards');
            if (cardsContainer) {
                console.log(`Found cards container for ${category.id}`);
                cardsContainer.innerHTML = ''; // Clear container
                
                // Check that the category has items
                if (!category.items || category.items.length === 0) {
                    console.error(`Category ${category.id} has no items!`);
                    return;
                }
                
                console.log(`Category ${category.id} has ${category.items.length} items`);
                
                // Add cards
                category.items.forEach((item, itemIndex) => {
                    console.log(`Creating card for ${category.id}, item ${itemIndex}: ${item.title}`);
                    
                    // For private channels, add ID for navigation
                    const isPrivate = category.id === 'private';
                    const cardId = isPrivate ? `private-card-${itemIndex}` : `${category.id}-card-${itemIndex}`;
                    
                    // Pass category.id as a separate parameter
                    const card = createCard(item, category.id === 'channels', privateChannelMap, cardId, window.config, category.id);
                    cardsContainer.appendChild(card);
                    console.log(`Card for ${item.title} appended to container`);
                });
            } else {
                console.error(`Cards container not found for ${category.id}`);
            }
        } else {
            console.error(`Content element not found for ${category.id} with ID ${contentId}`);
        }
        
        // If the channels category is missing or empty, load it directly
        if (!channelsCategory || !channelsCategory.items || channelsCategory.items.length === 0) {
            console.log('Channels category is missing or empty, loading directly...');
            
            // Load channels.json directly
            fetch('config/channels.json')
                .then(response => {
                    console.log('Direct fetch channels.json response status:', response.status);
                    if (!response.ok) {
                        throw new Error(`HTTP error loading channels directly! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(channelsData => {
                    console.log('Channels loaded directly:', channelsData);
                    
                    if (channelsData && channelsData.items && channelsData.items.length > 0) {
                        // Update the channels category
                        orderedCategories[0] = channelsData;
                        
                        // Update the channels container
                        const contentElement = document.getElementById('content1');
                        if (contentElement) {
                            const cardsContainer = contentElement.querySelector('.link-cards');
                            if (cardsContainer) {
                                cardsContainer.innerHTML = ''; // Clear container
                                
                                // Add cards
                                channelsData.items.forEach((item, itemIndex) => {
                                    console.log(`Creating card for channels, item ${itemIndex}: ${item.title}`);
                                    
                                    const cardId = `channels-card-${itemIndex}`;
                                    
                                    // Create card
                                    const card = createCard(item, true, privateChannelMap, cardId, window.config, 'channels');
                                    cardsContainer.appendChild(card);
                                    console.log(`Card for ${item.title} appended to container`);
                                });
                            }
                        }
                    }
                })
                .catch(error => {
                    console.error('Error loading channels directly:', error);
                });
        }
    });
    
    // Initialize search
    initSearch(window.config);
    
    // Initialize "Back to top" button
    initBackToTopButton();
    
    // Initialize "Subscribe to all channels" button
    initSubscribeAllButton();
    
    // Initialize contact modal
    initContactModal();
    
    // Add URL hash handling for tabs
    document.querySelectorAll('.tab-label').forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Get category from data-tab attribute
            const tabType = tab.getAttribute('data-tab');
            const category = categories.find(cat => cat.id === tabType);
            
            // Update URL without calling external modules
            try {
                const shortSlug = tabType === 'channels' ? 'channels' : 
                                  tabType === 'shops' ? 'markets' : 
                                  tabType === 'groups' ? 'groups' : 
                                  tabType === 'private' ? 'private' : 
                                  tabType === 'pricing' ? 'ads' : tabType;
                
                history.replaceState(null, '', `#${shortSlug}`);
            } catch (error) {
                console.error('Error updating URL:', error);
            }
        });
    });
    
    // Handle URL on page load
    try {
        const hash = window.location.hash;
        if (hash) {
            const slug = hash.substring(1); // Remove # symbol
            let tabId = '';
            
            switch (slug) {
                case 'channels': tabId = 'tab1'; break; // channels
                case 'markets': tabId = 'tab2'; break; // shops (markets)
                case 'groups': tabId = 'tab3'; break; // groups
                case 'private': tabId = 'tab4'; break; // private
                case 'ads': tabId = 'tab5'; break; // ads (pricing)
                case 'contacts': 
                    // Scroll to contacts section
                    setTimeout(() => {
                        const contactsSection = document.querySelector('.footer-section:nth-child(2)');
                        if (contactsSection) {
                            contactsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            contactsSection.classList.add('highlighted');
                            setTimeout(() => {
                                contactsSection.classList.remove('highlighted');
                            }, 2000);
                        }
                    }, 300);
                    break;
                default:
                    // Check if there is a card with the same slug
                    const cardElement = document.querySelector(`[data-slug="${slug}"]`);
                    if (cardElement) {
                        // Determine which tab the card is on
                        // Find the parent tab-content
                        let parentTab = cardElement.closest('.tab-content');
                        if (parentTab) {
                            const tabId = parentTab.id;
                            // Determine the tab number based on the content ID
                            if (tabId === 'content1') {
                                document.getElementById('tab1').checked = true;
                            } else if (tabId === 'content2') {
                                document.getElementById('tab2').checked = true;
                            } else if (tabId === 'content3') {
                                document.getElementById('tab3').checked = true;
                            } else if (tabId === 'content4') {
                                document.getElementById('tab4').checked = true;
                            } else if (tabId === 'content5') {
                                document.getElementById('tab5').checked = true;
                            }
                        } else {
                            // Try to determine the tab based on the data-slug attribute
                            // Iterate through all categories
                            const categoryItems = categories.flatMap(category => category.items || []);
                            const foundItem = categoryItems.find(item => {
                                const itemSlug = item.slug || (item.username ? item.username.replace('@', '') : item.title.toLowerCase().replace(/\s+/g, '-'));
                                return itemSlug === slug;
                            });
                            
                            if (foundItem) {
                                // Determine the category of the item
                                const category = categories.find(cat => cat.items && cat.items.some(item => item === foundItem));
                                if (category) {
                                    // Switch to the corresponding tab
                                    if (category.id === 'channels') {
                                        document.getElementById('tab1').checked = true;
                                    } else if (category.id === 'shops') {
                                        document.getElementById('tab2').checked = true;
                                    } else if (category.id === 'groups') {
                                        document.getElementById('tab3').checked = true;
                                    } else if (category.id === 'private') {
                                        document.getElementById('tab4').checked = true;
                                    } else if (category.id === 'pricing') {
                                        document.getElementById('tab5').checked = true;
                                    }
                                }
                            }
                        }
                        
                        // Highlight the found card
                        cardElement.classList.add('highlighted');
                        setTimeout(() => {
                            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                    }
            }
            
            // If we need to switch tabs
            if (tabId) {
                const tabElement = document.getElementById(tabId);
                if (tabElement) {
                    tabElement.checked = true;
                }
            }
        }
    } catch (error) {
        console.error('Error processing URL hash:', error);
    }
    
    // Handler for switching tabs programmatically
    window.switchToPrivateTab = function(cardId) {
        // Activate private channels tab
        const tab4 = document.getElementById('tab4');
        if (tab4) {
            tab4.checked = true;
            
            // Give time for tab to display
            setTimeout(() => {
                // Find card and scroll to it
                const card = document.getElementById(cardId);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Add highlight to card for a short time
                    card.classList.add('highlight-card');
                    setTimeout(() => {
                        card.classList.remove('highlight-card');
                    }, 2000);
                }
            }, 100);
        }
    };
    
    // Show content
    const contentElement = document.getElementById('content');
    const loadingElement = document.getElementById('loading');
    
    if (contentElement) {
        // Get show content text from configuration
        let showContentText = 'Show content';
        if (window.config && window.config.texts && window.config.texts.ui && 
            window.config.texts.ui.loading) {
            showContentText = window.config.texts.ui.loading.show || showContentText;
        }
        console.log(showContentText);
        contentElement.style.display = 'block';
    }
    
    if (loadingElement) {
        // Get hide loading text from configuration
        let hideLoadingText = 'Hide loading';
        if (window.config && window.config.texts && window.config.texts.ui && 
            window.config.texts.ui.loading) {
            hideLoadingText = window.config.texts.ui.loading.hide || hideLoadingText;
        }
        console.log(hideLoadingText);
        loadingElement.style.display = 'none';
    }
    
    console.log('Window config after loading:', window.config);
}

// Function to update external links
export function updateExternalLinks(externalLinks) {
    const forumsListElement = document.querySelector('.forums-list');
    if (forumsListElement) {
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

// Function to initialize "Back to top" button
export function initBackToTopButton() {
    // Create "Back to top" button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top';
    backToTopBtn.className = 'back-to-top-btn';
    
    // Get button text from configuration
    let backToTopText = '';
    if (window.config && window.config.texts && window.config.texts.ui && 
        window.config.texts.ui.buttons) {
        backToTopText = window.config.texts.ui.buttons.backToTop || backToTopText;
    } else if (window.config && window.config.texts && window.config.texts.buttons) {
        // Fallback to the previous configuration structure
        backToTopText = window.config.texts.buttons.backToTop || backToTopText;
    }
    
    backToTopBtn.innerHTML = `<i class="fas fa-arrow-up"></i>`;
    
    // Add button to body
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top when button is clicked
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Function to initialize "Subscribe to all channels" button
export function initSubscribeAllButton() {
    const subscribeAllButton = document.getElementById('subscribe-all');
    const subscribeAllText = document.getElementById('subscribe-all-text');
    
    // Get default values from configuration
    let subscribeAllButtonText, subscribeAllButtonTitle;
    
    // Get button text from configuration
    if (window.config && window.config.texts && window.config.texts.buttons) {
        subscribeAllButtonText = window.config.texts.buttons.subscribeAll;
        subscribeAllButtonTitle = window.config.texts.buttons.subscribeAllTitle || window.config.texts.buttons.subscribeAll;
    }
    
    // Apply fallback values if not found in configuration
    subscribeAllButtonText = subscribeAllButtonText || "Subscribe to all channels";
    subscribeAllButtonTitle = subscribeAllButtonTitle || "Subscribe to all channels";
    
    if (subscribeAllButton) {
        // Set button text if text element exists
        if (subscribeAllText) {
            subscribeAllText.textContent = subscribeAllButtonText;
        }
        
        // Set button title
        subscribeAllButton.title = subscribeAllButtonTitle;
        
        // Show button with delay (5 seconds)
        setTimeout(function() {
            subscribeAllButton.classList.add('visible');
        }, 5000);
        
        // Add click event handler
        subscribeAllButton.addEventListener('click', function() {
            // Get URL to Telegram folder from config
            const telegramFolderUrl = window.config && window.config.telegramFolder 
                ? window.config.telegramFolder 
                : 'https://t.me/';
            
            // Open link in new window/tab
            window.open(telegramFolderUrl, '_blank');
        });
    }
}
