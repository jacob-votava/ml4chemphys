(function () {
  document.addEventListener('DOMContentLoaded', initSeasonPage);

  async function initSeasonPage() {
    const seasonId = document.body?.dataset.season;
    if (!seasonId) {
      console.warn('Season page missing data-season attribute');
      return;
    }

    try {
      const [seasonData, siteData] = await Promise.all([
        loadSeasonData(seasonId),
        loadSiteData()
      ]);

      renderSeasonHero(seasonData, siteData, seasonId);
      renderSeasonContent(seasonData);
    } catch (error) {
      console.error(`Unable to render ${seasonId}`, error);
      renderLoadError();
    }
  }

  async function loadSeasonData(seasonId) {
    const response = await fetch(`assets/data/seasons/${seasonId}.json`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load season data (${response.status})`);
    }
    return response.json();
  }

  async function loadSiteData() {
    if (window.siteData) return window.siteData;
    const response = await fetch('assets/data/site.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load site data (${response.status})`);
    }
    const data = await response.json();
    window.siteData = data;
    return data;
  }

  function renderSeasonHero(seasonData, siteData, seasonId) {
    const heroMeta = Array.isArray(siteData?.seasons)
      ? siteData.seasons.find((entry) => entry.id === seasonId)
      : null;

    const eyebrow = document.querySelector('[data-hero-eyebrow]');
    const title = document.querySelector('[data-hero-title]');
    const subtitle = document.querySelector('[data-hero-subtitle]');
    const metaWrapper = document.querySelector('[data-hero-meta]');
    const presentationCount = document.querySelector('[data-hero-presentations]');
    const rangeEl = document.querySelector('[data-hero-range]');
    const leadEl = document.querySelector('[data-season-lead]');

    const heroConfig = heroMeta?.hero || {};

    if (eyebrow && heroConfig.eyebrow) {
      eyebrow.textContent = heroConfig.eyebrow;
    }

    if (title) {
      title.textContent = heroConfig.title || seasonData.title || seasonId;
    }

    if (subtitle) {
      subtitle.textContent = heroConfig.subtitle || seasonData.lead || '';
    }

    const presentations = Array.isArray(seasonData.presentations)
      ? seasonData.presentations
      : [];

    if (presentationCount) {
      const count = presentations.length;
      presentationCount.textContent = `${count} presentation${count === 1 ? '' : 's'}`;
    }

    if (rangeEl) {
      rangeEl.textContent = buildSeasonDateRange(presentations, heroMeta?.dates);
    }

    if (metaWrapper) {
      metaWrapper.classList.toggle('is-hidden', !presentations.length && !heroMeta?.dates);
    }

    const heroSection = document.querySelector('[data-season-hero]');
    const mediaWrapper = document.querySelector('[data-hero-media]');
    const heroImage = mediaWrapper?.querySelector('[data-hero-image]');
    const heroCredit = mediaWrapper?.querySelector('[data-hero-credit]');

    if (mediaWrapper) {
      const imageSrc = heroConfig.image || seasonData.heroImage || '';
      const imageAlt = heroConfig.imageAlt || seasonData.heroImageAlt || '';
      const creditText = heroConfig.credit || seasonData.heroCredit || '';

      let hasMedia = false;

      if (heroImage) {
        if (imageSrc) {
          heroImage.src = imageSrc;
          heroImage.alt = imageAlt || heroImage.alt || '';
          heroImage.hidden = false;
          heroImage.removeAttribute('hidden');
          hasMedia = true;
        } else {
          heroImage.removeAttribute('src');
          heroImage.hidden = true;
          heroImage.setAttribute('hidden', '');
        }
      }

      if (heroCredit) {
        if (creditText) {
          heroCredit.textContent = creditText;
          heroCredit.hidden = false;
          heroCredit.removeAttribute('hidden');
          hasMedia = true;
        } else {
          heroCredit.textContent = '';
          heroCredit.hidden = true;
          heroCredit.setAttribute('hidden', '');
        }
      }

      mediaWrapper.hidden = !hasMedia;
      if (hasMedia) {
        mediaWrapper.removeAttribute('hidden');
      } else {
        mediaWrapper.setAttribute('hidden', '');
      }
      if (heroSection) {
        heroSection.classList.toggle('hero--season--with-media', hasMedia);
      }
    }

    if (leadEl) {
      leadEl.textContent = seasonData.lead || heroConfig.subtitle || leadEl.textContent;
    }
  }

  function renderSeasonContent(seasonData) {
    const container = document.querySelector('[data-season-container]');
    const grid = document.querySelector('[data-presentation-grid]');
    if (!container || !grid) return;

    const title = container.querySelector('.season__title');
    const description = container.querySelector('.season__description');

    if (title && seasonData.listTitle) {
      title.textContent = seasonData.listTitle;
    }
    if (description && seasonData.listDescription) {
      description.textContent = seasonData.listDescription;
    }

    grid.innerHTML = '';

    const presentations = Array.isArray(seasonData.presentations)
      ? seasonData.presentations.slice().sort(comparePresentations)
      : [];

    if (!presentations.length) {
      const placeholder = document.createElement('article');
      placeholder.className = 'presentation-card presentation-card--placeholder';
      placeholder.innerHTML = `
        <div class="presentation-card__image" aria-hidden="true"></div>
        <div class="presentation-card__body">
          <h3 class="presentation-card__title">Schedule coming soon</h3>
          <p class="presentation-card__meta">Check back for confirmed speakers and session details.</p>
          <p class="presentation-card__summary">Join the mailing list for announcements or reach out if you're interested in presenting.</p>
        </div>
      `;
      grid.appendChild(placeholder);
      return;
    }

    presentations.forEach((presentation) => {
      const card = createPresentationCard(presentation, seasonData.id);
      grid.appendChild(card);
    });
  }

  function createPresentationCard(presentation, seasonId) {
    const article = document.createElement('article');
    article.className = 'presentation-card';

    const paperLink = presentation.paper?.link;
    const image = document.createElement(paperLink ? 'a' : 'div');
    image.className = 'presentation-card__image';
    if (paperLink) {
      image.href = paperLink;
      image.target = '_blank';
      image.rel = 'noopener noreferrer';
      const label = presentation.paper?.title || presentation.title || 'Paper link';
      image.setAttribute('aria-label', `Open paper: ${label}`);
    }

    const screenshotPath = resolveScreenshot(presentation, seasonId);
    if (screenshotPath) {
      image.style.setProperty('background-image', `url('${screenshotPath}')`);
    }

    const body = document.createElement('div');
    body.className = 'presentation-card__body';

    const title = document.createElement('h3');
    title.className = 'presentation-card__title';
    const titleText = presentation.title || presentation.paper?.title || 'Untitled session';
    if (paperLink) {
      const titleLink = document.createElement('a');
      titleLink.className = 'presentation-card__title-link';
      titleLink.href = paperLink;
      titleLink.target = '_blank';
      titleLink.rel = 'noopener noreferrer';
      titleLink.textContent = titleText;
      title.appendChild(titleLink);
    } else {
      title.textContent = titleText;
    }

    const meta = document.createElement('p');
    meta.className = 'presentation-card__meta';
    populatePresentationMeta(meta, presentation);

    const summary = document.createElement('p');
    summary.className = 'presentation-card__summary';
    summary.textContent = presentation.summary || presentation.paper?.summary || '';

    const links = buildResourceLinks(presentation.resources || []);
    const tags = buildTagList(presentation.tags || presentation.paper?.tags || []);

    body.appendChild(title);
    if (meta.textContent.trim()) body.appendChild(meta);
    if (summary.textContent.trim()) body.appendChild(summary);
    if (links) body.appendChild(links);
    if (tags) body.appendChild(tags);

    article.appendChild(image);
    article.appendChild(body);
    return article;
  }

  function populatePresentationMeta(container, presentation) {
    container.innerHTML = '';

    const segments = [];

    if (presentation.presenter) {
      const presenterSegment = document.createElement('span');
      presenterSegment.className = 'presentation-card__meta-item';
      presenterSegment.append('Presented by ');

      if (presentation.presenterLink) {
        const link = document.createElement('a');
        link.className = 'presentation-card__meta-link';
        link.href = presentation.presenterLink;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = presentation.presenter;
        presenterSegment.appendChild(link);
      } else {
        presenterSegment.append(presentation.presenter);
      }

      segments.push(presenterSegment);
    }

    if (presentation.date) {
      const dateSegment = document.createElement('span');
      dateSegment.className = 'presentation-card__meta-item';
      dateSegment.textContent = formatDate(presentation.date);
      segments.push(dateSegment);
    }

    if (presentation.time) {
      const timeSegment = document.createElement('span');
      timeSegment.className = 'presentation-card__meta-item';
      timeSegment.textContent = presentation.time;
      segments.push(timeSegment);
    }

    if (presentation.location) {
      const locationSegment = document.createElement('span');
      locationSegment.className = 'presentation-card__meta-item';
      locationSegment.textContent = presentation.location;
      segments.push(locationSegment);
    }

    if (presentation.paper?.authors) {
      const authorSegment = document.createElement('span');
      authorSegment.className = 'presentation-card__meta-item';
      authorSegment.textContent = presentation.paper.authors;
      segments.push(authorSegment);
    }

    if (!segments.length) {
      container.textContent = '';
      return;
    }

    segments.forEach((segment, index) => {
      if (index > 0) {
        container.appendChild(document.createTextNode(' • '));
      }
      container.appendChild(segment);
    });
  }

  function buildResourceLinks(resources) {
    const links = Array.isArray(resources) ? resources.filter((resource) => Boolean(resource?.url)) : [];
    const filtered = links.filter(Boolean);
    if (!filtered.length) return null;

    const wrapper = document.createElement('div');
    wrapper.className = 'presentation-card__links';

    filtered.forEach((resource) => {
      const anchor = document.createElement('a');
      anchor.className = 'presentation-card__link';
      anchor.href = resource.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = resource.label || formatResourceLabel(resource.type);
      wrapper.appendChild(anchor);
    });

    return wrapper;
  }

  function buildTagList(tags) {
    const tagList = Array.isArray(tags) ? tags.filter(Boolean) : [];
    if (!tagList.length) return null;

    const wrapper = document.createElement('div');
    wrapper.className = 'presentation-card__tags';

    tagList.forEach((tag) => {
      const pill = document.createElement('span');
      pill.className = 'presentation-card__tag';
      pill.textContent = tag;
      wrapper.appendChild(pill);
    });

    return wrapper;
  }

  function buildSeasonDateRange(presentations, fallback) {
    const dates = presentations
      .map((presentation) => parseDateValue(presentation.date))
      .filter(Boolean)
      .sort((a, b) => a - b);

    if (dates.length === 0) {
      return fallback || 'Upcoming sessions';
    }

    const first = dates[0];
    const last = dates[dates.length - 1];
    if (first.toDateString() === last.toDateString()) {
      return formatDate(first, { includeYear: true });
    }

    return `${formatDate(first)} – ${formatDate(last, { includeYear: true })}`;
  }

  function comparePresentations(a, b) {
    const dateA = parseDateValue(a.date);
    const dateB = parseDateValue(b.date);
    if (dateA && dateB) {
      return dateA.valueOf() - dateB.valueOf();
    }
    if (dateA) return -1;
    if (dateB) return 1;
    return String(a.title || '').localeCompare(String(b.title || ''));
  }

  function resolveScreenshot(presentation, seasonId) {
    const path = presentation.paper?.screenshot || presentation.screenshot;
    if (!path) return '';
    if (/^https?:/i.test(path)) {
      return path;
    }
    const clean = String(path).replace(/^[./]+/, '');
    if (/^assets\//.test(clean)) {
      return clean;
    }
    return `assets/images/${seasonId}/${clean}`;
  }

  function formatDate(input, options = {}) {
    const date = parseDateValue(input);
    if (!date) return String(input);

    const locale = navigator.language || 'en-US';
    const config = { month: 'short', day: 'numeric' };
    if (options.includeYear || date.getFullYear() !== new Date().getFullYear()) {
      config.year = 'numeric';
    }
    return date.toLocaleDateString(locale, config);
  }

  function parseDateValue(value) {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;

    if (typeof value === 'string') {
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const [, year, month, day] = match;
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        if (!Number.isNaN(date.valueOf())) return date;
      }
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.valueOf()) ? null : parsed;
  }

  function formatResourceLabel(type) {
    if (!type) return 'Resource';
    return type.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function renderLoadError() {
    const grid = document.querySelector('[data-presentation-grid]');
    const title = document.querySelector('[data-hero-title]');
    const subtitle = document.querySelector('[data-hero-subtitle]');
    if (title) title.textContent = 'Season unavailable';
    if (subtitle) subtitle.textContent = 'We could not load the selected season. Check the data path or JSON syntax.';
    if (grid) {
      grid.innerHTML = '';
      const errorCard = document.createElement('article');
      errorCard.className = 'presentation-card presentation-card--placeholder';
      errorCard.innerHTML = `
        <div class="presentation-card__body">
          <h3 class="presentation-card__title">Data not found</h3>
          <p class="presentation-card__meta">Expected to load assets/data/seasons/${document.body?.dataset.season}.json.</p>
        </div>
      `;
      grid.appendChild(errorCard);
    }
  }
})();
