// main.js - main module for initialization
import { loadConfig } from './config.js';
import { initUI, updateExternalLinks } from './ui.js';
import { updateContactInfo } from './contacts.js';

// Main initialization function when the page loads
export function initApp() {
    // Get log message from config or use default
    const domLoadedMessage = window.config && window.config.main && 
                           window.config.main.logs && 
                           window.config.main.logs.domLoaded ? 
                           window.config.main.logs.domLoaded : 
                           'DOM fully loaded, attempting to fetch config files...';
    
    console.log(domLoadedMessage);
    
    // Global config object
    window.config = {};
    
    // Load main configuration file first
    loadConfig()
        .then(categories => {
            // Set contact information
            if (window.config.contactInfo) {
                updateContactInfo(window.config.contactInfo);
            }
            
            // Set external links
            if (window.config.externalLinks) {
                updateExternalLinks(window.config.externalLinks);
            }
            
            // Initialize UI with loaded categories
            initUI(categories);
        })
        .catch(error => {
            // Get error message from config or use default
            const configErrorMessage = window.config && window.config.main && 
                                     window.config.main.logs && 
                                     window.config.main.logs.configError ? 
                                     window.config.main.logs.configError : 
                                     'Error loading configuration:';
            
            console.error(configErrorMessage, error);
            
            // Get error display settings from config or use defaults
            const errorTitle = window.config && window.config.main && 
                             window.config.main.errors && 
                             window.config.main.errors.title ? 
                             window.config.main.errors.title : 
                             'Error loading configuration';
                             
            const checkConsoleText = window.config && window.config.main && 
                                   window.config.main.errors && 
                                   window.config.main.errors.checkConsole ? 
                                   window.config.main.errors.checkConsole : 
                                   'Check browser console for more details';
            
            // Get error box styles from config or use defaults
            const errorBoxStyles = window.config && window.config.main && 
                                 window.config.main.errors && 
                                 window.config.main.errors.errorBox ? 
                                 window.config.main.errors.errorBox : 
                                 {
                                     color: "red",
                                     background: "black",
                                     padding: "20px",
                                     margin: "20px",
                                     border: "2px solid red",
                                     position: "fixed",
                                     top: "0",
                                     left: "0",
                                     zIndex: "9999"
                                 };
            
            // Create CSS style string from style object
            const styleString = Object.entries(errorBoxStyles)
                .map(([key, value]) => `${key}: ${value};`)
                .join(' ');
            
            // Display error on page for better visibility
            document.body.innerHTML += `<div style="${styleString}">
                <h2>${errorTitle}</h2>
                <p>${error.message}</p>
                <p>${checkConsoleText}</p>
            </div>`;
        });
}
