fetch('../data/rcc.json')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.horizontal-scroll-container');
    if (!container || !data.rcc) return;
    container.innerHTML = '';
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat'];
    const formatDate = (dateStr, long = false) => {
      const [day, month, year] = dateStr.split('-');
      const dateObj = new Date(`${year}-${month}-${day}`);
      if (long) {
        return `${days[dateObj.getDay()]} ${monthsLong[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
      }
      return `${monthsShort[parseInt(month, 10) - 1]} ${parseInt(day, 10)} ${year}`;
    };
    const getInfoBarHTML = (film, opts = {}) => {
      let infoText = '';
      if (opts.short) {
        if (film.director) infoText += `${film.director}'s `;
        infoText += `<a href="${film.link}" target="_blank" rel="norefferrer" class="rcc-link">${film.title}</a> (${film.year}) on ${formatDate(film.date)} //`;
        return infoText;
      }
      infoText += `<strong>${formatDate(film.date, true)} //</strong><br/>`;
      if (film.series) infoText += `<em class="rcc-series-title">${film.series}:</em><br/>`;
      if (film.title === 'TBD') {
        infoText += `TBD<br/>`;
        if (Array.isArray(film.nominees) && film.nominees.length > 0) {
          infoText += `<span class="rcc-nominees">Nominees: ${film.nominees.join(', ')}</span><br/>`;
        }
      } else {
        infoText += `<a href="${film.link}" target="_blank" rel="norefferrer" class="rcc-link--full">${film.title}</a> ${film.year ? `(${film.year}) ` : ''}<br/>`;
      }
      if (
        film.director &&
        Array.isArray(film.writer) &&
        film.writer.length === 1 &&
        film.writer[0] === film.director
      ) {
        infoText += `<hr/>Written and Directed by: ${film.director}<br/>`;
      } else {
        if (film.director) infoText += `<hr/>Directed by: ${film.director}<br/>`;
        if (Array.isArray(film.writer) && film.writer.length > 0) {
          infoText += `Written by: ${film.writer.join(', ')}<br/>`;
        }
      }
      if (Array.isArray(film.cast) && film.cast.length > 0) {
        infoText += `Starring: ${film.cast.join(', ')}<br/>`;
      }
      if (film.runtime) infoText += `<hr/>${film.runtime} mins | ${film.languages ? film.languages.join(', ') : ''}<br/>`;
      return infoText;
    };
    const createPosterSection = film => {
      if (film.title === 'TBD') return null;
      const section = document.createElement('section');
      const infoBar = document.createElement('div');
      infoBar.className = 'rcc-info-bar rcc-info-bar--short';
      infoBar.innerHTML = getInfoBarHTML(film, { short: true });
      section.appendChild(infoBar);
      const img = document.createElement('img');
      img.src = film.poster;
      img.alt = `'${film.title}' (${film.year}) poster`;
      img.className = 'poster';
      section.appendChild(img);
      return section;
    };
    const createListItem = film => {
      const li = document.createElement('li');
      li.className = 'rcc-list-item';
      const infoBar = document.createElement('div');
      infoBar.className = 'rcc-info-bar rcc-info-bar--full';
      infoBar.innerHTML = getInfoBarHTML(film);
      if (film.series) infoBar.classList.add('rcc-info-bar--series');
      li.appendChild(infoBar);
      const img = document.createElement('img');
      img.src = (film.title === 'TBD') ? 'blank.png' : film.poster;
      img.alt = `'${film.title}' (${film.year}) poster`;
      img.className = `poster rcc-list-poster${film.series ? ' rcc-list-poster--series' : ''}${film.title === 'TBD' ? ' tbd' : ''}`;
      if (film.title !== 'TBD') {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => openLightbox(film.poster, film.title, film.year));
      }
      li.appendChild(img);
      return li;
    };
    const openLightbox = (src, title, year) => {
      const overlay = document.createElement('div');
      overlay.className = 'rcc-lightbox-overlay';
      const content = document.createElement('div');
      content.className = 'rcc-lightbox-content';
      const banner = document.createElement('div');
      banner.className = 'rcc-lightbox-banner';
      const closeBtn = document.createElement('button');
      closeBtn.className = 'rcc-lightbox-close';
      closeBtn.innerHTML = '&#10005;';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.addEventListener('click', () => overlay.remove());
      banner.appendChild(closeBtn);
      const img = document.createElement('img');
      img.src = src;
      img.alt = `'${title}' (${year}) poster`;
      content.appendChild(banner);
      content.appendChild(img);
      overlay.appendChild(content);
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.remove();
      });
      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') {
          overlay.remove();
          document.removeEventListener('keydown', handler);
        }
      });
      document.body.appendChild(overlay);
    };
    data.rcc.forEach(film => {
      const section = createPosterSection(film);
      if (section) container.appendChild(section);
    });
    const list = document.createElement('ul');
    list.className = 'rcc-list';
    data.rcc.forEach(film => {
      list.appendChild(createListItem(film));
    });
    container.parentNode.insertBefore(list, container.nextSibling);
    const listBtn = document.getElementById('rcc-list-btn');
    const postersBtn = document.getElementById('rcc-posters-btn');
    const statsBtn = document.getElementById('rcc-stats-btn');
    const statsList = document.createElement('ul');
    statsList.className = 'rcc-stats-list';
    const createStatList = (items, label, formatter) => {
      const header = document.createElement('li');
      header.innerHTML = `<strong>${label} //</strong>`;
      const ul = document.createElement('ul');
      ul.className = 'rcc-stat-sublist';
      Object.keys(items).sort().forEach(key => {
        const li = document.createElement('li');
        li.textContent = formatter ? formatter(key, items[key]) : `${key}: ${items[key]}`;
        ul.appendChild(li);
      });
      statsList.appendChild(header);
      statsList.appendChild(ul);
    };
    const countBy = (arr, keyFn) => arr.reduce((acc, item) => {
      const key = keyFn(item);
      if (key) acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    createStatList(countBy(data.rcc, film => film.year ? Math.floor(film.year / 10) * 10 : null), 'Decades', (decade, count) => `${decade}s movie(s): ${count}`);
    createStatList(
      data.rcc.reduce((acc, film) => {
        if (film.country) film.country.forEach(c => acc[c] = (acc[c] || 0) + 1);
        return acc;
      }, {}),
      '<hr/>Countries',
      (country, count) => `${country} produced movie(s): ${count}`
    );
    createStatList(
      data.rcc.reduce((acc, film) => {
        if (film.languages) film.languages.forEach(lang => acc[lang] = (acc[lang] || 0) + 1);
        return acc;
      }, {}),
      '<hr/>Languages',
      (lang, count) => `${lang} language movie(s): ${count}`
    );
    const castAppearances = {};
    data.rcc.forEach(film => {
      if (Array.isArray(film.cast)) {
        film.cast.forEach(actor => {
          if (!castAppearances[actor]) castAppearances[actor] = [];
          castAppearances[actor].push(film.title);
        });
      }
    });
    const repeatPerformers = Object.entries(castAppearances)
      .filter(([, movies]) => movies.length > 1)
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
    if (repeatPerformers.length > 0) {
      const rpHeader = document.createElement('li');
      rpHeader.innerHTML = '<hr/><strong>Repeat Performers //</strong>';
      const rpUl = document.createElement('ul');
      rpUl.className = 'rcc-stat-sublist';
      repeatPerformers.forEach(([actor, movies]) => {
        const li = document.createElement('li');
        li.textContent = `${actor}: ${movies.length} appearances (${movies.join(', ')})`;
        rpUl.appendChild(li);
      });
      statsList.appendChild(rpHeader);
      statsList.appendChild(rpUl);
    }
    const totalFilms = data.rcc.length;
    const directorsList = [...new Set(data.rcc.map(film => film.director).filter(Boolean))].sort();
    const writersList = [...new Set(
      data.rcc.flatMap(film => Array.isArray(film.writer) ? film.writer : []).filter(Boolean)
    )].sort();
    const totalRuntime = data.rcc.reduce((sum, film) => sum + (film.runtime || 0), 0);
    const totalsUl = document.createElement('ul');
    totalsUl.className = 'rcc-stat-sublist';
    [
      `Directors: ${directorsList.join(', ')}`,
      `Writers: ${writersList.join(', ')}`,
      `Total runtime: ${totalRuntime} mins (${(totalRuntime / 60).toFixed(2)} hrs)`,
      `Total # of movies: ${totalFilms}`
    ].forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      totalsUl.appendChild(li);
    });
    const totalsHeader = document.createElement('li');
    totalsHeader.innerHTML = '<hr/><strong>Totals //</strong>';
    statsList.appendChild(totalsHeader);
    statsList.appendChild(totalsUl);
    container.parentNode.insertBefore(statsList, container.nextSibling);
    function showView(view) {
      [listBtn, postersBtn, statsBtn].forEach(btn => btn && btn.classList.remove('selected'));
      container.classList.toggle('hidden', view !== 'posters');
      list.classList.toggle('active', view === 'list');
      statsList.classList.toggle('active', view === 'stats');
      if (view === 'list' && listBtn) listBtn.classList.add('selected');
      else if (view === 'stats' && statsBtn) statsBtn.classList.add('selected');
      else if (postersBtn) postersBtn.classList.add('selected');
    }
    const hash = window.location.hash.replace('#', '');
    showView(['list', 'stats', 'posters'].includes(hash) ? hash : 'posters');
    if (listBtn) listBtn.addEventListener('click', () => { window.location.hash = 'list'; showView('list'); });
    if (postersBtn) postersBtn.addEventListener('click', () => { window.location.hash = 'posters'; showView('posters'); });
    if (statsBtn) statsBtn.addEventListener('click', () => { window.location.hash = 'stats'; showView('stats'); });
  });