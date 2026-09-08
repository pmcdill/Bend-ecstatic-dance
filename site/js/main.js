(() => {
  'use strict';

  // ---------- schedule/artist content, loaded from content/schedule.json ----------
  // (that file is what Decap CMS at /admin edits — see admin/config.yml)
  let WEEKS_BY_ID = {};

  // Dates aren't stored in the CMS — the first week in the list is always
  // this Thursday (rolling forward automatically with today's date), the
  // second is next Thursday, and so on. Reordering the list in the CMS
  // reorders which Thursday each week lands on.
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function nextThursdayOnOrAfter(from) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7)); // 4 = Thursday
    return d;
  }

  function weekDate(index) {
    const d = nextThursdayOnOrAfter(new Date());
    d.setDate(d.getDate() + index * 7);
    return d;
  }

  function monthDay(date) {
    return MONTH_NAMES[date.getMonth()] + ' ' + date.getDate();
  }

  function assignComputedDates(weeks) {
    weeks.forEach((week, index) => {
      const date = weekDate(index);
      week.dateLabel = index === 0 ? ('This Thursday · ' + monthDay(date)) : monthDay(date);
      week.dateDisplay = 'Thursday · ' + monthDay(date);
    });
  }

  // ---------- artist modal ----------
  const artistModal = document.getElementById('artist-modal');
  const artistModalInner = artistModal.querySelector('.modal');
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

  const SOCIAL_ICONS = {
    instagramUrl: {
      label: 'Instagram',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none"></circle></svg>',
    },
    spotifyUrl: {
      label: 'Spotify',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"></circle><path d="M7 15c3-1 7-1 10 1"></path><path d="M6.3 11.3c4-1.2 8.7-1 12.2 1"></path><path d="M5.7 7.6c4.6-1.5 10.2-1.2 13.8 1"></path></svg>',
    },
    soundcloudUrl: {
      label: 'SoundCloud',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 17h11.5a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 5.8 9.6 3.5 3.5 0 0 0 4.5 17z"></path><line x1="6.5" y1="12.5" x2="6.5" y2="17"></line><line x1="9" y1="10.5" x2="9" y2="17"></line></svg>',
    },
  };

  function renderModalSocials(week) {
    const el = document.getElementById('modal-socials');
    el.innerHTML = '';
    Object.keys(SOCIAL_ICONS).forEach((key) => {
      const url = week[key];
      if (!url) return;
      const a = document.createElement('a');
      a.className = 'modal-social-link';
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', SOCIAL_ICONS[key].label);
      a.title = SOCIAL_ICONS[key].label;
      a.innerHTML = SOCIAL_ICONS[key].svg;
      el.appendChild(a);
    });
  }

  function openArtistModal(id) {
    const week = WEEKS_BY_ID[id];
    if (!week || week.tba) return;
    modalDate.textContent = week.dateDisplay || '';
    modalTypeBadge.textContent = week.typeLabel || '';
    modalName.textContent = week.name;
    modalTypeLabel.textContent = week.typeLabel || '';
    modalDj.textContent = week.bio || '';
    modalSet.textContent = week.setDescription || '';
    modalSomalabLabel.textContent = 'SomaLab · 7pm · 45 mins';
    modalSomalabInstructor.textContent = week.somaticInstructor || '';
    modalSomalabActivity.textContent = week.somaticOffering || '';
    modalSomalabBlurb.textContent = week.somaticBlurb || '';
    setPhoto(modalPhotoImg, modalPhotoPlaceholder, week.photo, week.name);
    setPhoto(modalInstructorImg, modalInstructorPlaceholder, week.somaticInstructorPhoto, week.somaticInstructor);
    renderModalSocials(week);
    artistModal.hidden = false;
    // Reset scroll position — this dialog is reused across weeks, so without
    // this a modal opened after scrolling through a longer one starts scrolled.
    artistModal.scrollTop = 0;
    artistModalInner.scrollTop = 0;
  }

  function closeArtistModal() {
    artistModal.hidden = true;
  }

  function wireModalTrigger(el) {
    el.addEventListener('click', () => openArtistModal(el.dataset.openModal));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openArtistModal(el.dataset.openModal);
      }
    });
  }

  document.getElementById('artist-modal-close').addEventListener('click', closeArtistModal);
  artistModal.addEventListener('click', (e) => {
    if (e.target === artistModal) closeArtistModal();
  });

  // ---------- hero + schedule rendering (from content/schedule.json) ----------
  function photoImgEl(src, alt) {
    const img = document.createElement('img');
    img.className = 'photo-img';
    img.src = src;
    img.alt = alt || '';
    return img;
  }

  function renderFeatured(week) {
    const slot = document.getElementById('featured-slot');
    slot.innerHTML = '';
    if (!week) return;

    const photoDiv = document.createElement('div');
    photoDiv.className = 'featured-photo';
    photoDiv.appendChild(photoImgEl(week.photo, week.name));

    const info = document.createElement('div');
    info.className = 'featured-info';

    const dateEl = document.createElement('div');
    dateEl.className = 'featured-date';
    dateEl.textContent = week.dateDisplay || '';
    info.appendChild(dateEl);

    const nameEl = document.createElement('div');
    nameEl.className = 'featured-name';
    nameEl.textContent = week.name;
    info.appendChild(nameEl);

    const pillRow = document.createElement('div');
    pillRow.className = 'pill-row';
    pillRow.innerHTML =
      '<a class="pill pill--link" href="https://maps.app.goo.gl/8AXYxkABnHr6uPQFA" target="_blank" rel="noopener">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' +
      'The Glow Pad' +
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>' +
      '</a>' +
      '<span class="pill">8–10pm</span>';
    const typePill = document.createElement('span');
    typePill.className = 'pill';
    typePill.textContent = week.typeLabel || '';
    pillRow.appendChild(typePill);
    info.appendChild(pillRow);

    const desc = document.createElement('p');
    desc.className = 'featured-desc';
    desc.textContent = week.shortDescription || '';
    info.appendChild(desc);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-primary';
    btn.dataset.openModal = week.id;
    btn.textContent = 'Read more →';
    wireModalTrigger(btn);
    info.appendChild(btn);

    slot.appendChild(photoDiv);
    slot.appendChild(info);
  }

  function renderScheduleList(weeks) {
    const list = document.getElementById('schedule-list');
    list.innerHTML = '';

    weeks.forEach((week) => {
      const item = document.createElement('div');
      item.className = 'schedule-item';

      const dateLabel = document.createElement('div');
      dateLabel.className = 'schedule-date-label';
      dateLabel.textContent = week.dateLabel || '';
      item.appendChild(dateLabel);

      const card = document.createElement('div');

      if (week.tba) {
        card.className = 'schedule-card schedule-card--tba';

        const photo = document.createElement('div');
        photo.className = 'schedule-card-photo schedule-card-photo--tba';
        photo.textContent = '?';
        card.appendChild(photo);

        const body = document.createElement('div');
        body.className = 'schedule-card-body';
        const name = document.createElement('div');
        name.className = 'schedule-card-name schedule-card-name--tba';
        name.textContent = week.name || 'Artist to be announced';
        const desc = document.createElement('p');
        desc.className = 'schedule-card-desc schedule-card-desc--tba';
        desc.textContent = week.shortDescription || '';
        body.appendChild(name);
        body.appendChild(desc);
        card.appendChild(body);

        item.appendChild(card);
        list.appendChild(item);
        return;
      }

      card.className = 'schedule-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.dataset.openModal = week.id;

      const photo = document.createElement('div');
      photo.className = 'schedule-card-photo';
      photo.appendChild(photoImgEl(week.photo, week.name));
      card.appendChild(photo);

      const body = document.createElement('div');
      body.className = 'schedule-card-body';

      const name = document.createElement('div');
      name.className = 'schedule-card-name';
      name.textContent = week.name;
      body.appendChild(name);

      const type = document.createElement('div');
      type.className = 'schedule-card-type ' + (week.typeLabel === 'Live DJ set' ? 'schedule-card-type--live' : 'schedule-card-type--curated');
      type.textContent = week.typeLabel || '';
      body.appendChild(type);

      const desc = document.createElement('p');
      desc.className = 'schedule-card-desc';
      desc.textContent = week.shortDescription || '';
      body.appendChild(desc);

      const somalab = document.createElement('div');
      somalab.className = 'schedule-card-somalab';
      const somalabLabel = document.createElement('span');
      somalabLabel.textContent = 'SomaLab:';
      somalab.appendChild(somalabLabel);
      somalab.appendChild(document.createTextNode(' ' + (week.somaticOffering || '') + ' by ' + (week.somaticInstructor || '')));
      body.appendChild(somalab);

      card.appendChild(body);

      const arrow = document.createElement('div');
      arrow.className = 'schedule-card-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
      card.appendChild(arrow);

      wireModalTrigger(card);
      item.appendChild(card);
      list.appendChild(item);
    });
  }

  async function loadSchedule() {
    try {
      const res = await fetch('content/schedule.json', { cache: 'no-store' });
      const data = await res.json();
      const weeks = Array.isArray(data.weeks) ? data.weeks : [];
      assignComputedDates(weeks);
      WEEKS_BY_ID = {};
      weeks.forEach((w) => { WEEKS_BY_ID[w.id] = w; });
      renderFeatured(weeks[0]); // the first week in the list is always this week's feature
      renderScheduleList(weeks);
    } catch (err) {
      console.error('Failed to load schedule content:', err);
    }
  }

  // ---------- venue details (from content/details.json) ----------
  async function loadDetails() {
    try {
      const res = await fetch('content/details.json', { cache: 'no-store' });
      const details = await res.json();
      document.getElementById('detail-when').textContent = details.when || '';
      document.getElementById('detail-price').textContent = details.price || '';
      document.getElementById('detail-ages').textContent = details.ages || '';
      document.getElementById('detail-bring').textContent = details.bring || '';
      document.getElementById('modal-footer-price').textContent = details.price || '';
    } catch (err) {
      console.error('Failed to load venue details:', err);
    }
  }

  // ---------- calendar modal ----------
  const calendarModal = document.getElementById('calendar-modal');
  const calendarModalInner = calendarModal.querySelector('.modal');
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
    calendarModal.scrollTop = 0;
    calendarModalInner.scrollTop = 0;
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

  loadSchedule();
  loadDetails();
})();
