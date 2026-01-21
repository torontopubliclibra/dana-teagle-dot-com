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
      const dayOfWeek = days[dateObj.getDay()];
      return `${dayOfWeek} ${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    };

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
      if (film.director) infoText += `Directed by ${film.director}<br/>`;
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
      [listBtn, postersBtn, statsBtn].forEach(btn => btn && btn.classList.remove('selected'));
      if (view === 'list') {
        container.style.display = 'none';
        list.style.display = 'flex';
        statsList.style.display = 'none';
        if (listBtn) listBtn.classList.add('selected');
      } else if (view === 'stats') {
        container.style.display = 'none';
        list.style.display = 'none';
        statsList.style.display = 'flex';
        if (statsBtn) statsBtn.classList.add('selected');
      } else {
        list.style.display = 'none';
        statsList.style.display = 'none';
        container.style.display = 'flex';
        if (postersBtn) postersBtn.classList.add('selected');
      }
    }

    const hash = window.location.hash.replace('#', '');
    showView(['list', 'stats', 'posters'].includes(hash) ? hash : 'posters');

    if (listBtn) listBtn.addEventListener('click', () => { window.location.hash = 'list'; showView('list'); });
    if (postersBtn) postersBtn.addEventListener('click', () => { window.location.hash = 'posters'; showView('posters'); });
    if (statsBtn) statsBtn.addEventListener('click', () => { window.location.hash = 'stats'; showView('stats'); });
  });