(() => {
  'use strict';

  // ---------- artist content (shared between hero, schedule cards, and modal) ----------
  const ARTISTS = {
    kalpa: {
      name: 'Kalpa',
      typeLabel: 'Live DJ set',
      photo: 'assets/images/kalpa-card.webp',
      photoPosition: '50% 72.5%',
      dj: 'Kalpa is a Bend-based DJ and movement facilitator drawn to organic, earthy sound. Blending live percussion textures with deep electronic grooves, they hold space for a floor to arrive, unwind, and let go together.',
      set: 'A gentle opening wave, a slow build through tribal and organic house, a full-bodied peak, and a soft landing — a three-act arc from first breath to final stillness.',
      somatic: 'Embodied dance',
      somaticInstructor: 'Sol',
      somaticInstructorPhoto: 'assets/images/sol-instructor.webp',
      somaticInstructorPhotoStyle: { objectPosition: '50.5% 100%', transform: 'scale(1.85)', transformOrigin: '50.5% 100%' },
      somaticBlurb: 'A somatic, sensation-led practice tuning into subtle movement and inner rhythm to help you arrive fully in the body.',
    },
    amanda: {
      name: 'Amanda Ramirez',
      typeLabel: 'Curated setlist',
      photo: 'assets/images/amanda-card.webp',
      dj: 'Amanda Ramirez is a longtime member of the Bend dance community who curates warm, soulful setlists rather than mixing live — an evening shaped like a story.',
      set: 'Earthy, melodic openings that rise into radiant, full-hearted release, then settle gently back to the ground. Expect goosebumps.',
      somatic: 'Contact dance',
      somaticInstructor: 'Ryza',
      somaticInstructorPhoto: 'assets/images/ryza-instructor.webp',
      somaticBlurb: 'A guided contact-improvisation warm-up — explore weight-sharing, rolling points of contact, and moving in duet before the floor opens.',
    },
    indigo: {
      name: 'Electric Indigo',
      typeLabel: 'Live DJ set',
      photo: 'assets/images/indigo-card.webp',
      dj: 'Electric Indigo brings pulsing, hypnotic electronic textures with a shimmer of the cosmic — a DJ who loves a slow, patient build.',
      set: 'Deep, driving grooves that arrive in waves: trance-tinged peaks, spacious breath-breaks, and a luminous comedown.',
      somatic: 'Yoga',
      somaticInstructor: 'Mara',
      somaticInstructorPhoto: 'assets/images/mara-instructor.webp',
      somaticInstructorPhotoStyle: { objectPosition: '39.3% 100%', transform: 'scale(2.18)', transformOrigin: '39.3% 100%' },
      somaticBlurb: 'A gentle grounding yoga flow to open the hips, spine, and breath, easing body and mind onto the dance floor.',
    },
    neoma: {
      name: 'DJ Neoma',
      typeLabel: 'Live DJ set',
      photo: 'assets/images/neoma-card.webp',
      dj: 'DJ Neoma spins global rhythms and bass-forward grooves rooted in dance floors around the world, with an ear for the unexpected.',
      set: 'Percussive, hip-shaking, and full of surprise — a set that keeps the body guessing and grinning all the way through.',
      somatic: 'Acrobatic dance',
      somaticInstructor: 'Theo',
      somaticInstructorPhoto: null,
      somaticBlurb: 'A playful acro-based warm-up building trust, balance, and partner flying — no experience needed, spotters provided.',
    },
    puma: {
      name: 'Puma',
      typeLabel: 'Curated setlist',
      photo: 'assets/images/puma-card.webp',
      dj: 'Puma crafts intuitive setlists that read the room and follow the collective pulse, favoring feeling over formula.',
      set: 'A responsive, ever-shifting journey — no two moments the same, all of it built for letting go.',
      somatic: 'Yoga',
      somaticInstructor: 'Wren',
      somaticInstructorPhoto: null,
      somaticBlurb: 'A slow, restorative yoga sequence to soften tension and settle the nervous system ahead of the dance.',
    },
  };

  // ---------- artist modal ----------
  const artistModal = document.getElementById('artist-modal');
  const modalDate = document.getElementById('modal-date');
  const modalTypeBadge = document.getElementById('modal-type-badge');
  const modalName = document.getElementById('modal-name');
  const modalTypeLabel = document.getElementById('modal-type-label');
  const modalDj = document.getElementById('modal-dj');
  const modalSet = document.getElementById('modal-set');
  const modalSomalabLabel = document.getElementById('modal-somalab-label');
  const modalSomalabInstructor = document.getElementById('modal-somalab-instructor');
  const modalSomalabActivity = document.getElementById('modal-somalab-activity');
  const modalSomalabBlurb = document.getElementById('modal-somalab-blurb');
  const modalPhotoImg = document.getElementById('modal-photo-img');
  const modalPhotoPlaceholder = document.getElementById('modal-photo-placeholder');
  const modalInstructorImg = document.getElementById('modal-instructor-img');
  const modalInstructorPlaceholder = document.getElementById('modal-instructor-placeholder');

  function setPhoto(imgEl, placeholderEl, src, alt, style) {
    if (src) {
      imgEl.src = src;
      imgEl.alt = alt;
      imgEl.removeAttribute('style');
      Object.assign(imgEl.style, { objectPosition: '', transform: '', transformOrigin: '' }, style || {});
      imgEl.hidden = false;
      placeholderEl.hidden = true;
    } else {
      imgEl.hidden = true;
      placeholderEl.hidden = false;
    }
  }

  function openArtistModal(key, dateDisplay) {
    const artist = ARTISTS[key];
    if (!artist) return;
    modalDate.textContent = dateDisplay;
    modalTypeBadge.textContent = artist.typeLabel;
    modalName.textContent = artist.name;
    modalTypeLabel.textContent = artist.typeLabel;
    modalDj.textContent = artist.dj;
    modalSet.textContent = artist.set;
    modalSomalabLabel.textContent = 'SomaLab · 7pm · 45 mins';
    modalSomalabInstructor.textContent = artist.somaticInstructor;
    modalSomalabActivity.textContent = artist.somatic;
    modalSomalabBlurb.textContent = artist.somaticBlurb;
    setPhoto(modalPhotoImg, modalPhotoPlaceholder, artist.photo, artist.name, artist.photoPosition ? { objectPosition: artist.photoPosition } : null);
    setPhoto(modalInstructorImg, modalInstructorPlaceholder, artist.somaticInstructorPhoto, artist.somaticInstructor, artist.somaticInstructorPhotoStyle);
    artistModal.hidden = false;
  }

  function closeArtistModal() {
    artistModal.hidden = true;
  }

  document.querySelectorAll('[data-open-modal]').forEach((el) => {
    el.addEventListener('click', () => {
      openArtistModal(el.dataset.openModal, el.dataset.dateDisplay);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openArtistModal(el.dataset.openModal, el.dataset.dateDisplay);
      }
    });
  });

  document.getElementById('artist-modal-close').addEventListener('click', closeArtistModal);
  artistModal.addEventListener('click', (e) => {
    if (e.target === artistModal) closeArtistModal();
  });

  // ---------- calendar modal ----------
  const calendarModal = document.getElementById('calendar-modal');
  const calMonthLabel = document.getElementById('cal-month-label');
  const calWeekdays = document.getElementById('cal-weekdays');
  const calCells = document.getElementById('cal-cells');
  const calPrevBtn = document.getElementById('cal-prev');
  const calNextBtn = document.getElementById('cal-next');

  const MONTHS = [
    { y: 2026, m: 6, label: 'July 2026' },
    { y: 2026, m: 7, label: 'August 2026' },
  ];
  const EVENTS = {
    '2026-6-16': 'Kalpa',
    '2026-6-23': 'Amanda Ramirez',
    '2026-6-30': 'Electric Indigo',
    '2026-7-6': 'Kalpa',
    '2026-7-13': 'DJ Neoma',
    '2026-7-27': 'Puma',
  };
  const TBA_DATES = { '2026-7-20': true };
  const THIS_WEEK_KEY = '2026-6-16';
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let calMonthIndex = 0;

  WEEKDAYS.forEach((w) => {
    const el = document.createElement('div');
    el.className = 'cal-weekday';
    el.textContent = w;
    calWeekdays.appendChild(el);
  });

  function renderCalendar() {
    const cm = MONTHS[calMonthIndex];
    calMonthLabel.textContent = cm.label;
    calPrevBtn.disabled = calMonthIndex === 0;
    calNextBtn.disabled = calMonthIndex === MONTHS.length - 1;

    calCells.innerHTML = '';
    const firstDow = new Date(cm.y, cm.m, 1).getDay();
    const daysIn = new Date(cm.y, cm.m + 1, 0).getDate();

    for (let i = 0; i < firstDow; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      calCells.appendChild(cell);
    }

    for (let d = 1; d <= daysIn; d++) {
      const key = cm.y + '-' + cm.m + '-' + d;
      const isThu = new Date(cm.y, cm.m, d).getDay() === 4;
      const ev = EVENTS[key];
      const isTba = TBA_DATES[key];
      const isNow = key === THIS_WEEK_KEY;

      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      if (ev) {
        cell.classList.add('cal-cell--event');
        if (isNow) cell.classList.add('cal-cell--now');
      } else if (isTba) {
        cell.classList.add('cal-cell--tba');
      } else if (isThu) {
        cell.classList.add('cal-cell--thu');
      }

      const num = document.createElement('div');
      num.className = 'cal-cell-num';
      num.textContent = String(d);
      cell.appendChild(num);

      const name = document.createElement('div');
      name.className = 'cal-cell-name';
      name.textContent = ev || (isTba ? 'TBA' : '');
      cell.appendChild(name);

      calCells.appendChild(cell);
    }
  }

  calPrevBtn.addEventListener('click', () => {
    calMonthIndex = Math.max(0, calMonthIndex - 1);
    renderCalendar();
  });
  calNextBtn.addEventListener('click', () => {
    calMonthIndex = Math.min(MONTHS.length - 1, calMonthIndex + 1);
    renderCalendar();
  });

  document.getElementById('open-calendar-btn').addEventListener('click', () => {
    renderCalendar();
    calendarModal.hidden = false;
  });
  document.getElementById('calendar-modal-close').addEventListener('click', () => {
    calendarModal.hidden = true;
  });
  calendarModal.addEventListener('click', (e) => {
    if (e.target === calendarModal) calendarModal.hidden = true;
  });

  // ---------- "what exactly is ecstatic dance" voice switcher ----------
  const VOICES = {
    poet: { label: 'Poet-philosopher', text: 'To dance ecstatically is to become, for one trembling hour, a rumor of the wind — a body unlearning its edges, remembering it was always music only pretending to be still.' },
    dict: { label: 'Edance facilitator', text: 'A freeform movement practice performed without steps, speech, or shoes, in which participants move spontaneously to a live DJ’s set. See also: joy, sweat, catharsis.' },
    uncle: { label: 'Uncle Steve', text: 'So let me get this straight — you drive across town on a Thursday to flail around barefoot in the dark, no beer, and nobody’s allowed to TALK? …And you LIKE it?' },
    dj: { label: 'The hype DJ', text: 'It’s church, but the sermon is a bassline and somebody stole the pews. You come as you are and leave about nine pounds lighter. Let’s GO.' },
    toddler: { label: 'A delighted toddler', text: 'Everybody go wiggle-wiggle and nobody says stop and there’s NO shoes and you can spin around until you fall down. Best day of my whole life.' },
    scientist: { label: 'A skeptical scientist', text: 'Rhythmic entrainment, elevated heart rate, and social synchrony producing a measurable improvement in mood. Fine. Against my expectations, it works.' },
    grandma: { label: 'A mystic grandmother', text: 'Oh, sweetheart. It’s just the old thing — bodies and drums and letting the whole heavy day slide right off your shoulders. We’ve always done this.' },
    consultant: { label: 'A corporate consultant', text: 'Think of it as an unstructured, high-engagement wellness touchpoint that unlocks holistic synergy across the whole individual. Barefoot, though.' },
    genz: { label: 'A Gen-Z teen', text: 'ok so it’s giving silent rave but make it healing and everyone’s lowkey feral and somehow it’s the least problematic thing I’ve ever done??' },
  };

  const LOADING_ICONS = [
    'assets/icons/chakras.png',
    'assets/icons/eye-closed.png',
    'assets/icons/eye-icon.png',
    'assets/icons/eye-sun.png',
    'assets/icons/moon-eye.png',
    'assets/icons/moon-stars.png',
    'assets/icons/moon-sun.png',
  ];

  const rollBtn = document.getElementById('roll-dice-btn');
  const voiceLoadingEl = document.getElementById('voice-loading');
  const voiceReadyEl = document.getElementById('voice-ready');
  const voiceIconEl = document.getElementById('voice-icon');
  const voiceQuoteEl = document.getElementById('voice-quote');
  const voiceLabelEl = document.getElementById('voice-label');

  let currentVoice = 'poet';
  let voiceLoading = false;

  function renderVoice() {
    voiceQuoteEl.textContent = VOICES[currentVoice].text;
    voiceLabelEl.textContent = VOICES[currentVoice].label;
  }
  renderVoice();

  rollBtn.addEventListener('click', () => {
    if (voiceLoading) return;
    voiceLoading = true;
    rollBtn.disabled = true;
    voiceReadyEl.hidden = true;
    voiceLoadingEl.hidden = false;
    voiceIconEl.innerHTML = '';
    const icon = document.createElement('img');
    icon.src = LOADING_ICONS[Math.floor(Math.random() * LOADING_ICONS.length)];
    icon.alt = '';
    voiceIconEl.appendChild(icon);

    setTimeout(() => {
      const keys = Object.keys(VOICES).filter((k) => k !== currentVoice);
      currentVoice = keys[Math.floor(Math.random() * keys.length)];
      renderVoice();
      voiceLoading = false;
      rollBtn.disabled = false;
      voiceLoadingEl.hidden = true;
      voiceReadyEl.hidden = false;
    }, 2500);
  });

  // ---------- sticky nav scroll-spy ----------
  const SECTION_IDS = ['top', 'artists', 'about', 'location'];
  const navLinks = document.querySelectorAll('.nav-link[data-nav]');

  function updateActiveSection() {
    const line = window.innerHeight * 0.4;
    let current = SECTION_IDS[0];
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= line) current = id; // last section whose top has passed the line wins
    }
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.nav === current);
    });
  }

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  window.addEventListener('resize', updateActiveSection, { passive: true });
  updateActiveSection();
})();
