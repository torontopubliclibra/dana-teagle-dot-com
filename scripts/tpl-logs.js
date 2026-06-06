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
    view: "shelves",
    tmdbKey: '1d27d67ac5b026aad089308525f64f5f',
    postersFetched: {},
    functions: {
        categories: [
            { key: 'movies', label: 'movies watched', icon: 'arrow-down.svg' },
            { key: 'books', label: 'books read', icon: 'arrow-down.svg' },
            { key: 'tv', label: 'tv shows watched', icon: 'arrow-down.svg' }
        ],
        yearSet(year) {
            tplLogs.year = year;
            tplLogs.yearSelect = tplLogs.functions.generateYearSelect(year);
            tplLogs.functions.fetchPostersForYear(year);
            tplLogs.functions.logsDisplay();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        viewSet(view) {
            tplLogs.view = view;
            tplLogs.viewSelect = tplLogs.functions.generateViewSelect(view);
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
            const views = ['shelves', 'lists'];
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
        getPosterUrl(poster) {
            return poster ? (poster.startsWith('http') ? poster : `https://image.tmdb.org/t/p/w185${poster}`) : '';
        },
        escapeTitle(title) {
            return `${title || ''}`.replace(/'/g, '&#39;');
        },
        getTopToggles() {
            return tplLogs.yearSelect + tplLogs.viewSelect;
        },
        renderFooter(topToggles) {
            return `<hr>${topToggles}<p>See also: <a href="/letterboxd" target="_blank" title="@torontolibra on Letterboxd">Letterboxd</a> | <a href="/goodreads" target="_blank" title="Dana Teagle on Goodreads">Goodreads</a></p>`;
        },
        renderSectionHeader(cat, year, count, index) {
            return `${index === 0 ? '<hr class="no-top">' : '<hr>'}<p id="${cat.key}">>> ${cat.label} in ${year} (${count})</p>`;
        },
        renderCategoryNav(yearObj) {
            const navItems = tplLogs.functions.categories
                .filter(cat => yearObj[cat.key].length > 0)
                .map(cat => `<li class="link-category"><a href="#${cat.key}">${cat.label} (${yearObj[cat.key].length})<img src="../assets/icons/${cat.icon}" alt="scroll down icon"></a></li>`);

            return navItems.length > 0
                ? `<hr class="alt"><div class="tpl-categories logs"><ul>${navItems.join('')}</ul></div>`
                : '';
        },
        getShelfImageUrl(item) {
            return item.poster || item.coverUrl || item.cover || '';
        },
        renderShelfCard(item, options) {
            const label = item.log || '';
            const imageUrl = tplLogs.functions.getShelfImageUrl(item);
            const posterUrl = options.imageType === 'book'
                ? imageUrl
                : tplLogs.functions.getPosterUrl(imageUrl);
            const fallbackClass = options.fallbackClass ? ` ${options.fallbackClass}` : '';
            const img = posterUrl
                ? `<img src="${posterUrl}" alt="${label.replace(/"/g, '&quot;')} ${options.altText}" class="now-poster"/>`
                : `<div class="now-poster-fallback${fallbackClass}">${label}</div>`;
            const link = item.link || options.fallbackLink;
            const target = item.link ? ' target="_blank" rel="noopener noreferrer"' : '';
            return `<a href="${link}"${target} class="${options.className} now-card">${img}${options.renderInfo(item)}</a>`;
        },
        formatLinkedTitle(title, href) {
            const safeTitle = title || '';
            return href ? `'` + `<a href="${href}" target="_blank">${safeTitle}</a>` + `'` : `'${safeTitle}'`;
        },
        renderListBook(item) {
            let logStr = tplLogs.functions.formatLinkedTitle(item.log, item.link);
            if (item.year) logStr += ` (${item.year})`;
            if (item.author) logStr += ` by ${item.author}`;
            return `<p class="sub">> ${logStr}</p>`;
        },
        renderListMedia(item, includeSeason) {
            let logStr = tplLogs.functions.formatLinkedTitle(item.log, item.link);
            if (includeSeason && item.season) {
                logStr += tplLogs.functions.seasonStr(item.season);
            }
            if (item.year) {
                logStr += ` (${item.year}`;
                if (item.rewatch) logStr += ', rewatch';
                logStr += ')';
            }
            return `<p class="sub">> ${logStr}</p>`;
        },
        renderListItem(catKey, item) {
            if (typeof item !== 'object' || item === null) {
                return `<p class="sub">> ${item}</p>`;
            }

            if (catKey === 'books') return tplLogs.functions.renderListBook(item);
            return tplLogs.functions.renderListMedia(item, catKey === 'tv');
        },
        fetchPostersForYear(year) {
            if (tplLogs.postersFetched[year]) return Promise.resolve();
            tplLogs.postersFetched[year] = true;
            const yearObj = tplLogs.years[year];
            return Promise.all([
                tplLogs.functions.fetchTMDBPosters(yearObj.movies, 'movie'),
                tplLogs.functions.fetchBookCovers(yearObj.books),
                tplLogs.functions.fetchTMDBPosters(yearObj.tv, 'tv')
            ]).then(() => {
                // Avoid re-rendering from stale async responses when user switched years.
                if (tplLogs.year === year) {
                    tplLogs.functions.logsDisplay();
                }
            });
        },
        fetchTMDBPosters(items, type) {
            if (!items.length || !tplLogs.tmdbKey) return Promise.resolve();
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
                    .catch(() => { });
            });
            return Promise.all(promises);
        },
        fetchBookCovers(books) {
            if (!books.length) return Promise.resolve();
            const promises = books.map(book => {
                if (book.coverUrl) return Promise.resolve();
                if (book.cover) { book.coverUrl = book.cover; return Promise.resolve(); }
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
                    .catch(() => { });
            });
            return Promise.all(promises);
        },
        renderMoviesShelves(movies) {
            if (!movies.length) return '';
            const movieItems = movies.map(movie => tplLogs.functions.renderShelfCard(movie, {
                className: 'now-movie',
                fallbackLink: '#movies',
                altText: 'poster',
                renderInfo(entry) {
                    return `<div class="now-card-info"><span>&gt; '${tplLogs.functions.escapeTitle(entry.log)}' (${entry.year}${entry.rewatch ? ', rewatch' : ''})</span></div>`;
                }
            })).join('');
            return `<div class="now-scroll log-scroll">${movieItems}</div>`;
        },
        renderBooksShelves(books) {
            if (!books.length) return '';
            const bookItems = books.map(book => tplLogs.functions.renderShelfCard(book, {
                className: 'now-book',
                fallbackLink: '#books',
                imageType: 'book',
                altText: 'cover',
                fallbackClass: 'tall',
                renderInfo(entry) {
                    let infoText = `&gt; '${tplLogs.functions.escapeTitle(entry.log)}'`;
                    if (entry.year) infoText += ` (${entry.year})`;
                    if (entry.author) infoText += ` \\ ${entry.author}`;
                    return `<div class="now-card-info"><span>${infoText}</span></div>`;
                }
            })).join('');
            return `<div class="now-scroll log-scroll">${bookItems}</div>`;
        },
        renderTVShelves(tv) {
            if (!tv.length) return '';
            const tvItems = tv.map(show => tplLogs.functions.renderShelfCard(show, {
                className: 'now-tv',
                fallbackLink: '#tv',
                altText: 'poster',
                fallbackClass: 'tall',
                renderInfo(entry) {
                    return `<div class="now-card-info"><span>&gt; '${tplLogs.functions.escapeTitle(entry.log)}'${tplLogs.functions.seasonStr(entry.season)} (${entry.year}${entry.rewatch ? ', rewatch' : ''})</span></div>`;
                }
            })).join('');
            return `<div class="now-scroll log-scroll">${tvItems}</div>`;
        },
        logsDisplay() {
            const year = tplLogs.year;
            const yearObj = tplLogs.years[year];
            const categories = tplLogs.functions.categories;
            const topToggles = tplLogs.functions.getTopToggles();

            if (tplLogs.view === 'shelves') {
                const formattedLogs = [topToggles];
                categories.forEach((cat, idx) => {
                    const items = yearObj[cat.key];
                    if (items.length > 0) {
                        formattedLogs.push(tplLogs.functions.renderSectionHeader(cat, year, items.length, idx));
                        if (cat.key === 'movies') formattedLogs.push(tplLogs.functions.renderMoviesShelves(items));
                        else if (cat.key === 'books') formattedLogs.push(tplLogs.functions.renderBooksShelves(items));
                        else if (cat.key === 'tv') formattedLogs.push(tplLogs.functions.renderTVShelves(items));
                    }
                });
                tplLogs.date.text(year === "2026" ? ` // up to ${tplLogs.updated}` : "");
                formattedLogs.push(tplLogs.functions.renderFooter(topToggles));
                tplLogs.content.html(formattedLogs.join(''));
                return;
            }

            const toggles = topToggles + tplLogs.functions.renderCategoryNav(yearObj);
            const formattedLogs = [toggles];
            categories.forEach((cat, idx) => {
                const items = yearObj[cat.key];
                if (items.length > 0) {
                    formattedLogs.push(tplLogs.functions.renderSectionHeader(cat, year, items.length, idx));
                    items.forEach(item => {
                        formattedLogs.push(tplLogs.functions.renderListItem(cat.key, item));
                    });
                }
            });
            tplLogs.date.text(year === "2026" ? ` // up to ${tplLogs.updated}` : "");
            formattedLogs.push(tplLogs.functions.renderFooter(topToggles));
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
                        tplLogs.functions.fetchPostersForYear(tplLogs.year);
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