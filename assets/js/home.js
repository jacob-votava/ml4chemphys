(function () {
  document.addEventListener('DOMContentLoaded', initHome);
  document.addEventListener('site:data', (event) => {
    renderHome(event.detail);
  });

  function initHome() {
    if (window.siteData) {
      renderHome(window.siteData);
    }
  }

  function renderHome(data) {
    renderHero(data?.home?.hero, data?.site?.currentSeason);
    renderSeasonCards(data?.seasons || []);
  }

  function renderHero(hero, currentSeasonId) {
    if (!hero) return;

    const eyebrow = document.querySelector('[data-hero-eyebrow]');
    const title = document.querySelector('[data-hero-title]');
    const subtitle = document.querySelector('[data-hero-subtitle]');
    const cta = document.querySelector('[data-hero-cta]');

    if (eyebrow && hero.eyebrow) eyebrow.textContent = hero.eyebrow;
    if (title && hero.title) title.textContent = hero.title;
    if (subtitle && hero.subtitle) subtitle.textContent = hero.subtitle;

    if (cta) {
      if (hero.cta?.label) cta.textContent = hero.cta.label;
      const href = hero.cta?.href || (currentSeasonId ? `${currentSeasonId}.html` : '#');
      cta.setAttribute('href', href);
    }
  }

  function renderSeasonCards(seasons) {
    const grid = document.querySelector('[data-season-grid]');
    if (!grid) return;

    grid.innerHTML = '';

    if (!seasons.length) {
      const placeholder = document.createElement('article');
      placeholder.className = 'season-card season-card--placeholder';
      placeholder.innerHTML = `
        <div class="season-card__body">
          <h3 class="season-card__title">Season archive coming soon</h3>
          <p class="season-card__summary">We will publish sessions once the first season wraps up.</p>
        </div>
      `;
      grid.appendChild(placeholder);
      return;
    }

    seasons.forEach((season) => {
      const card = document.createElement('article');
      card.className = 'season-card';

      const header = document.createElement('div');
      header.className = 'season-card__header';

      if (season.status) {
        const status = document.createElement('span');
        status.className = `season-card__status season-card__status--${season.status}`;
        status.textContent = formatStatus(season.status);
        header.appendChild(status);
      }

      if (season.dates) {
        const dates = document.createElement('span');
        dates.className = 'season-card__dates';
        dates.textContent = season.dates;
        header.appendChild(dates);
      }

      const body = document.createElement('div');
      body.className = 'season-card__body';

      const title = document.createElement('h3');
      title.className = 'season-card__title';
      title.textContent = season.title || season.shortTitle || 'Season';

      const summary = document.createElement('p');
      summary.className = 'season-card__summary';
      summary.textContent = season.description || '';

      const link = document.createElement('a');
      link.className = 'season-card__link';
      link.href = season.page || `${season.id}.html`;
      link.textContent = 'View season';

      body.appendChild(title);
      if (summary.textContent.trim()) body.appendChild(summary);
      body.appendChild(link);

      card.appendChild(header);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  function formatStatus(status) {
    switch (status) {
      case 'active':
        return 'Active';
      case 'archived':
        return 'Archived';
      case 'upcoming':
        return 'Upcoming';
      default:
        return status;
    }
  }
})();
