// Blog JavaScript - Search and Filter Functionality

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('blogSearchInput');
    const filterBtns = document.querySelectorAll('.blog-filter-btn');
    const blogCards = document.querySelectorAll('[data-category]');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const newsletterForm = document.getElementById('newsletterForm');
    
    let activeFilter = 'all';
    let searchTerm = '';

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            searchTerm = e.target.value.toLowerCase();
            filterBlogCards();
        });
    }

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update active filter
            activeFilter = this.getAttribute('data-filter');
            // Filter the cards
            filterBlogCards();
        });
    });

    // Filter blog cards based on search and category
    function filterBlogCards() {
        let visibleCount = 0;

        blogCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('.blog-card-title a').textContent.toLowerCase();
            const excerpt = card.querySelector('.blog-card-excerpt').textContent.toLowerCase();

            // Check if card matches the search term
            const matchesSearch = title.includes(searchTerm) || excerpt.includes(searchTerm);
            // Check if card matches the active filter
            const matchesFilter = activeFilter === 'all' || category === activeFilter;

            if (matchesSearch && matchesFilter) {
                card.style.display = 'block';
                // Add animation
                card.style.animation = 'fadeIn 0.3s ease-in';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide no results message
        if (noResultsMessage) {
            noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    // Newsletter subscription
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('.newsletter-input');
            const email = emailInput.value;

            // Simple email validation
            if (validateEmail(email)) {
                // Show success message
                showNotification('Success! Please check your email to confirm subscription.', 'success');
                emailInput.value = '';
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }

    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Show notification
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Add to page
        const form = document.getElementById('newsletterForm');
        form.parentElement.insertBefore(notification, form);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Share buttons functionality
    const shareButtons = document.querySelectorAll('.share-btn');
    if (shareButtons.length > 0) {
        shareButtons.forEach((btn, index) => {
            btn.addEventListener('click', function () {
                const title = document.querySelector('.blog-post-title')?.textContent || 'Check out this post';
                const url = window.location.href;

                switch (index) {
                    case 0: // Twitter
                        shareOnTwitter(title, url);
                        break;
                    case 1: // LinkedIn
                        shareOnLinkedIn(url);
                        break;
                    case 2: // Facebook
                        shareOnFacebook(url);
                        break;
                    case 3: // Copy link
                        copyToClipboard(url);
                        break;
                }
            });
        });
    }

    // Share on Twitter
    function shareOnTwitter(title, url) {
        const text = encodeURIComponent(`Check out this article: "${title}"`);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
    }

    // Share on LinkedIn
    function shareOnLinkedIn(url) {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }

    // Share on Facebook
    function shareOnFacebook(url) {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }

    // Copy link to clipboard
    function copyToClipboard(url) {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy link', 'error');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add fade-in animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .blog-card {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    // Read time estimation
    function estimateReadTime(text) {
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes > 0 ? minutes : 1;
    }

    // Add read time to blog posts if needed
    const blogContent = document.querySelector('.blog-post-content');
    if (blogContent) {
        const readTime = estimateReadTime(blogContent.textContent);
        const readTimeElement = document.querySelector('.blog-read-time');
        if (readTimeElement) {
            readTimeElement.textContent = `${readTime} min read`;
        }
    }
});

// Table of Contents generation for blog posts
function generateTableOfContents() {
    const content = document.querySelector('.blog-post-content');
    if (!content) return;

    const headings = content.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    toc.innerHTML = '<h4>Table of Contents</h4><ul>';

    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;

        const level = heading.tagName === 'H2' ? 0 : 1;
        const li = document.createElement('li');
        li.style.marginLeft = `${level * 20}px`;
        li.innerHTML = `<a href="#${id}">${heading.textContent}</a>`;
        toc.querySelector('ul').appendChild(li);
    });

    toc.innerHTML += '</ul>';

    // Insert table of contents before blog content
    const contentContainer = content.parentElement;
    contentContainer.insertBefore(toc, content);
}

// Call this function when the page is loaded
document.addEventListener('DOMContentLoaded', generateTableOfContents);

// Add styles for table of contents
const tocStyle = document.createElement('style');
tocStyle.textContent = `
    .table-of-contents {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 40px;
    }

    .table-of-contents h4 {
        font-weight: 600;
        margin-bottom: 15px;
        color: #1e293b;
    }

    .table-of-contents ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .table-of-contents li {
        margin-bottom: 8px;
    }

    .table-of-contents a {
        color: #667eea;
        text-decoration: none;
        transition: color 0.3s ease;
    }

    .table-of-contents a:hover {
        color: #764ba2;
        text-decoration: underline;
    }
`;
document.head.appendChild(tocStyle);
