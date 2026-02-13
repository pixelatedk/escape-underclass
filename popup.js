// Popup: Custom photo upload + site blocking toggles
(function () {
  const MAX_PHOTOS = 8;
  const MAX_WIDTH = 800;    // resize images to max 800px width
  const JPEG_QUALITY = 0.75; // compression quality

  const STORAGE_KEY = 'customHopeImages';
  const SITES_KEY = 'blockedSites';

  const photoGrid = document.getElementById('photo-grid');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const photoCount = document.getElementById('photo-count');

  let currentPhotos = [];

  // Default site blocking state
  const DEFAULT_SITES = { x: true, instagram: false, tiktok: false, youtube: false };

  // ============================================================
  // INIT — Load existing photos + site settings from storage
  // ============================================================
  async function init() {
    // Load photos + site settings + earned entry
    const data = await chrome.storage.local.get([STORAGE_KEY, SITES_KEY, 'earnedEntry']);
    currentPhotos = data[STORAGE_KEY] || [];
    renderGrid();
    updateStatus();

    // Load site toggles
    const sites = data[SITES_KEY] || DEFAULT_SITES;
    document.getElementById('toggle-x').checked = sites.x !== false;
    document.getElementById('toggle-instagram').checked = !!sites.instagram;
    document.getElementById('toggle-tiktok').checked = !!sites.tiktok;
    document.getElementById('toggle-youtube').checked = !!sites.youtube;

    // Load earned entry toggle (default: ON)
    const earnedEntry = data.earnedEntry !== false;
    document.getElementById('toggle-earned-entry').checked = earnedEntry;

    // Attach site toggle listeners
    ['x', 'instagram', 'tiktok', 'youtube'].forEach(site => {
      const toggle = document.getElementById(`toggle-${site}`);
      toggle.addEventListener('change', () => saveSiteSettings());
    });

    // Attach earned entry toggle listener
    document.getElementById('toggle-earned-entry').addEventListener('change', (e) => {
      chrome.storage.local.set({ earnedEntry: e.target.checked });
    });
  }

  // ============================================================
  // SAVE SITE SETTINGS
  // ============================================================
  async function saveSiteSettings() {
    const sites = {
      x: document.getElementById('toggle-x').checked,
      instagram: document.getElementById('toggle-instagram').checked,
      tiktok: document.getElementById('toggle-tiktok').checked,
      youtube: document.getElementById('toggle-youtube').checked,
    };
    await chrome.storage.local.set({ [SITES_KEY]: sites });
  }

  // ============================================================
  // RENDER — Display photo thumbnails
  // ============================================================
  function renderGrid() {
    photoGrid.innerHTML = '';

    currentPhotos.forEach((dataUri, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'photo-thumb';

      const img = document.createElement('img');
      img.src = dataUri;
      img.alt = `Custom photo ${index + 1}`;

      const removeBtn = document.createElement('div');
      removeBtn.className = 'photo-remove';
      removeBtn.textContent = '\u00d7';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removePhoto(index);
      });

      thumb.appendChild(img);
      thumb.appendChild(removeBtn);
      photoGrid.appendChild(thumb);
    });
  }

  function updateStatus() {
    photoCount.textContent = currentPhotos.length;

    if (currentPhotos.length >= MAX_PHOTOS) {
      dropZone.classList.add('full');
    } else {
      dropZone.classList.remove('full');
    }
  }

  // ============================================================
  // SAVE — Persist to chrome.storage.local
  // ============================================================
  async function savePhotos() {
    await chrome.storage.local.set({ [STORAGE_KEY]: currentPhotos });
  }

  // ============================================================
  // ADD PHOTO — Resize + convert to base64
  // ============================================================
  function processImage(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Not an image'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize using canvas
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;

          if (w > MAX_WIDTH) {
            h = Math.round(h * (MAX_WIDTH / w));
            w = MAX_WIDTH;
          }

          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          const dataUri = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
          resolve(dataUri);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function addPhotos(files) {
    const remaining = MAX_PHOTOS - currentPhotos.length;
    if (remaining <= 0) return;

    const toProcess = Array.from(files).slice(0, remaining);

    for (const file of toProcess) {
      try {
        const dataUri = await processImage(file);
        currentPhotos.push(dataUri);
      } catch (err) {
        console.error('Failed to process image:', err);
      }
    }

    await savePhotos();
    renderGrid();
    updateStatus();
  }

  // ============================================================
  // REMOVE PHOTO
  // ============================================================
  async function removePhoto(index) {
    currentPhotos.splice(index, 1);
    await savePhotos();
    renderGrid();
    updateStatus();
  }

  // ============================================================
  // EVENT HANDLERS — Drag & drop + click
  // ============================================================

  // Click to browse
  dropZone.addEventListener('click', () => {
    if (currentPhotos.length < MAX_PHOTOS) {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      addPhotos(e.target.files);
      fileInput.value = ''; // reset so same file can be re-selected
    }
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');

    if (e.dataTransfer.files.length > 0) {
      addPhotos(e.dataTransfer.files);
    }
  });

  // Prevent default drag behavior on the whole document
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());

  // ============================================================
  // START
  // ============================================================
  init();
})();
