// pricing_calculator.js - additional functions for the price calculator

// Function to update discount info based on active tab and duration
export function updateDiscountInfo() {
    const activeTab = document.querySelector('.calc-tab.active');
    if (!activeTab) return;
    
    const isShop = activeTab && activeTab.dataset.type === 'shops';
    
    let discountText = '';
    
    // Get duration type for channels and groups
    const durationSelect = document.getElementById('duration-select');
    if (!durationSelect) return;
    
    const durationType = durationSelect.value;
    
    // Get discount texts from configuration
    let tier1Label = '';
    let tier2Label = '';
    let tier3Label = '';
    let currentLabel = '';
    
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.discounts &&
        window.config.texts.buttons.calculator.discounts.labels) {
        const labels = window.config.texts.buttons.calculator.discounts.labels;
        tier1Label = labels.tier1 || '';
        tier2Label = labels.tier2 || '';
        tier3Label = labels.tier3 || '';
        currentLabel = labels.current || '';
    }
    
    // Get discount values for selected duration
    let tier1Value = '10%';
    let tier2Value = '20%';
    let tier3Value = '30%';
    
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.discounts &&
        window.config.texts.buttons.calculator.discounts.values) {
        const values = window.config.texts.buttons.calculator.discounts.values;
        if (values[durationType]) {
            tier1Value = values[durationType].tier1 || tier1Value;
            tier2Value = values[durationType].tier2 || tier2Value;
            tier3Value = values[durationType].tier3 || tier3Value;
        }
    } else {
        // Use default discount values for all platform types
        if (durationType === '24h') {
            // 24-hour tariff
            tier1Value = '10%';
            tier2Value = '20%';
            tier3Value = '30%';
        } else if (durationType === 'week') {
            // Weekly tariff
            tier1Value = '15%';
            tier2Value = '25%';
            tier3Value = '35%';
        } else if (durationType === 'month') {
            // Monthly tariff
            tier1Value = '20%';
            tier2Value = '30%';
            tier3Value = '40%';
        }
    }
    
    // Generate HTML with discounts
    discountText = `
        <div class="discount-item">${tier1Label} <span class="discount-value">${tier1Value}</span></div>
        <div class="discount-item">${tier2Label} <span class="discount-value">${tier2Value}</span></div>
        <div class="discount-item">${tier3Label} <span class="discount-value">${tier3Value}</span></div>
        <div class="discount-item current-discount">${currentLabel} <span id="current-discount">0%</span></div>
    `;
    
    // Update discount information
    const discountInfo = document.getElementById('discount-info');
    if (discountInfo) {
        discountInfo.innerHTML = discountText;
    }
}

// Function to update price labels based on selected duration
export function updatePriceLabels() {
    const activeTab = document.querySelector('.calc-tab.active');
    if (!activeTab) return;
    
    const isShop = activeTab && activeTab.dataset.type === 'shops';
    
    let durationKey;
    let durationText = ''; 
    
    if (isShop) {
        const shopDurationSelect = document.getElementById('shop-duration-select');
        if (!shopDurationSelect) return;
        
        const selectedValue = shopDurationSelect.value;
        const selectedIndex = shopDurationSelect.selectedIndex;
        
        if (selectedIndex >= 0 && shopDurationSelect.options[selectedIndex]) {
            durationText = shopDurationSelect.options[selectedIndex].text;
        }
        
        if (selectedValue === 'one') {
            durationKey = 'price24h';
        } else if (selectedValue === 'three') {
            durationKey = 'priceWeek';
        } else if (selectedValue === 'ten') {
            durationKey = 'priceMonth';
        }
    } else {
        const durationSelect = document.getElementById('duration-select');
        if (!durationSelect) return;
        
        const selectedIndex = durationSelect.selectedIndex;
        
        if (selectedIndex >= 0 && durationSelect.options[selectedIndex]) {
            durationText = durationSelect.options[selectedIndex].text;
        }
        
        if (durationSelect.value === '24h') {
            durationKey = 'price24h';
        } else if (durationSelect.value === 'week') {
            durationKey = 'priceWeek';
        } else if (durationSelect.value === 'month') {
            durationKey = 'priceMonth';
        }
    }
    
    // Update price text for each platform
    const channelType = activeTab.dataset.type;
    
    if (!window.config || !window.config.categories) return;
    
    const category = window.config.categories.find(cat => cat.id === channelType);
    
    // Get unavailable text from configuration
    let unavailableText = '';
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator) {
        unavailableText = window.config.texts.buttons.calculator.unavailable || 'Unavailable';
    }
    
    if (category && category.items) {
        category.items.forEach((item, index) => {
            const label = document.querySelector(`label[for="${channelType}-${index}"]`);
            if (label) {
                if (item.ads) {
                    let price = 0;
                    if (isShop) {
                        const checkbox = document.getElementById(`${channelType}-${index}`);
                        if (checkbox && checkbox.dataset[durationKey]) {
                            price = parseInt(checkbox.dataset[durationKey]);
                        } else if (item.ads) {
                            // Fallback method for getting price from configuration
                            let key = durationKey;
                            price = item.ads[key] || 0;
                        }
                    } else {
                        const checkbox = document.getElementById(`${channelType}-${index}`);
                        if (checkbox && checkbox.dataset[durationKey]) {
                            price = parseInt(checkbox.dataset[durationKey]);
                        } else if (item.ads) {
                            // Fallback method for getting price from configuration
                            let key = durationKey;
                            price = item.ads[key] || 0;
                        }
                    }
                    label.textContent = `${item.title} ($${price})`;
                } else {
                    label.textContent = `${item.title} (${unavailableText})`;
                }
            }
        });
    }
}

// Function to initialize calculator
export function initCalculator() {
    // Add event listeners to all checkboxes and select
    document.querySelectorAll('.channel-item input, .option-item input').forEach(element => {
        element.addEventListener('change', calculatePrice);
    });
    
    // Add event listeners to duration selects
    const durationSelect = document.getElementById('duration-select');
    if (durationSelect) {
        durationSelect.addEventListener('change', function() {
            updatePriceLabels();
            updateDiscountInfo();
            calculatePrice();
        });
    }
    
    const shopDurationSelect = document.getElementById('shop-duration-select');
    if (shopDurationSelect) {
        shopDurationSelect.addEventListener('change', function() {
            updatePriceLabels();
            calculatePrice();
        });
    }
    
    // Add event listeners to tabs
    document.querySelectorAll('.calc-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            setTimeout(() => {
                updatePriceLabels();
                calculatePrice(); // Added to update prices when switching tabs
            }, 50);
        });
    });
    
    // Initial calculation and label update
    updatePriceLabels();
    calculatePrice();
}

// Function to calculate price
export function calculatePrice() {
    let totalPrice = 0;
    let selectedChannelsList = [];
    let selectedCount = 0;
    let detailedList = [];
    
    // Get all selected platforms
    document.querySelectorAll('.channel-item input:checked').forEach(channel => {
        // Determine which duration type is selected for this platform type
        let durationKey;
        let durationText = '';
        const channelType = channel.dataset.type;
        
        if (channelType === 'shops') {
            const shopDurationSelect = document.getElementById('shop-duration-select');
            if (!shopDurationSelect) return;
            
            const selectedValue = shopDurationSelect.value;
            const selectedIndex = shopDurationSelect.selectedIndex;
            
            if (selectedIndex >= 0 && shopDurationSelect.options[selectedIndex]) {
                durationText = shopDurationSelect.options[selectedIndex].text;
            }
            
            if (selectedValue === 'one') {
                durationKey = 'price24h';
            } else if (selectedValue === 'three') {
                durationKey = 'priceWeek';
            } else if (selectedValue === 'ten') {
                durationKey = 'priceMonth';
            }
        } else {
            const durationSelect = document.getElementById('duration-select');
            if (!durationSelect) return;
            
            const selectedIndex = durationSelect.selectedIndex;
            
            if (selectedIndex >= 0 && durationSelect.options[selectedIndex]) {
                durationText = durationSelect.options[selectedIndex].text;
            }
            
            if (durationSelect.value === '24h') {
                durationKey = 'price24h';
            } else if (durationSelect.value === 'week') {
                durationKey = 'priceWeek';
            } else if (durationSelect.value === 'month') {
                durationKey = 'priceMonth';
            }
        }
        
        // Get price for selected duration (convert key for dataset access)
        let price = 0;
        if (channel.dataset[durationKey]) {
            price = parseInt(channel.dataset[durationKey]);
        }
        
        totalPrice += price;
        selectedChannelsList.push(channel.dataset.name);
        selectedCount++;
        
        // Add to detailed list
        let typeText = '';
        
        // Get platform types from configuration
        if (window.config && window.config.texts && window.config.texts.buttons && 
            window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.platformTypes) {
            const platformTypes = window.config.texts.buttons.calculator.platformTypes;
            typeText = platformTypes[channelType] || '';
        }
        
        // If not available in configuration, use default values
        if (!typeText) {
            // These default values should be moved to the configuration
            if (channelType === 'channels') {
                typeText = 'Channel';
            } else if (channelType === 'groups') {
                typeText = 'Group';
            } else if (channelType === 'shops') {
                typeText = 'Shop';
            }
        }
        
        detailedList.push({
            name: channel.dataset.name,
            type: typeText,
            price: price,
            duration: durationText
        });
    });
    
    // For discount calculation, always use channels/groups duration type
    const durationSelect = document.getElementById('duration-select');
    if (!durationSelect) return;
    
    const durationType = durationSelect.value;
    
    // Calculate discount based on number of selected channels and duration
    let discount = 0;
    
    // Get discount values from configuration
    let discountValues = {
        '24h': { tier1: 10, tier2: 20, tier3: 30 },
        'week': { tier1: 15, tier2: 25, tier3: 35 },
        'month': { tier1: 20, tier2: 30, tier3: 40 }
    };
    
    // Try to load values from configuration
    if (window.config && window.config.texts && window.config.texts.buttons && 
        window.config.texts.buttons.calculator && window.config.texts.buttons.calculator.discounts &&
        window.config.texts.buttons.calculator.discounts.values) {
        
        const values = window.config.texts.buttons.calculator.discounts.values;
        
        // Convert text discount values to numbers
        for (const duration in values) {
            if (values[duration]) {
                discountValues[duration] = {
                    tier1: parseInt(values[duration].tier1) || discountValues[duration].tier1,
                    tier2: parseInt(values[duration].tier2) || discountValues[duration].tier2,
                    tier3: parseInt(values[duration].tier3) || discountValues[duration].tier3
                };
            }
        }
    }
    
    // Unified discount system for all platform types, based on channels/groups duration
    if (selectedCount >= 3 && selectedCount <= 5) {
        if (durationType === '24h') {
            discount = discountValues['24h'].tier1;
        } else if (durationType === 'week') {
            discount = discountValues['week'].tier1;
        } else if (durationType === 'month') {
            discount = discountValues['month'].tier1;
        }
    } else if (selectedCount >= 6 && selectedCount <= 10) {
        if (durationType === '24h') {
            discount = discountValues['24h'].tier2;
        } else if (durationType === 'week') {
            discount = discountValues['week'].tier2;
        } else if (durationType === 'month') {
            discount = discountValues['month'].tier2;
        }
    } else if (selectedCount >= 11) {
        if (durationType === '24h') {
            discount = discountValues['24h'].tier3;
        } else if (durationType === 'week') {
            discount = discountValues['week'].tier3;
        } else if (durationType === 'month') {
            discount = discountValues['month'].tier3;
        }
    }
    
    console.log('Selected count:', selectedCount, 'Duration type:', durationType, 'Discount:', discount);
    
    // Update discount display
    const currentDiscountElement = document.getElementById('current-discount');
    if (currentDiscountElement) {
        currentDiscountElement.textContent = discount + '%';
    }
    
    // Apply discount to all platforms
    if (discount > 0) {
        totalPrice = totalPrice * (1 - discount / 100);
    }
    
    // Add options
    document.querySelectorAll('.option-item input:checked').forEach(option => {
        if (option.dataset.price) {
            totalPrice += parseInt(option.dataset.price);
        }
    });
    
    // Update total cost with discount
    const totalAmountElement = document.getElementById('total-amount');
    if (totalAmountElement) {
        const discountAmount = Math.round(totalPrice * discount / 100);
        const finalPrice = Math.round(totalPrice - discountAmount);
        
        totalAmountElement.textContent = '$' + finalPrice;
        
        // Add information about saved amount
        const totalPriceElement = document.querySelector('.total-price');
        if (totalPriceElement && discountAmount > 0) {
            // Get text from configuration or use fallback
            let savedText = '';
            
            if (window.config && window.config.texts && window.config.texts.buttons && 
                window.config.texts.buttons.calculator) {
                savedText = window.config.texts.buttons.calculator.youSaved || 'You saved:';
            }
            
            const savedAmountInfo = document.getElementById('saved-amount');
            if (savedAmountInfo) {
                savedAmountInfo.textContent = `${savedText} $${discountAmount}`;
                savedAmountInfo.style.display = 'block';
            } else {
                const savedAmount = document.createElement('div');
                savedAmount.id = 'saved-amount';
                savedAmount.className = 'saved-amount';
                savedAmount.textContent = `${savedText} $${discountAmount}`;
                totalPriceElement.appendChild(savedAmount);
            }
        } else if (totalPriceElement) {
            const savedAmountInfo = document.getElementById('saved-amount');
            if (savedAmountInfo) {
                savedAmountInfo.style.display = 'none';
            }
        }
        
        // Animate price change
        totalAmountElement.classList.add('price-updated');
        setTimeout(() => {
            totalAmountElement.classList.remove('price-updated');
        }, 500);
    }
    
    // Update list of selected platforms
    const channelsListElement = document.getElementById('selected-channels-list');
    const detailedListContainer = document.getElementById('detailed-list-container');
    
    if (selectedChannelsList.length > 0) {
        // Update structured list of selected channels
        if (channelsListElement) {
            let listHtml = '';
            detailedList.forEach(item => {
                listHtml += `<li>
                    <span class="item-type">${item.type}</span> 
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">$${item.price}</span> 
                    <span class="item-duration">${item.duration}</span>
                </li>`;
            });
            channelsListElement.innerHTML = listHtml;
        }
        
        // Create detailed list (for compatibility with old code)
        if (detailedListContainer) {
            let detailedHtml = '<ul class="detailed-list">';
            detailedList.forEach(item => {
                detailedHtml += `<li>
                    <span class="item-type">${item.type}</span> 
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">$${item.price}</span> 
                    <span class="item-duration">${item.duration}</span>
                </li>`;
            });
            detailedHtml += '</ul>';
            
            detailedListContainer.innerHTML = detailedHtml;
        }
    } else {
        if (channelsListElement) {
            // Get text from configuration or use fallback
            let noItemsText = '';
            
            if (window.config && window.config.texts && window.config.texts.buttons && 
                window.config.texts.buttons.calculator) {
                noItemsText = window.config.texts.buttons.calculator.noItemsSelected || 'No platforms selected';
            }
            
            channelsListElement.innerHTML = `<li class="no-items">${noItemsText}</li>`;
        }
        
        if (detailedListContainer) {
            detailedListContainer.innerHTML = '';
        }
    }
}
