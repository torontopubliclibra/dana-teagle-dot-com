
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
    renderList(title, link, items) {
        let html = `<p>>> ${title} (<a href="${link}">see more</a>)</p>`;
        items.forEach(item => {
            let formatted = '';
            if (typeof item === 'object' && item !== null) {
                if (title.toLowerCase().includes('book')) {
                    const bookTitle = item.log || '';
                    const author = item.author || '';
                    const year = item.year || '';
                    let bookStr = `'` + bookTitle + `'`;
                    if (year) bookStr += ` (${year})`;
                    if (author) bookStr += ` by ${author}`;
                    if (item.link) {
                        bookStr = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${bookStr}</a>`;
                    }
                    formatted = bookStr;
                } else if (title.toLowerCase().includes('tv')) {
                    let logTitle = `'` + item.log + `'` || '';
                    if (item.link) {
                        logTitle = `'` + `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.log}</a>` + `'`;
                    }
                    let seasonStr = '';
                    if (item.season) {
                        if (typeof item.season === 'string' && item.season.includes('-')) {
                            seasonStr = ` seasons ${item.season}`;
                        } else {
                            seasonStr = ` season ${item.season}`;
                        }
                    }
                    let extra = '';
                    if (item.year) extra += ` (${item.year}`;
                    if (item.rewatch) extra += (item.year ? ', rewatch' : 'rewatch');
                    if (item.year) extra += ')';
                    formatted = logTitle + seasonStr + extra;
                } else {
                    let logTitle = `'` + item.log + `'` || '';
                    if (item.link) {
                        logTitle = `'` + `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.log}</a>` + `'`;
                    }
                    let extra = '';
                    if (item.year) extra += ` (${item.year}`;
                    if (item.rewatch) extra += (item.year ? ', rewatch' : 'rewatch');
                    if (item.year) extra += ')';
                    formatted = logTitle + extra;
                }
            } else {
                formatted = item;
            }
            html += `<p class="sub">> ${formatted}</p>`;
        });
        return html;
    },
    renderFeedPosts() {
        if (!this.feedPosts.length) return '';
        const feedPostStyle = 'border: solid 3px rgba(243, 232, 233, 0.5);margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;background:none;';
        const feedContainerStyle = 'display:flex;gap: 15px;overflow-x:auto;white-space:nowrap;max-height:220px;max-width:700px;margin: 10px auto;padding:15px;background-image: linear-gradient(120deg, rgba(122, 145, 177, 0.1) 50%, rgba(181, 126, 155, 0.1) 100%);';
        let html = `<hr><p>>> latest feed posts (<a href='/tpl/feed'>see more</a>)</p>`;
        const feedItems = this.feedPosts.map(post => {
            const id = post.id || post.ID || post.number;
            const permalink = id ? `/tpl/feed#${id}` : '#';
            let img = '';
            if (post.type === 'video' && post.thumbnail) {
                img = `<img src="${post.thumbnail}" alt="${post.alt ? post.alt.replace(/\"/g, '&quot;') : 'video thumbnail'}" style="max-height: 150px; display: block; margin: 0 auto;"/>`;
            } else if (post.url) {
                img = `<img src="${post.url}" alt="${post.alt ? post.alt.replace(/\"/g, '&quot;') : ''}" style="max-height: 150px; display: block; margin: 0 auto;"/>`;
            }
            const date = post.date ? `<div style="font-size:0.65rem;color:rgba(243,232,233,0.9);text-align:left;padding:2px 5px;width:100%;letter-spacing:0.5px;">&gt; ${post.date}</div>` : '';
            return `<a href="${permalink}" class="now-feed-post" style="${feedPostStyle}">${img}${date}</a>`;
        }).join('');
        html += `<div id="now-feed-scroll" style="${feedContainerStyle}">${feedItems}</div>`;
        return html;
    },
    renderMixes() {
        if (!this.mixes.length) return '';
        const mixStyle = 'display:flex;max-width:700px;padding:5px 10px;gap:10px;align-items:center;justify-content:space-between;margin-bottom:10px;text-decoration:none;border:none;background-image: linear-gradient(120deg, rgba(122, 145, 177, 0.1) 50%, rgba(181, 126, 155, 0.1) 100%);margin-right:auto;margin-left:auto;cursor:pointer;transition:background-image 0.5s;';
        let html = `<p>>> latest rusty mixes (<a href="/tpl/mixes">see more</a>)</p>`;
        const mixesItems = this.mixes.map(object => {
            const link = `/tpl/mixes#${object.number}`;
            const image = object.image ? `<img src="${object.image}" alt="rusty mix #${object.number} cover art" style="width:50px;height:50px;margin:5px 2px;border:solid 3px rgba(255,255,255,0.5);pointer-events:none;object-fit:cover;"/>` : '';
            const title = `<p class="mix-featuring-ellipsis" style="text-align:left;min-width:calc(100% - 100px);line-height:1.25;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"><small>#${object.number} \\ ${object.title}</small></p>`;
            let featuring = '';
            if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                featuring = `<p class="mix-featuring-ellipsis" style="text-align:left;min-width:0;max-width:100%;margin:0;margin-top:5px;font-size:0.85em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${object.featuring.join(', ')}</p>`;
            }
            const icon = `<p style="padding-right:10px;">></p>`;
            return `<a href="${link}" class="sub mix" style="${mixStyle}">${image}<span style="display:flex;flex-direction:column;flex:1;min-width:0;">${title}${featuring}</span>${icon}</a>`;
        }).join('');
        html += `<div class="now-mixes-list">${mixesItems}</div>`;
        return html;
    },
    nowDisplay() {
        const formattedNow = [];
        this.list.forEach(bullet => {
            formattedNow.push(`<p>>> ${bullet}</p>`);
        });
        formattedNow.push(this.renderFeedPosts());
        formattedNow.push(this.renderMixes());
        formattedNow.push(this.renderList('last watched movies', '/tpl/logs#movies', this.movies));
        formattedNow.push(this.renderList('last read books', '/tpl/logs#books', this.books));
        formattedNow.push(this.renderList('last watched tv shows', '/tpl/logs#tv', this.tv));
        this.content.html(formattedNow.join(''));
        this.date.text(this.updated);
        setTimeout(() => {
            $("#now-feed-scroll").off("click").on("click", function() {
                window.location.href = "/tpl/feed";
            });
        }, 0);
    },
    fetchAndUpdate(url, updateFn) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                updateFn(data);
                this.nowDisplay();
            })
            .catch(error => console.log(error));
    },
    init() {
        this.fetchAndUpdate('../data/now.json', data => {
            this.updated = Object.keys(data)[0];
            this.list = Object.values(data)[0] || [];
        });
        this.fetchAndUpdate('../data/logs.json', data => {
            const getRecent = (year, type) => (data[year] && data[year][type]) ? data[year][type] : [];
            const combineRecent = (type) => {
                let arr = getRecent('2026', type).slice(0, 3);
                if (arr.length < 3) arr = arr.concat(getRecent('2025', type).slice(0, 3 - arr.length));
                return arr;
            };
            this.movies = combineRecent('movies');
            this.books = combineRecent('books');
            this.tv = combineRecent('tv');
        });
        this.fetchAndUpdate('../data/mixes.json', data => {
            const mixes = Object.keys(data).map(key => ({
                title: key,
                number: data[key].number,
                tidal: data[key].tidal,
                image: data[key].image,
                featuring: data[key].featuring || []
            }));
            this.mixes = mixes.slice(0, 3);
        });
        this.fetchAndUpdate('../data/feed.json', data => {
            const posts = (data && data.items) ? data.items : [];
            this.feedPosts = posts.slice(0, 6);
        });
    }
};

$(document).ready(() => tplNow.init());