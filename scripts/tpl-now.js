const tplNow = {
    content: $(".tpl-page-text"),
    updated: "",
    date: $(".date"),
    list: [],
    movies: [],
    books: [],
    tv: [],
    mixes: [],
    feedPosts: [],
    topAlbums: [],
    tmdbKey: '',
    tmdbImageBase: 'https://image.tmdb.org/t/p/w185',
    seasonStr(season) {
        if (!season) return '';
        return typeof season === 'string' && season.includes('-') ? ` seasons ${season}` : ` season ${season}`;
    },
    escapeAttr(value = '') {
        return String(value).replace(/"/g, '&quot;');
    },
    escapeText(value = '') {
        return String(value).replace(/'/g, '&#39;');
    },
    renderSection(title, link, body, className = 'now-scroll', attributes = '') {
        if (!body) return '';
        const extraAttrs = attributes ? ` ${attributes}` : '';
        return `<p>>> ${title} (${link})</p><div class="${className}"${extraAttrs}>${body}</div>`;
    },
    buildPoster(url, alt, fallback, fallbackClass = '') {
        if (url) {
            return `<img src="${url}" alt="${this.escapeAttr(alt)}" class="now-poster"/>`;
        }

        const className = fallbackClass ? `now-poster-fallback ${fallbackClass}` : 'now-poster-fallback';
        return `<div class="${className}">${fallback}</div>`;
    },
    buildCard(link, className, image, info) {
        return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="${className} now-card">${image}<div class="now-card-info"><span>${info}</span></div></a>`;
    },
    tmdbPosterUrl(path) {
        if (!path) return '';
        return path.startsWith('http') ? path : `${this.tmdbImageBase}${path}`;
    },
    getRecentLogs(data, type, count = 4) {
        const years = ['2026', '2025'];
        return years.reduce((items, year) => {
            if (items.length >= count) return items;
            const nextItems = data[year] && data[year][type] ? data[year][type] : [];
            return items.concat(nextItems.slice(0, count - items.length));
        }, []);
    },
    bindFeedScroll() {
        setTimeout(() => {
            $('#now-feed-scroll').off('click').on('click', function() {
                window.location.href = '/tpl/feed';
            });
        }, 0);
    },
    renderFeedPosts() {
        if (!this.feedPosts.length) return '';

        const feedItems = this.feedPosts.map(post => {
            const id = post.id || post.ID || post.number;
            const permalink = id ? `/tpl/feed#${id}` : '#';
            let img = '';
            if (post.type === 'video' && post.thumbnail) {
                img = `<img src="${post.thumbnail}" alt="${this.escapeAttr(post.alt || 'video thumbnail')}" class="now-feed-img"/>`;
            } else if (post.url) {
                img = `<img src="${post.url}" alt="${this.escapeAttr(post.alt)}" class="now-feed-img"/>`;
            }
            const date = post.date ? `<div class="now-feed-date">&gt; ${post.date}</div>` : '';
            return `<a href="${permalink}" class="now-feed-post">${img}${date}</a>`;
        }).join('');
        const link = `<a href='/tpl/feed'>more</a> / <a href="/tpl/rss.xml" target="_blank" title="RSS Feed" class="now-rss-icon"><img src="../../assets/icons/rss.svg" class="feed-rss-icon" alt="RSS icon" style="text-decoration: underline;width:12px;"></a>`;
        return `<hr>${this.renderSection('latest feed posts', link, feedItems, 'now-feed-scroll', 'id="now-feed-scroll"')}`;
    },
    renderMovies() {
        if (!this.movies.length) return '';
        const movieItems = this.movies.map(movie => {
            const img = this.buildPoster(this.tmdbPosterUrl(movie.poster), `${movie.log} poster`, movie.log);
            const info = `&gt; '${this.escapeText(movie.log)}' (${movie.year}${movie.rewatch ? ', rewatch' : ''})`;
            const link = movie.link || '/tpl/logs#movies';
            return this.buildCard(link, 'now-movie', img, info);
        }).join('');
        return this.renderSection('last watched movies', '<a href="/tpl/logs#movies">more</a>', movieItems);
    },
    renderBooks() {
        if (!this.books.length) return '';
        const bookItems = this.books.map(book => {
            const title = book.log || '';
            const author = book.author || '';
            const year = book.year || '';
            const coverUrl = book.coverUrl || '';
            const img = this.buildPoster(coverUrl, `${title} cover`, title, 'tall');
            let infoText = `&gt; '${this.escapeText(title)}'`;
            if (year) infoText += ` (${year}${book.rewatch ? ', reread' : ''})`;
            if (author) infoText += ` by ${author}`;
            const link = book.link || book.openLibraryUrl || '/tpl/logs#books';
            return this.buildCard(link, 'now-book', img, infoText);
        }).join('');
        return this.renderSection('last read books', '<a href="/tpl/logs#books">more</a>', bookItems);
    },
    renderTV() {
        if (!this.tv.length) return '';
        const tvItems = this.tv.map(show => {
            const img = this.buildPoster(this.tmdbPosterUrl(show.poster), `${show.log} poster`, show.log, 'tall');
            const info = `&gt; '${this.escapeText(show.log)}'${this.seasonStr(show.season)} (${show.year}${show.rewatch ? ', rewatch' : ''})`;
            const link = show.link || show.thetvdbUrl || '/tpl/logs#tv';
            return this.buildCard(link, 'now-tv', img, info);
        }).join('');
        return this.renderSection('last watched tv shows', '<a href="/tpl/logs#tv">more</a>', tvItems);
    },
    renderTopAlbums() {
        if (!this.topAlbums.length) return '';
        const albumItems = this.topAlbums.map(album => {
            const artwork = album.image || '';
            const img = artwork ? `<img src="${artwork}" alt="${this.escapeAttr(album.name)} album art" class="now-album-art"/>` : '';
            const info = `&gt; ${album.artist} \\ '${this.escapeText(album.name)}'`;
            const lastFmUrl = album.url || 'https://www.last.fm/user/rustbecomesher';
            return this.buildCard(lastFmUrl, 'now-album', img, info);
        }).join('');
        return this.renderSection('recently listening', '<a href="https://www.last.fm/user/rustbecomesher" target="_blank" rel="noopener noreferrer">last.fm</a>', albumItems);
    },
    renderMixes() {
        if (!this.mixes.length) return '';
        const mixesItems = this.mixes.map(object => {
            const link = `/tpl/mixes#${object.number}`;
            const image = object.image ? `<img src="${object.image}" alt="rusty mix #${object.number} cover art" class="now-mix-img"/>` : '';
            const title = `<p class="now-mix-title"><small>#${object.number} \\ ${object.title}</small></p>`;
            let featuring = '';
            if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                featuring = `<p class="now-mix-featuring">${object.featuring.join(', ')}</p>`;
            }
            const icon = `<p class="now-mix-icon">></p>`;
            return `<a href="${link}" class="now-mix">${image}<span class="now-mix-details">${title}${featuring}</span>${icon}</a>`;
        }).join('');
        return this.renderSection('latest rusty mixes', '<a href="/tpl/mixes">more</a>', mixesItems, 'now-mixes-list');
    },
    _initialized: false,
    _sections: ['now-list', 'feed', 'mixes', 'albums', 'movies', 'books', 'tv'],
    _ensureContainers() {
        if (this._initialized) return;
        this._initialized = true;
        this.content.html(this._sections.map(id => `<div id="now-${id}"></div>`).join(''));
    },
    nowDisplay(...changed) {
        this._ensureContainers();
        const sections = changed.length ? changed : this._sections;
        const renderers = {
            'now-list': () => this.list.map(bullet => `<p>>> ${bullet}</p>`).join(''),
            feed: () => this.renderFeedPosts(),
            mixes: () => this.renderMixes(),
            albums: () => this.renderTopAlbums(),
            movies: () => this.renderMovies(),
            books: () => this.renderBooks(),
            tv: () => this.renderTV()
        };

        sections.forEach(section => {
            const render = renderers[section];
            if (render) {
                $(`#now-${section}`).html(render());
            }
        });

        this.date.text(this.updated);
        if (!changed.length || changed.includes('feed')) {
            this.bindFeedScroll();
        }
    },
    fetchSection(url, sections, updateFn) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                updateFn(data);
                this.nowDisplay(...sections);
            })
            .catch(error => console.log(error));
    },
    init() {
        this.fetchSection('../data/now.json', ['now-list'], data => {
            this.updated = Object.keys(data)[0];
            this.list = Object.values(data)[0] || [];
        });
        this.fetchSection('../data/logs.json', ['movies', 'books', 'tv'], data => {
            this.movies = this.getRecentLogs(data, 'movies');
            this.books = this.getRecentLogs(data, 'books');
            this.tv = this.getRecentLogs(data, 'tv');
            this.fetchTMDBPosters(this.movies, 'movie');
            this.fetchBookCovers();
            this.fetchTMDBPosters(this.tv, 'tv');
        });
        this.fetchSection('../data/mixes.json', ['mixes'], data => {
            const mixes = Object.keys(data).map(key => ({
                title: key,
                number: data[key].number,
                tidal: data[key].tidal,
                image: data[key].image,
                featuring: data[key].featuring || []
            }));
            this.mixes = mixes.slice(0, 2);
        });
        this.fetchSection('../data/feed.json', ['feed'], data => {
            const posts = (data && data.items) ? data.items : [];
            this.feedPosts = posts.slice(0, 10);
        });
        this.tmdbKey = '1d27d67ac5b026aad089308525f64f5f';
        const lastFmKey = '8387eaa633e79d3aaab96fb9c1173163';
        const lastFmUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=rustbecomesher&period=1month&api_key=${lastFmKey}&format=json&limit=4`;
        this.fetchSection(lastFmUrl, ['albums'], data => {
            const albums = (data && data.topalbums && data.topalbums.album) ? data.topalbums.album : [];
            this.topAlbums = albums.map(album => ({
                name: album.name,
                artist: album.artist.name,
                url: album.url,
                image: (album.image && album.image.length) ? album.image[album.image.length - 1]['#text'] : ''
            }));
        });
    },
    fetchTMDBPosters(items, type) {
        if (!items.length || !this.tmdbKey) return;
        const promises = items.map(item => {
            if (item.poster) return Promise.resolve();
            const query = encodeURIComponent(item.log);
            let url = `https://api.themoviedb.org/3/search/${type}?api_key=${this.tmdbKey}&query=${query}`;
            if (type === 'movie' && item.year) url += `&year=${item.year}`;
            return fetch(url)
                .then(res => res.json())
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        item.poster = data.results[0].poster_path || '';
                        if (type === 'tv' && data.results[0].id) {
                            return fetch(`https://api.themoviedb.org/3/tv/${data.results[0].id}/external_ids?api_key=${this.tmdbKey}`)
                                .then(res => res.json())
                                .then(ids => {
                                    if (ids.tvdb_id) {
                                        item.thetvdbUrl = `https://thetvdb.com/dereferrer/series/${ids.tvdb_id}`;
                                    }
                                });
                        }
                    }
                })
                .catch(() => {});
        });
        const section = type === 'movie' ? 'movies' : 'tv';
        Promise.all(promises).then(() => this.nowDisplay(section));
    },
    fetchBookCovers() {
        if (!this.books.length) return;
        const promises = this.books.map(book => {
            if (book.cover) {
                book.coverUrl = book.cover;
                return Promise.resolve();
            }
            const author = book.author ? book.author.replace(/,?\s*et al\.?/i, '').trim() : '';
            const q = encodeURIComponent(book.log + (author ? ' ' + author : ''));
            const searchUrl = `https://openlibrary.org/search.json?q=${q}&limit=1&fields=key,isbn`;
            return fetch(searchUrl)
                .then(res => res.json())
                .then(data => {
                if (data.docs && data.docs.length > 0) {
                        if (data.docs[0].key) {
                            book.openLibraryUrl = `https://openlibrary.org${data.docs[0].key}`;
                        }
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
        Promise.all(promises).then(() => this.nowDisplay('books'));
    }
};

$(document).ready(() => tplNow.init());