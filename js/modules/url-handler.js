/**
 * URL handling module for each block
 */
const UrlHandler = {
    /**
     * Create URL for an element
     * @param {string} slug - Unique identifier of the element
     * @returns {string} - Full URL
     */
    createUrl(slug) {
        return `${window.location.origin}${window.location.pathname}#${slug}`;
    }
};

export default UrlHandler;
