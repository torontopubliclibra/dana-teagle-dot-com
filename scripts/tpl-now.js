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
    seasonStr(season) {
        if (!season) return '';
        return typeof season === 'string' && season.includes('-') ? ` seasons ${season}` : ` season ${season}`;
    },
    renderFeedPosts() {
        if (!this.feedPosts.length) return '';

        let html = `<hr><p>>> latest feed posts (<a href='/tpl/feed'>see more</a> / <a href="/tpl/rss.xml" target="_blank" title="RSS Feed" class="now-rss-icon"><img src="../../assets/icons/rss.svg" class="feed-rss-icon" alt="RSS icon" style="text-decoration: underline;width:12px;"></a>)</p>`;
        const feedItems = this.feedPosts.map(post => {
            const id = post.id || post.ID || post.number;
            const permalink = id ? `/tpl/feed#${id}` : '#';
            let img = '';
            if (post.type === 'video' && post.thumbnail) {
                img = `<img src="${post.thumbnail}" alt="${post.alt ? post.alt.replace(/\"/g, '&quot;') : 'video thumbnail'}" class="now-feed-img"/>`;
            } else if (post.url) {
                img = `<img src="${post.url}" alt="${post.alt ? post.alt.replace(/\"/g, '&quot;') : ''}" class="now-feed-img"/>`;
            }
            const date = post.date ? `<div class="now-feed-date">&gt; ${post.date}</div>` : '';
            return `<a href="${permalink}" class="now-feed-post">${img}${date}</a>`;
        }).join('');
        html += `<div id="now-feed-scroll" class="now-feed-scroll">${feedItems}</div>`;
        return html;
    },
    renderMovies() {
        if (!this.movies.length) return '';
        let html = `<p>>> last watched movies (<a href="/tpl/logs#movies">see more</a>)</p>`;
        const movieItems = this.movies.map(movie => {
            const posterUrl = movie.poster ? (movie.poster.startsWith('http') ? movie.poster : `https://image.tmdb.org/t/p/w185${movie.poster}`) : '';
            const img = posterUrl ? `<img src="${posterUrl}" alt="${movie.log.replace(/"/g, '&quot;')} poster" class="now-poster"/>` : `<div class="now-poster-fallback">${movie.log}</div>`;
            const info = `<div class="now-card-info"><span>&gt; '${movie.log.replace(/'/g, '\&#39;')}' (${movie.year}${movie.rewatch ? ', rewatch' : ''})</span></div>`;
            const link = movie.link || '/tpl/logs#movies';
            return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="now-movie now-card">${img}${info}</a>`;
        }).join('');
        html += `<div class="now-scroll">${movieItems}</div>`;
        return html;
    },
    renderBooks() {
        if (!this.books.length) return '';
        let html = `<p>>> last read books (<a href="/tpl/logs#books">see more</a>)</p>`;
        const bookItems = this.books.map(book => {
            const title = book.log || '';
            const author = book.author || '';
            const year = book.year || '';
            const coverUrl = book.coverUrl || '';
            const img = coverUrl ? `<img src="${coverUrl}" alt="${title.replace(/"/g, '&quot;')} cover" class="now-poster"/>` : `<div class="now-poster-fallback tall">${title}</div>`;
            let infoText = `&gt; '${title.replace(/'/g, '&#39;')}'`;
            if (year) infoText += ` (${year}${book.rewatch ? ', reread' : ''})`;
            if (author) infoText += ` by ${author}`;
            const info = `<div class="now-card-info"><span>${infoText}</span></div>`;
            const link = book.link || book.openLibraryUrl || '/tpl/logs#books';
            return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="now-book now-card">${img}${info}</a>`;
        }).join('');
        html += `<div class="now-scroll">${bookItems}</div>`;
        return html;
    },
    renderTV() {
        if (!this.tv.length) return '';
        let html = `<p>>> last watched tv shows (<a href="/tpl/logs#tv">see more</a>)</p>`;
        const tvItems = this.tv.map(show => {
            const posterUrl = show.poster ? (show.poster.startsWith('http') ? show.poster : `https://image.tmdb.org/t/p/w185${show.poster}`) : '';
            const img = posterUrl ? `<img src="${posterUrl}" alt="${show.log.replace(/"/g, '&quot;')} poster" class="now-poster"/>` : `<div class="now-poster-fallback tall">${show.log}</div>`;
            const info = `<div class="now-card-info"><span>&gt; '${show.log.replace(/'/g, '\&#39;')}'${this.seasonStr(show.season)} (${show.year}${show.rewatch ? ', rewatch' : ''})</span></div>`;
            const link = show.link || show.thetvdbUrl || '/tpl/logs#tv';
            return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="now-tv now-card">${img}${info}</a>`;
        }).join('');
        html += `<div class="now-scroll">${tvItems}</div>`;
        return html;
    },
    renderTopAlbums() {
        if (!this.topAlbums.length) return '';
        let html = `<p>>> recently listening (<a href="https://www.last.fm/user/rustbecomesher" target="_blank" rel="noopener noreferrer">last.fm</a>)</p>`;
        const albumItems = this.topAlbums.map(album => {
            const artwork = album.image || '';
            const img = artwork ? `<img src="${artwork}" alt="${album.name.replace(/"/g, '&quot;')} album art" class="now-album-art"/>` : '';
            const info = `<div class="now-card-info"><span>&gt; ${album.artist} \\ '${album.name}'</span></div>`;
            const lastFmUrl = album.url || 'https://www.last.fm/user/rustbecomesher';
            return `<a href="${lastFmUrl}" target="_blank" rel="noopener noreferrer" class="now-album now-card">${img}${info}</a>`;
        }).join('');
        html += `<div class="now-scroll">${albumItems}</div>`;
        return html;
    },
    renderMixes() {
        if (!this.mixes.length) return '';
        let html = `<p>>> latest rusty mixes (<a href="/tpl/mixes">see more</a>)</p>`;
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
        html += `<div class="now-mixes-list">${mixesItems}</div>`;
        return html;
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
        const all = changed.length === 0;
        if (all || changed.includes('now-list')) {
            $("#now-now-list").html(this.list.map(bullet => `<p>>> ${bullet}</p>`).join(''));
        }
        if (all || changed.includes('feed')) {
            $("#now-feed").html(this.renderFeedPosts());
        }
        if (all || changed.includes('mixes')) {
            $("#now-mixes").html(this.renderMixes());
        }
        if (all || changed.includes('albums')) {
            $("#now-albums").html(this.renderTopAlbums());
        }
        if (all || changed.includes('movies')) {
            $("#now-movies").html(this.renderMovies());
        }
        if (all || changed.includes('books')) {
            $("#now-books").html(this.renderBooks());
        }
        if (all || changed.includes('tv')) {
            $("#now-tv").html(this.renderTV());
        }
        this.date.text(this.updated);
        if (all || changed.includes('feed')) {
            setTimeout(() => {
                $("#now-feed-scroll").off("click").on("click", function() {
                    window.location.href = "/tpl/feed";
                });
            }, 0);
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
            const getRecent = (year, type) => (data[year] && data[year][type]) ? data[year][type] : [];
            const combineRecent = (type) => {
                let arr = getRecent('2026', type).slice(0, 4);
                if (arr.length < 4) arr = arr.concat(getRecent('2025', type).slice(0, 4 - arr.length));
                return arr;
            };
            this.movies = combineRecent('movies');
            this.books = combineRecent('books');
            this.tv = combineRecent('tv');
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
            this.mixes = mixes.slice(0, 4);
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