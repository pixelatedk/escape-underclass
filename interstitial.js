(function () {
  'use strict';

  // ════════════════════════════════════════════════════════════════
  // CONFIGURATION — every timing knob in one place
  // ════════════════════════════════════════════════════════════════
  const CONFIG = {
    acts: {
      1: {
        textDelay: 800,          // "u right now" text fades in
        frame1Delay: 2200,       // first wojak appears
        frame2Delay: 5000,       // morph to frazzled
        frame3Delay: 7800,       // morph to deteriorated
        totalDuration: 10500,    // full act length
        acFadeIn: 3000,          // AC ambient fade-in duration
        acVolume: 0.4,           // AC peak volume
        acFadeOut: 2500,         // AC fade-out before bridge
      },
      3: {
        initialPause: 600,       // breath of darkness before first hit
        beatInterval: 1250,      // every beat at ~96 BPM ("All The Stars")
        firstBeatDelay: 1400,    // let the music intro breathe
        textDelay: 800,          // hope text appears after last slide
        holdDuration: 3500,      // hold final image with text
        musicFadeIn: 1200,       // music volume ramp
        musicVolume: 0.55,       // music peak volume
        musicFadeOut: 1500,      // music fade before scene cut
        bridgeWait: 400,         // wait for bridge to be fully opaque
        bgSwapSettle: 100,       // settle after bg swap behind bridge
        bridgeLiftSettle: 450,   // settle after bridge lifts
      },
      hope: {
        totalDuration: 4500,     // full hope beat
        captionDelay: 1500,      // "...you see it now?" appears
        wojakEnter: 300,         // wojak fade-in start
        wojakSettle: 300,        // wojak settles
        flashDuration: 150,      // white flash before rug-pull
      },
      4: {
        invertFlash: 80,         // color inversion duration
        invertFade: 200,         // inversion fade-out
        shakeDuration: 350,      // screen shake length
        acVolume: 0.35,          // AC return volume
        acFadeIn: 2000,          // AC creep-back duration
        figureDelay: 0,          // figure appears immediately after shake
        holdDuration: 6000,      // total act hold
      },
      5: {
        twitchDuration: 2000,    // intense glitch phase
        dissolveDuration: 2000,  // figure dissolves to nothing
        fadeoutDuration: 1500,   // final overlay fade-out
      },
    },
    assets: {
      wojakPhone: 'assets/wojak-phone.jpg',
      wojakFrazzled: 'assets/wojak-frazzled.jpg',
      wojakDeteriorated: 'assets/wojak-deteriorated.jpg',
      wojakHopeful: 'assets/wojak-hopeful.jpg',
      wojakVR: 'assets/wojak-vr.jpg',
      audioAmbient: 'assets/air-conditioner.mp3',
      audioHope: 'assets/hope-music.mp3',
      hopeImages: [
        'assets/hope-1-tree.jpg',
        'assets/hope-2-beach.jpg',
        'assets/hope-3-painting.jpg',
        'assets/hope-4-lake.jpg',
        'assets/hope-5-alps.jpg',
        'assets/hope-6-portofino.jpg',
        'assets/hope-7-lakecomo.jpg',
      ],
    },
  };

  // ════════════════════════════════════════════════════════════════
  // TIME-OF-DAY PROFILES — different tones for different hours
  // ════════════════════════════════════════════════════════════════
  const TIME_PROFILES = {
    'late-night': {
      cssClass: 'time-late-night',
      timingMultiplier: 1.3,   // 30% slower — hold the dread longer
      shameSentences: [
        'i am choosing to lose sleep over this',
        'i am letting a screen replace my dreams',
        'i am sacrificing tomorrow for nothing',
        'i am rotting awake while the world sleeps',
        'i am trading rest for content that forgets me',
        'i am choosing exhaustion over peace',
        'i am burning hours i will beg for tomorrow',
        'i am watching my sleep die for strangers',
      ],
      text: {
        act1Text: "it's {time}. you're still here.",
        act3HopeText: 'everyone you love is sleeping right now.',
        hopeCaption: '...is this what you wanted?',
        act4Main: "you'll feel this tomorrow.",
        act4Sub: "the hours between now and dawn are the ones you can't get back.",
        act4Warning: 'close the screen. go to sleep.',
      },
    },
    morning: {
      cssClass: 'time-morning',
      timingMultiplier: 0.9,   // slightly faster — gentler, less oppressive
      shameSentences: [
        'i am choosing to waste my morning',
        'i am giving my best hours to an algorithm',
        'i am letting today start with surrender',
        'i am feeding my potential to a feed',
        'i am replacing ambition with scrolling',
        'i am choosing numbness over momentum',
        'i am handing my morning to people who do not care about me',
        'i am starting today by choosing to be less',
      ],
      text: {
        act1Text: 'good morning.',
        act3HopeText: 'you have a whole day ahead of you',
        hopeCaption: '...what could today be?',
        act4Main: "today hasn't been written yet.",
        act4Sub: 'every minute here is a minute stolen from what today could be.',
        act4Warning: 'go make something real.',
      },
    },
    default: {
      cssClass: null,
      timingMultiplier: 1.0,
      shameSentences: [
        'i am choosing to waste my time',
        'i am watching my life leak through a screen',
        'i am choosing to be a product instead of a person',
        'i am volunteering to be farmed for engagement',
        'i am donating my attention to people who sell it',
        'i am choosing distraction over everything i could become',
        'i am letting an algorithm decide what i feel',
        'i am trading irreplaceable time for forgettable content',
        'i am numbing myself on purpose',
        'i am choosing the permanent underclass',
      ],
      text: null,   // null = use hardcoded HTML defaults
    },
  };

  // ════════════════════════════════════════════════════════════════
  // SITE-SPECIFIC DATA — actual company payroll/compensation figures
  // Sources: public SEC filings, annual reports, and credible estimates
  // ════════════════════════════════════════════════════════════════
  const SITE_DATA = {
    x: {
      companyName: 'X',
      // Post-acquisition: ~2,000 employees, est. avg comp ~$200K = ~$400M+
      // Plus massive infrastructure/AI investment
      payrollFigure: '$500 million',
      act4Main: 'X pays over $500 million a year in engineering talent',
      act4Sub: 'thousands of engineers, optimizing every pixel to keep you here. you are the product.',
    },
    instagram: {
      companyName: 'Meta',
      // Meta total comp: ~72,000 employees × ~$370K avg = ~$27B annually
      // Instagram is a core revenue driver within Meta
      payrollFigure: '$27 billion',
      act4Main: 'Meta invests $27 billion a year in human capital',
      act4Sub: 'seventy thousand engineers building the most addictive machine ever made. for you.',
    },
    tiktok: {
      companyName: 'ByteDance',
      // ByteDance: ~150,000 employees globally, est. $15–20B in total comp
      payrollFigure: '$18 billion',
      act4Main: 'ByteDance spends $18 billion a year on its workforce',
      act4Sub: 'one hundred fifty thousand people engineering your next dopamine hit. you never stood a chance.',
    },
    youtube: {
      companyName: 'Google',
      // Alphabet total comp: ~180,000 employees × ~$350K avg = ~$63B+
      // YouTube is one of Google's largest products
      payrollFigure: '$63 billion',
      act4Main: 'Google pours $63 billion a year into its people',
      act4Sub: 'one hundred eighty thousand minds, building the attention trap you just walked into.',
    },
  };

  /**
   * Detect which social media site triggered the interstitial.
   * Reads from the URL parameter passed by content.js.
   */
  function detectSiteKey() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('site') || 'x'; // fallback to X
    } catch (e) {
      return 'x';
    }
  }

  const currentSiteKey = detectSiteKey();

  // ════════════════════════════════════════════════════════════════
  // DOM REFERENCES
  // ════════════════════════════════════════════════════════════════
  const overlay      = document.getElementById('overlay');
  const canvas       = document.getElementById('glitch-canvas');
  const ctx          = canvas.getContext('2d');
  const grainCanvas  = document.getElementById('grain-canvas');
  const grainCtx     = grainCanvas.getContext('2d');
  const audioAmbient = document.getElementById('audio-ambient');
  const audioHope    = document.getElementById('audio-hope');
  const sceneBridge  = document.getElementById('scene-bridge');

  let width, height;
  let animationId;
  let grainId;
  let canvasMode = 'off';
  let currentProfile = null;

  // ════════════════════════════════════════════════════════════════
  // UTILITIES
  // ════════════════════════════════════════════════════════════════
  function assetURL(path) {
    return chrome.runtime.getURL(path);
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fade audio volume with an ease-in-out curve for natural sounding ramps.
   * Returns a promise that resolves when the fade is complete.
   */
  function fadeAudio(audioEl, fromVol, toVol, durationMs) {
    return new Promise(resolve => {
      const steps = 50;
      const stepTime = durationMs / steps;
      let step = 0;
      audioEl.volume = Math.max(0, Math.min(1, fromVol));

      const interval = setInterval(() => {
        step++;
        // Ease-in-out curve: smoother than linear
        const t = step / steps;
        const eased = t < 0.5
          ? 2 * t * t
          : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const vol = fromVol + (toVol - fromVol) * eased;
        audioEl.volume = Math.max(0, Math.min(1, vol));

        if (step >= steps) {
          clearInterval(interval);
          audioEl.volume = Math.max(0, Math.min(1, toVol));
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Safely attempt to play audio. Returns true if successful, false if blocked.
   */
  async function safePlay(audioEl) {
    try {
      await audioEl.play();
      return true;
    } catch (e) {
      console.log('Audio autoplay blocked:', e.message);
      return false;
    }
  }

  /**
   * Generate a deep bass thump using Web Audio API — used for rug-pull impact.
   * Creates a short, sub-bass sine wave with fast attack and medium decay.
   */
  function playBassThump() {
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, actx.currentTime);          // deep A1
      osc.frequency.exponentialRampToValueAtTime(30, actx.currentTime + 0.3); // pitch drops

      gain.gain.setValueAtTime(0.6, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start(actx.currentTime);
      osc.stop(actx.currentTime + 0.5);
    } catch (e) {
      // Web Audio not available — fail silently
    }
  }

  // ════════════════════════════════════════════════════════════════
  // TIME-OF-DAY DETECTION + TEXT OVERRIDES
  // ════════════════════════════════════════════════════════════════
  function detectTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) return 'late-night';
    if (hour >= 5 && hour < 12) return 'morning';
    return 'default';
  }

  function formatCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  }

  /**
   * Pick a random shame sentence from the profile's pool.
   */
  function pickShameSentence(profile) {
    const pool = profile.shameSentences;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Apply text overrides, CSS class, and site-specific Act 4 data.
   * Site-specific payroll figures ALWAYS drive Act 4 main + sub text.
   * Time-of-day profiles override Acts 1, 3, hope caption, and warning.
   */
  function applyTimeProfile(profile) {
    // ── SITE-SPECIFIC ACT 4 TEXT (always applies, regardless of time period) ──
    const siteInfo = SITE_DATA[currentSiteKey];
    if (siteInfo) {
      const mainEl = document.getElementById('message-glitch');
      mainEl.textContent = siteInfo.act4Main;
      mainEl.setAttribute('data-text', siteInfo.act4Main);

      document.getElementById('message-sub').textContent = siteInfo.act4Sub;
    }

    // CSS class for visual tone
    if (profile.cssClass) {
      overlay.classList.add(profile.cssClass);
    }

    if (!profile.text) return; // default period — site-specific already applied

    const t = profile.text;

    // Act 1 text
    const act1El = document.getElementById('act1-text');
    let act1Text = t.act1Text;
    if (act1Text.includes('{time}')) {
      act1Text = act1Text.replace('{time}', formatCurrentTime());
    }
    act1El.textContent = act1Text;
    act1El.setAttribute('data-text', act1Text);

    // Act 3 hope text
    document.getElementById('act3-text').textContent = t.act3HopeText;

    // Hope caption
    document.getElementById('hope-caption').textContent = t.hopeCaption;

    // Act 4 warning — time-of-day controls the closing warning
    document.querySelector('#message-warning .flicker').textContent = t.act4Warning;
  }

  /**
   * Scale hold/duration timing values in CONFIG for time-of-day pacing.
   * Only affects "feel" timings, not animation-critical ones like beatInterval or flashDuration.
   */
  function applyTimingMultiplier(multiplier) {
    const holdKeys = ['totalDuration', 'holdDuration', 'textDelay', 'captionDelay'];
    for (const actKey of Object.keys(CONFIG.acts)) {
      const act = CONFIG.acts[actKey];
      for (const key of holdKeys) {
        if (act[key] !== undefined) {
          act[key] = Math.round(act[key] * multiplier);
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════════════
  // EARNED ENTRY — typing challenge after the cinematic experience
  // ════════════════════════════════════════════════════════════════
  async function getEarnedEntrySetting() {
    try {
      const data = await chrome.storage.local.get('earnedEntry');
      return data.earnedEntry !== false; // default: true
    } catch (e) {
      return true;
    }
  }

  /**
   * Display the earned entry typing screen. Returns a promise that
   * resolves when the user has typed the full shame sentence.
   */
  function runEarnedEntry(shameSentence) {
    return new Promise((resolve) => {
      const screen = document.createElement('div');
      screen.id = 'earned-entry-screen';

      const promptText = document.createElement('div');
      promptText.id = 'earned-entry-prompt';
      promptText.textContent = 'type to continue:';

      const sentenceDisplay = document.createElement('div');
      sentenceDisplay.id = 'earned-entry-sentence';

      // Build individual character spans
      const chars = shameSentence.split('');
      chars.forEach((char) => {
        const span = document.createElement('span');
        span.className = 'ee-char';
        span.textContent = char;
        sentenceDisplay.appendChild(span);
      });

      const cursorLine = document.createElement('div');
      cursorLine.id = 'earned-entry-cursor';
      const cursorSpan = document.createElement('span');
      cursorSpan.className = 'ee-cursor-blink';
      cursorSpan.textContent = '_';
      cursorLine.appendChild(cursorSpan);

      screen.appendChild(promptText);
      screen.appendChild(sentenceDisplay);
      screen.appendChild(cursorLine);

      document.body.appendChild(screen);

      // Ensure the screen can receive keyboard events inside the iframe
      screen.setAttribute('tabindex', '-1');
      screen.focus();

      let currentIndex = 0;
      const charSpans = sentenceDisplay.querySelectorAll('.ee-char');

      function onKeyDown(e) {
        if (currentIndex >= chars.length) return;

        const expected = chars[currentIndex];
        const typed = e.key;

        // Case-insensitive single-character matching
        if (typed.length === 1 && typed.toLowerCase() === expected.toLowerCase()) {
          charSpans[currentIndex].classList.add('ee-correct');
          currentIndex++;

          if (currentIndex >= chars.length) {
            // Sentence complete
            document.removeEventListener('keydown', onKeyDown);
            screen.classList.add('ee-complete');

            setTimeout(() => {
              screen.classList.add('ee-fade-out');
              setTimeout(() => {
                screen.remove();
                resolve();
              }, 800);
            }, 600);
          }
        } else if (typed.length === 1) {
          // Wrong character — red flash + shake
          charSpans[currentIndex].classList.add('ee-wrong');
          screen.classList.add('ee-shake');
          setTimeout(() => {
            charSpans[currentIndex].classList.remove('ee-wrong');
            screen.classList.remove('ee-shake');
          }, 300);
        }
        // Ignore non-printable keys (Shift, Alt, etc.)
      }

      document.addEventListener('keydown', onKeyDown);

      // Fade in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          screen.classList.add('ee-visible');
        });
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  // CANVAS SETUP
  // ════════════════════════════════════════════════════════════════
  function resize() {
    width = canvas.width = grainCanvas.width = window.innerWidth;
    height = canvas.height = grainCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ════════════════════════════════════════════════════════════════
  // FILM GRAIN ENGINE — persistent analog texture across all acts
  // Sparse pixel sampling for performance, subtle overlay blend
  // ════════════════════════════════════════════════════════════════
  function drawFilmGrain() {
    const imageData = grainCtx.createImageData(width, height);
    const data = imageData.data;
    // Sample every 16th pixel for performance — grain doesn't need full res
    for (let i = 0; i < data.length; i += 16) {
      const v = Math.random() * 255;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = Math.random() * 30;
    }
    grainCtx.putImageData(imageData, 0, 0);
    grainId = requestAnimationFrame(drawFilmGrain);
  }

  // ════════════════════════════════════════════════════════════════
  // GLITCH CANVAS — two modes: ambient (Acts 4) and intense (Act 5)
  // ════════════════════════════════════════════════════════════════
  function drawAmbientNoise() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.02) {
        const v = Math.random() * 60;
        data[i]     = v * 0.5;     // red channel — muted
        data[i + 1] = v * 0.3;     // green channel — very muted
        data[i + 2] = v;           // blue channel — dominant
        data[i + 3] = Math.random() * 80;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Occasional horizontal tear line
    if (Math.random() < 0.08) {
      const y = Math.random() * height;
      const barHeight = Math.random() * 4 + 1;
      const shift = (Math.random() - 0.5) * 20;
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.drawImage(canvas, 0, y, width, barHeight, shift, y, width, barHeight);
      ctx.restore();
    }
  }

  function drawIntenseGlitch() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.15) {
        const intensity = Math.random() * 200;
        data[i]     = Math.random() < 0.5 ? intensity : 0;
        data[i + 1] = Math.random() < 0.3 ? intensity * 0.5 : 0;
        data[i + 2] = Math.random() < 0.7 ? intensity : 0;
        data[i + 3] = Math.random() * 180;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Horizontal corruption bars
    for (let j = 0; j < 5; j++) {
      if (Math.random() < 0.4) {
        const y = Math.random() * height;
        const barHeight = Math.random() * 30 + 5;
        const shift = (Math.random() - 0.5) * 60;
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = `rgba(${Math.random() * 100}, 0, ${Math.random() * 255}, 0.3)`;
        ctx.fillRect(0, y, width, barHeight);
        ctx.drawImage(canvas, 0, y, width, barHeight, shift, y, width, barHeight);
        ctx.restore();
      }
    }

    // Block displacement corruption
    if (Math.random() < 0.3) {
      const blockSize = Math.random() * 100 + 50;
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const dx = sx + (Math.random() - 0.5) * 30;
      const dy = sy + (Math.random() - 0.5) * 10;
      ctx.drawImage(canvas, sx, sy, blockSize, blockSize, dx, dy, blockSize, blockSize);
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    if (canvasMode === 'ambient') {
      drawAmbientNoise();
    } else if (canvasMode === 'intense') {
      drawIntenseGlitch();
    }
    animationId = requestAnimationFrame(animateCanvas);
  }

  // ════════════════════════════════════════════════════════════════
  // SCENE MANAGEMENT
  // ════════════════════════════════════════════════════════════════
  function activateScene(actId) {
    const scene = document.getElementById(`act-${actId}`);
    if (!scene) return;

    // Activate new scene FIRST, then deactivate others
    // This prevents a 1-frame gap where no scene is active (= black flash)
    scene.classList.add('active');
    document.querySelectorAll('.act-scene').forEach(el => {
      if (el !== scene) {
        el.classList.remove('active');
      }
    });
  }

  // ════════════════════════════════════════════════════════════════
  // MORPH TRANSITION — motion blur crossfade between wojak frames
  // ════════════════════════════════════════════════════════════════
  async function morphTransition(outFrame, inFrame) {
    inFrame.classList.add('morphing-in', 'visible');
    outFrame.classList.add('morphing-out');
    outFrame.classList.remove('visible');
    await wait(800);
    outFrame.classList.remove('morphing-out');
    inFrame.classList.remove('morphing-in');
    inFrame.classList.add('settled');
  }

  // ════════════════════════════════════════════════════════════════
  // PRELOAD ALL ASSETS — ensures zero loading hitches during playback
  // ════════════════════════════════════════════════════════════════
  async function preloadAssets() {
    const imagePaths = [
      CONFIG.assets.wojakPhone,
      CONFIG.assets.wojakFrazzled,
      CONFIG.assets.wojakDeteriorated,
      CONFIG.assets.wojakHopeful,
      CONFIG.assets.wojakVR,
      ...CONFIG.assets.hopeImages,
    ];

    const promises = imagePaths.map(path => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // don't block on missing assets
        img.src = assetURL(path);
      });
    });

    await Promise.all(promises);
  }

  // ════════════════════════════════════════════════════════════════
  // LOAD CUSTOM PHOTOS FROM STORAGE
  // ════════════════════════════════════════════════════════════════
  async function getCustomPhotos() {
    try {
      const data = await chrome.storage.local.get('customHopeImages');
      return data.customHopeImages || [];
    } catch (e) {
      console.log('No custom photos found:', e);
      return [];
    }
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDESHOW BUILDER — full-screen frames + flash overlay
  // ════════════════════════════════════════════════════════════════
  function buildSlideshow(surface, allImageSources) {
    surface.innerHTML = '';

    const frames = [];
    for (let i = 0; i < allImageSources.length; i++) {
      const frame = document.createElement('div');
      frame.className = 'slide-frame';

      const img = document.createElement('img');
      img.className = 'slide-img';
      img.src = allImageSources[i];
      img.alt = '';
      img.draggable = false;

      frame.appendChild(img);
      surface.appendChild(frame);
      frames.push(frame);
    }

    // Flash overlay for beat impact
    const flash = document.createElement('div');
    flash.className = 'slide-flash';
    surface.appendChild(flash);

    return { frames, flash };
  }

  // ════════════════════════════════════════════════════════════════
  // ▌ ACT 1 + 2: "u right now" — Wojak Deterioration
  // ════════════════════════════════════════════════════════════════
  async function runWojakScene() {
    const cfg = CONFIG.acts[1];

    const frame1 = document.getElementById('wojak-frame-1');
    const frame2 = document.getElementById('wojak-frame-2');
    const frame3 = document.getElementById('wojak-frame-3');

    frame1.src = assetURL(CONFIG.assets.wojakPhone);
    frame2.src = assetURL(CONFIG.assets.wojakFrazzled);
    frame3.src = assetURL(CONFIG.assets.wojakDeteriorated);

    // Start ambient audio (air conditioner drone)
    audioAmbient.src = assetURL(CONFIG.assets.audioAmbient);
    audioAmbient.volume = 0;
    await safePlay(audioAmbient);
    fadeAudio(audioAmbient, 0, cfg.acVolume, cfg.acFadeIn);

    // Activate scene
    activateScene(1);

    // "u right now" text materializes
    await wait(cfg.textDelay);
    document.getElementById('act1-text').classList.add('visible');

    // Frame 1: phone wojak appears
    await wait(cfg.frame1Delay - cfg.textDelay);
    frame1.classList.add('visible');
    await wait(400);
    frame1.classList.add('settled');

    // Frame 2: morph crossfade to frazzled
    await wait(cfg.frame2Delay - cfg.frame1Delay - 400);
    frame1.classList.remove('settled');
    await morphTransition(frame1, frame2);

    // Frame 3: morph crossfade to deteriorated
    await wait(cfg.frame3Delay - cfg.frame2Delay - 800);
    frame2.classList.remove('settled');
    await morphTransition(frame2, frame3);

    // Hold final deteriorated frame, fade out AC
    fadeAudio(audioAmbient, cfg.acVolume, 0, cfg.acFadeOut);
    await wait(cfg.totalDuration - cfg.frame3Delay - 800);
    audioAmbient.pause();

    // Cinematic bridge: fade to black before transitioning to collage
    sceneBridge.classList.add('active');
    await wait(450);
  }

  // ════════════════════════════════════════════════════════════════
  // ▌ ACT 3: Happiness Collage — "All The Stars" beat-synced
  // ════════════════════════════════════════════════════════════════
  async function runAct3() {
    const cfg = CONFIG.acts[3];
    const surface = document.getElementById('collage-surface');

    // Custom photos REPLACE the defaults entirely. If none uploaded, use defaults.
    const customImages = await getCustomPhotos();
    const defaultImages = CONFIG.assets.hopeImages.map(p => assetURL(p));
    const allImages = (customImages.length > 0 ? customImages : defaultImages).slice(0, 8);

    // Build full-screen slideshow frames
    const { frames, flash } = buildSlideshow(surface, allImages);

    // Prepare hope music
    audioHope.src = assetURL(CONFIG.assets.audioHope);
    audioHope.volume = 0;

    // Mark slideshow phase (dark bg, softened grain)
    overlay.classList.remove('collage-exiting');
    overlay.classList.add('collage-active');

    // Activate scene behind the bridge (both dark — seamless)
    activateScene(3);

    // Lift bridge — reveals the dark slideshow canvas
    await wait(100);
    sceneBridge.classList.remove('active');

    // Brief beat of darkness — the quiet before the first hit
    await wait(cfg.initialPause);

    // Start music — "All The Stars"
    await safePlay(audioHope);
    fadeAudio(audioHope, 0, cfg.musicVolume, cfg.musicFadeIn);

    // Let the music intro breathe before the first photo slams in
    await wait(cfg.firstBeatDelay);

    // ── BEAT-SYNCED SLIDESHOW ──
    // Each photo SLAMS full-screen on every beat.
    // Loop through all images, then cycle back for extra beats.
    const totalBeats = Math.max(frames.length, 8); // at least 8 beats of photos
    let prevFrame = null;

    for (let beat = 0; beat < totalBeats; beat++) {
      const frameIndex = beat % frames.length;
      const frame = frames[frameIndex];

      // Kill previous frame instantly
      if (prevFrame && prevFrame !== frame) {
        prevFrame.classList.remove('slide-active', 'slide-holding');
        prevFrame.classList.add('slide-out');
      }

      // Reset current frame if it was used before (cycling)
      frame.classList.remove('slide-out', 'slide-holding');

      // SLAM — flash + frame hits
      flash.classList.remove('flash-active');
      void flash.offsetWidth; // force reflow for re-trigger
      flash.classList.add('flash-active');

      frame.classList.add('slide-active');

      // After the slam animation settles, switch to Ken Burns drift
      await wait(150);
      frame.classList.remove('slide-active');
      frame.classList.add('slide-holding');

      prevFrame = frame;

      // Wait for the rest of the beat interval before next slam
      if (beat < totalBeats - 1) {
        await wait(cfg.beatInterval - 150);
      }
    }

    // Hope text fades in over the last held image
    await wait(cfg.textDelay);
    document.getElementById('act3-text').classList.add('visible');

    // Hold the final image with text
    await wait(cfg.holdDuration);

    // ── GRACEFUL EXIT ──
    // Fade slideshow + music in parallel
    surface.classList.add('fading-out');
    await fadeAudio(audioHope, audioHope.volume, 0, cfg.musicFadeOut);
    audioHope.pause();

    // Dark bridge for clean scene cut
    sceneBridge.classList.add('active');
    await wait(cfg.bridgeWait);

    // Swap state behind the opaque bridge
    overlay.classList.remove('collage-active');
    overlay.classList.add('collage-exiting');

    // Activate hope scene BEHIND the bridge (it's opaque, user can't see)
    const hopeful = document.getElementById('wojak-hopeful');
    hopeful.src = assetURL(CONFIG.assets.wojakHopeful);
    activateScene('hope');

    // Let scene activation settle behind the bridge
    await wait(cfg.bgSwapSettle + 50);

    // Lift bridge — reveals the already-active dark hope scene
    sceneBridge.classList.remove('active');
    await wait(cfg.bridgeLiftSettle);
  }

  // ════════════════════════════════════════════════════════════════
  // ▌ ACT 3.5: Hopeful Wojak — "...you see it now?"
  // ════════════════════════════════════════════════════════════════
  async function runHopeScene() {
    const cfg = CONFIG.acts.hope;

    // Scene is already activated by runAct3 — no activateScene call needed
    const hopeful = document.getElementById('wojak-hopeful');

    // Wojak fades in
    await wait(cfg.wojakEnter);
    hopeful.classList.add('visible');
    await wait(cfg.wojakSettle);
    hopeful.classList.add('settled');

    // Caption materializes
    await wait(cfg.captionDelay);
    document.getElementById('hope-caption').classList.add('visible');

    // Hold the moment of warmth — the last good feeling
    await wait(cfg.totalDuration - cfg.captionDelay - cfg.wojakEnter - cfg.wojakSettle);

    // ══ THE RUG-PULL BEGINS ══
    playBassThump();
    overlay.classList.add('hope-flash');
    await wait(cfg.flashDuration);
  }

  // ════════════════════════════════════════════════════════════════
  // ▌ ACT 4: The Haunting Figure — THE RUG-PULL
  // ════════════════════════════════════════════════════════════════
  async function runAct4() {
    const cfg = CONFIG.acts[4];

    // Grain surge — texture intensifies
    overlay.classList.add('grain-surge');

    // Color inversion flash — gut-punch visual
    overlay.classList.add('invert-flash');
    await wait(cfg.invertFlash);
    overlay.classList.remove('invert-flash');
    overlay.classList.add('invert-flash-off');
    await wait(cfg.invertFade);
    overlay.classList.remove('invert-flash-off');

    // Clean up hope flash + collage-exiting
    overlay.classList.remove('hope-flash');
    overlay.classList.remove('collage-exiting');

    // Letterbox bars return for the dark final acts
    overlay.classList.add('letterbox-return');

    // Activate the dark scene
    activateScene(4);
    overlay.classList.add('act4-active');
    canvasMode = 'ambient';

    // Screen shake — visceral jolt
    overlay.classList.add('act4-shake');

    // AC sound creeps back — sinister return
    audioAmbient.volume = 0;
    await safePlay(audioAmbient);
    fadeAudio(audioAmbient, 0, cfg.acVolume, cfg.acFadeIn);

    await wait(cfg.shakeDuration);
    overlay.classList.remove('act4-shake', 'grain-surge');

    // The haunting figure materializes from the void
    const figContainer = document.getElementById('figure-container');
    const msgContainer = document.getElementById('message-container');
    figContainer.classList.add('entrance');
    msgContainer.classList.add('entrance');

    // Hold — let the dread sink in
    await wait(cfg.holdDuration);
  }

  // ════════════════════════════════════════════════════════════════
  // ▌ ACT 5: Glitch Out + Release — the system breaks
  // ════════════════════════════════════════════════════════════════
  async function runAct5() {
    const cfg = CONFIG.acts[5];

    // Intense pixel glitch — the figure twitches and corrupts
    canvasMode = 'intense';
    overlay.classList.add('twitching');
    await wait(cfg.twitchDuration);

    // Cut the noise — sudden silence is more terrifying
    canvasMode = 'off';
    overlay.classList.remove('twitching');
    overlay.classList.add('dissolving');
    ctx.clearRect(0, 0, width, height);

    // AC fades to nothing as the figure dissolves
    fadeAudio(audioAmbient, audioAmbient.volume, 0, cfg.dissolveDuration);
    await wait(cfg.dissolveDuration);
    audioAmbient.pause();

    // Brief moment of complete void — total silence, total darkness
    await wait(600);

    // Final fade — the overlay dissolves, the real site appears underneath
    overlay.classList.add('fade-out');
    await wait(cfg.fadeoutDuration);

    // Clean up — remove overlay and canvas loops
    cancelAnimationFrame(animationId);
    cancelAnimationFrame(grainId);
    overlay.remove();

    // Earned entry gate — user must type a randomly chosen shame sentence to proceed
    const earnedEntryEnabled = await getEarnedEntrySetting();
    if (earnedEntryEnabled) {
      await runEarnedEntry(pickShameSentence(currentProfile));
    }

    // Signal to the parent content script that we're done
    if (window.parent !== window) {
      window.parent.postMessage('interstitial-complete', '*');
    }
  }

  // ════════════════════════════════════════════════════════════════
  // ▌ MAIN — The Cinematic Sequence
  // ════════════════════════════════════════════════════════════════
  async function runCinematicExperience() {
    // Detect time-of-day and apply the appropriate profile
    const period = detectTimePeriod();
    currentProfile = TIME_PROFILES[period];
    applyTimeProfile(currentProfile);

    // Scale timing values for late-night (slower) or morning (faster)
    if (currentProfile.timingMultiplier !== 1.0) {
      applyTimingMultiplier(currentProfile.timingMultiplier);
    }

    // Start film grain immediately — sets the analog tone
    drawFilmGrain();

    // Start glitch canvas loop (mode starts as 'off' — invisible until Act 4)
    animateCanvas();

    // Preload all default images to prevent loading hitches
    await preloadAssets();

    // Set VR wojak src early so it's fully loaded before Act 4
    document.getElementById('wojak-haunting').src = assetURL(CONFIG.assets.wojakVR);

    // ── THE SEQUENCE ──
    await runWojakScene();    // Acts 1+2: "u right now" → doomer deterioration
    await runAct3();          // Act 3:    Happiness collage → "All The Stars"
    await runHopeScene();     // Act 3.5:  Hopeful wojak → "...you see it now?"
    await runAct4();          // Act 4:    Rug-pull → haunting figure → "$600M"
    await runAct5();          // Act 5:    Glitch out → dissolve → site loads
  }

  runCinematicExperience();
})();
