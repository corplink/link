// pricing.js - pricing section functionality
import { openContactModal } from './contacts.js';
import { updateDiscountInfo, updatePriceLabels, initCalculator, calculatePrice } from './pricing_calculator.js';

// Initialize pricing section
export function initPricingSection(pricingCategory) {
    if (pricingCategory && pricingCategory.items) {
        const pricingCardsContainer = document.querySelector('.pricing-cards');
        if (pricingCardsContainer) {
            // Clear container
            pricingCardsContainer.innerHTML = '';
            
            // Add pricing cards
            pricingCategory.items.forEach(option => {
                const card = createPricingCard(option);
                pricingCardsContainer.appendChild(card);
            });
        }
    }
}

// Function to create a pricing card
export function createPricingCard(option) {
    const card = document.createElement('div');
    card.className = 'pricing-card';
    
    // Add fullWidth class if specified
    if (option.fullWidth) {
        card.classList.add('full-width');
    }
    
    // Create title
    const title = document.createElement('h3');
    title.className = 'pricing-card-title';
    title.textContent = option.title;
    card.appendChild(title);
    
    // Create price
    const price = document.createElement('div');
    price.className = 'pricing-card-price';
    price.textContent = option.price;
    card.appendChild(price);
    
    // Create description
    const description = document.createElement('p');
    description.className = 'pricing-card-description';
    description.textContent = option.description;
    card.appendChild(description);
    
    // Create features list
    if (option.features && option.features.length > 0) {
        const featuresList = document.createElement('ul');
        featuresList.className = 'pricing-features';
        
        option.features.forEach(feature => {
            const featureItem = document.createElement('li');
            
            // Add icon
            const icon = document.createElement('i');
            icon.className = 'fas fa-check';
            featureItem.appendChild(icon);
            
            // Add feature text
            const featureText = document.createTextNode(feature);
            featureItem.appendChild(featureText);
            
            featuresList.appendChild(featureItem);
        });
        
        card.appendChild(featuresList);
    }
    
    // Create button based on option type
    if (option.isCalculator) {
        // Create calculator
        createCalculator(card);
    } else {
        // Create contact button
        const contactButton = document.createElement('button');
        contactButton.className = 'pricing-contact-btn';
        contactButton.textContent = window.config.texts && window.config.texts.buttons ? window.config.texts.buttons.contactUs || 'Contact Us' : 'Contact Us';
        
        if (option.contactModal) {
            // Open modal window with contacts
            contactButton.addEventListener('click', openContactModal);
        } else if (option.contactLink) {
            // Open external link
            contactButton.addEventListener('click', function() {
                window.open(option.contactLink, '_blank');
            });
        }
        
        card.appendChild(contactButton);
    }
    
    return card;
}

// Function to create calculator for a card
export function createCalculator(card) {
    // Get calculator texts from configuration
    let calculatorTitle = 'Custom Calculator';
    let calculatorPrice = 'Calculate';
    let calculatorDescription = 'Calculate advertising cost based on your parameters';
    let calculatorFeatures = [
        'Select channels for placement',
        'Specify placement duration',
        'Add additional options',
        'Get instant cost calculation',
        'Custom conditions for regular clients'
    ];
    
    // Load texts from configuration if available
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.pricingCardText) {
        const cardTexts = window.config.texts.buttons.calculator.pricingCardText;
        calculatorTitle = cardTexts.title || calculatorTitle;
        calculatorPrice = cardTexts.price || calculatorPrice;
        calculatorDescription = cardTexts.description || calculatorDescription;
        calculatorFeatures = cardTexts.features || calculatorFeatures;
    }
    
    // Update texts in the card
    const titleElement = card.querySelector('.pricing-card-title');
    if (titleElement) {
        titleElement.textContent = calculatorTitle;
    }
    
    const priceElement = card.querySelector('.pricing-card-price');
    if (priceElement) {
        priceElement.textContent = calculatorPrice;
    }
    
    const descriptionElement = card.querySelector('.pricing-card-description');
    if (descriptionElement) {
        descriptionElement.textContent = calculatorDescription;
    }
    
    // Update features list
    const featuresElement = card.querySelector('.pricing-features');
    if (featuresElement && calculatorFeatures.length > 0) {
        let featuresHtml = '';
        calculatorFeatures.forEach(feature => {
            featuresHtml += `<li><i class="fas fa-check"></i>${feature}</li>`;
        });
        featuresElement.innerHTML = featuresHtml;
    }
    
    // Create main calculator container
    const calcContainer = document.createElement('div');
    calcContainer.className = 'calculator-container';
    
    // Create top section (three blocks)
    const topSection = document.createElement('div');
    topSection.className = 'calculator-top-section';
    
    // Create left column - platform selection
    const channelsSection = document.createElement('div');
    channelsSection.className = 'calc-section channels-section';
    
    // Get platform selection title text from configuration
    let selectPlatformsText = 'Select platforms:';
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.sectionTitles) {
        selectPlatformsText = window.config.texts.buttons.calculator.sectionTitles.selectPlatforms || selectPlatformsText;
    }
    
    const channelsTitle = document.createElement('h4');
    channelsTitle.textContent = selectPlatformsText;
    channelsSection.appendChild(channelsTitle);
    
    const calcTabs = document.createElement('div');
    calcTabs.className = 'calc-tabs';
    
    // Get tab texts from configuration
    let channelTypes = [
        { id: 'channels', text: 'Channels' },
        { id: 'groups', text: 'Groups' },
        { id: 'shops', text: 'Shops' }
    ];
    
    // Try to load tab texts from configuration
    if (window.config && window.config.texts && window.config.texts.tabs) {
        channelTypes = [
            { id: 'channels', text: window.config.texts.tabs.channels || 'Channels' },
            { id: 'groups', text: window.config.texts.tabs.groups || 'Groups' },
            { id: 'shops', text: window.config.texts.tabs.shops || 'Shops' }
        ];
    }
    
    channelTypes.forEach((type, index) => {
        const tab = document.createElement('div');
        tab.className = 'calc-tab' + (index === 0 ? ' active' : '');
        tab.dataset.type = type.id;
        tab.textContent = type.text;
        tab.addEventListener('click', function() {
            document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.channels-list').forEach(list => {
                list.style.display = 'none';
            });
            
            document.getElementById(`${type.id}-list`).style.display = 'block';
            
            // Show/hide appropriate duration selector
            const isShop = type.id === 'shops';
            document.getElementById('duration-select').style.display = isShop ? 'none' : 'block';
            document.getElementById('shop-duration-select').style.display = isShop ? 'block' : 'none';
        });
        
        calcTabs.appendChild(tab);
    });
    
    channelsSection.appendChild(calcTabs);
    
    // Create container for channel list
    const allChannelsContainer = document.createElement('div');
    allChannelsContainer.className = 'all-channels-container';
    allChannelsContainer.id = 'all-channels-container';
    
    // Create channel lists
    createChannelLists(allChannelsContainer, channelTypes);
    
    channelsSection.appendChild(allChannelsContainer);
    topSection.appendChild(channelsSection);
    
    // Create middle column - duration and options selection
    const optionsSection = document.createElement('div');
    optionsSection.className = 'calc-section options-section';
    
    // Get duration selection title text from configuration
    let selectDurationText = 'Select duration:';
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.sectionTitles) {
        selectDurationText = window.config.texts.buttons.calculator.sectionTitles.selectDuration || selectDurationText;
    }
    
    const durationTitle = document.createElement('h4');
    durationTitle.textContent = selectDurationText;
    optionsSection.appendChild(durationTitle);
    
    const durationSelect = document.createElement('select');
    durationSelect.id = 'duration-select';
    
    const durationsForChannels = [
        { value: '24h', text: '24 hours', dataKey: 'price24h' },
        { value: 'week', text: 'Week', dataKey: 'priceWeek' },
        { value: 'month', text: 'Month', dataKey: 'priceMonth' }
    ];
    
    durationsForChannels.forEach(duration => {
        const option = document.createElement('option');
        option.value = duration.value;
        option.textContent = duration.text;
        option.dataset.key = duration.dataKey;
        durationSelect.appendChild(option);
    });
    
    optionsSection.appendChild(durationSelect);
    
    // Create select for shop duration selection
    const shopDurationSelect = document.createElement('select');
    shopDurationSelect.id = 'shop-duration-select';
    shopDurationSelect.className = 'duration-select';
    shopDurationSelect.style.display = 'none'; // Initially hidden
    
    // Get shop duration selection title text from configuration
    let shopDurationText = 'Select number of mailings:';
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.sectionTitles) {
        shopDurationText = window.config.texts.buttons.calculator.sectionTitles.shopDuration || shopDurationText;
    }
    
    shopDurationSelect.setAttribute('data-title', shopDurationText);
    
    const durationsForShops = [
        { value: 'one', text: 'One mailing', dataKey: 'priceOne' },
        { value: 'three', text: 'Three mailings', dataKey: 'priceThree' },
        { value: 'ten', text: 'Ten mailings', dataKey: 'priceTen' }
    ];
    
    durationsForShops.forEach(duration => {
        const option = document.createElement('option');
        option.value = duration.value;
        option.textContent = duration.text;
        option.dataset.key = duration.dataKey;
        shopDurationSelect.appendChild(option);
    });
    
    optionsSection.appendChild(shopDurationSelect);
    
    // Create additional options section
    const optionsTitle = document.createElement('h4');
    // Get additional options title text from configuration
    let additionalOptionsText = 'Additional options:';
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.sectionTitles) {
        additionalOptionsText = window.config.texts.buttons.calculator.sectionTitles.additionalOptions || additionalOptionsText;
    }
    optionsTitle.textContent = additionalOptionsText;
    optionsSection.appendChild(optionsTitle);
    
    // Create options list
    const options = [
        { id: 'pinned', text: 'Pinned post', price: 50 },
        { id: 'promo', text: 'Promotional text under each post', price: 100 },
        { id: 'analytics', text: 'Advanced analytics', price: 75 },
        { id: 'noAd', text: 'Placement without "ad" mark', price: 50 },
        { id: 'noCompetitors', text: 'Placement without competitors', price: 50 },
        { id: 'utm', text: 'UTM tag and link tracking support', price: 30 }
    ];
    
    // Load options from configuration if available
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.options) {
        options.forEach(opt => {
            const optionText = window.config.texts.buttons.calculator.options[opt.id] || opt.text;
            opt.text = optionText;
        });
    }
    
    options.forEach(opt => {
        const optItem = document.createElement('div');
        optItem.className = 'option-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `option-${opt.id}`;
        checkbox.dataset.price = opt.price;
        
        const label = document.createElement('label');
        label.htmlFor = `option-${opt.id}`;
        label.innerHTML = `${opt.text} <span class="price">+$${opt.price}</span>`;
        
        optItem.appendChild(checkbox);
        optItem.appendChild(label);
        optionsSection.appendChild(optItem);
    });
    
    topSection.appendChild(optionsSection);
    
    // Create right column - discount system
    const discountSection = document.createElement('div');
    discountSection.className = 'calc-section discount-section';
    
    // Get discount system title text from configuration
    let discountSystemText = 'Discount system:';
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.sectionTitles) {
        discountSystemText = window.config.texts.buttons.calculator.sectionTitles.discountSystem || discountSystemText;
    }
    
    const discountTitle = document.createElement('h4');
    discountTitle.textContent = discountSystemText;
    discountSection.appendChild(discountTitle);
    
    // Get discount texts from configuration
    let discount3to5Text = '3-5 platforms:';
    let discount6to10Text = '6-10 platforms:';
    let discount11PlusText = '11+ platforms:';
    let yourDiscountText = 'Your discount:';
    
    // Load discount texts from configuration if available
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.discounts) {
        const discountTexts = window.config.texts.buttons.calculator.discounts;
        discount3to5Text = discountTexts['3-5'] || discount3to5Text;
        discount6to10Text = discountTexts['6-10'] || discount6to10Text;
        discount11PlusText = discountTexts['11plus'] || discount11PlusText;
        yourDiscountText = discountTexts.yourDiscount || yourDiscountText;
    }
    
    const discountInfo = document.createElement('div');
    discountInfo.className = 'discount-info';
    discountInfo.id = 'discount-info';
    discountInfo.innerHTML = `
        <div class="discount-item">${discount3to5Text} <span class="discount-value">10%</span></div>
        <div class="discount-item">${discount6to10Text} <span class="discount-value">20%</span></div>
        <div class="discount-item">${discount11PlusText} <span class="discount-value">30%</span></div>
        <div class="discount-item current-discount">${yourDiscountText} <span id="current-discount">0%</span></div>
    `;
    
    discountSection.appendChild(discountInfo);
    topSection.appendChild(discountSection);
    
    // Add top section to container
    calcContainer.appendChild(topSection);
    
    // Create bottom section - results
    const resultSection = document.createElement('div');
    resultSection.className = 'calc-section result-section';
    
    // Add container for selected channels list
    const selectedChannelsContainer = document.createElement('div');
    selectedChannelsContainer.className = 'selected-channels-container';
    
    // Get selected platforms text from configuration
    let selectedPlatformsText = 'Selected platforms:';
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.ui) {
        selectedPlatformsText = window.config.texts.buttons.calculator.ui.selectedPlatforms || selectedPlatformsText;
    }
    
    selectedChannelsContainer.innerHTML = `<h4>${selectedPlatformsText}</h4>`;
    
    // Create element for selected channels list
    const selectedList = document.createElement('ul');
    selectedList.className = 'selected-list';
    selectedList.id = 'selected-channels-list';
    selectedChannelsContainer.appendChild(selectedList);
    
    resultSection.appendChild(selectedChannelsContainer);
    
    // Add container for detailed list (for compatibility)
    const detailedListContainer = document.createElement('div');
    detailedListContainer.className = 'detailed-list-container';
    detailedListContainer.id = 'detailed-list-container';
    detailedListContainer.style.display = 'none'; // Initially hidden
    resultSection.appendChild(detailedListContainer);
    
    // Total cost
    const totalPrice = document.createElement('div');
    totalPrice.className = 'total-price';
    
    // Get total cost text from configuration
    let totalPriceText = 'Total cost:';
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator) {
        totalPriceText = window.config.texts.buttons.calculator.totalPrice || totalPriceText;
        
        // Also check UI section if totalPrice is not found
        if (window.config.texts.buttons.calculator.ui && 
            !window.config.texts.buttons.calculator.totalPrice) {
            totalPriceText = window.config.texts.buttons.calculator.ui.totalCost || totalPriceText;
        }
    }
    
    totalPrice.innerHTML = `${totalPriceText} <span id="total-amount">$0</span>`;
    resultSection.appendChild(totalPrice);
    
    // Add bottom section to container
    calcContainer.appendChild(resultSection);
    
    // Create contact button
    const contactButton = document.createElement('button');
    contactButton.className = 'pricing-contact-btn';
    contactButton.textContent = window.config.texts && window.config.texts.buttons ? window.config.texts.buttons.contactUs || 'CONTACT US' : 'CONTACT US';
    contactButton.addEventListener('click', openContactModal);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'calc-buttons';
    buttonsContainer.appendChild(contactButton);
    
    calcContainer.appendChild(buttonsContainer);
    card.appendChild(calcContainer);
    
    // Add calculator functionality
    setTimeout(() => {
        initCalculator();
        updateDiscountInfo(); // Initialize discount information
    }, 100);
}

// Function to create calculator tabs
function createCalculatorTabs() {
    const calcTabs = document.createElement('div');
    calcTabs.className = 'calc-tabs';

    const channelTypes = [
        { id: 'channels', text: 'Channels' },
        { id: 'groups', text: 'Groups' },
        { id: 'shops', text: 'Shops' }
    ];
    
    channelTypes.forEach((type, index) => {
        const tab = document.createElement('div');
        tab.className = 'calc-tab' + (index === 0 ? ' active' : '');
        tab.dataset.type = type.id;
        tab.textContent = type.text;
        tab.addEventListener('click', function() {
            document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.channels-list').forEach(list => {
                list.style.display = 'none';
            });
            
            const listElement = document.getElementById(`${type.id}-list`);
            if (listElement) {
                listElement.style.display = 'block';
            }
            
            // Show/hide appropriate duration selector
            const isShop = type.id === 'shops';
            document.getElementById('duration-select').style.display = isShop ? 'none' : 'block';
            document.getElementById('shop-duration-select').style.display = isShop ? 'block' : 'none';
        });
        
        calcTabs.appendChild(tab);
    });
    
    return calcTabs;
}

// Create channel lists for calculator
function createChannelLists(allChannelsContainer, channelTypes) {
    channelTypes.forEach((type, typeIndex) => {
        const channelsList = document.createElement('div');
        channelsList.className = 'channels-list';
        channelsList.id = `${type.id}-list`;
        channelsList.style.display = typeIndex === 0 ? 'block' : 'none';
        
        // For channels, load data directly from file
        if (type.id === 'channels') {
            // Temporarily show loading message
            let loadingText = 'Loading channels...';
            let errorText = 'Error loading channels';
            let noAvailableText = 'No available channels';
            let httpErrorText = 'HTTP error loading channels! Status: {status}';
            
            if (window.config && window.config.texts && window.config.texts.buttons && 
                window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.ui) {
                loadingText = window.config.texts.buttons.calculator.ui.loadingChannels || loadingText;
                errorText = window.config.texts.buttons.calculator.ui.errorLoadingChannels || errorText;
                noAvailableText = window.config.texts.buttons.calculator.ui.noAvailableChannels || noAvailableText;
                httpErrorText = window.config.texts.buttons.calculator.ui.httpError || httpErrorText;
            }
            
            channelsList.textContent = loadingText;
            
            // Load channels.json directly
            fetch('config/channels.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(httpErrorText.replace('{status}', response.status));
                    }
                    return response.json();
                })
                .then(channelsData => {
                    console.log('Channels loaded directly for calculator:', channelsData);
                    
                    // Clear list
                    channelsList.innerHTML = '';
                    
                    if (!channelsData || !channelsData.items || channelsData.items.length === 0) {
                        // If no data, show message
                        channelsList.textContent = noAvailableText;
                        return;
                    }
                    
                    // Add each channel to list
                    channelsData.items.forEach((item, index) => {
                        const channelItem = document.createElement('div');
                        channelItem.className = 'channel-item';
                        
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = `channels-${index}`;
                        
                        // Set prices from JSON file
                        if (item.ads) {
                            checkbox.dataset.price24h = item.ads['24h'] || 0;
                            checkbox.dataset.priceWeek = item.ads.week || 0;
                            checkbox.dataset.priceMonth = item.ads.month || 0;
                        } else {
                            checkbox.dataset.price24h = 0;
                            checkbox.dataset.priceWeek = 0;
                            checkbox.dataset.priceMonth = 0;
                        }
                        
                        checkbox.dataset.name = item.title;
                        checkbox.dataset.type = 'channels';
                        
                        const label = document.createElement('label');
                        label.htmlFor = `channels-${index}`;
                        
                        // Show price for selected period
                        let priceText = '';
                        if (item.ads && item.ads['24h']) {
                            priceText = `${item.title} <span class="price">$${item.ads['24h']}</span>`;
                        } else {
                            priceText = `${item.title} <span class="price">(Not available)</span>`;
                        }
                        
                        label.innerHTML = priceText;
                        
                        channelItem.appendChild(checkbox);
                        channelItem.appendChild(label);
                        channelsList.appendChild(channelItem);
                        
                        // Add event listener
                        checkbox.addEventListener('change', calculatePrice);
                    });
                })
                .catch(error => {
                    console.error('Error loading channels directly for calculator:', error);
                    channelsList.textContent = errorText;
                });
        } else {
            // For other types (groups and shops), use existing logic
            // Add channels from config if available
            if (window.config.categories) {
                const category = window.config.categories.find(cat => cat.id === type.id);
                
                // Check if category exists
                if (!category || !category.items) {
                    // If category not found, show message
                    let noAvailablePlatformsText = 'No available platforms';
                    let notAvailableText = 'Not available';
                    
                    if (window.config && window.config.texts && window.config.texts.buttons && 
                        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.ui) {
                        noAvailablePlatformsText = window.config.texts.buttons.calculator.ui.noAvailablePlatforms || noAvailablePlatformsText;
                        notAvailableText = window.config.texts.buttons.calculator.ui.notAvailable || notAvailableText;
                    }
                
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'empty-message';
                    emptyMessage.textContent = noAvailablePlatformsText;
                    channelsList.appendChild(emptyMessage);
                } else if (category.items.length === 0) {
                    // If list is empty, show message
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'empty-message';
                    emptyMessage.textContent = noAvailablePlatformsText;
                    channelsList.appendChild(emptyMessage);
                } else {
                    // Add each item to list
                    category.items.forEach((item, index) => {
                        // Remove check for ads existence to show all channels
                        const channelItem = document.createElement('div');
                        channelItem.className = 'channel-item';
                        
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = `${type.id}-${index}`;
                        
                        // Set prices from JSON files
                        if (item.ads) {
                            if (type.id === 'groups') {
                                checkbox.dataset.price24h = item.ads['24h'] || 0;
                                checkbox.dataset.priceWeek = item.ads.week || 0;
                                checkbox.dataset.priceMonth = item.ads.month || 0;
                            } else if (type.id === 'shops') {
                                checkbox.dataset.price24h = item.ads.one || 0; // Use same keys for compatibility
                                checkbox.dataset.priceWeek = item.ads.three || 0;
                                checkbox.dataset.priceMonth = item.ads.ten || 0;
                            }
                        } else {
                            // If no prices, set zero values
                            checkbox.dataset.price24h = 0;
                            checkbox.dataset.priceWeek = 0;
                            checkbox.dataset.priceMonth = 0;
                        }
                        
                        checkbox.dataset.name = item.title;
                        checkbox.dataset.type = type.id;
                        
                        const label = document.createElement('label');
                        label.htmlFor = `${type.id}-${index}`;
                        
                        // Show only price for selected period
                        let priceText = '';
                        if (item.ads) {
                            if (type.id === 'groups') {
                                priceText = `${item.title} <span class="price">$${item.ads['24h']}</span>`;
                            } else if (type.id === 'shops') {
                                priceText = `${item.title} <span class="price">$${item.ads.one}</span>`;
                            }
                        } else {
                            priceText = `${item.title} <span class="price">(${notAvailableText})</span>`;
                        }
                        
                        label.innerHTML = priceText;
                        
                        channelItem.appendChild(checkbox);
                        channelItem.appendChild(label);
                        channelsList.appendChild(channelItem);
                        
                        // Add event listener
                        checkbox.addEventListener('change', calculatePrice);
                    });
                }
            }
        }
        
        allChannelsContainer.appendChild(channelsList);
    });
}
