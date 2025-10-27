(function () {
  document.addEventListener('DOMContentLoaded', initAbout);
  document.addEventListener('site:data', (event) => {
    renderAbout(event.detail);
  });

  function initAbout() {
    if (window.siteData) {
      renderAbout(window.siteData);
    }
  }

  function renderAbout(data) {
    const about = data?.about;
    if (!about) return;

    const hero = about.hero || {};
    const eyebrow = document.querySelector('[data-hero-eyebrow]');
    const title = document.querySelector('[data-hero-title]');
    const subtitle = document.querySelector('[data-hero-subtitle]');
    const metaWrapper = document.querySelector('[data-hero-meta]');
    const metaText = document.querySelector('[data-hero-meta-text]');

    if (eyebrow && hero.eyebrow) eyebrow.textContent = hero.eyebrow;
    if (title && hero.title) title.textContent = hero.title;
    if (subtitle && hero.subtitle) subtitle.textContent = hero.subtitle;
    if (metaWrapper) {
      metaWrapper.hidden = true;
    }

    const aboutSection = document.querySelector('[data-about-section]');
    const bodyContainer = document.querySelector('[data-about-body]');
    if (bodyContainer) {
      bodyContainer.innerHTML = '';
      const paragraphs = Array.isArray(about.body) ? about.body : [];
      const meaningfulParagraphs = paragraphs.filter(
        (text) => typeof text === 'string' && text.trim().length
      );

      if (!meaningfulParagraphs.length) {
        if (aboutSection) aboutSection.hidden = true;
      } else {
        if (aboutSection) aboutSection.hidden = false;
        meaningfulParagraphs.forEach((text) => {
          const p = document.createElement('p');
          p.textContent = text;
          bodyContainer.appendChild(p);
        });
      }
    }

    const organizerGrid = document.querySelector('[data-about-organizers]');
    if (organizerGrid) {
      renderProfileCards(
        organizerGrid,
        about.organizers,
        'Add organizer profiles in assets/data/site.json'
      );
    }

    const advisorGrid = document.querySelector('[data-about-advisors]');
    if (advisorGrid) {
      renderProfileCards(
        advisorGrid,
        about.advisors,
        'Add faculty advisors in assets/data/site.json'
      );
    }
  }

  function renderProfileCards(container, profiles, placeholderText) {
    container.innerHTML = '';
    const entries = Array.isArray(profiles) ? profiles : [];

    if (!entries.length) {
      const placeholder = document.createElement('article');
      placeholder.className = 'organizer-card organizer-card--placeholder';

      const body = document.createElement('div');
      body.className = 'organizer-card__body';

      const heading = document.createElement('h3');
      heading.className = 'organizer-card__name';
      heading.textContent = placeholderText;

      body.appendChild(heading);
      placeholder.appendChild(body);
      container.appendChild(placeholder);
      return;
    }

    entries.forEach((profile) => {
      if (!profile) return;
      container.appendChild(buildProfileCard(profile));
    });
  }

  function buildProfileCard(profile) {
    const card = document.createElement('article');
    card.className = 'organizer-card';

    if (profile.linkedin) {
      card.dataset.linked = 'true';
    }

    const media = document.createElement('div');
    media.className = 'organizer-card__media';

    if (profile.headshot) {
      const img = document.createElement('img');
      img.className = 'organizer-card__photo';
      img.src = profile.headshot;
      img.alt = profile.name ? `${profile.name} headshot` : 'Profile portrait';
      media.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'organizer-card__photo organizer-card__photo--placeholder';
      const initial = profile.name ? String(profile.name).trim().charAt(0).toUpperCase() : '?';
      placeholder.textContent = initial || '?';
      media.appendChild(placeholder);
    }

    const body = document.createElement('div');
    body.className = 'organizer-card__body';

    const name = document.createElement('h3');
    name.className = 'organizer-card__name';

    if (profile.linkedin) {
      const link = document.createElement('a');
      link.href = profile.linkedin;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = profile.name || 'Contributor';
      name.appendChild(link);
    } else {
      name.textContent = profile.name || 'Contributor';
    }

    const affiliation = document.createElement('p');
    affiliation.className = 'organizer-card__affiliation';
    affiliation.textContent = profile.affiliation || '';

    const bio = document.createElement('p');
    bio.className = 'organizer-card__bio';
    bio.textContent = profile.bio || '';

    body.appendChild(name);
    if (affiliation.textContent.trim()) body.appendChild(affiliation);
    if (bio.textContent.trim()) body.appendChild(bio);

    card.appendChild(media);
    card.appendChild(body);
    return card;
  }
})();
