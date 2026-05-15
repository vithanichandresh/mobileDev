// Load modal HTML into page
async function loadModal() {
  try {
    // Always use ./includes/modal.html (all pages are at root level)
    const modalPath = './includes/modal.html';
    
    console.log('[Modal Loader] Loading modal from:', modalPath);

    const response = await fetch(modalPath);
    if (response.ok) {
      const modalHTML = await response.text();
      console.log('[Modal Loader] Modal HTML loaded successfully');
      
      // Create a container for the modal at the end of body
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      
      // Append all modal elements to body
      while (modalContainer.firstElementChild) {
        document.body.appendChild(modalContainer.firstElementChild);
      }
      
      console.log('[Modal Loader] Modal appended to body');

      // Re-initialize form listeners after modal is loaded
      // Use a small delay to ensure api.js is fully loaded
      setTimeout(() => {
        if (typeof initializeContactForm === 'function') {
          console.log('[Modal Loader] Initializing contact form');
          initializeContactForm();
        } else {
          console.warn('[Modal Loader] initializeContactForm function not found yet');
          // Try again after a longer delay
          setTimeout(() => {
            if (typeof initializeContactForm === 'function') {
              console.log('[Modal Loader] Retrying form initialization');
              initializeContactForm();
            } else {
              console.error('[Modal Loader] initializeContactForm still not found');
            }
          }, 500);
        }
      }, 100);
    } else {
      console.error('[Modal Loader] Failed to load modal from ' + modalPath + '. Status: ' + response.status);
    }
  } catch (error) {
    console.error('[Modal Loader] Error loading modal:', error);
  }
}

// Load modal when DOM is ready
if (document.readyState === 'loading') {
  console.log('[Modal Loader] DOM still loading, waiting for DOMContentLoaded event');
  document.addEventListener('DOMContentLoaded', loadModal);
} else {
  // If DOM is already loaded, load immediately
  console.log('[Modal Loader] DOM already loaded, loading modal immediately');
  loadModal();
}