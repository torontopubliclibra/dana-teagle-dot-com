fetch('../data/rcc.json')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.horizontal-scroll-container');
    if (!container || !data.rcc) return;
    container.style.marginBottom = '90px';
    container.innerHTML = '';

    const formatDateShort = dateStr => {
      const [day, month, year] = dateStr.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)} ${year}`;
    };
    const formatDateLong = dateStr => {
      const [day, month, year] = dateStr.split('-');
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat'];
      const dateObj = new Date(`${year}-${month}-${day}`);
      const dayOfWeek = days[(dateObj.getDay() + 1) % 7];
      return `${dayOfWeek} ${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    };

    const nowPlayingSection = document.createElement('section');
    nowPlayingSection.style.display = 'none';
    nowPlayingSection.id = 'rcc-now-section';
    const today = new Date();
    let nextFilm = null;
    for (const film of data.rcc) {
      if (film.title === 'TBD') continue;
      const [day, month, year] = film.date.split('-');
      const filmDate = new Date(`${year}-${month}-${day}`);
      if (filmDate > today) {
        nextFilm = film;
        break;
      }
    }
    if (nextFilm) {
      const wrapper = document.createElement('div');
      Object.assign(wrapper.style, {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '15px',
        background: '#222',
        margin: '15px 0',
        minHeight: 'calc(100vh - 75px)',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      });
      const img = document.createElement('img');
      img.src = nextFilm.poster;
      img.alt = `'${nextFilm.title}' (${nextFilm.year}) poster`;
      img.className = 'poster';
      Object.assign(img.style, {
        display: 'block',
        height: '100%',
        maxHeight: 'calc(100vh - 90px)',
        maxWidth: '25vw',
        padding: '0',
        background: nextFilm.series ? 'rgba(41, 37, 41, 1)' : 'rgb(34, 34, 34)'
      });
      wrapper.appendChild(img);

      const infoDiv = document.createElement('div');
      Object.assign(infoDiv.style, {
        color: '#c0c5d2',
        fontSize: '0.9rem',
        fontFamily: 'inherit',
        background: '#222',
        width: '100%',
        padding: '15px',
        boxSizing: 'border-box',
        minWidth: '300px'
      });
      let infoText = `<h2 style="font-size:1.5rem;margin:0;">Now Playing at Rusty Cinema Club</h2><hr/>`;
      infoText += `<a href="${nextFilm.link}" target="_blank" rel="norefferrer" style="color: #c0c5d2; text-decoration: underline;font-size:1.2rem;">${nextFilm.title}</a> ${nextFilm.year ? `(${nextFilm.year}) ` : ''}<hr/>${formatDateLong(nextFilm.date)}<br/>`;
      if (nextFilm.series) infoText += `<em style="font-size: 0.9rem;">${nextFilm.series}:</em><br/>`;
      if (nextFilm.director) infoText += `Directed by ${nextFilm.director}<br/>`;
        if (nextFilm.writer) {
          const writers = Array.isArray(nextFilm.writer) ? nextFilm.writer.join(', ') : nextFilm.writer;
          infoText += `Written by ${writers}<br/>`;
        }
      if (nextFilm.runtime) infoText += `${nextFilm.runtime} mins | ${nextFilm.languages ? nextFilm.languages.join(', ') : ''}<br/>`;
      infoDiv.innerHTML = infoText;
      wrapper.appendChild(infoDiv);
      nowPlayingSection.appendChild(wrapper);
    } else {
      nowPlayingSection.innerHTML = '<div class="rcc-info-bar">No upcoming films scheduled.</div>';
    }
    container.parentNode.insertBefore(nowPlayingSection, container);

    data.rcc.forEach(film => {
      if (film.title === 'TBD') return;
      const section = document.createElement('section');
      const infoBar = document.createElement('div');
      infoBar.className = 'rcc-info-bar';
      infoBar.style = 'color: #c0c5d2; padding: 6px 10px; font-size: 0.75rem; font-family: inherit;width:100%;height:32px;box-sizing:border-box;';
      let infoText = '';
      if (film.director) infoText += `${film.director}'s `;
      infoText += `<a href="${film.link}" target="_blank" rel="norefferrer" style="color: #c0c5d2; text-decoration: underline;font-size:0.75rem;">${film.title}</a> (${film.year}) on ${formatDateShort(film.date)} //`;
      infoBar.innerHTML = infoText;
      section.appendChild(infoBar);
      const img = document.createElement('img');
      img.src = film.poster;
      img.alt = `'${film.title}' (${film.year}) poster`;
      img.className = 'poster';
      section.appendChild(img);
      container.appendChild(section);
    });

    const list = document.createElement('ul');
    Object.assign(list.style, {
      listStyle: 'none',
      padding: '0',
      display: 'none',
      flexDirection: 'column',
      marginBottom: '0',
      gap: '15px',
      paddingBottom: '90px'
    });
    data.rcc.forEach(film => {
      const li = document.createElement('li');
      Object.assign(li.style, {
        display: 'flex',
        flexDirection: 'row'
      });
      const infoBar = document.createElement('div');
      infoBar.className = 'rcc-info-bar';
      infoBar.style = 'color: #c0c5d2; padding: 20px; font-size: 0.9rem; font-family: inherit; background: #222; width: 100%; box-sizing: border-box;';
      let infoText = `<strong>${formatDateLong(film.date)} //</strong><br/>`;
      if (film.series) infoText += `<em style="font-size: 0.9rem;">${film.series}:</em><br/>`;
      if (film.title === 'TBD') {
        infoText += `TBD<br/>`;
        if (Array.isArray(film.nominees) && film.nominees.length > 0) {
          infoText += `<span style="font-size:0.85em; color:#b7b7b7;">Nominees: ${film.nominees.join(', ')}</span><br/>`;
        }
      } else {
        infoText += `<a href="${film.link}" target="_blank" rel="norefferrer" style="color: #c0c5d2; text-decoration: underline;font-size:0.9rem;">${film.title}</a> ${film.year ? `(${film.year}) ` : ''}<br/>`;
      }
      const singleWriter = Array.isArray(film.writer) ? film.writer.length === 1 ? film.writer[0] : null : film.writer;
      if (film.director && singleWriter && film.director === singleWriter) {
        infoText += `Written and Directed by ${film.director}<br/>`;
      } else {
        if (film.director) infoText += `Directed by ${film.director}<br/>`;
        if (film.writer) {
          const writers = Array.isArray(film.writer) ? film.writer.join(', ') : film.writer;
          infoText += `Written by ${writers}<br/>`;
        }
      }
      if (film.runtime) infoText += `${film.runtime} mins | ${film.languages ? film.languages.join(', ') : ''}<br/>`;
      infoBar.innerHTML = infoText;
      li.appendChild(infoBar);
      const img = document.createElement('img');
      img.src = (film.title === 'TBD') ? 'blank.png' : film.poster;
      img.alt = `'${film.title}' (${film.year}) poster`;
      img.className = 'poster';
      Object.assign(img.style, {
        display: 'block',
        width: '250px',
        maxWidth: '25%',
        height: 'auto',
        padding: '0',
        background: film.series ? 'rgba(41, 37, 41, 1)' : 'rgb(34, 34, 34)'
      });
      if (film.series) infoBar.style.background = 'rgba(41, 37, 41, 1)';
      li.appendChild(img);
      list.appendChild(li);
    });
    container.parentNode.insertBefore(list, container.nextSibling);

    const listBtn = document.getElementById('rcc-list-btn');
    const postersBtn = document.getElementById('rcc-posters-btn');
    const statsBtn = document.getElementById('rcc-stats-btn');
    const nowBtn = document.getElementById('rcc-now-btn');

    const statsList = document.createElement('ul');
    Object.assign(statsList.style, {
      listStyle: 'none',
      padding: '0',
      display: 'none',
      flexDirection: 'column',
      marginBottom: '0',
      gap: '5px',
      background: 'rgb(34, 34, 34)',
      paddingBottom: '90px',
      padding: '20px'
    });

    const createStatList = (items, label, formatter) => {
      const header = document.createElement('li');
      header.innerHTML = `<strong>${label} //</strong>`;
      const ul = document.createElement('ul');
      Object.assign(ul.style, {
        listStyle: 'none',
        padding: '0',
        marginBottom: '10px',
        fontSize: '0.9rem'
      });
      Object.keys(items).sort().forEach(key => {
        const li = document.createElement('li');
        li.textContent = formatter ? formatter(key, items[key]) : `${key}: ${items[key]}`;
        ul.appendChild(li);
      });
      statsList.appendChild(header);
      statsList.appendChild(ul);
    };

    const decadeCounts = {};
    data.rcc.forEach(film => {
      if (film.year) {
        const decade = Math.floor(film.year / 10) * 10;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      }
    });
    createStatList(decadeCounts, 'Decades', (decade, count) => `${decade}s movie(s): ${count}`);

    const countries = {};
    data.rcc.forEach(film => {
      if (film.country) {
        countries[film.country] = (countries[film.country] || 0) + 1;
      }
    });
    createStatList(countries, 'Countries', (country, count) => `${country} movie(s): ${count}`);

    const languages = {};
    data.rcc.forEach(film => {
      if (film.languages) {
        film.languages.forEach(lang => {
          languages[lang] = (languages[lang] || 0) + 1;
        });
      }
    });
    createStatList(languages, 'Languages', (lang, count) => `${lang} language movie(s): ${count}`);

    const totalFilms = data.rcc.length;
    const directorsList = [...new Set(data.rcc.map(film => film.director).filter(Boolean))].sort();
    const writersSet = new Set();
    data.rcc.forEach(film => {
      if (film.writer) {
        if (Array.isArray(film.writer)) {
          film.writer.forEach(w => writersSet.add(w));
        } else {
          writersSet.add(film.writer);
        }
      }
    });
    const writersList = [...writersSet].sort();
    const totalRuntime = data.rcc.reduce((sum, film) => sum + (film.runtime || 0), 0);
    const totalsUl = document.createElement('ul');
    Object.assign(totalsUl.style, {
      listStyle: 'none',
      padding: '0',
      marginBottom: '10px',
      fontSize: '0.9rem'
    });
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
    totalsHeader.innerHTML = '<strong>Totals //</strong>';
    statsList.appendChild(totalsHeader);
    statsList.appendChild(totalsUl);
    container.parentNode.insertBefore(statsList, container.nextSibling);

    function showView(view) {
      [listBtn, postersBtn, statsBtn, nowBtn].forEach(btn => btn && btn.classList.remove('selected'));
      nowPlayingSection.style.display = 'none'; // Always hidden
      container.style.display = 'none';
      list.style.display = 'none';
      statsList.style.display = 'none';
      // Disable 'now' view
      if (view === 'list') {
        list.style.display = 'flex';
        if (listBtn) listBtn.classList.add('selected');
      } else if (view === 'stats') {
        statsList.style.display = 'flex';
        if (statsBtn) statsBtn.classList.add('selected');
      } else {
        container.style.display = 'flex';
        if (postersBtn) postersBtn.classList.add('selected');
      }
    }

    const hash = window.location.hash.replace('#', '');
    // Default to 'posters' if no valid hash
    showView(['list', 'stats', 'posters'].includes(hash) ? hash : 'posters');

    // Disable nowBtn functionality
    if (listBtn) listBtn.addEventListener('click', () => { window.location.hash = 'list'; showView('list'); });
    if (postersBtn) postersBtn.addEventListener('click', () => { window.location.hash = 'posters'; showView('posters'); });
    if (statsBtn) statsBtn.addEventListener('click', () => { window.location.hash = 'stats'; showView('stats'); });
  });