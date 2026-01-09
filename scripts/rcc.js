fetch('../data/rcc.json')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.horizontal-scroll-container');
    if (!container || !data.rcc) return;
    container.innerHTML = '';
    data.rcc.forEach(film => {
      const section = document.createElement('section');
      // Create info bar
      const infoBar = document.createElement('div');
      infoBar.className = 'rcc-info-bar';
      infoBar.style = 'color: #c0c5d2; padding: 6px 10px; font-size: 0.75rem; font-family: inherit;width:calc(100%);min-width:calc(100%);max-width:calc(100%);height:32px;';
      // Format date from DD-MM-YYYY to 'Mon D YYYY'
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
      // Poster image
      const img = document.createElement('img');
      img.src = film.poster;
      img.alt = `'${film.title}' (${film.year}) poster`;
      img.className = 'poster';
      section.appendChild(img);
      container.appendChild(section);
    });
  });
