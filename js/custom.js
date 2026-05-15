// new slider code
// tab, dot, nav + auto-scroll sync
const slidesEl = document.querySelector(".vision-slides");
let currentIndex = 0;

function $tabs() { return Array.from(document.querySelectorAll(".vision-tab")); }
function $dots() { return Array.from(document.querySelectorAll(".vision-dot")); }
function slideCount() { return document.querySelectorAll(".vision-slide").length; }

function updateSlide(index) {
  if (!slidesEl) return;
  const total = slideCount();
  currentIndex = ((index % total) + total) % total; // wrap both ways

  // move slides
  slidesEl.style.transform = `translateX(-${currentIndex * 100}%)`;

  // tabs state
  const tabs = $tabs();
  tabs.forEach(t => t.classList.remove("active"));
  if (tabs[currentIndex]) tabs[currentIndex].classList.add("active");

  // dots state
  const dots = $dots();
  dots.forEach(d => d.classList.remove("active"));
  if (dots[currentIndex]) dots[currentIndex].classList.add("active");
}

// Event delegation for tabs (works if tabs are added later)
// document.querySelector(".vision-tabs").addEventListener("click", (e) => {
//   const tab = e.target.closest(".vision-tab");
//   if (!tab) return;
//   updateSlide(Number(tab.dataset.index));
// });

const visionTabs = document.querySelector(".vision-tabs");
if (visionTabs) {
  visionTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".vision-tab");
    if (!tab) return;
    updateSlide(Number(tab.dataset.index));
  });
}

// HISTORY + localStorage + "open specific tab (portfolio)" handler
(function () {
  const tabsRoot = document.querySelector('.vision-tabs');
  const tabs = () => Array.from(document.querySelectorAll('.vision-tab'));
  if (!tabsRoot) return;

  // Helper: normalize a string -> lowercase trimmed
  function norm(s) { return String(s || '').trim().toLowerCase(); }

  // Find tab index by one of:
  //  - a tab[data-target="#portfolio"]
  //  - tab textContent matching "portfolio"
  function findTabIndexForTarget(target) {
    const t = norm(target).replace(/^#/, ''); // accept "#portfolio" or "portfolio"
    // 1) data-target matching
    const byData = tabs().findIndex(tab => {
      const dt = tab.getAttribute('data-target') || tab.dataset.target;
      return dt && norm(dt).replace(/^#/, '') === t;
    });
    if (byData >= 0) return byData;

    // 2) match on text content (safe fallback)
    const byText = tabs().findIndex(tab => norm(tab.textContent).includes(t));
    if (byText >= 0) return byText;

    return -1;
  }

  // Store selection to localStorage when user clicks a tab
  tabsRoot.addEventListener('click', (e) => {
    const tab = e.target.closest('.vision-tab');
    if (!tab) return;
    const idx = Number(tab.dataset.index);
    // store index and a textual target (so other pages can request "portfolio")
    localStorage.setItem('visionIndex', String(idx));

    // If tab has explicit data-target (section id) store that, else store tab text
    const dt = tab.getAttribute('data-target') || tab.dataset.target;
    if (dt) {
      localStorage.setItem('visionTarget', norm(dt));
    } else {
      localStorage.setItem('visionTarget', norm(tab.textContent));
    }
    // update slide immediately
    if (typeof updateSlide === 'function') updateSlide(idx);
    // push history state (optional), so Back/Forward can reflect tab change
    try {
      history.pushState({ visionIndex: idx }, '', `#vision-${idx}`);
    } catch (err) { /* ignore */ }
  });

  // Helper to try to open portfolio or saved index on load/back navigation
  function applySavedOrRequestedTab() {
    const currentHash = location.hash || '';

    // === NEW: If URL already has a #vision-N hash AND that tab is the portfolio tab,
    // replace the fragment with #portfolio using history.replaceState (no scroll).
    const visionMatch = currentHash.match(/^#vision-(\d+)$/);
    if (visionMatch) {
      const idxFromHash = Number(visionMatch[1]);
      if (!Number.isNaN(idxFromHash) && idxFromHash >= 0 && idxFromHash < tabs().length) {
        const portfolioIdx = findTabIndexForTarget('portfolio');
        if (portfolioIdx === idxFromHash) {
          // open that tab and replace URL fragment with #portfolio without scrolling
          updateSlide(idxFromHash);
          try {
            history.replaceState({ visionIndex: idxFromHash }, '', '#portfolio');
          } catch (err) { /* ignore */ }
          // do not remove localStorage keys here (we're only responding to an existing hash)
          return;
        }
      }
    }

    // 1) Hash #portfolio (explicit request) OR any #/portfolio anchor
    if (currentHash === '#portfolio' || currentHash === '#/portfolio') {
      const idx = findTabIndexForTarget('portfolio');
      if (idx >= 0) {
        updateSlide(idx);
        // keep history consistent but avoid causing scroll: replaceState with a vision hash
        try {
          history.replaceState({ visionIndex: idx }, '', `#vision-${idx}`);
        } catch (err) { /* ignore */ }
        // clear any transient target flag
        localStorage.removeItem('visionTarget');
        return;
      }
    }

    // 2) localStorage.visionTarget === 'portfolio' (set by other page before redirect)
    // NOTE: per request: do NOT add '#portfolio' to the URL when the page originally had no hash.
    const savedTarget = norm(localStorage.getItem('visionTarget') || '');
    if (savedTarget === 'portfolio') {
      const idx = findTabIndexForTarget(savedTarget);
      if (idx >= 0) {
        updateSlide(idx);
        // Keep URL stable. If there was already a hash we could replace it,
        // but do not add a new #portfolio when the URL was blank.
        // We'll write a vision-index fragment to keep history consistent (no scrolling).
        try {
          // only replace if there is already some fragment (so we don't add '#portfolio' on blank url)
          if (currentHash) {
            history.replaceState({ visionIndex: idx }, '', `#vision-${idx}`);
          } else {
            // if no hash existed, we still update history state without changing URL:
            history.replaceState({ visionIndex: idx }, '', location.pathname + location.search);
          }
        } catch (err) { /* ignore */ }
        // remove target so it won't re-open on every load
        localStorage.removeItem('visionTarget');
        // also update stored index
        localStorage.setItem('visionIndex', String(idx));
        return;
      }
    }

    // 3) localStorage.visionIndex (restore last selected)
    const savedIndex = localStorage.getItem('visionIndex');
    if (savedIndex != null) {
      const idx = Number(savedIndex);
      if (!Number.isNaN(idx) && idx >= 0 && idx < tabs().length) {
        updateSlide(idx);
        try {
          // only set a fragment if there was already a fragment or if you want a vision fragment;
          // using replaceState to avoid scrolling.
          if (currentHash) {
            history.replaceState({ visionIndex: idx }, '', `#vision-${idx}`);
          } else {
            history.replaceState({ visionIndex: idx }, '', location.pathname + location.search);
          }
        } catch (err) { /* ignore */ }
        return;
      }
    }

    // 4) fallback to first tab (do NOT add #portfolio if URL is blank)
    updateSlide(0);
    try {
      if (currentHash) {
        history.replaceState({ visionIndex: 0 }, '', `#vision-0`);
      } else {
        history.replaceState({ visionIndex: 0 }, '', location.pathname + location.search);
      }
    } catch (err) { /* ignore */ }
  }

  // apply on initial load
  window.addEventListener('DOMContentLoaded', applySavedOrRequestedTab);

  // apply on pageshow for bfcache/back-forward
  window.addEventListener('pageshow', (ev) => {
    // If persisted (bfcache), re-apply so UI is consistent
    if (ev.persisted) {
      applySavedOrRequestedTab();
    } else {
      // Sometimes browsers restore DOM exactly (including active classes).
      // Still safe to call applySavedOrRequestedTab to ensure slides align.
      applySavedOrRequestedTab();
    }
  });

  // handle popstate to respond to back/forward
  window.addEventListener('popstate', (ev) => {
    if (ev.state && typeof ev.state.visionIndex === 'number') {
      updateSlide(ev.state.visionIndex);
      return;
    }
    // fallback to hash / storage
    applySavedOrRequestedTab();
  });

})();






// if ('scrollRestoration' in history) {
//   history.scrollRestoration = 'manual';
// }
// window.addEventListener('popstate', (e) => {
//   updateSlide(0);
//   window.scrollTo({ top: 0, left: 0 });
// });


// Close Bootstrap collapse when clicking outside (navbar collapse)
document.addEventListener("click", function (event) {
  const navbar = document.querySelector(".navbar");
  const collapseEl = document.querySelector(".navbar-collapse");
  if (!collapseEl) return;

  // If click isn't inside navbar and collapse is open, hide it
  if (!navbar.contains(event.target) && collapseEl.classList.contains("show")) {
    // Use Bootstrap Collapse API
    const collapse = bootstrap.Collapse.getOrCreateInstance(collapseEl);
    collapse.hide();
  }
});

// Animate elements on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// count on scroll using IntersectionObserver for maximum reliability
(function ($) {
  "use strict";

  var countersInitiated = false;

  function runCounterAnimation() {
    if (countersInitiated) return;

    $(".count").each(function () {
      var $el = $(this);
      var stopValue = parseInt($el.attr("data-count"), 10);

      if (isNaN(stopValue)) return;

      // Ensure we start from 0
      $({ countVal: 0 }).animate({ countVal: stopValue }, {
        duration: 2000,
        easing: 'swing',
        step: function () {
          $el.text(Math.floor(this.countVal));
        },
        complete: function () {
          $el.text(stopValue);
        }
      });
    });

    countersInitiated = true;
  }

  $(function () {
    var observerTarget = document.getElementById('counter');
    if (!observerTarget) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          runCounterAnimation();
          observer.disconnect();
        }
      }, { threshold: 0.01 });
      observer.observe(observerTarget);
    } else {
      // Fallback for older browsers
      runCounterAnimation();
    }
  });
})(jQuery);

$(document).ready(function () {
  const $navbar = $('#navbarNav'); // your collapse ID

  // When navbar opens
  $navbar.on('shown.bs.collapse', function () {
    $('body').addClass('overflow-hidden');
  });

  // When navbar closes (outside click, link click, ESC, anything)
  $navbar.on('hidden.bs.collapse', function () {
    $('body').removeClass('overflow-hidden');
  });
});
// Put inside $(document).ready(...) or at end of custom.js
(function ($) {
  const $collapse = $('#navbarNav');
  const collapseEl = $collapse[0];
  const navbar = document.getElementById('mainNavbar');

  // helper to get navbar height (for offset)
  function getNavbarOffset() {
    if (!navbar) return 0;
    return navbar.offsetHeight;
  }

  // click handler for same-page anchors inside the collapse / navbar
  $(document).on('click', 'a.nav-link[href^="#"]', function (e) {
    // only handle same-page anchors (no path change)
    const href = this.getAttribute('href');
    const targetId = href.slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return; // let default happen if element not on page

    // prevent default jump
    e.preventDefault();

    // remove no-scroll immediately so smooth scrolling works
    $('body').removeClass('no-scroll');

    // close the collapse (if open)
    const bsCollapse = bootstrap.Collapse.getInstance(collapseEl) || new bootstrap.Collapse(collapseEl, { toggle: false });
    bsCollapse.hide();

    // perform smooth scroll after a tiny delay so DOM can update.
    // you can also wait for 'hidden.bs.collapse' if you want the scroll after animation finishes
    const offset = getNavbarOffset();
    setTimeout(function () {
      const top = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

      // update URL hash without jump
      try {
        history.replaceState(null, '', '#' + targetId);
      } catch (err) { /* fallback: do nothing */ }
    }, 40);
  });

  // Keep body.no-scroll logic safe: add/remove on shown/hidden events as before
  $collapse.on('shown.bs.collapse', function () {
    $('body').addClass('no-scroll');
  });
  $collapse.on('hidden.bs.collapse', function () {
    $('body').removeClass('no-scroll');
  });
})(jQuery);

// remove no-js class if JS is enabled
document.documentElement.classList.remove("no-js");



const slider = document.getElementById('scrollContainer');
let isDown = false;
let startX;
let scrollLeft;

if (slider) {
  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    slider.scrollLeft = scrollLeft - walk;
  });
}

// Global Slick Slider Dots sliding window logic
function updateSlickDots(slick, currentSlide) {
  if (!slick.$dots) return;
  var i = currentSlide ? currentSlide : 0;
  var total = slick.$dots.find("li");
  if (total.length <= 5) {
    total.show();
    return;
  }

  var maxVisible = 5;
  var half = Math.floor(maxVisible / 2);

  total.hide();
  var start = i - half;
  var end = i + half;

  if (start < 0) {
    start = 0;
    end = Math.min(maxVisible - 1, total.length - 1);
  }
  if (end >= total.length) {
    end = total.length - 1;
    start = Math.max(0, end - (maxVisible - 1));
  }
  total.slice(start, end + 1).show();
}

$(document).on('init afterChange', '.slick-slider', function (event, slick, currentSlide) {
  updateSlickDots(slick, currentSlide);
});

// Also run on page load for any already initialized sliders
$(document).ready(function() {
  $('.slick-slider').each(function() {
    var slick = $(this).slick('getSlick');
    if (slick) {
      updateSlickDots(slick, slick.currentSlide);
    }
  });
});