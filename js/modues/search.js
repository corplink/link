// search.js - search functionality

// Function to initialize search
export function initSearch(config) {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    if (!searchInput || !searchButton) return;
    
    // Function to perform search
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        // Remove any existing search indicators from tabs
        document.querySelectorAll('.tab-label .search-count').forEach(el => el.remove());
        
        // Remove any existing search info
        const existingInfo = document.querySelector('.search-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        if (searchTerm === '') {
            // If search field is empty, show all cards
            document.querySelectorAll('.card').forEach(card => {
                card.style.display = 'flex';
            });
            
            // Remove search result messages
            document.querySelectorAll('.no-results').forEach(el => el.remove());
            
            // Reset tab selection to first tab
            document.getElementById('tab1').checked = true;
            
            return;
        }
        
        // Counter for found cards in each category
        const foundCount = {
            'content1': 0,
            'content2': 0,
            'content3': 0,
            'content4': 0
        };
        
        // Iterate over all cards and filter them
        document.querySelectorAll('.card').forEach(card => {
            const title = card.getAttribute('data-title') || '';
            const description = card.getAttribute('data-description') || '';
            const username = card.getAttribute('data-username') || '';
            
            const contentId = card.closest('.tab-content').id;
            
            // Check if card contains search query
            if (title.toLowerCase().includes(searchTerm) || 
                description.toLowerCase().includes(searchTerm) || 
                username.toLowerCase().includes(searchTerm)) {
                card.style.display = 'flex';
                foundCount[contentId]++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Add message if no results in category
        for (const contentId in foundCount) {
            const container = document.getElementById(contentId);
            const existingNoResults = container.querySelector('.no-results');
            
            if (foundCount[contentId] === 0) {
                if (!existingNoResults) {
                    const noResults = document.createElement('div');
                    noResults.className = 'no-results';
                    
                    // Get no results text from configuration
                    let noResultsText = 'No results found';
                    if (window.config && window.config.texts && window.config.texts.searchSection) {
                        noResultsText = window.config.texts.searchSection.noResults || noResultsText;
                    }
                    
                    noResults.textContent = noResultsText;
                    container.appendChild(noResults);
                }
            } else if (existingNoResults) {
                existingNoResults.remove();
            }
        }
        
        // Add search count indicators to tab labels
        for (let i = 1; i <= 4; i++) {
            if (foundCount[`content${i}`] > 0) {
                const tabLabel = document.querySelector(`.tab-label[for="tab${i}"]`);
                const searchCount = document.createElement('span');
                searchCount.className = 'search-count';
                searchCount.textContent = `(${foundCount[`content${i}`]})`;
                tabLabel.appendChild(searchCount);
            }
        }
        
        // Determine which tab to show based on search results
        let tabToShow = null;
        for (let i = 1; i <= 4; i++) {
            if (foundCount[`content${i}`] > 0) {
                tabToShow = i;
                break;
            }
        }
        
        // Switch to the tab with results or show a message if no results
        if (tabToShow) {
            document.getElementById(`tab${tabToShow}`).checked = true;
            
            // Create a summary of search results
            const searchInfo = document.createElement('div');
            searchInfo.className = 'search-info';
            
            // Get total count of results
            const totalResults = Object.values(foundCount).reduce((total, count) => total + count, 0);
            
            // Get categories with results
            const categoriesWithResults = [];
            for (let i = 1; i <= 4; i++) {
                if (foundCount[`content${i}`] > 0) {
                    const tabLabel = document.querySelector(`.tab-label[for="tab${i}"]`).textContent.trim();
                    categoriesWithResults.push(tabLabel);
                }
            }
            
            // Get search result texts from configuration
            let totalResultsText = 'Total results: {count}';
            let matchesInText = 'Found matches in: {categories}';
            
            if (window.config && window.config.texts && window.config.texts.searchSection) {
                totalResultsText = window.config.texts.searchSection.searchTotalResults || totalResultsText;
                matchesInText = window.config.texts.searchSection.searchMatchesIn || matchesInText;
            }
            
            // Replace placeholders with actual values
            totalResultsText = totalResultsText.replace('{count}', totalResults);
            matchesInText = matchesInText.replace('{categories}', categoriesWithResults.join(', '));
            
            searchInfo.innerHTML = `
                <div>${totalResultsText}</div>
                <div>${matchesInText}</div>
            `;
            
            // Add clear search button
            const clearButton = document.createElement('button');
            clearButton.className = 'clear-search';
            clearButton.innerHTML = '&times;';
            
            // Get clear search tooltip from configuration
            let clearSearchTooltip = 'Clear search';
            if (window.config && window.config.texts && window.config.texts.searchSection) {
                clearSearchTooltip = window.config.texts.searchSection.resetTooltip || clearSearchTooltip;
            }
            
            clearButton.title = clearSearchTooltip;
            clearButton.addEventListener('click', () => {
                searchInput.value = '';
                performSearch();
            });
            
            searchInfo.appendChild(clearButton);
            
            // Add search info to the page
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer) {
                searchContainer.appendChild(searchInfo);
            }
        } else {
            // If no results found in any tab, show the first tab
            document.getElementById('tab1').checked = true;
        }
    }
    
    // Add event listener to search button
    searchButton.addEventListener('click', performSearch);
    
    // Add event listener to search input for "Enter" key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Add input event to enable/disable search button
    searchInput.addEventListener('input', function() {
        searchButton.disabled = searchInput.value.trim() === '';
    });
    
    // Update search input placeholder from configuration
    let searchPlaceholder = 'Search...';
    if (config && config.texts) {
        if (config.texts.searchSection && config.texts.searchSection.searchPlaceholder) {
            searchPlaceholder = config.texts.searchSection.searchPlaceholder;
        } else if (config.texts.search) {
            // Fallback to direct search text if searchSection is not defined
            searchPlaceholder = config.texts.search;
        }
    } else if (window.config && window.config.texts) {
        if (window.config.texts.searchSection && window.config.texts.searchSection.searchPlaceholder) {
            searchPlaceholder = window.config.texts.searchSection.searchPlaceholder;
        } else if (window.config.texts.search) {
            // Fallback to direct search text if searchSection is not defined
            searchPlaceholder = window.config.texts.search;
        }
    }
    searchInput.placeholder = searchPlaceholder;
    
    // Set instructions placeholder from configuration
    let instructionsText = 'Enter search term...';
    if (window.config && window.config.texts && window.config.texts.searchSection) {
        instructionsText = window.config.texts.searchSection.instructions || instructionsText;
    }
    
    // Initial state: disable search button if input is empty
    searchButton.disabled = searchInput.value.trim() === '';
}
