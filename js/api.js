// Function to send inquiry email
async function submitContactForm(event) {
  event.preventDefault();
  console.log('[API] Form submitted');

  try {
    // STEP 1: Collect ALL form values - handle cases where fields might not exist
    const fullName = document.getElementById('fullName')?.value.trim() || '';
    const company = document.getElementById('company')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const projectDetails = document.getElementById('description')?.value.trim() || '';
    
    console.log('[API] Form values collected:', { fullName, email, projectDetails });
    
    // Get selected interest (only if form has these radio buttons)
    const interestElement = document.querySelector('input[name="interest"]:checked');
    const interest = interestElement ? interestElement.nextElementSibling.textContent.trim() : '';
    
    // Get selected budget (only if form has these radio buttons)
    const budgetElement = document.querySelector('input[name="budget"]:checked');
    const budget = budgetElement ? budgetElement.nextElementSibling.textContent.trim() : '';

    // STEP 2: Validate ONLY required fields (name, email, projectDetails)
    const missingFields = [];
    if (!fullName) missingFields.push('Full Name');
    if (!email) missingFields.push('Email Address');
    if (!projectDetails) missingFields.push('Project Details');

    if (missingFields.length > 0) {
      console.log('[API] Missing fields:', missingFields);
      Swal.fire({
        icon: 'warning',
        title: '⚠️ Missing Required Fields',
        html: '<p style="text-align: left; margin: 10px 0;"><strong>Please complete:</strong></p>' +
              '<ul style="text-align: left; margin: 0;">' +
              missingFields.map(field => '<li>❌ ' + field + '</li>').join('') +
              '</ul>',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[API] Invalid email format:', email);
      Swal.fire({
        icon: 'warning',
        title: '⚠️ Invalid Email',
        text: 'Please enter a valid email address.',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK'
      });
      return;
    }

    // STEP 3: Show confirmation with all details
    const confirmResult = await Swal.fire({
      title: '📋 Confirm Your Details',
      icon: 'info',
      html: '<div style="text-align: left; background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; max-height: 400px; overflow-y: auto;">' +
            '<p><strong>👤 Name:</strong> ' + fullName + '</p>' +
            '<p><strong>📧 Email:</strong> ' + email + '</p>' +
            (company ? '<p><strong>🏢 Company:</strong> ' + company + '</p>' : '') +
            (phone ? '<p><strong>📱 Phone:</strong> ' + phone + '</p>' : '') +
            (interest ? '<p><strong>🎯 Interest:</strong> ' + interest + '</p>' : '') +
            (budget ? '<p><strong>💰 Budget:</strong> ' + budget + '</p>' : '') +
            '<p><strong>📝 Project Details:</strong> ' + projectDetails + '</p>' +
            '</div>',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Submit ✓',
      cancelButtonText: 'Edit'
    });

    if (!confirmResult.isConfirmed) {
      console.log('[API] User cancelled submission');
      return;
    }

    console.log('[API] User confirmed, sending data...');

    // STEP 4: Show sending animation
    await Swal.fire({
      title: '🚀 Sending Your Inquiry...',
      html: '<p style="color: #666;">Establishing secure connection...</p>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: async () => {
        Swal.showLoading();
        
        try {
          // STEP 5: Build payload with all available data
          const payload = {
            name: fullName,
            email: email,
            projectDetails: projectDetails
          };

          // Add optional fields only if they have values
          if (company) payload.company = company;
          if (phone) payload.phone = phone;
          if (interest) payload.interest = interest;
          if (budget) payload.budget = budget;

          console.log('[API] Sending payload:', payload);

          // STEP 6: Send all data via API to new endpoint
          const response = await fetch('https://sendinquiryemailwithdetails-775373879129.us-central1.run.app', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          console.log('[API] Response status:', response.status);

          // STEP 7: Handle response
          if (response.ok) {
            console.log('[API] Success!');
            Swal.fire({
              icon: 'success',
              title: '✨ Success!',
              html: '<p><strong>' + fullName + '</strong>, your inquiry was sent successfully!</p>' +
                    '<p style="color: #666; font-size: 14px; margin-top: 10px;">We will review your project and contact you at <strong>' + email + '</strong> within 24 hours</p>',
              confirmButtonColor: '#10b981',
              confirmButtonText: 'Done',
              timer: 6000
            });
            
            // Reset form
            const form = event.target;
            if (form) form.reset();
            
            // Hide modal if it exists
            const modalElement = document.getElementById('staticBackdrop');
            if (modalElement) {
              try {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                  modal.hide();
                  console.log('[API] Modal closed');
                }
              } catch (e) {
                console.warn('[API] Could not close modal:', e);
              }
            }
          } else {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('[API] Server error:', response.status, errorText);
            throw new Error('Server error: ' + response.status);
          }
        } catch (error) {
          console.error('[API] Error in submission:', error);
          Swal.fire({
            icon: 'error',
            title: '❌ Submission Failed',
            html: '<p>Unable to send your inquiry.</p>' +
                  '<p style="color: #666; font-size: 13px; margin-top: 8px;">' + (error.message || 'Please try again.') + '</p>' +
                  '<p style="color: #999; font-size: 12px; margin-top: 8px;">If the problem persists, contact us directly at team@dashstack.tech</p>',
            confirmButtonColor: '#10b981'
          });
        }
      }
    });
  } catch (error) {
    console.error('[API] Outer error:', error);
    Swal.fire({
      icon: 'error',
      title: '❌ An Error Occurred',
      text: error.message || 'Please try again.',
      confirmButtonColor: '#10b981'
    });
  }
}

// Initialize form listener
function initializeContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    // Remove existing listeners to prevent duplicates
    contactForm.removeEventListener('submit', submitContactForm);
    // Add the listener
    contactForm.addEventListener('submit', submitContactForm);
    console.log('[API] Contact form initialized successfully');
  } else {
    console.warn('[API] Contact form not found in DOM');
  }
}

// Try to initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('[API] DOMContentLoaded event fired');
  // Small delay to ensure modal-loader has time to inject the form
  setTimeout(function() {
    initializeContactForm();
  }, 100);
});

// Also try to initialize after a window load event (fallback)
window.addEventListener('load', function() {
  console.log('[API] Window load event fired');
  initializeContactForm();
});

// Observe for dynamic form additions
if (document.body && typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(function(mutations) {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      console.log('[API] Contact form detected via MutationObserver');
      initializeContactForm();
      observer.disconnect();
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}