(() => {
  'use strict';

  // ---------- schedule/artist content, loaded from content/schedule.json ----------
  // (that file is what Decap CMS at /admin edits — see admin/config.yml)
  let WEEKS_BY_ID = {};

  // Each week entry carries its own explicit `date` (set via the CMS date
  // picker) instead of being inferred from its position in the list — so
  // bookings don't need to be back-to-back Thursdays. The site sorts all
  // entries by date and shows whichever booked date comes up next as
  // "This week's DJ," then the next three after that.
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function parseISODate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function monthDay(date) {
    return MONTH_NAMES[date.getMonth()] + ' ' + date.getDate();
  }

  function assignDateFields(weeks) {
    weeks.forEach((week) => {
      const date = parseISODate(week.date);
      week._date = date;
      week.dateLabel = monthDay(date);
      week.dateDisplay = 'Thursday · ' + monthDay(date);
    });
  }

  function dateKey(date) {
    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
  }

  // ---------- shared modal accessibility (focus trap, Escape-to-close,
  // focus returned to whatever triggered the modal) — used by both the
  // artist modal and the calendar modal below ----------
  function getFocusable(container) {
    return Array.from(container.querySelectorAll('a[href], button:not([disabled])'));
  }

  function makeModalController(overlayEl, innerEl, closeFn) {
    let lastFocused = null;

    document.addEventListener('keydown', (e) => {
      if (overlayEl.hidden) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeFn();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable(innerEl);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      // Cycle Tab/Shift+Tab within the modal instead of letting focus
      // escape to the page underneath.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    return {
      open() {
        lastFocused = document.activeElement;
        overlayEl.hidden = false;
        const focusable = getFocusable(innerEl);
        (focusable[0] || innerEl).focus();
      },
      close() {
        overlayEl.hidden = true;
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
        lastFocused = null;
      },
    };
  }

  // ---------- artist modal ----------
  const artistModal = document.getElementById('artist-modal');
  const artistModalInner = artistModal.querySelector('.modal');
  const artistModalCtl = makeModalController(artistModal, artistModalInner, closeArtistModal);
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
    if (!src) {
      imgEl.hidden = true;
      placeholderEl.hidden = false;
      return;
    }
    imgEl.alt = alt;
    imgEl.removeAttribute('style');
    Object.assign(imgEl.style, { objectPosition: '', transform: '', transformOrigin: '' }, style || {});
    // onerror covers a src that 404s (e.g. an uploaded photo later deleted
    // from the CMS while still referenced) — falls back to the placeholder
    // instead of the browser's broken-image icon.
    imgEl.onload = () => { placeholderEl.hidden = true; imgEl.hidden = false; };
    imgEl.onerror = () => { placeholderEl.hidden = false; imgEl.hidden = true; };
    imgEl.hidden = true;
    placeholderEl.hidden = true;
    imgEl.src = src;
  }

  const SOCIAL_ICONS = {
    websiteUrl: {
      label: 'Website',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"></circle><line x1="2.5" y1="12" x2="21.5" y2="12"></line><path d="M12 2.5c3 3 3 16 0 19"></path><path d="M12 2.5c-3 3-3 16 0 19"></path></svg>',
    },
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
    artistModalCtl.open();
    // Reset scroll position — this dialog is reused across weeks, so without
    // this a modal opened after scrolling through a longer one starts scrolled.
    artistModal.scrollTop = 0;
    artistModalInner.scrollTop = 0;
  }

  function closeArtistModal() {
    artistModalCtl.close();
  }

  // Trigger elements are always real <button>s (see renderFeatured and
  // renderScheduleList below), so the browser already fires 'click' on
  // Enter/Space natively — no manual keydown handling needed here.
  function wireModalTrigger(el) {
    el.addEventListener('click', () => openArtistModal(el.dataset.openModal));
  }

  document.getElementById('artist-modal-close').addEventListener('click', closeArtistModal);
  artistModal.addEventListener('click', (e) => {
    if (e.target === artistModal) closeArtistModal();
  });

  // ---------- hero + schedule rendering (from content/schedule.json) ----------
  const PLACEHOLDER_PHOTO_SVG = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="12" cy="12" r="3.5"></circle><path d="M8 5l1.5-2h5L16 5"></path></svg><span>Photo</span>';

  // Appends either the photo or a placeholder into `container` — including
  // when `src` is set but the file 404s (e.g. an uploaded photo later
  // deleted from the CMS while still referenced by a schedule entry), so a
  // missing image never shows the browser's broken-image icon.
  function appendPhoto(container, src, alt) {
    const placeholder = document.createElement('div');
    placeholder.className = 'ph-photo';
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.innerHTML = PLACEHOLDER_PHOTO_SVG;

    if (!src) {
      container.appendChild(placeholder);
      return;
    }

    const img = document.createElement('img');
    img.className = 'photo-img';
    img.alt = alt || '';
    img.hidden = true;
    img.addEventListener('load', () => { placeholder.hidden = true; img.hidden = false; });
    img.addEventListener('error', () => { placeholder.hidden = false; img.hidden = true; });
    img.src = src;

    container.appendChild(placeholder);
    container.appendChild(img);
  }

  // Shared by the empty-state (fetch succeeded, nothing upcoming) and
  // error-state (fetch failed) cases below.
  function renderScheduleFallback(container, html) {
    container.innerHTML = '';
    const msg = document.createElement('p');
    msg.className = 'schedule-fallback';
    msg.innerHTML = html;
    container.appendChild(msg);
  }

  function renderFeatured(week) {
    const slot = document.getElementById('featured-slot');
    const weekBanner = document.getElementById('week-banner');
    slot.innerHTML = '';

    if (!week) {
      // Nothing booked for the featured slot — the "This week's DJ" banner
      // would otherwise sit directly over blank space.
      weekBanner.hidden = true;
      renderScheduleFallback(slot, 'No dates are booked yet — see our <a href="https://www.instagram.com/bendecstaticdance" target="_blank" rel="noopener">Instagram</a> for updates, or check <a href="#location">Details</a> below.');
      return;
    }
    weekBanner.hidden = false;

    const photoDiv = document.createElement('div');
    photoDiv.className = 'featured-photo';
    appendPhoto(photoDiv, week.photo, week.name);

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

    if (!weeks.length) {
      // No additional bookings beyond (or instead of) the featured week —
      // otherwise the "Future artists" heading sits over blank space.
      renderScheduleFallback(list, 'No additional dates booked yet — check back soon, or see our <a href="https://www.instagram.com/bendecstaticdance" target="_blank" rel="noopener">Instagram</a> for updates.');
      return;
    }

    list.innerHTML = '';
    weeks.forEach((week) => {
      const item = document.createElement('div');
      item.className = 'schedule-item';

      const dateLabel = document.createElement('div');
      dateLabel.className = 'schedule-date-label';
      dateLabel.textContent = week.dateLabel || '';
      item.appendChild(dateLabel);

      if (week.tba) {
        // Not interactive — no artist confirmed yet, so this stays a plain
        // display card rather than a button with nothing to activate.
        const card = document.createElement('div');
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

      // A real <button> instead of a div with tabindex/role="button" — gets
      // keyboard reachability and Enter/Space activation for free.
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'schedule-card';
      card.dataset.openModal = week.id;

      const photo = document.createElement('div');
      photo.className = 'schedule-card-photo';
      appendPhoto(photo, week.photo, week.name);
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
      if (!res.ok) throw new Error('content/schedule.json responded with ' + res.status);
      const data = await res.json();
      const weeks = Array.isArray(data.weeks) ? data.weeks : [];
      assignDateFields(weeks);
      weeks.sort((a, b) => a._date - b._date);
      WEEKS_BY_ID = {};
      weeks.forEach((w) => { WEEKS_BY_ID[w.id] = w; });

      // Only ever show the next booked date as "This week's DJ" plus the
      // next three after it — never more than 4, and never a date that's
      // already passed.
      const today = startOfToday();
      const upcoming = weeks.filter((w) => w._date.getTime() >= today.getTime());
      const shown = upcoming.slice(0, 4);

      renderFeatured(shown[0]);
      renderScheduleList(shown.slice(1));
      buildCalendarData(shown);
    } catch (err) {
      console.error('Failed to load schedule content:', err);
      document.getElementById('week-banner').hidden = true;
      renderScheduleFallback(document.getElementById('featured-slot'), 'Couldn\'t load this week\'s schedule. Try refreshing, or see our <a href="https://www.instagram.com/bendecstaticdance" target="_blank" rel="noopener">Instagram</a> for updates.');
      renderScheduleFallback(document.getElementById('schedule-list'), 'See our <a href="https://www.instagram.com/bendecstaticdance" target="_blank" rel="noopener">Instagram</a> for upcoming dates.');
    }
  }

  // ---------- venue details (from content/details.json) ----------
  let VENUE_DETAILS = {};

  async function loadDetails() {
    try {
      const res = await fetch('content/details.json', { cache: 'no-store' });
      const details = await res.json();
      VENUE_DETAILS = details;
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
  const calendarModalCtl = makeModalController(calendarModal, calendarModalInner, closeCalendarModal);
  const calMonthLabel = document.getElementById('cal-month-label');
  const calWeekdays = document.getElementById('cal-weekdays');
  const calCells = document.getElementById('cal-cells');
  const calPrevBtn = document.getElementById('cal-prev');
  const calNextBtn = document.getElementById('cal-next');

  // Populated from the live schedule (see buildCalendarData) instead of being
  // hardcoded, so the calendar always spans exactly the Thursdays currently
  // in content/schedule.json — whatever those roll forward to.
  let CAL_MONTHS = [];
  let CAL_EVENTS = {};
  let CAL_THIS_WEEK_KEY = '';
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let calMonthIndex = 0;

  function buildCalendarData(weeks) {
    if (!weeks.length) {
      const now = new Date();
      CAL_MONTHS = [{ y: now.getFullYear(), m: now.getMonth(), label: MONTH_NAMES[now.getMonth()] + ' ' + now.getFullYear() }];
      CAL_EVENTS = {};
      CAL_THIS_WEEK_KEY = '';
      calMonthIndex = 0;
      return;
    }

    const start = weeks[0]._date;
    const end = weeks[weeks.length - 1]._date;
    const months = [];
    let y = start.getFullYear();
    let m = start.getMonth();
    const endY = end.getFullYear();
    const endM = end.getMonth();
    while (y < endY || (y === endY && m <= endM)) {
      months.push({ y, m, label: MONTH_NAMES[m] + ' ' + y });
      m += 1;
      if (m > 11) { m = 0; y += 1; }
    }
    CAL_MONTHS = months;

    const events = {};
    weeks.forEach((week) => {
      events[dateKey(week._date)] = { tba: !!week.tba, name: week.tba ? 'TBA' : week.name };
    });
    CAL_EVENTS = events;
    CAL_THIS_WEEK_KEY = dateKey(weeks[0]._date);
    calMonthIndex = 0;
  }

  WEEKDAYS.forEach((w) => {
    const el = document.createElement('div');
    el.className = 'cal-weekday';
    el.textContent = w;
    calWeekdays.appendChild(el);
  });

  function renderCalendar() {
    const cm = CAL_MONTHS[calMonthIndex];
    calMonthLabel.textContent = cm.label;
    calPrevBtn.disabled = calMonthIndex === 0;
    calNextBtn.disabled = calMonthIndex === CAL_MONTHS.length - 1;

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
      const ev = CAL_EVENTS[key];
      const isNow = key === CAL_THIS_WEEK_KEY;

      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      if (ev && !ev.tba) {
        cell.classList.add('cal-cell--event');
        if (isNow) cell.classList.add('cal-cell--now');
      } else if (ev && ev.tba) {
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
      name.textContent = ev ? ev.name : '';
      cell.appendChild(name);

      calCells.appendChild(cell);
    }
  }

  calPrevBtn.addEventListener('click', () => {
    calMonthIndex = Math.max(0, calMonthIndex - 1);
    renderCalendar();
  });
  calNextBtn.addEventListener('click', () => {
    calMonthIndex = Math.min(CAL_MONTHS.length - 1, calMonthIndex + 1);
    renderCalendar();
  });

  function openCalendarModal() {
    renderCalendar();
    calendarModalCtl.open();
    calendarModal.scrollTop = 0;
    calendarModalInner.scrollTop = 0;
  }

  function closeCalendarModal() {
    calendarModalCtl.close();
  }

  document.getElementById('open-calendar-btn').addEventListener('click', openCalendarModal);
  document.getElementById('calendar-modal-close').addEventListener('click', closeCalendarModal);
  calendarModal.addEventListener('click', (e) => {
    if (e.target === calendarModal) closeCalendarModal();
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
