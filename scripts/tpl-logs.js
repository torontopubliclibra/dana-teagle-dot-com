const tplLogs = {
    content: $(".tpl-page-text"),
    year: "2026",
    updated: "",
    date: $(".date"),
    years: {
        "2026": { movies: [], books: [], tv: [] },
        "2025": { movies: [], books: [], tv: [] },
        "2024": { movies: [], books: [], tv: [] }
    },
    yearList: ["2026", "2025", "2024"],
    yearSelect: "",
    viewSelect: "",
    view: "list",
    tmdbKey: '1d27d67ac5b026aad089308525f64f5f',
    postersFetched: {},
    functions: {
        yearSet(year) {
            tplLogs.year = year;
            tplLogs.yearSelect = tplLogs.functions.generateYearSelect(year);
            if (tplLogs.view === 'shelves') {
                tplLogs.functions.fetchPostersForYear(year);
            }
            tplLogs.functions.logsDisplay();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        viewSet(view) {
            tplLogs.view = view;
            tplLogs.viewSelect = tplLogs.functions.generateViewSelect(view);
            if (view === 'shelves') {
                tplLogs.functions.fetchPostersForYear(tplLogs.year);
            }
            tplLogs.functions.logsDisplay();
        },
        generateYearSelect(selectedYear) {
            return `<p>year: ` + tplLogs.yearList.map(y =>
                y === selectedYear
                    ? `<span class="year-selected">${y}</span>`
                    : `<button class="range" onclick="tplLogs.functions.yearSet('${y}')">${y}</button>`
            ).join(" | ") + `</p>`;
        },
        generateViewSelect(selectedView) {
            const views = ['list', 'shelves'];
            return `<p>view: ` + views.map(v =>
                v === selectedView
                    ? `<span class="year-selected">${v}</span>`
                    : `<button class="range" onclick="tplLogs.functions.viewSet('${v}')">${v}</button>`
            ).join(" | ") + `</p>`;
        },
        seasonStr(season) {
            if (!season) return '';
            return typeof season === 'string' && season.includes('-') ? ` seasons ${season}` : ` season ${season}`;
        },
        fetchPostersForYear(year) {
            if (tplLogs.postersFetched[year]) return;
            tplLogs.postersFetched[year] = true;
            const yearObj = tplLogs.years[year];
            tplLogs.functions.fetchTMDBPosters(yearObj.movies, 'movie');
            tplLogs.functions.fetchBookCovers(yearObj.books);
            tplLogs.functions.fetchTMDBPosters(yearObj.tv, 'tv');
        },
        fetchTMDBPosters(items, type) {
            if (!items.length || !tplLogs.tmdbKey) return;
            const promises = items.map(item => {
                if (item.poster) return Promise.resolve();
                const query = encodeURIComponent(item.log);
                let url = `https://api.themoviedb.org/3/search/${type}?api_key=${tplLogs.tmdbKey}&query=${query}`;
                if (type === 'movie' && item.year) url += `&year=${item.year}`;
                return fetch(url)
                    .then(res => res.json())
                    .then(data => {
                        if (data.results && data.results.length > 0) {
                            item.poster = data.results[0].poster_path || '';
                        }
                    })
                    .catch(() => {});
            });
            Promise.all(promises).then(() => tplLogs.functions.logsDisplay());
        },
        fetchBookCovers(books) {
            if (!books.length) return;
            const promises = books.map(book => {
                if (book.coverUrl) return Promise.resolve();
                const author = book.author ? book.author.replace(/,?\s*et al\.?/i, '').trim() : '';
                const q = encodeURIComponent(book.log + (author ? ' ' + author : ''));
                const searchUrl = `https://openlibrary.org/search.json?q=${q}&limit=1&fields=key,isbn`;
                return fetch(searchUrl)
                    .then(res => res.json())
                    .then(data => {
                        if (data.docs && data.docs.length > 0) {
                            if (data.docs[0].isbn && data.docs[0].isbn.length > 0) {
                                const isbn = data.docs[0].isbn.find(i => i.length === 13) || data.docs[0].isbn[0];
                                return fetch(`https://bookcover.longitood.com/bookcover/${isbn}`)
                                    .then(res => res.json())
                                    .then(cover => {
                                        if (cover.url) book.coverUrl = cover.url;
                                    });
                            }
                        }
                    })
                    .catch(() => {});
            });
            Promise.all(promises).then(() => tplLogs.functions.logsDisplay());
        },
        renderMoviesShelves(movies) {
            if (!movies.length) return '';
            const movieItems = movies.map(movie => {
                const posterUrl = movie.poster ? `https://image.tmdb.org/t/p/w185${movie.poster}` : '';
                const img = posterUrl ? `<img src="${posterUrl}" alt="${movie.log.replace(/"/g, '&quot;')} poster" class="now-poster"/>` : `<div class="now-poster-fallback">${movie.log}</div>`;
                const info = `<div class="now-card-info"><span>&gt; '${movie.log.replace(/'/g, '&#39;')}' (${movie.year}${movie.rewatch ? ', rewatch' : ''})</span></div>`;
                const link = movie.link || '#movies';
                const target = movie.link ? ' target="_blank" rel="noopener noreferrer"' : '';
                return `<a href="${link}"${target} class="now-movie now-card">${img}${info}</a>`;
            }).join('');
            return `<div class="now-scroll log-scroll">${movieItems}</div>`;
        },
        renderBooksShelves(books) {
            if (!books.length) return '';
            const bookItems = books.map(book => {
                const title = book.log || '';
                const author = book.author || '';
                const year = book.year || '';
                const coverUrl = book.coverUrl || '';
                const img = coverUrl ? `<img src="${coverUrl}" alt="${title.replace(/"/g, '&quot;')} cover" class="now-poster"/>` : `<div class="now-poster-fallback tall">${title}</div>`;
                let infoText = `&gt; '${title.replace(/'/g, '&#39;')}'`;
                if (year) infoText += ` (${year}${book.rewatch ? ', reread' : ''})`;
                if (author) infoText += ` by ${author}`;
                const info = `<div class="now-card-info"><span>${infoText}</span></div>`;
                const link = book.link || '#books';
                const target = book.link ? ' target="_blank" rel="noopener noreferrer"' : '';
                return `<a href="${link}"${target} class="now-book now-card">${img}${info}</a>`;
            }).join('');
            return `<div class="now-scroll log-scroll">${bookItems}</div>`;
        },
        renderTVShelves(tv) {
            if (!tv.length) return '';
            const tvItems = tv.map(show => {
                const posterUrl = show.poster ? `https://image.tmdb.org/t/p/w185${show.poster}` : '';
                const img = posterUrl ? `<img src="${posterUrl}" alt="${show.log.replace(/"/g, '&quot;')} poster" class="now-poster"/>` : `<div class="now-poster-fallback tall">${show.log}</div>`;
                const info = `<div class="now-card-info"><span>&gt; '${show.log.replace(/'/g, '&#39;')}'${tplLogs.functions.seasonStr(show.season)} (${show.year}${show.rewatch ? ', rewatch' : ''})</span></div>`;
                const link = show.link || '#tv';
                const target = show.link ? ' target="_blank" rel="noopener noreferrer"' : '';
                return `<a href="${link}"${target} class="now-tv now-card">${img}${info}</a>`;
            }).join('');
            return `<div class="now-scroll log-scroll">${tvItems}</div>`;
        },
        logsDisplay() {
            const year = tplLogs.year;
            const yearObj = tplLogs.years[year];
            const categories = [
                { key: 'movies', label: 'movies watched', icon: 'arrow-down.svg' },
                { key: 'books', label: 'books read', icon: 'arrow-down.svg' },
                { key: 'tv', label: 'tv shows watched', icon: 'arrow-down.svg' }
            ];
            const topToggles = tplLogs.yearSelect + tplLogs.viewSelect;

            if (tplLogs.view === 'shelves') {
                const formattedLogs = [topToggles];
                categories.forEach((cat, idx) => {
                    const count = yearObj[cat.key].length;
                    if (count > 0) {
                        formattedLogs.push(`${idx === 0 ? '<hr class="no-top">' : '<hr>'}<p id="${cat.key}">>> ${cat.label} in ${year} (${count})</p>`);
                        if (cat.key === 'movies') formattedLogs.push(tplLogs.functions.renderMoviesShelves(yearObj.movies));
                        else if (cat.key === 'books') formattedLogs.push(tplLogs.functions.renderBooksShelves(yearObj.books));
                        else if (cat.key === 'tv') formattedLogs.push(tplLogs.functions.renderTVShelves(yearObj.tv));
                    }
                });
                tplLogs.date.text(year === "2026" ? ` // up to ${tplLogs.updated}` : "");
                formattedLogs.push(`<hr>` + topToggles + `<p>See also: <a href="/letterboxd" target="_blank" title="@torontolibra on Letterboxd">Letterboxd</a> | <a href="/goodreads" target="_blank" title="Dana Teagle on Goodreads">Goodreads</a></p>`);
                tplLogs.content.html(formattedLogs.join(''));
                return;
            }

            const navItems = categories
                .filter(cat => yearObj[cat.key].length > 0)
                .map(cat => `<li class="link-category"><a href="#${cat.key}">${cat.label} (${yearObj[cat.key].length})<img src="../assets/icons/${cat.icon}" alt="scroll down icon"></a></li>`);
            let logCategories = navItems.length > 0 ? `<hr class="alt"><div class="tpl-categories logs"><ul>${navItems.join('')}</ul></div>` : '';
            const toggles = topToggles + logCategories;
            const formattedLogs = [toggles];
            categories.forEach((cat, idx) => {
                const count = yearObj[cat.key].length;
                if (count > 0) {
                    formattedLogs.push(`${idx === 0 ? '<hr class="no-top">' : '<hr>'}<p id="${cat.key}">>> ${cat.label} in ${year} (${count})`);
                        yearObj[cat.key].forEach(item => {
                            if (typeof item === 'object' && item !== null) {
                                let logStr = '';
                                if (cat.key === 'books') {
                                    let title = item.log || '';
                                    if (item.link) {
                                        title = `'` + `<a href="${item.link}" target="_blank">${title}</a>` + `'`;
                                    } else {
                                        title = `'` + title + `'`;
                                    }
                                    let author = item.author ? ` by ${item.author}` : '';
                                    let year = item.year ? ` (${item.year})` : '';
                                    logStr = `${title}${year}${author}`;
                                } else {
                                    let logTitle = `'` + item.log + `'` || '';
                                    if (item.link) {
                                        logTitle = `'` + `<a href="${item.link}" target="_blank">${item.log}</a>` + `'`;
                                    }
                                    let seasonStr = '';
                                    if (cat.key === 'tv' && item.season) {
                                        if (typeof item.season === 'string' && item.season.includes('-')) {
                                            seasonStr = ` seasons ${item.season}`;
                                        } else {
                                            seasonStr = ` season ${item.season}`;
                                        }
                                    }
                                    logStr = logTitle + seasonStr;
                                    if (item.year) {
                                        logStr += ` (${item.year}`;
                                        if (item.rewatch) logStr += ', rewatch';
                                        logStr += ')';
                                    }
                                }
                                formattedLogs.push(`<p class="sub">> ${logStr}</p>`);
                            } else {
                                formattedLogs.push(`<p class="sub">> ${item}</p>`);
                            }
                        });
                }
            });
            tplLogs.date.text(year === "2026" ? ` // up to ${tplLogs.updated}` : "");
            formattedLogs.push(`<hr>` + topToggles + `<p>See also: <a href="/letterboxd" target="_blank" title="@torontolibra on Letterboxd">Letterboxd</a> | <a href="/goodreads" target="_blank" title="Dana Teagle on Goodreads">Goodreads</a></p>`);
            tplLogs.content.html(formattedLogs.join(''));
        },
    },
    init() {
        tplLogs.yearSelect = tplLogs.functions.generateYearSelect(tplLogs.year);
        tplLogs.viewSelect = tplLogs.functions.generateViewSelect(tplLogs.view);
        fetch('../data/now.json')
            .then(response => response.json())
            .then(nowData => {
                tplLogs.updated = Object.keys(nowData)[0] || '';
            })
            .catch(error => console.log(error))
            .finally(() => {
                fetch('../data/logs.json')
                    .then(response => response.json())
                    .then(data => {
                        tplLogs.yearList.forEach(year => {
                            tplLogs.years[year].movies = data[year]?.movies || [];
                            tplLogs.years[year].books = data[year]?.books || [];
                            tplLogs.years[year].tv = data[year]?.tv || [];
                        });
                        tplLogs.functions.logsDisplay();
                    })
                    .catch(error => console.log(error));

                if (window.location.hash) {
                    const hash = window.location.hash;
                    if (["#movies", "#books", "#tv"].includes(hash)) {
                        setTimeout(() => {
                            const el = document.querySelector(hash);
                            if (el) el.scrollIntoView();
                        }, 100);
                    }
                }
            });
    }
};

$(document).ready(tplLogs.init);