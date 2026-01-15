fetch('../data/rcc.json')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.horizontal-scroll-container');
    if (container) {
      container.style.marginBottom = '90px'; // Ensure space for sticky footer
    }
    if (!container || !data.rcc) return;
    container.innerHTML = '';
    data.rcc.forEach(film => {
      if (film.title === 'TBD') return; // skip in posters view
      const section = document.createElement('section');
      const infoBar = document.createElement('div');
      infoBar.className = 'rcc-info-bar';
      infoBar.style = 'color: #c0c5d2; padding: 6px 10px; font-size: 0.75rem; font-family: inherit;width:calc(100%);min-width:calc(100%);max-width:calc(100%);height:32px;';
      function formatDate(dateStr) {
        const [day, month, year] = dateStr.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)} ${year}`;
      }
      let infoText = '';
      if (film.director) infoText += `${film.director}'s `;
      infoText += `<a href="${film.link}" target="_blank" rel="norefferrer" style="color: #c0c5d2; text-decoration: underline;font-size:0.75rem;">${film.title}</a> (${film.year}) on ${formatDate(film.date)} //`;
      infoBar.innerHTML = `${infoText}`;
      infoBar.style.boxSizing = 'border-box';
      section.appendChild(infoBar);
      const img = document.createElement('img');
      img.src = film.poster;
      img.alt = `'${film.title}' (${film.year}) poster`;
      img.className = 'poster';
      section.appendChild(img);
      container.appendChild(section);
    });

    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    list.style.display = 'none';
    list.style.flexDirection = 'column';
    list.style.marginBottom = '0';
    // Remove fixed height so list can grow naturally
    list.style.gap = '15px';
    list.style.paddingBottom = '90px'; // Prevent sticky footer overlap (footer ~75px)
    data.rcc.forEach(film => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.flexDirection = 'row';
      const infoBar = document.createElement('div');
      infoBar.className = 'rcc-info-bar';
      infoBar.style = 'color: #c0c5d2; padding: 20px; font-size: 0.9rem; font-family: inherit; background: #222; width: 100%; box-sizing: border-box;';
      function formatDate(dateStr) {
        const [day, month, year] = dateStr.split('-');
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat'];
        const dateObj = new Date(`${year}-${month}-${day}`);
        const dayOfWeek = days[dateObj.getDay() + 1];
        return `${dayOfWeek} ${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
      }
      let infoText = '';
      infoText += `<strong>${formatDate(film.date)} //</strong><br/>`;
      if (film.series) {
        infoText += `<em style="font-size: 0.9rem;">${film.series}:</em><br/>`;
      }
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
      img.style.display = 'block';
      img.style.width = '250px';
      img.style.maxWidth = '25%';
      img.style.height = 'auto';
      img.style.padding = '0';
      img.style.background = 'rgb(34, 34, 34)';
      if (film.series) {
        infoBar.style.background = 'rgba(41, 37, 41, 1)';
        img.style.background = 'rgba(41, 37, 41, 1)';
      }
      li.appendChild(img);
      list.appendChild(li);
    });

    container.parentNode.insertBefore(list, container.nextSibling);

    const listBtn = document.getElementById('rcc-list-btn');
    const postersBtn = document.getElementById('rcc-posters-btn');
    const statsBtn = document.getElementById('rcc-stats-btn');

    const statsList = document.createElement('ul');
    statsList.style.listStyle = 'none';
    statsList.style.padding = '0';
    statsList.style.display = 'none';
    statsList.style.flexDirection = 'column';
    statsList.style.marginBottom = '0';
    statsList.style.gap = '5px';
    statsList.style.background = 'rgb(34, 34, 34)';
    statsList.style.padding = '20px';
    statsList.style.paddingBottom = '90px';

    // Create separate lists for each stat category
    const decadesList = document.createElement('ul');
    decadesList.style.listStyle = 'none';
    decadesList.style.padding = '0';
    decadesList.style.marginBottom = '10px';
    decadesList.style.fontSize = '0.9rem';
    const countriesList = document.createElement('ul');
    countriesList.style.listStyle = 'none';
    countriesList.style.padding = '0';
    countriesList.style.marginBottom = '10px';
    countriesList.style.fontSize = '0.9rem';
    const languagesList = document.createElement('ul');
    languagesList.style.listStyle = 'none';
    languagesList.style.padding = '0';
    languagesList.style.marginBottom = '10px';
    languagesList.style.fontSize = '0.9rem';
    const totalsList = document.createElement('ul');
    totalsList.style.listStyle = 'none';
    totalsList.style.padding = '0';
    totalsList.style.marginBottom = '10px';
    totalsList.style.fontSize = '0.9rem';

    const totalFilms = data.rcc.length;
    // Decade stats
    const decadeCounts = {};
    data.rcc.forEach(film => {
      if (film.year) {
        const decade = Math.floor(film.year / 10) * 10;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      }
    });
    Object.keys(decadeCounts).sort().forEach(decade => {
      const li = document.createElement('li');
      li.textContent = `${decade}s movie(s): ${decadeCounts[decade]}`;
      decadesList.appendChild(li);
    });

    // Country stats
    const countries = {};
    data.rcc.forEach(film => {
      if (film.country) {
        countries[film.country] = (countries[film.country] || 0) + 1;
      }
    });
    Object.keys(countries).sort().forEach(country => {
      const li = document.createElement('li');
      li.textContent = `${country} movie(s): ${countries[country]}`;
      countriesList.appendChild(li);
    });

    // Language stats
    const languages = {};
    data.rcc.forEach(film => {
      if (film.languages) {
        film.languages.forEach(lang => {
          languages[lang] = (languages[lang] || 0) + 1;
        });
      }
    });
    Object.keys(languages).sort().forEach(lang => {
      const li = document.createElement('li');
      li.textContent = `${lang} language movie(s): ${languages[lang]}`;
      languagesList.appendChild(li);
    });

    // Totals and directors
    const directorsList = [];
    data.rcc.forEach(film => {
      if (film.director) {
        directorsList.push(film.director);
      }
    });
    const directorsLi = document.createElement('li');
    directorsLi.textContent = `Directors: ${[...new Set(directorsList)].sort().join(', ')}`;
    const runtimeLi = document.createElement('li');
    let totalRuntime = 0;
    data.rcc.forEach(film => {
      if (film.runtime) {
        totalRuntime += film.runtime;
      }
    });
    runtimeLi.textContent = `Total runtime: ${totalRuntime} mins (${(totalRuntime / 60).toFixed(2)} hrs)`;
    const filmsLi = document.createElement('li');
    filmsLi.textContent = `Total # of movies: ${totalFilms}`;
    totalsList.appendChild(directorsLi);
    totalsList.appendChild(runtimeLi);
    totalsList.appendChild(filmsLi);

    // Add all lists to statsList
    // Add a heading for each section for clarity
    const decadesHeader = document.createElement('li');
    decadesHeader.innerHTML = '<strong>Decades //</strong>';
    statsList.appendChild(decadesHeader);
    statsList.appendChild(decadesList);
    const countriesHeader = document.createElement('li');
    countriesHeader.innerHTML = '<strong>Countries //</strong>';
    statsList.appendChild(countriesHeader);
    statsList.appendChild(countriesList);
    const languagesHeader = document.createElement('li');
    languagesHeader.innerHTML = '<strong>Languages //</strong>';
    statsList.appendChild(languagesHeader);
    statsList.appendChild(languagesList);
    const totalsHeader = document.createElement('li');
    totalsHeader.innerHTML = '<strong>Totals //</strong>';
    statsList.appendChild(totalsHeader);
    statsList.appendChild(totalsList);
    container.parentNode.insertBefore(statsList, container.nextSibling);

    function showView(view) {
      if (listBtn) listBtn.classList.remove('selected');
      if (postersBtn) postersBtn.classList.remove('selected');
      if (statsBtn) statsBtn.classList.remove('selected');

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
    if (hash === 'list' || hash === 'stats' || hash === 'posters') {
      showView(hash);
    } else {
      showView('posters');
    }

    if (listBtn) {
      listBtn.addEventListener('click', () => {
        window.location.hash = 'list';
        showView('list');
      });
    }
    if (postersBtn) {
      postersBtn.addEventListener('click', () => {
        window.location.hash = 'posters';
        showView('posters');
      });
    }
    if (statsBtn) {
      statsBtn.addEventListener('click', () => {
        window.location.hash = 'stats';
        showView('stats');
      });
    }
  });
