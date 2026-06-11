fetch('../data/rcc.json')
  .then(response => response.json())
  .then(data => {
    const grid = document.getElementById('rcc-grid');
    const statsMount = document.getElementById('rcc-stats');
    const lightboxRoot = document.getElementById('rcc-lightbox-root');
    const page = document.getElementById('rcc-page');
    const accessGate = document.getElementById('rcc-access-gate');
    const passwordInput = document.getElementById('rcc-password');
    const accessMessage = document.getElementById('rcc-access-message');
    const confirmedToggle = document.getElementById('rcc-confirmed-toggle');
    const filterTabsContainer = document.querySelector('.rcc-filter-tabs');

    if (!grid || !statsMount || !lightboxRoot || !page || !data.rcc || !filterTabsContainer) {
      return;
    }

    const ACCESS_STORAGE_KEY = 'rccAccessGranted';
    const ACCESS_PASSWORD = 'popcorn';

    const films = data.rcc;
    const cardFilms = films.filter(film => film.poster || film.title === 'TBD');
    let activeFilms = cardFilms;

    const parseFilmDate = dateStr => {
      if (!dateStr || typeof dateStr !== 'string') {
        return null;
      }

      const [day, month, year] = dateStr.split('-').map(Number);
      if (!day || !month || !year) {
        return null;
      }

      return new Date(year, month - 1, day);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYearLabel = String(today.getFullYear());

    let activeFilter = 'upcoming';

    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat'];

    const formatDate = (dateStr, long = false) => {
      const [day, month, year] = dateStr.split('-');
      const dateObj = new Date(`${year}-${month}-${day}`);
      if (long) {
        return `${days[dateObj.getDay() + 1]} ${monthsLong[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
      }
      return `${monthsShort[parseInt(month, 10) - 1]} ${parseInt(day, 10)} ${year}`;
    };

    const getFilmYear = film => {
      const parsedDate = parseFilmDate(film.date);
      return parsedDate ? String(parsedDate.getFullYear()) : null;
    };

    const getFilterTabElements = () => Array.from(filterTabsContainer.querySelectorAll('[data-rcc-filter]'));

    const getCardInfoHTML = film => {
      const release = film.year ? ` (${film.year})` : '';
      const series = film.series ? `<span class="rcc-card-series">${film.series}</span>` : '';
      return `
        <p class="rcc-card-title">${film.title}${release}</p>
        ${series}
      `;
    };

    const getFullInfoHTML = film => {
      let infoText = '';

      if (film.series) {
        infoText += `<em class="rcc-series-title">${film.series}</em><hr/>`;
      }

      if (film.title === 'TBD') {
        infoText += 'TBD<br/>';
        if (Array.isArray(film.nominees) && film.nominees.length > 0) {
          infoText += `<hr/><span class="rcc-nominees">Nominees: ${film.nominees.join(', ')}</span><br/>`;
        }
      }

      if (
        film.director &&
        Array.isArray(film.writer) &&
        film.writer.length === 1 &&
        film.writer[0] === film.director
      ) {
        infoText += `Written and Directed by: ${film.director}<br/>`;
      } else {
        if (film.director) {
          infoText += `Directed by: ${film.director}<br/>`;
        }
        if (Array.isArray(film.writer) && film.writer.length > 0) {
          infoText += `Written by: ${film.writer.join(', ')}<br/>`;
        }
      }

      if (Array.isArray(film.cast) && film.cast.length > 0) {
        infoText += `Starring: ${film.cast.join(', ')}<br/>`;
      }

      if (film.runtime) {
        const languages = Array.isArray(film.languages) ? film.languages.join(', ') : '';
        const letterboxdLink = film.link
          ? ` | <a href="${film.link}" target="_blank" rel="noreferrer" class="rcc-link--full">View on Letterboxd</a>`
          : '';
        infoText += `<hr/>${film.runtime} mins${languages ? ` | ${languages}` : ''}${letterboxdLink}<br/>`;
      }

      return infoText;
    };

    const createPosterElement = (film, baseClass, placeholderClass) => {
      if (film.poster) {
        const poster = document.createElement('img');
        poster.src = film.poster;
        poster.alt = `'${film.title}' (${film.year || 'Unknown year'}) poster`;
        poster.className = baseClass;
        return poster;
      }

      const placeholder = document.createElement('div');
      placeholder.className = `${baseClass} ${placeholderClass}`;
      placeholder.textContent = 'TBD';
      placeholder.setAttribute('role', 'img');
      placeholder.setAttribute('aria-label', `'${film.title}' (${film.year || 'Unknown year'}) poster placeholder`);
      return placeholder;
    };

    let currentIndex = 0;
    let keyHandler = null;
    let previousFocus = null;

    const getPrevIndex = () => Math.max(0, currentIndex - 1);
    const getNextIndex = () => Math.min(activeFilms.length - 1, currentIndex + 1);

    const closeLightbox = () => {
      lightboxRoot.innerHTML = '';
      document.body.style.overflow = '';
      if (keyHandler) {
        document.removeEventListener('keydown', keyHandler);
        keyHandler = null;
      }
      if (previousFocus) {
        previousFocus.focus();
      }
    };

    const renderLightbox = () => {
      const film = activeFilms[currentIndex];
      if (!film) {
        return;
      }

      lightboxRoot.innerHTML = '';

      const overlay = document.createElement('div');
      overlay.className = 'rcc-lightbox-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', `${film.title} details`);

      const panel = document.createElement('div');
      panel.className = 'rcc-lightbox-panel';
      panel.classList.add('rcc-lightbox-swipe-surface');

      const topBar = document.createElement('div');
      topBar.className = 'rcc-lightbox-topbar';

      const counter = document.createElement('p');
      counter.className = 'rcc-lightbox-count';
      const releaseYear = film.year ? ` (${film.year})` : '';
      const formattedDate = film.date ? formatDate(film.date, true) : '';
      counter.innerHTML = formattedDate
        ? `${formattedDate} // <br/>${film.title}${releaseYear}`
        : `${film.title}${releaseYear}`;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'rcc-lightbox-close';
      closeBtn.setAttribute('type', 'button');
      closeBtn.setAttribute('aria-label', 'Close lightbox');
      closeBtn.innerHTML = '&#10005;';
      closeBtn.addEventListener('click', closeLightbox);

      topBar.appendChild(counter);
      topBar.appendChild(closeBtn);

      const body = document.createElement('div');
      body.className = 'rcc-lightbox-body';

      const prevBtn = document.createElement('button');
      prevBtn.className = 'rcc-lightbox-nav rcc-lightbox-nav--prev';
      prevBtn.setAttribute('type', 'button');
      prevBtn.setAttribute('aria-label', 'Previous poster');
      prevBtn.innerHTML = '<img src="/assets/icons/arrow-left.svg" alt="" aria-hidden="true">';
      const hasPrev = currentIndex > 0;
      const hasNext = currentIndex < activeFilms.length - 1;
      prevBtn.disabled = !hasPrev;

      const media = document.createElement('div');
      media.className = 'rcc-lightbox-media';

      const mediaPoster = createPosterElement(film, 'rcc-lightbox-poster', 'rcc-lightbox-poster--placeholder');

      let touchStartX = 0;
      let touchStartY = 0;
      let touchDeltaX = 0;
      let isTouchTracking = false;
      let touchAxis = null;

      prevBtn.addEventListener('click', () => {
        if (!hasPrev) {
          return;
        }
        currentIndex = getPrevIndex();
        renderLightbox();
      });

      panel.addEventListener('touchstart', event => {
        if (event.touches.length !== 1) {
          return;
        }

        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchDeltaX = 0;
        isTouchTracking = true;
        touchAxis = null;
        panel.classList.add('is-swipe-active');
        panel.style.transition = 'none';
      }, { passive: true });

      panel.addEventListener('touchmove', event => {
        if (!isTouchTracking || event.touches.length !== 1) {
          return;
        }

        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (!touchAxis) {
          if (absX > 26 && absX > absY * 1.4) {
            touchAxis = 'x';
          } else if (absY > 12 && absY > absX) {
            touchAxis = 'y';
          }
        }

        if (touchAxis === 'x') {
          event.preventDefault();
          touchDeltaX = deltaX;
          const clampedDelta = Math.max(-72, Math.min(72, deltaX));
          panel.style.transform = `translateX(${clampedDelta}px)`;
        }
      }, { passive: false });

      panel.addEventListener('touchend', () => {
        if (!isTouchTracking) {
          return;
        }

        isTouchTracking = false;
        panel.classList.remove('is-swipe-active');
        panel.style.transition = '';
        panel.style.transform = '';
        const axis = touchAxis;
        touchAxis = null;

        if (axis !== 'x') {
          return;
        }

        if (Math.abs(touchDeltaX) < 88) {
          return;
        }

        if (touchDeltaX < 0 && hasNext) {
          currentIndex = getNextIndex();
        } else if (touchDeltaX > 0 && hasPrev) {
          currentIndex = getPrevIndex();
        } else {
          closeLightbox();
          return;
        }

        renderLightbox();
      });

      panel.addEventListener('touchcancel', () => {
        isTouchTracking = false;
        touchAxis = null;
        panel.classList.remove('is-swipe-active');
        panel.style.transition = '';
        panel.style.transform = '';
      });

      const info = document.createElement('div');
      info.className = 'rcc-info-bar rcc-info-bar--full rcc-lightbox-info';
      if (film.series) {
        info.classList.add('rcc-info-bar--series');
      }
      info.innerHTML = getFullInfoHTML(film);

      media.appendChild(mediaPoster);
      media.appendChild(info);

      const nextBtn = document.createElement('button');
      nextBtn.className = 'rcc-lightbox-nav rcc-lightbox-nav--next';
      nextBtn.setAttribute('type', 'button');
      nextBtn.setAttribute('aria-label', 'Next poster');
      nextBtn.innerHTML = '<img src="/assets/icons/arrow-left.svg" alt="" aria-hidden="true">';
      nextBtn.disabled = !hasNext;
      nextBtn.addEventListener('click', () => {
        if (!hasNext) {
          return;
        }
        currentIndex = getNextIndex();
        renderLightbox();
      });

      body.appendChild(prevBtn);
      body.appendChild(media);
      body.appendChild(nextBtn);

      panel.appendChild(topBar);
      panel.appendChild(body);
      overlay.appendChild(panel);

      overlay.addEventListener('click', event => {
        if (event.target === overlay) {
          closeLightbox();
        }
      });

      lightboxRoot.appendChild(overlay);
      closeBtn.focus();
    };

    const openLightbox = index => {
      currentIndex = index;
      previousFocus = document.activeElement;
      document.body.style.overflow = 'hidden';

      if (keyHandler) {
        document.removeEventListener('keydown', keyHandler);
      }

      keyHandler = event => {
        if (!lightboxRoot.firstChild) {
          return;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          closeLightbox();
          return;
        }

        if (event.key === 'ArrowLeft') {
          if (currentIndex <= 0) {
            return;
          }
          event.preventDefault();
          currentIndex = getPrevIndex();
          renderLightbox();
          return;
        }

        if (event.key === 'ArrowRight') {
          if (currentIndex >= activeFilms.length - 1) {
            return;
          }
          event.preventDefault();
          currentIndex = getNextIndex();
          renderLightbox();
        }
      };

      document.addEventListener('keydown', keyHandler);
      renderLightbox();
    };

    const isUpcoming = film => {
      const parsedDate = parseFilmDate(film.date);
      return parsedDate ? parsedDate >= today : false;
    };

    const isSpecialPresentation = film => Boolean(film.series);
    const isConfirmedScreening = film => film.title !== 'TBD';
    const isConfirmedToggleAvailable = () => activeFilter === 'upcoming' || activeFilter === currentYearLabel || activeFilter === 'all';

    const getAvailableYearFilters = () => {
      const filmsByYear = new Map();

      cardFilms.forEach(film => {
        const year = getFilmYear(film);
        if (!year) {
          return;
        }

        if (!filmsByYear.has(year)) {
          filmsByYear.set(year, []);
        }

        filmsByYear.get(year).push(film);
      });

      return Array.from(filmsByYear.entries())
        .filter(([, filmsForYear]) => {
          if (confirmedToggle && confirmedToggle.checked) {
            return filmsForYear.some(isConfirmedScreening);
          }
          return filmsForYear.length > 0;
        })
        .map(([year]) => year)
        .sort((a, b) => Number(b) - Number(a));
    };

    const renderFilterTabs = () => {
      const availableYearFilters = getAvailableYearFilters();
      const availableFilters = ['upcoming', ...availableYearFilters, 'special-presentations', 'all'];

      if (!availableFilters.includes(activeFilter)) {
        activeFilter = 'upcoming';
      }

      filterTabsContainer.innerHTML = availableFilters
        .map(filter => {
          const label = filter === 'upcoming'
            ? 'Upcoming'
            : filter === 'all'
              ? 'All Screenings'
              : filter === 'special-presentations'
                ? 'Special Presentations'
                : filter;
          return `<button class="rcc-filter-tab" type="button" role="tab" data-rcc-filter="${filter}" aria-selected="false">${label}</button>`;
        })
        .join('');
    };

    const getVisibleFilms = () => {
      if (activeFilter === 'all') {
        if (confirmedToggle && !confirmedToggle.disabled && confirmedToggle.checked) {
          return cardFilms.filter(isConfirmedScreening);
        }

        return cardFilms;
      }
      const filteredFilms = activeFilter === 'upcoming'
        ? cardFilms.filter(isUpcoming)
        : activeFilter === 'special-presentations'
          ? cardFilms.filter(isSpecialPresentation)
          : cardFilms.filter(film => getFilmYear(film) === activeFilter);

      if (confirmedToggle && !confirmedToggle.disabled && confirmedToggle.checked) {
        return filteredFilms.filter(isConfirmedScreening);
      }

      return filteredFilms;
    };

    const syncFilterTabs = () => {
      getFilterTabElements().forEach(tab => {
        const isActive = tab.dataset.rccFilter === activeFilter;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      if (confirmedToggle) {
        confirmedToggle.disabled = !isConfirmedToggleAvailable();
        confirmedToggle.parentElement?.classList.toggle('is-disabled', confirmedToggle.disabled);
      }
    };

    const renderGrid = () => {
      activeFilms = getVisibleFilms();
      closeLightbox();
      grid.innerHTML = '';

      activeFilms.forEach((film, index) => {
        const button = document.createElement('button');
        button.className = 'rcc-card';
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Open ${film.title} details`);

        const date = document.createElement('p');
        date.className = 'rcc-card-date rcc-card-date--top';
        date.textContent = formatDate(film.date);

        const cardPoster = createPosterElement(film, 'rcc-card-poster', 'rcc-card-poster--placeholder');

        const info = document.createElement('div');
        info.className = 'rcc-info-bar rcc-info-bar--short';
        info.innerHTML = getCardInfoHTML(film);

        button.appendChild(date);
        button.appendChild(cardPoster);
        button.appendChild(info);
        button.addEventListener('click', () => openLightbox(index));
        grid.appendChild(button);
      });

      renderStats(activeFilms);
    };

    let hasRenderedContent = false;

    const renderContent = () => {
      if (hasRenderedContent) {
        return;
      }

      renderFilterTabs();
      syncFilterTabs();
      renderGrid();
      hasRenderedContent = true;
    };

    const getStoredAccess = () => {
      try {
        return window.localStorage.getItem(ACCESS_STORAGE_KEY) === 'true';
      } catch {
        return false;
      }
    };

    const setStoredAccess = value => {
      try {
        window.localStorage.setItem(ACCESS_STORAGE_KEY, value ? 'true' : 'false');
      } catch {
        // Ignore localStorage write errors and keep current session usable.
      }
    };

    const unlockPage = () => {
      page.classList.remove('is-locked');
      if (accessGate) {
        accessGate.hidden = true;
      }
      renderContent();
    };

    const renderStats = filmsToUse => {
      const shouldHideStats = activeFilter === 'upcoming' || activeFilter === 'special-presentations';
      if (shouldHideStats) {
        statsMount.innerHTML = '';
        statsMount.hidden = true;
        return;
      }

      statsMount.hidden = false;
      const wasOpen = statsMount.querySelector('details.rcc-stats-details')?.open ?? false;
      statsMount.innerHTML = '';

      const details = document.createElement('details');
      details.className = 'rcc-stats-details';

      const summary = document.createElement('summary');
      summary.className = 'rcc-stats-summary';
      summary.textContent = 'Details';
      details.appendChild(summary);

      const statsContent = document.createElement('div');
      statsContent.className = 'rcc-stats-content';

      const createStatBlock = (label, values) => {
        const block = document.createElement('section');
        block.className = 'rcc-stats-block';

        const heading = document.createElement('h2');
        heading.textContent = `${label} //`;
        block.appendChild(heading);

        const list = document.createElement('ul');
        list.className = 'rcc-stat-sublist';

        values.forEach(value => {
          const item = document.createElement('li');
          item.textContent = value;
          list.appendChild(item);
        });

        block.appendChild(list);
        return block;
      };

      const countBy = (arr, keyFn) => arr.reduce((acc, item) => {
        const key = keyFn(item);
        if (key) {
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {});

      const decades = countBy(filmsToUse, film => film.year ? `${Math.floor(Number(film.year) / 10) * 10}s` : null);
      const countries = filmsToUse.reduce((acc, film) => {
        if (Array.isArray(film.country)) {
          film.country.forEach(country => {
            acc[country] = (acc[country] || 0) + 1;
          });
        }
        return acc;
      }, {});
      const languages = filmsToUse.reduce((acc, film) => {
        if (Array.isArray(film.languages)) {
          film.languages.forEach(language => {
            acc[language] = (acc[language] || 0) + 1;
          });
        }
        return acc;
      }, {});

      const castAppearances = {};
      filmsToUse.forEach(film => {
        if (Array.isArray(film.cast)) {
          film.cast.forEach(actor => {
            if (!castAppearances[actor]) {
              castAppearances[actor] = [];
            }
            castAppearances[actor].push(film.title);
          });
        }
      });

      const repeatPerformers = Object.entries(castAppearances)
        .filter(([, movieTitles]) => movieTitles.length > 1)
        .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
        .map(([actor, movieTitles]) => `${actor}: ${movieTitles.length} appearances (${movieTitles.join(', ')})`);

      const totalFilms = filmsToUse.length;
      const directorsList = [...new Set(filmsToUse.map(film => film.director).filter(Boolean))].sort();
      const writersList = [...new Set(filmsToUse.flatMap(film => Array.isArray(film.writer) ? film.writer : []).filter(Boolean))].sort();
      const womenDirectedCount = filmsToUse.filter(film => film.women_directors === true).length;
      const totalRuntime = filmsToUse.reduce((sum, film) => sum + (film.runtime || 0), 0);
      const runtimeHours = Math.floor(totalRuntime / 60);
      const runtimeMinutes = totalRuntime % 60;

      const totalsValues = [
        `Total # of movies: ${totalFilms}`,
        `Total runtime: ${runtimeHours} hrs ${runtimeMinutes} mins`,
        `Directors: ${directorsList.join(', ')}`,
        `Writers: ${writersList.join(', ')}`,
        `Movies directed (or co-directed) by a woman: ${womenDirectedCount}`,
      ];

      const totalsBlock = document.createElement('section');
      totalsBlock.className = 'rcc-stats-block';

      const totalsList = document.createElement('ul');
      totalsList.className = 'rcc-stat-sublist';

      totalsValues.forEach(value => {
        const item = document.createElement('li');
        item.textContent = value;
        totalsList.appendChild(item);
      });

      totalsBlock.appendChild(totalsList);
      statsContent.appendChild(totalsBlock);

      statsContent.appendChild(
        createStatBlock(
          'Decades',
          Object.keys(decades).sort().map(decade => `${decade} movies: ${decades[decade]}`)
        )
      );
      statsContent.appendChild(
        createStatBlock(
          'Countries',
          Object.keys(countries).sort().map(country => `${country} produced movies: ${countries[country]}`)
        )
      );
      statsContent.appendChild(
        createStatBlock(
          'Languages',
          Object.keys(languages).sort().map(language => `${language} language movies: ${languages[language]}`)
        )
      );

      if (repeatPerformers.length > 0) {
        statsContent.appendChild(createStatBlock('Repeat Performers', repeatPerformers));
      }

      details.appendChild(statsContent);
      statsMount.appendChild(details);
      details.open = wasOpen;
    };

    filterTabsContainer.addEventListener('click', event => {
      const tab = event.target.closest('[data-rcc-filter]');
      if (!tab) {
        return;
      }

      const nextFilter = tab.dataset.rccFilter;
      if (!nextFilter || nextFilter === activeFilter) {
        return;
      }

      activeFilter = nextFilter;
      syncFilterTabs();
      renderGrid();
    });

    if (confirmedToggle) {
      confirmedToggle.addEventListener('change', () => {
        renderFilterTabs();
        syncFilterTabs();
        renderGrid();
      });
    }

    if (accessGate) {
      accessGate.addEventListener('submit', event => {
        event.preventDefault();

        if (!passwordInput) {
          return;
        }

        const password = passwordInput.value.trim();
        if (password !== ACCESS_PASSWORD) {
          if (accessMessage) {
            accessMessage.textContent = 'Incorrect password.';
            accessMessage.classList.add('is-error');
          }
          passwordInput.select();
          return;
        }

        setStoredAccess(true);
        if (accessMessage) {
          accessMessage.textContent = '';
          accessMessage.classList.remove('is-error');
        }
        passwordInput.value = '';
        unlockPage();
      });
    }

    if (getStoredAccess()) {
      unlockPage();
    } else {
      page.classList.add('is-locked');
      if (accessGate) {
        accessGate.hidden = false;
      }
      if (accessMessage) {
        accessMessage.textContent = '';
      }
      if (passwordInput) {
        passwordInput.focus();
      }
    }

  });