// Background service worker
// Ensures content script runs on blocked social media sites

chrome.runtime.onInstalled.addListener(() => {
  console.log('Escape the Permanent Underclass: Extension installed.');
});

// Handle navigations to blocked sites
chrome.webNavigation?.onCommitted?.addListener((details) => {
  if (details.frameId === 0) {
    console.log('Navigation to blocked site detected:', details.url);
  }
}, {
  url: [
    { hostSuffix: 'twitter.com' },
    { hostSuffix: 'x.com' },
    { hostSuffix: 'instagram.com' },
    { hostSuffix: 'tiktok.com' },
    { hostSuffix: 'youtube.com' }
  ]
});
