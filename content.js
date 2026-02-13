// Content script: runs at document_start on blocked social media sites
// Immediately injects the interstitial overlay before the site renders

(function () {
  const SESSION_KEY = 'escape_underclass_shown';
  const STORAGE_KEY = 'blockedSites';

  // Determine which site we're on
  const hostname = window.location.hostname.replace('www.', '');
  const SITE_MAP = {
    'twitter.com': 'x',
    'x.com': 'x',
    'instagram.com': 'instagram',
    'tiktok.com': 'tiktok',
    'youtube.com': 'youtube',
  };

  const siteKey = SITE_MAP[hostname];
  if (!siteKey) return;

  const DEFAULT_SITES = { x: true, instagram: false, tiktok: false, youtube: false };

  // For X/Twitter: inject the hide style IMMEDIATELY to prevent flash of content,
  // but only create the interstitial after confirming the toggle is enabled.
  // For other sites: wait for storage check before doing anything.
  let hideStyleInjected = false;

  if (siteKey === 'x') {
    // Inject hide style right away (prevents twitter content flash)
    // We'll remove it if X is toggled off
    injectHideStyle();
    hideStyleInjected = true;
  }

  // Always check storage to see if this site is enabled
  chrome.storage.local.get(STORAGE_KEY, (data) => {
    const sites = data[STORAGE_KEY] || DEFAULT_SITES;
    const isEnabled = !!sites[siteKey];

    if (!isEnabled) {
      // Site is disabled — clean up any preemptive hide style and bail
      if (hideStyleInjected) {
        removeHideStyle();
      }
      return;
    }

    // Site IS enabled — check if we already showed this session
    const shown = sessionStorage.getItem(SESSION_KEY);
    if (shown) {
      // Already shown this session tab — remove hide style if we injected it
      if (hideStyleInjected) {
        removeHideStyle();
      }
      return;
    }

    // Site is enabled and hasn't been shown yet — inject the interstitial
    sessionStorage.setItem(SESSION_KEY, 'true');

    if (!hideStyleInjected) {
      injectHideStyle();
    }

    waitForBody();
  });

  function injectHideStyle() {
    const hideStyle = document.createElement('style');
    hideStyle.id = 'escape-underclass-hide';
    hideStyle.textContent = `
      html, body {
        overflow: hidden !important;
      }
      body > *:not(#escape-underclass-iframe) {
        visibility: hidden !important;
      }
    `;
    (document.head || document.documentElement).appendChild(hideStyle);
  }

  function removeHideStyle() {
    const style = document.getElementById('escape-underclass-hide');
    if (style) style.remove();
  }

  function waitForBody() {
    if (!document.body) {
      const observer = new MutationObserver(() => {
        if (document.body) {
          observer.disconnect();
          createInterstitial();
        }
      });
      observer.observe(document.documentElement, { childList: true });
    } else {
      createInterstitial();
    }
  }

  function createInterstitial() {
    const iframe = document.createElement('iframe');
    iframe.id = 'escape-underclass-iframe';
    iframe.src = chrome.runtime.getURL('interstitial.html') + '?site=' + encodeURIComponent(siteKey);
    iframe.allow = 'autoplay';
    iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      border: none;
      z-index: 2147483647;
      background: #050510;
    `;

    document.body.appendChild(iframe);

    // Listen for the interstitial to complete
    window.addEventListener('message', function onMessage(e) {
      if (e.data === 'interstitial-complete') {
        window.removeEventListener('message', onMessage);
        cleanup();
      }
    });

    // Fallback timeout — 2 minutes max
    setTimeout(() => {
      cleanup();
    }, 120000);
  }

  function cleanup() {
    const iframe = document.getElementById('escape-underclass-iframe');
    if (iframe) {
      iframe.style.transition = 'opacity 0.5s ease-out';
      iframe.style.opacity = '0';
      setTimeout(() => {
        iframe.remove();
      }, 500);
    }
    removeHideStyle();
  }
})();
