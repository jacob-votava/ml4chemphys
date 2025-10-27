(function () {
  const DATA_URL = 'assets/data/site.json';
  let cache = null;
  let navIndicatorFrame = null;

  document.addEventListener('DOMContentLoaded', initSite);

  async function initSite() {
    updateCurrentYear();
    attachNavToggle();
    window.addEventListener('resize', handleNavResize, { passive: true });

    try {
      cache = await loadSiteData();
      window.siteData = cache; // expose for page-specific scripts
      renderSiteTitle(cache);
      buildPageNav(cache);
      buildSeasonNav(cache);
      renderJoinAction(cache);
      highlightActiveNav(cache);
      document.dispatchEvent(new CustomEvent('site:data', { detail: cache }));
      renderSponsors(cache);
      scheduleNavIndicatorUpdate();
    } catch (error) {
      console.error('Failed to initialise site data', error);
    }
  }

  async function loadSiteData() {
    if (cache) return cache;
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load ${DATA_URL} (${response.status})`);
    }
    return response.json();
  }

  function renderSiteTitle(data) {
    const titleEl = document.querySelector('[data-site-title]');
    if (titleEl) {
      titleEl.textContent = data?.site?.title || 'Journal Club';
    }
  }

  function buildPageNav(data) {
    const container = document.querySelector('[data-page-nav]');
    if (!container) return;
    container.innerHTML = '';

    const pages = Array.isArray(data?.pages) ? data.pages : [];
    pages.forEach((page) => {
      if (!page?.href) return;
      const li = document.createElement('li');
      li.className = 'site-nav__item';

      const link = document.createElement('a');
      link.className = 'site-nav__link';
      link.href = page.href;
      link.textContent = page.label || page.id;
      link.dataset.pageId = page.id || '';

      li.appendChild(link);
      container.appendChild(li);
    });
  }

  function buildSeasonNav(data) {
    const container = document.querySelector('[data-season-nav]');
    if (!container) return;
    container.innerHTML = '';

    const seasons = Array.isArray(data?.seasons) ? data.seasons : [];
    if (!seasons.length) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'site-nav__item is-empty';
      emptyItem.textContent = 'Seasons coming soon';
      container.appendChild(emptyItem);
      return;
    }

    seasons.forEach((season) => {
      const li = document.createElement('li');
      li.className = 'site-nav__item';

      const link = document.createElement('a');
      link.className = 'site-nav__link';
      link.href = season.page || `${season.id}.html`;
      link.textContent = season.shortTitle || season.title || season.id;
      link.dataset.seasonId = season.id || '';

      li.appendChild(link);
      container.appendChild(li);
    });
  }

  function renderJoinAction(data) {
    const joinLink = document.querySelector('[data-join-link]');
    if (!joinLink) return;

    const signup = data?.mailingList;
    if (!signup) {
      joinLink.classList.add('is-disabled');
      joinLink.setAttribute('aria-disabled', 'true');
      joinLink.href = '#';
      return;
    }

    joinLink.textContent = signup.label || 'Join Us';
    joinLink.href = signup.href || '#';
    if (signup.href) {
      joinLink.removeAttribute('aria-disabled');
      joinLink.classList.remove('is-disabled');
    }
    if (signup.openInNewTab !== false) {
      joinLink.target = '_blank';
      joinLink.rel = 'noopener noreferrer';
    } else {
      joinLink.removeAttribute('target');
      joinLink.removeAttribute('rel');
    }
  }

  function renderSponsors(data) {
    const grid = document.querySelector('[data-sponsor-grid]');
    if (!grid) return;

    const sponsors = Array.isArray(data?.sponsors) ? data.sponsors : [];
    grid.innerHTML = '';

    if (!sponsors.length) {
      const placeholder = document.createElement('article');
      placeholder.className = 'sponsor-card sponsor-card--placeholder';
      placeholder.innerHTML = `
        <div class="sponsor-card__body">
          <p class="sponsor-card__name">Add sponsors in assets/data/site.json</p>
        </div>
      `;
      grid.appendChild(placeholder);
      return;
    }

    sponsors.forEach((sponsor) => {
      const card = document.createElement('article');
      card.className = 'sponsor-card';

      if (sponsor.logo) {
        const media = document.createElement('div');
        media.className = 'sponsor-card__media';

        const img = document.createElement('img');
        img.className = 'sponsor-card__logo';
        img.src = sponsor.logo;
        img.alt = sponsor.name ? `${sponsor.name} logo` : 'Sponsor logo';
        media.appendChild(img);
        card.appendChild(media);
      }

      const body = document.createElement('div');
      body.className = 'sponsor-card__body';

      const nameContent = sponsor.name || sponsor;

      if (sponsor.url) {
        const link = document.createElement('a');
        link.className = 'sponsor-card__link';
        link.href = sponsor.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = nameContent;
        body.appendChild(link);
      } else if (nameContent) {
        const name = document.createElement('p');
        name.className = 'sponsor-card__name';
        name.textContent = nameContent;
        body.appendChild(name);
      }

      if (sponsor.note) {
        const note = document.createElement('p');
        note.className = 'sponsor-card__note';
        note.textContent = sponsor.note;
        body.appendChild(note);
      }

      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  function highlightActiveNav(data) {
    const body = document.body;
    const pageId = body?.dataset.page;
    const seasonId = body?.dataset.season || data?.site?.currentSeason;

    const pageLinks = document.querySelectorAll('[data-page-nav] .site-nav__link');
    pageLinks.forEach((link) => {
      const isActive = link.dataset.pageId === pageId;
      link.classList.toggle('is-active', isActive);
      link.parentElement?.classList.toggle('is-active', isActive);
    });

    const seasonLinks = document.querySelectorAll('[data-season-nav] .site-nav__link');
    seasonLinks.forEach((link) => {
      const isActive = pageId === 'season' && link.dataset.seasonId === seasonId;
      link.classList.toggle('is-active', isActive);
      link.parentElement?.classList.toggle('is-active', isActive);
    });

    scheduleNavIndicatorUpdate();
  }

  function attachNavToggle() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const panel = document.querySelector('[data-nav-panel]');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      panel.classList.toggle('is-visible', !isOpen);
    });

    window.addEventListener('click', (event) => {
      if (!panel.contains(event.target) && event.target !== toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        panel.classList.remove('is-visible');
      }
    });
  }

  function updateCurrentYear() {
    const yearEl = document.querySelector('[data-current-year]');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  function handleNavResize() {
    scheduleNavIndicatorUpdate();
  }

  function scheduleNavIndicatorUpdate() {
    if (navIndicatorFrame) return;
    navIndicatorFrame = requestAnimationFrame(() => {
      navIndicatorFrame = null;
      updateNavIndicator(document.querySelector('[data-page-nav]'));
      updateNavIndicator(document.querySelector('[data-season-nav]'));
    });
  }

  function updateNavIndicator(list) {
    if (!list) return;
    const activeLink = list.querySelector('.site-nav__link.is-active');
    if (!activeLink) {
      list.style.setProperty('--nav-indicator-opacity', '0');
      list.style.setProperty('--nav-indicator-width', '0px');
      list.style.setProperty('--nav-indicator-offset', '0px');
      return;
    }

    const listRect = list.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const offset = linkRect.left - listRect.left;

    list.style.setProperty('--nav-indicator-width', `${linkRect.width}px`);
    list.style.setProperty('--nav-indicator-offset', `${offset}px`);
    list.style.setProperty('--nav-indicator-opacity', '1');
  }
})();
