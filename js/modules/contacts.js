// contacts.js - contact functionality

// Function to update contact information
export function updateContactInfo(contactInfo) {
    const contactLabels = document.querySelectorAll('.contact-label');
    const contactValues = document.querySelectorAll('.contact-value');
    
    // Update labels
    contactLabels.forEach(label => {
        const contactType = label.getAttribute('data-contact-type');
        if (contactType && window.config.texts && window.config.texts.footer && window.config.texts.footer.contactLabels && window.config.texts.footer.contactLabels[contactType]) {
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
            
            // Get truncation settings from config
            const truncationConfig = window.config.contacts && window.config.contacts.truncation ? 
                window.config.contacts.truncation : 
                { maxLength: 30, startChars: 15, endChars: 10, separator: '...' };
            
            // Truncate long values
            if (fullValue.length > truncationConfig.maxLength && contactType !== 'tox') {
                displayValue = fullValue.substring(0, truncationConfig.startChars) + 
                              truncationConfig.separator + 
                              fullValue.substring(fullValue.length - truncationConfig.endChars);
            } else if (contactType === 'tox') {
                // For Tox ID we use special formatting
                displayValue = fullValue;
            }
            
            value.textContent = displayValue;
            value.setAttribute('data-full', fullValue);
            
            // Show the contact item
            const contactItem = value.closest('.contact-item');
            if (contactItem) {
                contactItem.style.display = 'flex';
                // Add data-contact-type attribute to parent element
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

// Function to open contact modal
export function openContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        // Populate modal with contacts
        populateContactModal();
        
        // Show modal
        modal.style.display = 'flex';
        
        // Add event listener to close button
        const closeBtn = modal.querySelector('.contact-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Function to populate contact modal
function populateContactModal() {
    const modalContacts = document.querySelector('.modal-contacts');
    if (!modalContacts || !window.config || !window.config.contactInfo) return;
    
    // Clear existing contacts
    modalContacts.innerHTML = '';
    
    // Get contact types from config or use defaults
    const contactTypes = window.config.contacts && window.config.contacts.types ?
        window.config.contacts.types :
        {
            telegram: { icon: 'fa-paper-plane', label: 'Telegram' },
            jabber: { icon: 'fa-comment-dots', label: 'Jabber/XMPP' },
            tox: { icon: 'fa-shield-alt', label: 'Tox ID' },
            session: { icon: 'fa-lock', label: 'Session ID' }
        };
    
    // Default icon if not specified in config
    const defaultIcon = contactTypes.default && contactTypes.default.icon ? 
        contactTypes.default.icon : 'fa-user';
    
    for (const [type, info] of Object.entries(window.config.contactInfo)) {
        // Skip commented out contacts (those starting with _)
        if (type.startsWith('_')) continue;
        
        // Skip empty contacts
        if (!info) continue;
        
        // Get contact type info or use default
        const contactType = contactTypes[type] || { icon: defaultIcon, label: type };
        
        // Create contact item
        const contactItem = document.createElement('div');
        contactItem.className = 'modal-contact-item';
        
        // Add icon
        const icon = document.createElement('i');
        icon.className = `fas ${contactType.icon}`;
        contactItem.appendChild(icon);
        
        // Add label
        const label = document.createElement('span');
        label.className = 'modal-contact-label';
        label.textContent = contactType.label + ':';
        contactItem.appendChild(label);
        
        // Add value
        const value = document.createElement('span');
        value.className = 'modal-contact-value';
        value.textContent = info;
        value.setAttribute('data-full', info);
        contactItem.appendChild(value);
        
        // Add copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'modal-copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.addEventListener('click', function() {
            const fullValue = value.getAttribute('data-full');
            if (fullValue) {
                navigator.clipboard.writeText(fullValue)
                    .then(() => {
                        // Get message from config or use default
                        const successMessage = window.config.contacts && 
                                            window.config.contacts.modal && 
                                            window.config.contacts.modal.copySuccess ? 
                                            window.config.contacts.modal.copySuccess : 'Copied!';
                        
                        // Show a notification of successful copying
                        const originalIcon = this.innerHTML;
                        this.innerHTML = '<i class="fas fa-check"></i>';
                        
                        // Get delay from config or use default
                        const copyDelay = window.config.contacts && window.config.contacts.copyDelay ? 
                                         window.config.contacts.copyDelay : 1500;
                                         
                        setTimeout(() => {
                            this.innerHTML = originalIcon;
                        }, copyDelay);
                    })
                    .catch(err => {
                        // Get error message from config or use default
                        const errorMessage = window.config.contacts && 
                                           window.config.contacts.modal && 
                                           window.config.contacts.modal.copyError ? 
                                           window.config.contacts.modal.copyError : 'Error copying text';
                                           
                        console.error(errorMessage, err);
                    });
            }
        });
        contactItem.appendChild(copyBtn);
        
        // Add to modal
        modalContacts.appendChild(contactItem);
    }
}

// Function to copy contact to clipboard
export function copyContact(element) {
    // Find parent element - contact-item
    const contactItem = element.closest('.contact-item');
    if (!contactItem) return;
    
    // Find element with full contact value
    const valueElement = contactItem.querySelector('.contact-value');
    if (!valueElement) return;
    
    // Get full value
    const fullValue = valueElement.getAttribute('data-full');
    if (!fullValue) return;
    
    // Copy to clipboard
    navigator.clipboard.writeText(fullValue)
        .then(() => {
            // Show notification of successful copying
            const iconElement = element.querySelector('i');
            if (iconElement) {
                const originalIcon = iconElement.className;
                iconElement.className = 'fas fa-check';
                
                // Get delay from config or use default
                const copyDelay = window.config.contacts && window.config.contacts.copyDelay ? 
                                 window.config.contacts.copyDelay : 1500;
                                 
                setTimeout(() => {
                    iconElement.className = originalIcon;
                }, copyDelay);
            }
        })
        .catch(err => {
            // Get error message from config or use default
            const errorMessage = window.config.contacts && 
                               window.config.contacts.modal && 
                               window.config.contacts.modal.copyError ? 
                               window.config.contacts.modal.copyError : 'Error copying text';
                               
            console.error(errorMessage, err);
        });
}

// Function to initialize contact modal
export function initContactModal() {
    // Check if modal already exists
    if (document.getElementById('contact-modal')) {
        return;
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'contact-modal';
    modal.className = 'contact-modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'contact-modal-content';
    
    // Create close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'contact-modal-close';
    
    // Get close button text from config or use default
    const closeButtonText = window.config.contacts && 
                           window.config.contacts.modal && 
                           window.config.contacts.modal.closeButton ? 
                           window.config.contacts.modal.closeButton : '&times;';
                           
    closeBtn.innerHTML = closeButtonText;
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    // Get title from config or use default
    const modalTitle = window.config.contacts && 
                      window.config.contacts.modal && 
                      window.config.contacts.modal.title ? 
                      window.config.contacts.modal.title : 'Contact Us';
                      
    modalHeader.innerHTML = `<h3>${modalTitle}</h3>`;
    
    // Create modal contacts container
    const modalContacts = document.createElement('div');
    modalContacts.className = 'modal-contacts';
    
    // Add elements to modal
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalContacts);
    modal.appendChild(modalContent);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
